import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductRatingDocument = ProductRating & Document;

@Schema({ timestamps: true, collection: 'product_ratings' })
export class ProductRating {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  productId: string;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: false, default: 'General' })
  category?: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: false })
  review?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ProductRatingSchema = SchemaFactory.createForClass(ProductRating);

ProductRatingSchema.index({ userId: 1, productId: 1 }, { unique: true });
