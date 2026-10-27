import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { VehicleStatus } from '../entities/vehicle.entity';

export class CreateVehicleDto {
  @ApiProperty({ example: 'ABC123' })
  @IsString({ message: 'La placa debe ser texto' })
  @IsNotEmpty({ message: 'La placa es obligatoria' })
  plate: string;

  @ApiProperty({ example: 'Chevrolet' })
  @IsString({ message: 'La marca debe ser texto' })
  @IsNotEmpty({ message: 'La marca es obligatoria' })
  brand: string;

  @ApiProperty({ example: 'NPR' })
  @IsString({ message: 'El modelo debe ser texto' })
  @IsNotEmpty({ message: 'El modelo es obligatorio' })
  model: string;

  @ApiProperty({ example: 2022 })
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(1900, { message: 'Año inválido' })
  year: number;

  @ApiProperty({ example: 45000 })
  @IsInt({ message: 'El kilometraje debe ser un número entero' })
  @Min(0, { message: 'El kilometraje no puede ser negativo' })
  mileage: number;

  @ApiProperty({
    enum: VehicleStatus,
    default: VehicleStatus.AVAILABLE,
    required: false,
  })
  @IsEnum(VehicleStatus, { message: 'Estado del vehículo inválido' })
  @IsOptional()
  status?: VehicleStatus;
}
