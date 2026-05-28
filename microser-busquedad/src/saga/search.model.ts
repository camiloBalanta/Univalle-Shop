import { ProductSearchResult } from '../domain/entities/search-result.entity';

export interface SearchResponse {
  query: string;
  category: string;
  total: number;
  results: ProductSearchResult[];
}
