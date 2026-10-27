import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workshop, WorkshopStatus } from './entities/workshop.entity';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
  ) {}

  // Registrar un nuevo taller
  async create(createWorkshopDto: CreateWorkshopDto): Promise<Workshop> {
    const workshop = this.workshopRepository.create({
      ...createWorkshopDto,
      status: createWorkshopDto.status || WorkshopStatus.ACTIVE,
    });
    return await this.workshopRepository.save(workshop);
  }

  // Listar talleres (por defecto los activos, con opción de listar todos)
  async findAll(activeOnly = false): Promise<Workshop[]> {
    if (activeOnly) {
      return await this.workshopRepository.find({
        where: { status: WorkshopStatus.ACTIVE },
        order: { id: 'ASC' },
      });
    }
    return await this.workshopRepository.find({ order: { id: 'ASC' } });
  }

  // Consultar información de un taller específico
  async findById(id: number): Promise<Workshop> {
    const workshop = await this.workshopRepository.findOne({ where: { id } });
    if (!workshop) {
      throw new NotFoundException(`Taller con ID ${id} no encontrado`);
    }
    return workshop;
  }

  // Actualizar taller
  async update(id: number, updateWorkshopDto: UpdateWorkshopDto): Promise<Workshop> {
    const workshop = await this.findById(id);
    Object.assign(workshop, updateWorkshopDto);
    return await this.workshopRepository.save(workshop);
  }

  // Activar o inactivar un taller
  async setStatus(id: number, status: WorkshopStatus): Promise<Workshop> {
    const workshop = await this.findById(id);
    workshop.status = status;
    return await this.workshopRepository.save(workshop);
  }
}
