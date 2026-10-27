import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Configuración de prefijo global para las rutas
  app.setGlobalPrefix('api');

  // Habilitar CORS para integración con clientes web/móvil
  app.enableCors();

  // Validación global de DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Interceptor global para estandarizar formato de respuestas exitosas
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Filtro global para captura y estandarización de excepciones (evita errores 500)
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configuración de documentación OpenAPI (Swagger)
  const config = new DocumentBuilder()
    .setTitle('FleetCore Maintenance API')
    .setDescription(
      'API REST para administrar el ciclo de vida de mantenimientos vehiculares de la empresa FleetCore',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingrese su token JWT generado en el login',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'API Key para endpoints de integración externa',
      },
      'api-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  logger.log(`🚀 FleetCore API iniciada en el puerto ${port}`);
  logger.log(`📄 Documentación Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
