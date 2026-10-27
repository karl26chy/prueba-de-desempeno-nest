import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { Mechanic, MechanicStatus } from '../mechanics/entities/mechanic.entity';
import { Workshop, WorkshopStatus } from '../workshops/entities/workshop.entity';
import { Vehicle, VehicleStatus } from '../vehicles/entities/vehicle.entity';
import {
  Maintenance,
  MaintenanceStatus,
  MaintenanceType,
} from '../maintenances/entities/maintenance.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  // Población inicial idempotente requerida por la prueba técnica
  async runSeed(): Promise<void> {
    this.logger.log('Iniciando proceso de siembra (Seeder)...');

    const userRepo = this.dataSource.getRepository(User);
    const mechanicRepo = this.dataSource.getRepository(Mechanic);
    const workshopRepo = this.dataSource.getRepository(Workshop);
    const vehicleRepo = this.dataSource.getRepository(Vehicle);
    const maintenanceRepo = this.dataSource.getRepository(Maintenance);

    const defaultPassword = await bcrypt.hash('Password123*', 10);

    // 1. Usuarios: 1 ADMIN y 2 TECHNICIAN
    let admin = await userRepo.findOne({
      where: { email: 'admin@fleetcore.com' },
    });
    if (!admin) {
      admin = await userRepo.save(
        userRepo.create({
          name: 'Administrador General',
          email: 'admin@fleetcore.com',
          password: defaultPassword,
          role: UserRole.ADMIN,
        }),
      );
      this.logger.log('Usuario ADMIN creado');
    }

    let tech1 = await userRepo.findOne({
      where: { email: 'carlos.tecnico@fleetcore.com' },
    });
    if (!tech1) {
      tech1 = await userRepo.save(
        userRepo.create({
          name: 'Carlos Pérez',
          email: 'carlos.tecnico@fleetcore.com',
          password: defaultPassword,
          role: UserRole.TECHNICIAN,
        }),
      );
      this.logger.log('Usuario TECHNICIAN 1 creado');
    }

    let tech2 = await userRepo.findOne({
      where: { email: 'laura.tecnico@fleetcore.com' },
    });
    if (!tech2) {
      tech2 = await userRepo.save(
        userRepo.create({
          name: 'Laura Gómez',
          email: 'laura.tecnico@fleetcore.com',
          password: defaultPassword,
          role: UserRole.TECHNICIAN,
        }),
      );
      this.logger.log('Usuario TECHNICIAN 2 creado');
    }

    // 2. Mecánicos: 2 activos vinculados a técnicos y 1 inactivo
    let mech1 = await mechanicRepo.findOne({
      where: { email: 'carlos.perez@fleetcore.com' },
    });
    if (!mech1) {
      mech1 = await mechanicRepo.save(
        mechanicRepo.create({
          name: 'Carlos Pérez',
          email: 'carlos.perez@fleetcore.com',
          specialty: 'Frenos y Suspensión',
          status: MechanicStatus.ACTIVE,
          user: tech1,
        }),
      );
      this.logger.log('Mecánico activo 1 (Carlos Pérez) creado y vinculado');
    }

    let mech2 = await mechanicRepo.findOne({
      where: { email: 'laura.gomez@fleetcore.com' },
    });
    if (!mech2) {
      mech2 = await mechanicRepo.save(
        mechanicRepo.create({
          name: 'Laura Gómez',
          email: 'laura.gomez@fleetcore.com',
          specialty: 'Motores Diésel y Transmisión',
          status: MechanicStatus.ACTIVE,
          user: tech2,
        }),
      );
      this.logger.log('Mecánico activo 2 (Laura Gómez) creado y vinculado');
    }

    let mech3 = await mechanicRepo.findOne({
      where: { email: 'pedro.ramirez@fleetcore.com' },
    });
    if (!mech3) {
      mech3 = await mechanicRepo.save(
        mechanicRepo.create({
          name: 'Pedro Ramírez',
          email: 'pedro.ramirez@fleetcore.com',
          specialty: 'Electricidad y Diagnóstico',
          status: MechanicStatus.INACTIVE,
          user: null as any,
        }),
      );
      this.logger.log('Mecánico inactivo (Pedro Ramírez) creado');
    }

    // 3. Talleres: 1 activo y 1 inactivo
    let workshopActive = await workshopRepo.findOne({
      where: { name: 'Taller Centro' },
    });
    if (!workshopActive) {
      workshopActive = await workshopRepo.save(
        workshopRepo.create({
          name: 'Taller Centro',
          address: 'Calle 45 # 28-30, Zona Industrial',
          status: WorkshopStatus.ACTIVE,
        }),
      );
      this.logger.log('Taller activo (Taller Centro) creado');
    }

    let workshopInactive = await workshopRepo.findOne({
      where: { name: 'Taller Norte' },
    });
    if (!workshopInactive) {
      workshopInactive = await workshopRepo.save(
        workshopRepo.create({
          name: 'Taller Norte',
          address: 'Autopista Norte Km 12',
          status: WorkshopStatus.INACTIVE,
        }),
      );
      this.logger.log('Taller inactivo (Taller Norte) creado');
    }

    // 4. Vehículos: 2 AVAILABLE, 1 IN_MAINTENANCE (con mantenimiento IN_PROGRESS) y 1 INACTIVE
    let v1 = await vehicleRepo.findOne({ where: { plate: 'ABC123' } });
    if (!v1) {
      v1 = await vehicleRepo.save(
        vehicleRepo.create({
          plate: 'ABC123',
          brand: 'Chevrolet',
          model: 'NPR',
          year: 2022,
          mileage: 45000,
          status: VehicleStatus.AVAILABLE,
          isActive: true,
        }),
      );
      this.logger.log('Vehículo AVAILABLE 1 (ABC123) creado');
    }

    let v2 = await vehicleRepo.findOne({ where: { plate: 'XYZ789' } });
    if (!v2) {
      v2 = await vehicleRepo.save(
        vehicleRepo.create({
          plate: 'XYZ789',
          brand: 'Renault',
          model: 'Master',
          year: 2023,
          mileage: 32000,
          status: VehicleStatus.AVAILABLE,
          isActive: true,
        }),
      );
      this.logger.log('Vehículo AVAILABLE 2 (XYZ789) creado');
    }

    let v3 = await vehicleRepo.findOne({ where: { plate: 'MNT456' } });
    if (!v3) {
      v3 = await vehicleRepo.save(
        vehicleRepo.create({
          plate: 'MNT456',
          brand: 'Hino',
          model: 'Dutro',
          year: 2021,
          mileage: 68000,
          status: VehicleStatus.IN_MAINTENANCE,
          isActive: true,
        }),
      );
      this.logger.log('Vehículo IN_MAINTENANCE (MNT456) creado');
    }

    let v4 = await vehicleRepo.findOne({ where: { plate: 'OLD000' } });
    if (!v4) {
      v4 = await vehicleRepo.save(
        vehicleRepo.create({
          plate: 'OLD000',
          brand: 'Ford',
          model: 'Cargo',
          year: 2012,
          mileage: 185000,
          status: VehicleStatus.INACTIVE,
          isActive: false,
        }),
      );
      this.logger.log('Vehículo INACTIVE (OLD000) creado');
    }

    // 5. Mantenimientos: Al menos 1 COMPLETED (historial) y 1 IN_PROGRESS (para el vehículo en mantenimiento)
    const completedExisting = await maintenanceRepo.findOne({
      where: {
        vehicle: { id: v1.id },
        status: MaintenanceStatus.COMPLETED,
      },
    });

    if (!completedExisting) {
      await maintenanceRepo.save(
        maintenanceRepo.create({
          type: MaintenanceType.PREVENTIVE,
          description: 'Mantenimiento preventivo general y cambio de fluidos',
          mileage: 45000,
          scheduledDate: new Date('2026-09-15T08:00:00.000Z'),
          estimatedDurationHours: 3,
          status: MaintenanceStatus.COMPLETED,
          vehicle: v1,
          mechanic: mech1,
          workshop: workshopActive,
          workDone: 'Cambio de aceite, filtros y calibración de frenos',
          finalCost: 350000,
          finishedAt: new Date('2026-09-15T16:30:00.000Z'),
          finalMileage: 45000,
        }),
      );
      this.logger.log('Mantenimiento COMPLETED creado para historial');
    }

    const inProgressExisting = await maintenanceRepo.findOne({
      where: {
        vehicle: { id: v3.id },
        status: MaintenanceStatus.IN_PROGRESS,
      },
    });

    if (!inProgressExisting) {
      await maintenanceRepo.save(
        maintenanceRepo.create({
          type: MaintenanceType.CORRECTIVE,
          description: 'Reparación de embrague y cambio de rodamientos',
          mileage: 68000,
          scheduledDate: new Date(),
          estimatedDurationHours: 4,
          status: MaintenanceStatus.IN_PROGRESS,
          vehicle: v3,
          mechanic: mech2,
          workshop: workshopActive,
        }),
      );
      this.logger.log('Mantenimiento IN_PROGRESS creado para vehículo MNT456');
    }

    this.logger.log('✅ Base de datos poblada exitosamente (Idempotente).');
  }
}
