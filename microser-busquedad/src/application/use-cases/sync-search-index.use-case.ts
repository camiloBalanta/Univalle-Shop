import { Injectable } from '@nestjs/common';
import { IndexProductDto } from '../dtos/index-product.dto';
import { ProductSearchResult } from '../../domain/entities/search-result.entity';
import { ProductSearchRepository } from '../../domain/ports/search.repository';

@Injectable()
export class SyncSearchIndexUseCase {
  constructor(private readonly repository: ProductSearchRepository) {}

  async upsert(product: IndexProductDto): Promise<ProductSearchResult> {
    return this.repository.upsert(product);
  }

  async delete(productId: string): Promise<boolean> {
    return this.repository.delete(productId);
  }

  async clear(): Promise<{ deleted: number }> {
    const deleted = await this.repository.clear();
    return { deleted };
  }
}
