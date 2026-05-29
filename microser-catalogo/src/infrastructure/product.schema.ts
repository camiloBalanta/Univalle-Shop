import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true, type: String })
  _id: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: false, type: String })
  description?: string;

  @Prop({ required: true, type: Number, min: 0 })
  price: number;

  @Prop({ required: false, type: String, default: 'General' })
  category?: string;

  @Prop({ required: false, type: Number, min: 0, default: 0 })
  stock: number;

  @Prop({ required: false, type: [String], default: [] })
  images: string[];

  @Prop({ required: false, type: Date })
  createdAt: Date;

  @Prop({ required: false, type: Date })
  updatedAt: Date;
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);
