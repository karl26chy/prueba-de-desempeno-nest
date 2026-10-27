import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WorkshopsService } from './workshops.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { WorkshopStatus } from './entities/workshop.entity';

@ApiTags('Talleres')
@ApiBearerAuth('JWT-auth')
@Controller('workshops')
export class WorkshopsController {
  constructor(private readonly workshopsService: WorkshopsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Registrar un nuevo taller (Solo Administrador)' })
  @ApiResponse({ status: 201, description: 'Taller registrado exitosamente' })
  async create(@Body() createWorkshopDto: CreateWorkshopDto) {
    return await this.workshopsService.create(createWorkshopDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar talleres registrados (por defecto activos)' })
  @ApiQuery({ name: 'all', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de talleres obtenida' })
  async findAll(@Query('all') all?: string) {
    const activeOnly = all !== 'true';
    return await this.workshopsService.findAll(activeOnly);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar información de un taller específico' })
  @ApiResponse({ status: 200, description: 'Taller encontrado' })
  @ApiResponse({ status: 404, description: 'Taller no encontrado' })
  async findOne(@Param('id') id: number) {
    return await this.workshopsService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar información de un taller (Solo Administrador)' })
  @ApiResponse({ status: 200, description: 'Taller actualizado exitosamente' })
  async update(
    @Param('id') id: number,
    @Body() updateWorkshopDto: UpdateWorkshopDto,
  ) {
    return await this.workshopsService.update(id, updateWorkshopDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activar o inactivar un taller (Solo Administrador)' })
  @ApiResponse({ status: 200, description: 'Estado del taller modificado' })
  async setStatus(
    @Param('id') id: number,
    @Body('status') status: WorkshopStatus,
  ) {
    return await this.workshopsService.setStatus(id, status);
  }
}
