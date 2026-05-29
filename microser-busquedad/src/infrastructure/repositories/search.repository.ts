import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductSearchResult } from '../../domain/entities/search-result.entity';
import {
  ProductSearchRepository,
  SearchIndexProduct,
} from '../../domain/ports/search.repository';
import { Query } from '../../domain/value-objects/query.vo';
import {
  ProductSearchResultDocument,
  ProductSearchResultDocumentType,
} from '../schemas/search-result.schema';

type SearchResultRecord = {
  productId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  stock: number;
  seller: string;
  tags?: string[];
  normalizedText?: string;
  normalizedCategory?: string;
};

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const DEFAULT_IMAGE_URL = 'https://placehold.co/600x400?text=Sin+Imagen';

const normalizeForSearch = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

@Injectable()
export class ProductSearchRepositoryImpl implements ProductSearchRepository {
  constructor(
    @InjectModel(ProductSearchResultDocument.name)
    private readonly searchModel: Model<ProductSearchResultDocumentType>,
  ) {}

  private toDomain(item: SearchResultRecord): ProductSearchResult {
    return new ProductSearchResult(
      item.productId,
      item.name,
      item.description,
      item.category,
      item.price,
      item.imageUrl,
      item.stock,
      item.seller,
      item.tags ?? [],
    );
  }

  async search(
    query: Query,
    category?: string,
  ): Promise<ProductSearchResult[]> {
    const term = query.value.trim();
    const normalizedTerm = normalizeForSearch(term);
    const selectedCategory = String(category ?? '').trim();
    const normalizedCategory = normalizeForSearch(selectedCategory);
    const filter: Record<string, unknown> = {};

    if (!term && !selectedCategory) {
      return [];
    }

    if (term) {
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } },
        { seller: { $regex: term, $options: 'i' } },
        { tags: { $regex: term, $options: 'i' } },
        { normalizedText: { $regex: escapeRegex(normalizedTerm), $options: 'i' } },
      ];
    }

    if (selectedCategory) {
      filter.normalizedCategory = {
        $regex: `^${escapeRegex(normalizedCategory)}$`,
        $options: 'i',
      };
    }

    const results = await this.searchModel.find(filter).lean().exec();
    return results.map((item) => this.toDomain(item));
  }

  async upsert(product: SearchIndexProduct): Promise<ProductSearchResult> {
    const document = {
      productId: product.productId,
      name: product.name,
      description: product.description ?? '',
      category: product.category ?? 'General',
      price: product.price ?? 0,
      imageUrl: product.imageUrl ?? DEFAULT_IMAGE_URL,
      stock: product.stock ?? 0,
      seller: product.seller ?? 'UnivalleShop',
      tags: product.tags ?? [],
    };
    const normalizedText = normalizeForSearch(
      [
        document.name,
        document.description,
        document.category,
        document.seller,
        ...document.tags,
      ].join(' '),
    );

    const indexedProduct = await this.searchModel
      .findOneAndUpdate(
        { productId: product.productId },
        {
          ...document,
          normalizedText,
          normalizedCategory: normalizeForSearch(document.category),
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      )
      .lean()
      .exec();

    if (!indexedProduct) {
      throw new Error('No se pudo indexar el producto en busqueda');
    }

    return this.toDomain(indexedProduct);
  }

  async delete(productId: string): Promise<boolean> {
    const result = await this.searchModel.deleteOne({ productId }).exec();
    return result.deletedCount > 0;
  }

  async clear(): Promise<number> {
    const result = await this.searchModel.deleteMany({}).exec();
    return result.deletedCount;
  }
}
