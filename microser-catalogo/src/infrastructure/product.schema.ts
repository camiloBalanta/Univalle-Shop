import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: Number, min: 0 })
  price: number;

  @Prop({ required: true, type: Number, min: 0, default: 0 })
  stock: number;

  @Prop({ required: true, type: String })
  sku: string;

  @Prop({ required: false, type: String })
  category: string;

  @Prop({ required: false, type: [String], default: [] })
  tags: string[];

  @Prop({ required: false, type: Number, min: 0, max: 5, default: 0 })
  rating: number;

  @Prop({ required: false, type: Number, default: 0 })
  reviewCount: number;

  @Prop({ required: false, type: [String], default: [] })
  images: string[];

  @Prop({ required: true, type: Boolean, default: true })
  active: boolean;

  @Prop({ required: false, type: String })
  supplier: string;

  @Prop({ required: false, type: Date })
  createdAt: Date;

  @Prop({ required: false, type: Date })
  updatedAt: Date;
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);

// Índices para optimizar búsquedas
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ sku: 1 }, { unique: true });
ProductSchema.index({ active: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ createdAt: -1 });
