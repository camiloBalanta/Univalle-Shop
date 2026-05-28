import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductSearchResult } from '../../domain/entities/search-result.entity';
import { ProductSearchRepository } from '../../domain/ports/search.repository';
import { Query } from '../../domain/value-objects/query.vo';
import {
  ProductSearchResultDocument,
  ProductSearchResultDocumentType,
} from '../schemas/search-result.schema';

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@Injectable()
export class ProductSearchRepositoryImpl implements ProductSearchRepository {
  constructor(
    @InjectModel(ProductSearchResultDocument.name)
    private readonly searchModel: Model<ProductSearchResultDocumentType>,
  ) {}

  async search(
    query: Query,
    category?: string,
  ): Promise<ProductSearchResult[]> {
    const term = query.value.trim();
    const selectedCategory = String(category ?? '').trim();
    const filter: Record<string, unknown> = {};

    if (term) {
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } },
        { seller: { $regex: term, $options: 'i' } },
      ];
    }

    if (selectedCategory) {
      filter.category = {
        $regex: `^${escapeRegex(selectedCategory)}$`,
        $options: 'i',
      };
    }

    const results = await this.searchModel.find(filter).lean().exec();
    return results.map(
      (item) =>
        new ProductSearchResult(
          item.productId,
          item.name,
          item.description,
          item.category,
          item.price,
          item.imageUrl,
          item.stock,
          item.seller,
        ),
    );
  }
}
