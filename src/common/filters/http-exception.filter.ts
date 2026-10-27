import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

// Filtro global para procesar excepciones y evitar errores HTTP 500 no controlados
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Error interno del servidor';

    // Manejo de excepciones estándar de NestJS (validación, 404, 401, 403, 409, etc.)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        message = (res as any).message || exception.message;
      } else {
        message = exception.message;
      }
    }
    // Manejo de errores de base de datos TypeORM (duplicados de unicidad, llaves foráneas)
    else if (exception instanceof QueryFailedError) {
      const err = exception as any;
      if (err.code === '23505') {
        // Código PostgreSQL para violación de restricción UNIQUE
        status = HttpStatus.CONFLICT;
        message = `Conflicto de unicidad: ${err.detail || 'El registro ya existe'}`;
      } else if (err.code === '23503') {
        // Código PostgreSQL para violación de Foreign Key
        status = HttpStatus.BAD_REQUEST;
        message = `Violación de relación: ${err.detail || 'Referencia no válida'}`;
      } else {
        status = HttpStatus.BAD_REQUEST;
        message = err.message || 'Error en la consulta a la base de datos';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Si es un arreglo (errores de class-validator), tomar el primer mensaje o unirlos
    if (Array.isArray(message)) {
      message = message.join(', ');
    }

    this.logger.warn(`[${request.method}] ${request.url} - Status ${status} - ${message}`);

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
