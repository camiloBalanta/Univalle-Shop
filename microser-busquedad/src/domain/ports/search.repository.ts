import { ProductSearchResult } from '../entities/search-result.entity';
import { Query } from '../value-objects/query.vo';

export type SearchIndexProduct = {
  productId: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  imageUrl?: string;
  stock?: number;
  seller?: string;
  tags?: string[];
};

export abstract class ProductSearchRepository {
  abstract search(
    query: Query,
    category?: string,
  ): Promise<ProductSearchResult[]>;

  abstract upsert(product: SearchIndexProduct): Promise<ProductSearchResult>;

  abstract delete(productId: string): Promise<boolean>;

  abstract clear(): Promise<number>;
}
