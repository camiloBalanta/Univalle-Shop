import { Injectable } from '@nestjs/common';
import { SearchResponse } from './search.model';
import { SearchSaga } from './search.saga';

@Injectable()
export class SearchService {
  constructor(private readonly searchSaga: SearchSaga) {}

  async search(query?: string, category?: string): Promise<SearchResponse> {
    return this.searchSaga.run(query, category);
  }
}
