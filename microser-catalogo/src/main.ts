import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

/**
 * Punto de entrada de la aplicación
 * Configura y arranca el microservicio con soporte para:
 * - HTTP (puerto 3000 por defecto)
 * - TCP Microservices (puerto 8877 para comunicación entre servicios)
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar microservicio TCP para comunicación asincrónica
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 8877,
    },
  });

  // Iniciar ambos transportes: HTTP y TCP
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `🚀 Microservicio iniciado en puerto ${process.env.PORT ?? 3000}`,
  );
  console.log(`🔌 TCP Microservice escuchando en localhost:8877`);
}

bootstrap().catch(console.error);
