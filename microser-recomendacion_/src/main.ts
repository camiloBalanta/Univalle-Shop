import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  const logger = new Logger('Bootstrap');

  app.useGlobalFilters(new HttpExceptionFilter());

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remover propiedades no declaradas
      forbidNonWhitelisted: true, // Lanzar error si hay propiedades no permitidas
      transform: true, // Transformar payload a tipos correctos
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Microservicio de Recomendaciones - Univalle Shop')
    .setDescription(
      'API para obtener, actualizar y eliminar recomendaciones personalizadas de productos para usuarios de la tienda virtual Univalle Shop',
    )
    .setVersion('1.0')
    .addTag('Recomendaciones', 'Endpoints para gestionar recomendaciones')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.enableCors({
  origin: 'http://localhost:3003', // frontend
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  });

  await app.listen(port);
  logger.log(`Microservicio de Recomendación iniciado en puerto: ${port}`);
  logger.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  logger.log(
    `Base de datos: ${process.env.MONGO_URI || 'mongodb://mongo:27017/recommendation-db'}`,
  );
  logger.log(`Swagger disponible en: http://localhost:${port}/api`);
}

void bootstrap();
