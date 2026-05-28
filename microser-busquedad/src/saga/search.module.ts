import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchUseCase } from '../application/use-cases/search.use-case';
import { ProductSearchRepository } from '../domain/ports/search.repository';
import { ProductSearchRepositoryImpl } from '../infrastructure/repositories/search.repository';
import {
  ProductSearchResultDocument,
  ProductSearchResultSchema,
} from '../infrastructure/schemas/search-result.schema';
import { SearchController } from './search.controller';
import { SearchSaga } from './search.saga';
import { SearchService } from './search.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ProductSearchResultDocument.name,
        schema: ProductSearchResultSchema,
      },
    ]),
  ],
  controllers: [SearchController],
  providers: [
    SearchService,
    SearchSaga,
    SearchUseCase,
    {
      provide: ProductSearchRepository,
      useClass: ProductSearchRepositoryImpl,
    },
  ],
  exports: [SearchService],
})
export class SearchModule {}
