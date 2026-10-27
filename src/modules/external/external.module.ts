import { Module } from '@nestjs/common';
import { ExternalController } from './external.controller';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { MaintenancesModule } from '../maintenances/maintenances.module';

@Module({
  imports: [VehiclesModule, MaintenancesModule],
  controllers: [ExternalController],
})
export class ExternalModule {}
