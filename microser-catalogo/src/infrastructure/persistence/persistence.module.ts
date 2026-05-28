import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../product.schema';
import { MongoProductRepository } from './mongo-product.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  providers: [
    {
      provide: 'IProductRepository',
      useClass: MongoProductRepository,
    },
  ],
  exports: ['IProductRepository'],
})
export class PersistenceModule {}
