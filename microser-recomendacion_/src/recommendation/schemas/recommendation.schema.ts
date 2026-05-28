import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RecommendationDocument = Recommendation & Document;

@Schema({ timestamps: true })
export class Recommendation {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop([
    {
      product: String,
      score: Number,
    },
  ])
  recommendations: {
    product: string;
    score: number;
  }[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const RecommendationSchema =
  SchemaFactory.createForClass(Recommendation);
