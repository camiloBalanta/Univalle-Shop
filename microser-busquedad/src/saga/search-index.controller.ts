import { Body, Controller, Delete, Param, Put } from '@nestjs/common';
import { IndexProductDto } from '../application/dtos/index-product.dto';
import { SyncSearchIndexUseCase } from '../application/use-cases/sync-search-index.use-case';
import { ProductSearchResult } from '../domain/entities/search-result.entity';

@Controller('search/index/products')
export class SearchIndexController {
  constructor(private readonly syncSearchIndex: SyncSearchIndexUseCase) {}

  @Put(':productId')
  async upsertProduct(
    @Param('productId') productId: string,
    @Body() dto: IndexProductDto,
  ): Promise<ProductSearchResult> {
    return this.syncSearchIndex.upsert({ ...dto, productId });
  }

  @Delete(':productId')
  async deleteProduct(@Param('productId') productId: string): Promise<boolean> {
    return this.syncSearchIndex.delete(productId);
  }

  @Delete()
  async clearProducts(): Promise<{ deleted: number }> {
    return this.syncSearchIndex.clear();
  }
}
