import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductController } from './infrastructure/controllers/product.controller';
import { ProductHandler } from './infrastructure/messaging/product.handler';
import { ProductService } from './application/use-cases/product.service';
import { ProductRepositoryImpl } from './infrastructure/persistence/product.repository.impl';
import { ProductSchema } from './infrastructure/persistence/product.schema';
import { ProductSaga } from './application/saga/product.saga';
import { NotifyInventoryHandler } from './application/handlers/notify-inventory.handler';
import { SyncCatalogHandler } from './application/handlers/sync-catalog.handler';
import { CleanupProductHandler } from './application/handlers/cleanup-product.handler';
import { Product } from './domain/entities/product.entity';

/**
 * Módulo principal de la aplicación
 * Organiza y registra todos los componentes:
 * - Controllers (adaptadores de entrada HTTP)
 * - Handlers (adaptadores de entrada por mensajería)
 * - Services (casos de uso de aplicación)
 * - Repositories (adaptadores de salida)
 */
@Module({
  imports: [
    CqrsModule,
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/catalogo',
    ),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [ProductController, ProductHandler],
  providers: [
    ProductService,
    ProductSaga,
    NotifyInventoryHandler,
    SyncCatalogHandler,
    CleanupProductHandler,
    {
      provide: 'IProductRepository',
      useClass: ProductRepositoryImpl,
    },
  ],
})
export class AppModule {}
