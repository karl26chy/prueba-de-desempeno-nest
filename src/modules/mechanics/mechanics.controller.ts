import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MechanicsService } from './mechanics.service';
import { CreateMechanicDto } from './dto/create-mechanic.dto';
import { UpdateMechanicDto } from './dto/update-mechanic.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { MechanicStatus } from './entities/mechanic.entity';

@ApiTags('Mecánicos')
@ApiBearerAuth('JWT-auth')
@Controller('mechanics')
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Registrar un nuevo mecánico (Solo Administrador)' })
  @ApiResponse({ status: 201, description: 'Mecánico registrado exitosamente' })
  @ApiResponse({ status: 409, description: 'Correo ya registrado' })
  async create(@Body() createMechanicDto: CreateMechanicDto) {
    return await this.mechanicsService.create(createMechanicDto);
  }

  @Get()
  @ApiOperation({ summary: 'Consultar todos los mecánicos registrados' })
  @ApiResponse({ status: 200, description: 'Lista de mecánicos obtenida' })
  async findAll() {
    return await this.mechanicsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar información de un mecánico específico' })
  @ApiResponse({ status: 200, description: 'Mecánico encontrado' })
  @ApiResponse({ status: 404, description: 'Mecánico no encontrado' })
  async findOne(@Param('id') id: number) {
    return await this.mechanicsService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar información de un mecánico (Solo Administrador)' })
  @ApiResponse({ status: 200, description: 'Mecánico actualizado' })
  async update(
    @Param('id') id: number,
    @Body() updateMechanicDto: UpdateMechanicDto,
  ) {
    return await this.mechanicsService.update(id, updateMechanicDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activar o inactivar un mecánico (Solo Administrador)' })
  @ApiResponse({ status: 200, description: 'Estado del mecánico modificado' })
  async setStatus(
    @Param('id') id: number,
    @Body('status') status: MechanicStatus,
  ) {
    return await this.mechanicsService.setStatus(id, status);
  }
}
