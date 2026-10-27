import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MaintenanceStatus } from '../entities/maintenance.entity';

export class UpdateMaintenanceStatusDto {
  @ApiProperty({
    enum: MaintenanceStatus,
    example: MaintenanceStatus.IN_PROGRESS,
    description: 'Nuevo estado del mantenimiento (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)',
  })
  @IsEnum(MaintenanceStatus, { message: 'Estado de mantenimiento inválido' })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  status: MaintenanceStatus;

  // Campos requeridos si el nuevo estado es COMPLETED
  @ApiProperty({
    example: 'Se realizó sustitución de pastillas de freno y cambio de aceite sintético 15W40',
    required: false,
  })
  @IsString({ message: 'El trabajo realizado debe ser texto' })
  @IsOptional()
  workDone?: string;

  @ApiProperty({ example: 480000, required: false })
  @IsNumber({}, { message: 'El costo final debe ser un valor numérico' })
  @Min(0, { message: 'El costo no puede ser negativo' })
  @IsOptional()
  finalCost?: number;

  @ApiProperty({ example: '2026-11-01T11:30:00.000Z', required: false })
  @IsDateString({}, { message: 'La fecha de finalización debe ser ISO 8601' })
  @IsOptional()
  finishedAt?: string;

  @ApiProperty({ example: 45050, required: false })
  @IsInt({ message: 'El kilometraje final debe ser un número entero' })
  @Min(0, { message: 'El kilometraje final no puede ser negativo' })
  @IsOptional()
  finalMileage?: number;
}
