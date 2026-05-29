import { Injectable, Logger } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';

type SearchIndexPayload = {
  productId: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  imageUrl?: string;
  stock: number;
  seller: string;
  tags: string[];
};

const DEFAULT_SEARCH_URL = 'http://search-service:3001/search';

@Injectable()
export class SearchIndexClient {
  private readonly logger = new Logger(SearchIndexClient.name);
  private readonly baseUrl =
    process.env.SEARCH_SERVICE_URL?.replace(/\/$/, '') ?? DEFAULT_SEARCH_URL;

  async upsertProduct(product: Product): Promise<void> {
    const payload = this.toSearchIndexPayload(product);

    try {
      const response = await fetch(
        `${this.baseUrl}/index/products/${product.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        this.logger.warn(
          `No se pudo sincronizar producto ${product.id} con busqueda: ${response.status}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Busqueda no disponible para sincronizar producto ${product.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/index/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 404) {
        this.logger.warn(
          `No se pudo eliminar producto ${productId} del indice de busqueda: ${response.status}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Busqueda no disponible para eliminar producto ${productId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async clearProducts(): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/index/products`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        this.logger.warn(
          `No se pudo limpiar el indice de busqueda: ${response.status}`,
        );
        return 0;
      }

      const result = (await response.json()) as { deleted?: number };
      return result.deleted ?? 0;
    } catch (error) {
      this.logger.warn(
        `Busqueda no disponible para limpiar indice: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return 0;
    }
  }

  private toSearchIndexPayload(product: Product): SearchIndexPayload {
    const category = product.category?.trim() || 'General';

    return {
      productId: product.id,
      name: product.name,
      description: product.description ?? '',
      category,
      price: product.price,
      imageUrl: product.mainImage,
      stock: product.stock,
      seller: 'UnivalleShop',
      tags: this.buildTags(product.name, product.description, category),
    };
  }

  private buildTags(...values: Array<string | undefined>): string[] {
    const words = values
      .flatMap((value) => value?.toLowerCase().split(/\W+/) ?? [])
      .map((word) => word.trim())
      .filter((word) => word.length > 2);

    return Array.from(new Set(words));
  }
}
