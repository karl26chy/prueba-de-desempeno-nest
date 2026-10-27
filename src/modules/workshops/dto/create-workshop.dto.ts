import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WorkshopStatus } from '../entities/workshop.entity';

export class CreateWorkshopDto {
  @ApiProperty({ example: 'Taller Central' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @ApiProperty({ example: 'Calle 50 # 45-20, Medellín' })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  address: string;

  @ApiProperty({
    enum: WorkshopStatus,
    default: WorkshopStatus.ACTIVE,
    required: false,
  })
  @IsEnum(WorkshopStatus, { message: 'El estado debe ser ACTIVE o INACTIVE' })
  @IsOptional()
  status?: WorkshopStatus;
}
