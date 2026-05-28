import { Injectable } from '@nestjs/common';
import { ProductSearchResult } from '../../domain/entities/search-result.entity';
import { ProductSearchRepository } from '../../domain/ports/search.repository';
import { Query } from '../../domain/value-objects/query.vo';
import { SearchQueryDto } from '../dtos/search-query.dto';

@Injectable()
export class SearchUseCase {
  constructor(private readonly repository: ProductSearchRepository) {}

  async execute(queryDto: SearchQueryDto): Promise<ProductSearchResult[]> {
    const query = new Query(queryDto.q ?? '');
    return this.repository.search(query, queryDto.category);
  }
}
