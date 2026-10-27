import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../modules/users/entities/user.entity';

// Guard encargado de validar que el usuario autenticado posea el rol requerido
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtenemos los roles requeridos desde los metadatos asignados por @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si la ruta no especifica roles, se permite el acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Verificamos que el usuario exista y tenga uno de los roles permitidos
    if (!user || !user.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Acceso denegado: se requiere uno de los siguientes roles: [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}
