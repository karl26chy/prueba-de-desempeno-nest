import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { VehiclesService } from '../vehicles/vehicles.service';
import { MaintenancesService } from '../maintenances/maintenances.service';
import { VehicleStatus } from '../vehicles/entities/vehicle.entity';

@ApiTags('Integraciones Externas')
@Controller('external')
export class ExternalController {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly maintenancesService: MaintenancesService,
  ) {}

  @Public() // Omite JWT porque la autenticación es vía API Key
  @UseGuards(ApiKeyGuard) // Valida encabezado x-api-key
  @Get('vehicles/:plate/history')
  @ApiHeader({
    name: 'x-api-key',
    description: 'Clave de autenticación para integraciones externas',
    required: true,
  })
  @ApiOperation({
    summary: 'Consultar historial de vehículo para integraciones externas vía x-api-key',
  })
  @ApiResponse({ status: 200, description: 'Historial obtenido correctamente' })
  @ApiResponse({ status: 401, description: 'API Key inválida o no suministrada' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  async getExternalVehicleHistory(@Param('plate') plate: string) {
    const vehicle = await this.vehiclesService.findByIdOrPlate(plate);
    const maintenances = await this.maintenancesService.findVehicleHistory(vehicle.id);

    return {
      vehicle: {
        id: vehicle.id,
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        available: vehicle.status === VehicleStatus.AVAILABLE,
      },
      maintenances: maintenances.map((m) => ({
        id: m.id,
        type: m.type,
        status: m.status,
        description: m.description,
        mileage: m.mileage,
        cost: m.finalCost ? Number(m.finalCost) : null,
        finishedAt: m.finishedAt,
        mechanic: m.mechanic
          ? {
              id: m.mechanic.id,
              name: m.mechanic.name,
            }
          : null,
        workshop: m.workshop
          ? {
              id: m.workshop.id,
              name: m.workshop.name,
            }
          : null,
      })),
    };
  }
}
