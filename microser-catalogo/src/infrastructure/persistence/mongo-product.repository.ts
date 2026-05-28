import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product as MongoProduct, ProductDocument } from '../product.schema';
import { Product } from '../../domain/entities/product.entity';
import { IProductRepository } from '../../domain/repositories/product.repository';

@Injectable()
export class MongoProductRepository implements IProductRepository {
  constructor(@InjectModel(MongoProduct.name) private productModel: Model<ProductDocument>) {}

  async findAll(): Promise<any[]> {
    return this.productModel.find({ active: true }).lean().exec();
  }

  async findById(id: string): Promise<any | null> {
    return this.productModel.findById(id).lean().exec();
  }

  async findByCategory(category: string): Promise<any[]> {
    return this.productModel.find({ category, active: true }).lean().exec();
  }

  async findBySku(sku: string): Promise<any | null> {
    return this.productModel.findOne({ sku }).lean().exec();
  }

  async search(query: string): Promise<any[]> {
    return this.productModel
      .find({ $text: { $search: query }, active: true })
      .lean()
      .exec();
  }

  async create(product: Product): Promise<any> {
    const newProduct = new this.productModel(product);
    return newProduct.save();
  }

  async update(id: string, product: Partial<Product>): Promise<any | null> {
    return this.productModel
      .findByIdAndUpdate(id, product, { new: true })
      .lean()
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async softDelete(id: string): Promise<any | null> {
    return this.productModel
      .findByIdAndUpdate(id, { active: false }, { new: true })
      .lean()
      .exec();
  }

  async updateStock(id: string, quantity: number): Promise<any | null> {
    return this.productModel
      .findByIdAndUpdate(id, { $inc: { stock: quantity } }, { new: true })
      .lean()
      .exec();
  }

  async findLowStock(threshold: number): Promise<any[]> {
    return this.productModel.find({ stock: { $lt: threshold }, active: true }).lean().exec();
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<any[]> {
    return this.productModel
      .find({ price: { $gte: minPrice, $lte: maxPrice }, active: true })
      .lean()
      .exec();
  }

  async bulkCreate(products: Product[]): Promise<any[]> {
    return this.productModel.insertMany(products);
  }

  async getTopRated(limit: number = 10): Promise<any[]> {
    return this.productModel
      .find({ active: true })
      .sort({ rating: -1 })
      .limit(limit)
      .lean()
      .exec();
  }
}
