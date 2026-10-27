import {
  Body,
  Controller,
  Delete,
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
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Vehículos')
@ApiBearerAuth('JWT-auth')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Registrar nuevo vehículo (Solo Administrador)' })
  @ApiResponse({ status: 201, description: 'Vehículo registrado exitosamente' })
  @ApiResponse({ status: 409, description: 'Placa ya registrada' })
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    return await this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los vehículos registrados' })
  @ApiResponse({ status: 200, description: 'Lista de vehículos obtenida' })
  async findAll() {
    return await this.vehiclesService.findAll();
  }

  @Get(':term')
  @ApiOperation({ summary: 'Consultar vehículo por ID o Placa' })
  @ApiResponse({ status: 200, description: 'Vehículo encontrado' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  async findOne(@Param('term') term: string) {
    return await this.vehiclesService.findByIdOrPlate(term);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar información de un vehículo (Solo Administrador)' })
  @ApiResponse({ status: 200, description: 'Vehículo actualizado' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  async update(
    @Param('id') id: number,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return await this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminación lógica / inactivación de vehículo (Solo Administrador)' })
  @ApiResponse({ status: 200, description: 'Vehículo inactivado exitosamente' })
  async inactivate(@Param('id') id: number) {
    return await this.vehiclesService.inactivate(id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reactivar vehículo previamente inactivado (Solo Administrador)' })
  @ApiResponse({ status: 200, description: 'Vehículo reactivado exitosamente' })
  async activate(@Param('id') id: number) {
    return await this.vehiclesService.activate(id);
  }
}
