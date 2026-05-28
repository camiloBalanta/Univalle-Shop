import { ProductSearchResult } from '../entities/search-result.entity';
import { Query } from '../value-objects/query.vo';

export abstract class ProductSearchRepository {
  abstract search(
    query: Query,
    category?: string,
  ): Promise<ProductSearchResult[]>;
}
