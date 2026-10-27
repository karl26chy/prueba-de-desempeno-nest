import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MechanicStatus } from '../entities/mechanic.entity';

export class CreateMechanicDto {
  @ApiProperty({ example: 'Carlos Pérez' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @ApiProperty({ example: 'carlos.mecanico@fleetcore.com' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @ApiProperty({ example: 'Motores Diésel y Frenos' })
  @IsString({ message: 'La especialidad debe ser texto' })
  @IsNotEmpty({ message: 'La especialidad es obligatoria' })
  specialty: string;

  @ApiProperty({
    enum: MechanicStatus,
    default: MechanicStatus.ACTIVE,
    required: false,
  })
  @IsEnum(MechanicStatus, { message: 'El estado debe ser ACTIVE o INACTIVE' })
  @IsOptional()
  status?: MechanicStatus;

  @ApiProperty({
    example: 2,
    description: 'ID del usuario del técnico con el que se vincula (opcional)',
    required: false,
  })
  @IsInt({ message: 'El ID de usuario debe ser un número entero' })
  @IsOptional()
  userId?: number;
}
