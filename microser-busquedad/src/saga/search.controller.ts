import { Controller, Get, Query } from '@nestjs/common';
import { SearchResponse } from './search.model';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') q?: string,
    @Query('category') category?: string,
  ): Promise<SearchResponse> {
    return this.searchService.search(q, category);
  }
}
