import { Injectable } from '@nestjs/common';
import { SearchUseCase } from '../application/use-cases/search.use-case';
import { SearchResponse } from './search.model';

@Injectable()
export class SearchSaga {
  constructor(private readonly searchUseCase: SearchUseCase) {}

  async run(query?: string, category?: string): Promise<SearchResponse> {
    const results = await this.searchUseCase.execute({ q: query, category });
    return {
      query: query ?? '',
      category: category ?? '',
      total: results.length,
      results,
    };
  }
}
