import { Injectable, Logger } from '@nestjs/common';
import {
  IExternalServicePort,
  IOrder,
  ICatalogProduct,
  IPopularProduct,
  ISimilarUser,
} from '../../domain/ports/external-service.port';

type CatalogServiceProduct = {
  id?: string;
  _id?: string;
  name: string;
  category?: string;
};

type OrdersServiceOrder = {
  customerId: string;
  status?: string;
  createdAt?: string;
  date?: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
};

@Injectable()
export class ExternalServiceAdapter implements IExternalServicePort {
  private readonly logger = new Logger(ExternalServiceAdapter.name);
  private readonly catalogUrl =
    process.env.CATALOG_SERVICE_URL?.replace(/\/$/, '') ??
    'http://catalog-service:3000';
  private readonly ordersUrl =
    process.env.ORDERS_SERVICE_URL?.replace(/\/$/, '') ??
    'http://orders-service:3004';
  private readonly usersUrl =
    process.env.USERS_SERVICE_URL?.replace(/\/$/, '') ??
    'http://users-service:3000';

  async getUserOrders(userId: string): Promise<IOrder[]> {
    this.logger.debug(`[External] Getting orders for user: ${userId}`);

    const catalog = await this.getCatalog();
    const orders = await this.callExternalService<OrdersServiceOrder[]>(
      `${this.ordersUrl}/orders/user/${encodeURIComponent(userId)}`,
    );

    const purchasedProducts = orders
      .filter((order) => !order.status || order.status === 'paid' || order.status === 'completed')
      .flatMap((order) =>
        (order.items ?? []).map((item) => {
          const product = catalog.find((p) => p.productId === item.productId);
          return {
            productId: item.productId,
            product: product?.product ?? item.productId,
            category: product?.category ?? 'General',
            date: new Date(order.createdAt ?? order.date ?? Date.now()),
            status: order.status,
          };
        }),
      );

    return purchasedProducts;
  }

  async getCatalog(): Promise<ICatalogProduct[]> {
    this.logger.debug('[External] Getting product catalog');
    const products = await this.callExternalService<CatalogServiceProduct[]>(
      `${this.catalogUrl}/products`,
    );

    return products.map((product) => ({
      productId: product.id ?? product._id ?? product.name,
      product: product.name,
      category: product.category ?? 'General',
    }));
  }

  async getPopularProducts(): Promise<IPopularProduct[]> {
    this.logger.debug('[External] Getting popular products');
    return [];
  }

  async getSimilarUsers(userId: string): Promise<ISimilarUser[]> {
    this.logger.debug(`[External] Getting similar users for: ${userId}`);

    const orders = await this.callExternalService<OrdersServiceOrder[]>(
      `${this.ordersUrl}/orders`,
    );

    const currentUserProductIds = new Set(
      orders
        .filter((order) => order.customerId === userId)
        .flatMap((order) => order.items.map((item) => item.productId)),
    );

    const users = orders.reduce((acc, order) => {
      if (order.customerId === userId) return acc;
      const purchases = order.items.map((item) => item.productId);
      if (!acc[order.customerId]) acc[order.customerId] = new Set<string>();
      purchases.forEach((productId) => acc[order.customerId].add(productId));
      return acc;
    }, {} as Record<string, Set<string>>);

    return Object.entries(users)
      .map(([customerId, products]) => ({
        userId: customerId,
        purchases: Array.from(products).filter((productId) =>
          currentUserProductIds.has(productId),
        ),
      }))
      .filter((user) => user.purchases.length > 0)
      .slice(0, 5);
  }

  private async callExternalService<T>(
    url: string,
    method: string = 'GET',
  ): Promise<T> {
    try {
      const response = await fetch(url, { method });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      this.logger.error(
        `[External] Error calling ${url}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  }

}
