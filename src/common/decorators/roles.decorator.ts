import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/users/entities/user.entity';

export const ROLES_KEY = 'roles';
// Decorador personalizado para asignar roles requeridos a un controlador o ruta
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
