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
import { MaintenancesService } from './maintenances.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceStatusDto } from './dto/update-maintenance-status.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Mantenimientos')
@ApiBearerAuth('JWT-auth')
@Controller('maintenances')
export class MaintenancesController {
  constructor(private readonly maintenancesService: MaintenancesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo mantenimiento (Solo Administrador)' })
  @ApiResponse({ status: 201, description: 'Mantenimiento creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Validación de negocio fallida' })
  @ApiResponse({ status: 409, description: 'Conflicto de horario o mantenimiento activo' })
  async create(@Body() createDto: CreateMaintenanceDto) {
    return await this.maintenancesService.create(createDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Consultar todos los mantenimientos (Solo Administrador)' })
  @ApiResponse({ status: 200, description: 'Lista de mantenimientos obtenida' })
  async findAll() {
    return await this.maintenancesService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Consultar mantenimientos activos (SCHEDULED o IN_PROGRESS)' })
  @ApiResponse({ status: 200, description: 'Mantenimientos activos obtenidos' })
  async findActive() {
    return await this.maintenancesService.findActive();
  }

  @Get('my-assigned')
  @ApiOperation({ summary: 'Consultar mantenimientos asignados al técnico en sesión' })
  @ApiResponse({ status: 200, description: 'Mantenimientos asignados al usuario actual' })
  async findMyAssigned(@CurrentUser() user: any) {
    return await this.maintenancesService.findAssignedToTechnician(user.id);
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Consultar mantenimientos asociados a un vehículo' })
  @ApiResponse({ status: 200, description: 'Mantenimientos del vehículo' })
  async findByVehicle(@Param('vehicleId') vehicleId: number) {
    return await this.maintenancesService.findByVehicle(vehicleId);
  }

  @Get('vehicle/:vehicleId/history')
  @ApiOperation({ summary: 'Consultar historial de mantenimientos de un vehículo' })
  @ApiResponse({ status: 200, description: 'Historial de mantenimientos' })
  async findVehicleHistory(@Param('vehicleId') vehicleId: number) {
    return await this.maintenancesService.findVehicleHistory(vehicleId);
  }

  @Get('mechanic/:mechanicId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Consultar mantenimientos asignados a un mecánico (Solo Administrador)' })
  @ApiResponse({ status: 200, description: 'Mantenimientos del mecánico' })
  async findByMechanic(@Param('mechanicId') mechanicId: number) {
    return await this.maintenancesService.findByMechanic(mechanicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar detalle de un mantenimiento por ID' })
  @ApiResponse({ status: 200, description: 'Detalle del mantenimiento' })
  @ApiResponse({ status: 404, description: 'Mantenimiento no encontrado' })
  async findOne(@Param('id') id: number) {
    return await this.maintenancesService.findById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de un mantenimiento (Admin o Técnico asignado)' })
  @ApiResponse({ status: 200, description: 'Estado actualizado correctamente' })
  @ApiResponse({ status: 400, description: 'Faltan datos requeridos de finalización' })
  @ApiResponse({ status: 403, description: 'Técnico no autorizado para este mantenimiento' })
  @ApiResponse({ status: 409, description: 'Transición de estado inválida' })
  async updateStatus(
    @Param('id') id: number,
    @Body() updateStatusDto: UpdateMaintenanceStatusDto,
    @CurrentUser() user: any,
  ) {
    return await this.maintenancesService.updateStatus(id, updateStatusDto, user);
  }
}
