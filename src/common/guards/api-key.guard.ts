import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Guard para autenticar llamadas de integraciones externas mediante el header x-api-key
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKeyHeader = request.headers['x-api-key'];

    if (!apiKeyHeader) {
      throw new UnauthorizedException(
        'Acceso denegado: falta el encabezado x-api-key',
      );
    }

    // Leemos la lista de API Keys permitidas desde las variables de entorno
    const configuredKeys = (
      this.configService.get<string>('API_KEYS') || ''
    )
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const isValid = configuredKeys.includes(apiKeyHeader as string);

    if (!isValid) {
      throw new UnauthorizedException(
        'Acceso denegado: la API Key proporcionada es incorrecta',
      );
    }

    return true;
  }
}
