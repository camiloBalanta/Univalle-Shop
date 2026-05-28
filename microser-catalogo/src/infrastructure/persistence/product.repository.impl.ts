import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../../domain/entities/product.entity';
import { IProductRepository } from '../../domain/repositories/product.repository';
import { ProductDocument } from './product.document';

/**
 * Adaptador: ProductRepositoryImpl
 * Implementación concreta del puerto IProductRepository usando MongoDB
 */
@Injectable()
export class ProductRepositoryImpl implements IProductRepository {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  private toDomain(document: ProductDocument): Product {
    return new Product(
      document._id.toString(),
      document.name,
      document.price,
      document.description,
    );
  }

  async findAll(): Promise<Product[]> {
    const products = await this.productModel.find().exec();
    return products.map((product) => this.toDomain(product));
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.productModel.findById(id).exec();
    return product ? this.toDomain(product) : null;
  }

  async create(product: Product): Promise<Product> {
    const createdProduct = await this.productModel.create({
      _id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
    });
    return this.toDomain(createdProduct);
  }

  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updates, { new: true })
      .exec();
    return updatedProduct ? this.toDomain(updatedProduct) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.productModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }
}
