import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RecommendationDocument = Recommendation & Document;

@Schema({ timestamps: true })
export class Recommendation {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({
    type: [
      {
        _id: false,
        productId: String,
        product: String,
        category: String,
        score: Number,
      },
    ],
    default: [],
  })
  recommendations: {
    productId?: string;
    product: string;
    category?: string;
    score: number;
  }[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const RecommendationSchema =
  SchemaFactory.createForClass(Recommendation);
