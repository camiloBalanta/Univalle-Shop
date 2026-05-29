export class IndexProductDto {
  productId: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  imageUrl?: string;
  stock?: number;
  seller?: string;
  tags?: string[];
}
