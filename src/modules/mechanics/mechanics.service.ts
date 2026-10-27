import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mechanic, MechanicStatus } from './entities/mechanic.entity';
import { CreateMechanicDto } from './dto/create-mechanic.dto';
import { UpdateMechanicDto } from './dto/update-mechanic.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MechanicsService {
  constructor(
    @InjectRepository(Mechanic)
    private readonly mechanicRepository: Repository<Mechanic>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Registrar un mecánico en la plataforma
  async create(createMechanicDto: CreateMechanicDto): Promise<Mechanic> {
    const existing = await this.mechanicRepository.findOne({
      where: { email: createMechanicDto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un mecánico registrado con el correo ${createMechanicDto.email}`,
      );
    }

    let user: User | null = null;
    if (createMechanicDto.userId) {
      user = await this.userRepository.findOne({
        where: { id: createMechanicDto.userId },
      });
      if (!user) {
        throw new NotFoundException(
          `Usuario con ID ${createMechanicDto.userId} no encontrado para vincular al mecánico`,
        );
      }
    }

    const mechanic = this.mechanicRepository.create({
      name: createMechanicDto.name,
      email: createMechanicDto.email.toLowerCase().trim(),
      specialty: createMechanicDto.specialty,
      status: createMechanicDto.status || MechanicStatus.ACTIVE,
      user: user || undefined,
    });

    return await this.mechanicRepository.save(mechanic);
  }

  // Consultar todos los mecánicos
  async findAll(): Promise<Mechanic[]> {
    return await this.mechanicRepository.find({
      relations: ['user'],
      order: { id: 'ASC' },
    });
  }

  // Consultar un mecánico específico por ID
  async findById(id: number): Promise<Mechanic> {
    const mechanic = await this.mechanicRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!mechanic) {
      throw new NotFoundException(`Mecánico con ID ${id} no encontrado`);
    }

    return mechanic;
  }

  // Buscar mecánico por ID de usuario
  async findByUserId(userId: number): Promise<Mechanic | null> {
    return await this.mechanicRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  // Actualizar datos del mecánico
  async update(id: number, updateMechanicDto: UpdateMechanicDto): Promise<Mechanic> {
    const mechanic = await this.findById(id);

    if (updateMechanicDto.email) {
      const formattedEmail = updateMechanicDto.email.toLowerCase().trim();
      const existing = await this.mechanicRepository.findOne({
        where: { email: formattedEmail },
      });
      if (existing && existing.id !== mechanic.id) {
        throw new ConflictException(
          `El correo ${formattedEmail} ya está registrado para otro mecánico`,
        );
      }
      mechanic.email = formattedEmail;
    }

    if (updateMechanicDto.userId !== undefined) {
      if (updateMechanicDto.userId === null) {
        mechanic.user = null as any;
      } else {
        const user = await this.userRepository.findOne({
          where: { id: updateMechanicDto.userId },
        });
        if (!user) {
          throw new NotFoundException(
            `Usuario con ID ${updateMechanicDto.userId} no encontrado`,
          );
        }
        mechanic.user = user;
      }
    }

    if (updateMechanicDto.name) mechanic.name = updateMechanicDto.name;
    if (updateMechanicDto.specialty) mechanic.specialty = updateMechanicDto.specialty;
    if (updateMechanicDto.status) mechanic.status = updateMechanicDto.status;

    return await this.mechanicRepository.save(mechanic);
  }

  // Activar o inactivar un mecánico (su historial se mantiene intacto)
  async setStatus(id: number, status: MechanicStatus): Promise<Mechanic> {
    const mechanic = await this.findById(id);
    mechanic.status = status;
    return await this.mechanicRepository.save(mechanic);
  }
}
