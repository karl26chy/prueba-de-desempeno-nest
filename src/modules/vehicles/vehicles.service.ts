import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  // Registrar un nuevo vehículo garantizando que la placa sea única
  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const formattedPlate = createVehicleDto.plate.trim().toUpperCase();

    const existing = await this.vehicleRepository.findOne({
      where: { plate: formattedPlate },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un vehículo registrado con la placa ${formattedPlate}`,
      );
    }

    const vehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      plate: formattedPlate,
      status: createVehicleDto.status || VehicleStatus.AVAILABLE,
      isActive: true,
    });

    return await this.vehicleRepository.save(vehicle);
  }

  // Listar todos los vehículos registrados
  async findAll(): Promise<Vehicle[]> {
    return await this.vehicleRepository.find({
      order: { id: 'ASC' },
    });
  }

  // Consultar vehículo por ID o por Placa
  async findByIdOrPlate(term: string): Promise<Vehicle> {
    let vehicle: Vehicle | null = null;

    if (!isNaN(Number(term))) {
      vehicle = await this.vehicleRepository.findOne({
        where: { id: Number(term) },
      });
    }

    if (!vehicle) {
      vehicle = await this.vehicleRepository.findOne({
        where: { plate: term.trim().toUpperCase() },
      });
    }

    if (!vehicle) {
      throw new NotFoundException(
        `Vehículo con identificador o placa '${term}' no fue encontrado`,
      );
    }

    return vehicle;
  }

  // Actualizar la información de un vehículo
  async update(id: number, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findByIdOrPlate(String(id));

    if (updateVehicleDto.plate) {
      const formattedPlate = updateVehicleDto.plate.trim().toUpperCase();
      const existing = await this.vehicleRepository.findOne({
        where: { plate: formattedPlate },
      });
      if (existing && existing.id !== vehicle.id) {
        throw new ConflictException(
          `La placa ${formattedPlate} ya está asignada a otro vehículo`,
        );
      }
      updateVehicleDto.plate = formattedPlate;
    }

    Object.assign(vehicle, updateVehicleDto);
    return await this.vehicleRepository.save(vehicle);
  }

  // Inactivación o eliminación lógica para preservar el histórico de mantenimientos
  async inactivate(id: number): Promise<Vehicle> {
    const vehicle = await this.findByIdOrPlate(String(id));
    vehicle.isActive = false;
    vehicle.status = VehicleStatus.INACTIVE;
    return await this.vehicleRepository.save(vehicle);
  }

  // Activar vehículo previamente inactivado
  async activate(id: number): Promise<Vehicle> {
    const vehicle = await this.findByIdOrPlate(String(id));
    vehicle.isActive = true;
    vehicle.status = VehicleStatus.AVAILABLE;
    return await this.vehicleRepository.save(vehicle);
  }
}
