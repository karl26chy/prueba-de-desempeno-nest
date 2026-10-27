import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MaintenanceType } from '../entities/maintenance.entity';

export class CreateMaintenanceDto {
  @ApiProperty({ enum: MaintenanceType, example: MaintenanceType.PREVENTIVE })
  @IsEnum(MaintenanceType, { message: 'El tipo debe ser PREVENTIVE o CORRECTIVE' })
  @IsNotEmpty({ message: 'El tipo de mantenimiento es obligatorio' })
  type: MaintenanceType;

  @ApiProperty({ example: 'Cambio de aceite, filtros y revisión de frenos' })
  @IsString({ message: 'La descripción debe ser texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description: string;

  @ApiProperty({ example: 45000 })
  @IsInt({ message: 'El kilometraje debe ser un número entero' })
  @Min(0, { message: 'El kilometraje no puede ser negativo' })
  mileage: number;

  @ApiProperty({ example: '2026-11-01T08:00:00.000Z' })
  @IsDateString({}, { message: 'La fecha programada debe tener formato ISO 8601' })
  @IsNotEmpty({ message: 'La fecha programada es obligatoria' })
  scheduledDate: string;

  @ApiProperty({ example: 2, required: false, default: 2 })
  @IsInt({ message: 'La duración estimada en horas debe ser un número entero' })
  @Min(1, { message: 'La duración estimada debe ser al menos de 1 hora' })
  @IsOptional()
  estimatedDurationHours?: number;

  @ApiProperty({ example: 1, description: 'ID del vehículo' })
  @IsInt({ message: 'El ID del vehículo debe ser un número entero' })
  @IsNotEmpty({ message: 'El vehículo es obligatorio' })
  vehicleId: number;

  @ApiProperty({ example: 1, description: 'ID del mecánico' })
  @IsInt({ message: 'El ID del mecánico debe ser un número entero' })
  @IsNotEmpty({ message: 'El mecánico es obligatorio' })
  mechanicId: number;

  @ApiProperty({ example: 1, description: 'ID del taller' })
  @IsInt({ message: 'El ID del taller debe ser un número entero' })
  @IsNotEmpty({ message: 'El taller es obligatorio' })
  workshopId: number;
}
