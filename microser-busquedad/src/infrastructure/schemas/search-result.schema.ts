import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductSearchResultDocumentType =
  HydratedDocument<ProductSearchResultDocument>;

@Schema({ collection: 'product_search_results' })
export class ProductSearchResultDocument {
  @Prop({ required: true })
  productId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  category!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true })
  imageUrl!: string;

  @Prop({ required: true })
  stock!: number;

  @Prop({ required: true })
  seller!: string;
}

export const ProductSearchResultSchema = SchemaFactory.createForClass(
  ProductSearchResultDocument,
);

ProductSearchResultSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  seller: 'text',
});
