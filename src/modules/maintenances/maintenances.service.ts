import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import {
  Maintenance,
  MaintenanceStatus,
} from './entities/maintenance.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceStatusDto } from './dto/update-maintenance-status.dto';
import { Vehicle, VehicleStatus } from '../vehicles/entities/vehicle.entity';
import { Mechanic, MechanicStatus } from '../mechanics/entities/mechanic.entity';
import { Workshop, WorkshopStatus } from '../workshops/entities/workshop.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class MaintenancesService {
  constructor(
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Mechanic)
    private readonly mechanicRepository: Repository<Mechanic>,
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
    private readonly dataSource: DataSource,
  ) {}

  // Creación de mantenimiento con validación estricta de reglas de negocio
  async create(createDto: CreateMaintenanceDto): Promise<Maintenance> {
    // 1. Validar que el vehículo exista y no esté inactivo
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: createDto.vehicleId },
    });
    if (!vehicle) {
      throw new NotFoundException(
        `El vehículo con ID ${createDto.vehicleId} no existe`,
      );
    }
    if (vehicle.status === VehicleStatus.INACTIVE || !vehicle.isActive) {
      throw new BadRequestException(
        'Un vehículo en estado INACTIVE no podrá ser asociado a un nuevo mantenimiento',
      );
    }

    // 2. Validar que el vehículo no tenga simultáneamente otro mantenimiento activo
    const vehicleActiveMaintenance = await this.maintenanceRepository.findOne({
      where: {
        vehicle: { id: vehicle.id },
        status: In([MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS]),
      },
    });
    if (vehicleActiveMaintenance) {
      throw new ConflictException(
        `El vehículo con placa ${vehicle.plate} ya tiene un mantenimiento activo en curso o programado`,
      );
    }

    // 3. Validar que el kilometraje registrado no sea menor al kilometraje actual del vehículo
    if (createDto.mileage < vehicle.mileage) {
      throw new BadRequestException(
        `El kilometraje registrado (${createDto.mileage}) no puede ser inferior al kilometraje actual del vehículo (${vehicle.mileage})`,
      );
    }

    // 4. Validar que el mecánico exista y esté activo
    const mechanic = await this.mechanicRepository.findOne({
      where: { id: createDto.mechanicId },
    });
    if (!mechanic || mechanic.status !== MechanicStatus.ACTIVE) {
      throw new BadRequestException(
        'No se podrá asignar un mecánico inexistente o inactivo',
      );
    }

    // 5. Validar que el mecánico no tenga cruce de horarios en mantenimientos activos
    const newScheduledStart = new Date(createDto.scheduledDate);
    const durationHours = createDto.estimatedDurationHours || 2;
    const newScheduledEnd = new Date(
      newScheduledStart.getTime() + durationHours * 60 * 60 * 1000,
    );

    const activeMechanicMaintenances = await this.maintenanceRepository.find({
      where: {
        mechanic: { id: mechanic.id },
        status: In([MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS]),
      },
    });

    for (const m of activeMechanicMaintenances) {
      const existingStart = new Date(m.scheduledDate);
      const existingEnd = new Date(
        existingStart.getTime() + (m.estimatedDurationHours || 2) * 60 * 60 * 1000,
      );

      // Verificación de solapamiento de horarios (start < existingEnd && end > existingStart)
      if (newScheduledStart < existingEnd && newScheduledEnd > existingStart) {
        throw new ConflictException(
          `El mecánico ${mechanic.name} ya tiene un mantenimiento activo en ese horario (${existingStart.toISOString()} - ${existingEnd.toISOString()})`,
        );
      }
    }

    // 6. Validar que el taller exista y esté activo
    const workshop = await this.workshopRepository.findOne({
      where: { id: createDto.workshopId },
    });
    if (!workshop || workshop.status !== WorkshopStatus.ACTIVE) {
      throw new BadRequestException(
        'No se podrá asignar un taller inexistente o inactivo',
      );
    }

    // Crear el mantenimiento con estado inicial obligatorio: SCHEDULED
    const maintenance = this.maintenanceRepository.create({
      type: createDto.type,
      description: createDto.description,
      mileage: createDto.mileage,
      scheduledDate: newScheduledStart,
      estimatedDurationHours: durationHours,
      status: MaintenanceStatus.SCHEDULED,
      vehicle,
      mechanic,
      workshop,
    });

    return await this.maintenanceRepository.save(maintenance);
  }

  // Actualización de estado de mantenimiento implementando TRANSACCIÓN atómica
  async updateStatus(
    id: number,
    updateDto: UpdateMaintenanceStatusDto,
    currentUser: any,
  ): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOne({
      where: { id },
      relations: ['vehicle', 'mechanic', 'mechanic.user', 'workshop'],
    });

    if (!maintenance) {
      throw new NotFoundException(`Mantenimiento con ID ${id} no encontrado`);
    }

    // Regla de autorización para rol Técnico: solo puede actualizar sus mantenimientos asignados
    if (currentUser.role === UserRole.TECHNICIAN) {
      if (!maintenance.mechanic?.user || maintenance.mechanic.user.id !== currentUser.id) {
        throw new ForbiddenException(
          'Solo puedes actualizar mantenimientos que tengas asignados',
        );
      }
    }

    const currentStatus = maintenance.status;
    const targetStatus = updateDto.status;

    // Regla de transición: COMPLETED no puede regresar a un estado anterior
    if (currentStatus === MaintenanceStatus.COMPLETED) {
      throw new ConflictException(
        'Un mantenimiento COMPLETED no podrá regresar a un estado anterior',
      );
    }

    // Regla de transición: CANCELLED no puede cambiar a IN_PROGRESS o COMPLETED
    if (
      currentStatus === MaintenanceStatus.CANCELLED &&
      (targetStatus === MaintenanceStatus.IN_PROGRESS ||
        targetStatus === MaintenanceStatus.COMPLETED)
    ) {
      throw new ConflictException(
        'Un mantenimiento CANCELLED no podrá posteriormente cambiar a IN_PROGRESS o COMPLETED',
      );
    }

    // Validación de datos obligatorios al finalizar a COMPLETED
    if (targetStatus === MaintenanceStatus.COMPLETED) {
      if (
        !updateDto.workDone ||
        updateDto.finalCost === undefined ||
        !updateDto.finishedAt ||
        updateDto.finalMileage === undefined
      ) {
        throw new BadRequestException(
          'No se podrá completar un mantenimiento si no contiene la información obligatoria de cierre (trabajo realizado, costo final, fecha y kilometraje final)',
        );
      }

      if (updateDto.finalMileage < maintenance.vehicle.mileage) {
        throw new BadRequestException(
          `El kilometraje final (${updateDto.finalMileage}) no puede ser menor al kilometraje registrado (${maintenance.vehicle.mileage})`,
        );
      }
    }

    // TRANSACCIÓN DE BASE DE DATOS: Asegura atomicidad entre el estado del mantenimiento y el vehículo
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      maintenance.status = targetStatus;

      // Al cambiar a IN_PROGRESS, el vehículo pasa automáticamente a IN_MAINTENANCE
      if (targetStatus === MaintenanceStatus.IN_PROGRESS) {
        maintenance.vehicle.status = VehicleStatus.IN_MAINTENANCE;
        await queryRunner.manager.save(Vehicle, maintenance.vehicle);
      }

      // Al cambiar a COMPLETED, el vehículo vuelve a AVAILABLE y actualiza su kilometraje
      if (targetStatus === MaintenanceStatus.COMPLETED) {
        maintenance.workDone = updateDto.workDone!;
        maintenance.finalCost = updateDto.finalCost!;
        maintenance.finishedAt = new Date(updateDto.finishedAt!);
        maintenance.finalMileage = updateDto.finalMileage!;

        maintenance.vehicle.status = VehicleStatus.AVAILABLE;
        maintenance.vehicle.mileage = updateDto.finalMileage!;
        await queryRunner.manager.save(Vehicle, maintenance.vehicle);
      }

      // Al cambiar a CANCELLED, si el vehículo estaba en mantenimiento, regresa a AVAILABLE
      if (targetStatus === MaintenanceStatus.CANCELLED) {
        if (maintenance.vehicle.status === VehicleStatus.IN_MAINTENANCE) {
          maintenance.vehicle.status = VehicleStatus.AVAILABLE;
          await queryRunner.manager.save(Vehicle, maintenance.vehicle);
        }
      }

      const savedMaintenance = await queryRunner.manager.save(
        Maintenance,
        maintenance,
      );

      // Confirmar la transacción
      await queryRunner.commitTransaction();
      return savedMaintenance;
    } catch (error) {
      // Revertir cambios en caso de fallo durante la transacción
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Consultar todos los mantenimientos
  async findAll(): Promise<Maintenance[]> {
    return await this.maintenanceRepository.find({
      order: { scheduledDate: 'DESC' },
    });
  }

  // Consultar mantenimientos activos (SCHEDULED o IN_PROGRESS)
  async findActive(): Promise<Maintenance[]> {
    return await this.maintenanceRepository.find({
      where: {
        status: In([MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS]),
      },
      order: { scheduledDate: 'ASC' },
    });
  }

  // Consultar mantenimientos por vehículo
  async findByVehicle(vehicleId: number): Promise<Maintenance[]> {
    return await this.maintenanceRepository.find({
      where: { vehicle: { id: vehicleId } },
      order: { scheduledDate: 'DESC' },
    });
  }

  // Consultar historial de mantenimientos de un vehículo (COMPLETED o todos ordenados por fecha)
  async findVehicleHistory(vehicleId: number): Promise<Maintenance[]> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehículo con ID ${vehicleId} no existe`);
    }

    return await this.maintenanceRepository.find({
      where: { vehicle: { id: vehicleId } },
      order: { scheduledDate: 'DESC' },
    });
  }

  // Consultar mantenimientos asignados a un mecánico
  async findByMechanic(mechanicId: number): Promise<Maintenance[]> {
    return await this.maintenanceRepository.find({
      where: { mechanic: { id: mechanicId } },
      order: { scheduledDate: 'ASC' },
    });
  }

  // Consultar mantenimientos asignados al técnico en sesión
  async findAssignedToTechnician(userId: number): Promise<Maintenance[]> {
    const mechanic = await this.mechanicRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!mechanic) {
      return [];
    }

    return await this.maintenanceRepository.find({
      where: { mechanic: { id: mechanic.id } },
      order: { scheduledDate: 'ASC' },
    });
  }

  // Consultar mantenimiento por ID
  async findById(id: number): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOne({
      where: { id },
    });

    if (!maintenance) {
      throw new NotFoundException(`Mantenimiento con ID ${id} no encontrado`);
    }

    return maintenance;
  }
}
