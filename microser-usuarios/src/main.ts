import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectMongoDB } from './infrastructure/persistence/mongo.connection';

async function bootstrap() {
  try {
    //  Conectar a Mongo primero
    await connectMongoDB();

    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.setGlobalPrefix('api');

    const port = process.env.PORT || 3002;
    await app.listen(port);

    console.log(`🚀 Aplicación ejecutándose en http://localhost:${port}/api`);
  } catch (error) {
    console.error(' Error iniciando la aplicación:', error);
    process.exit(1); //  importante para producción
  }
}

bootstrap();
