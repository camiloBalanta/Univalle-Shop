import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Recommendation } from './schemas/recommendation.schema';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    @InjectModel(Recommendation.name)
    private recommendationModel: Model<Recommendation>,
  ) {}

  async getRecommendations(userId: string) {
    try {
      this.logger.log(`Getting recommendations for user: ${userId}`);

      const existing = await this.recommendationModel.findOne({ userId });

      if (existing) {
        this.logger.log(`Found cached recommendations for user: ${userId}`);
        return existing;
      }

      const orders = await this.getUserOrders(userId);
      const catalog = await this.getCatalog();
      const popular = await this.getPopularProducts();
      const similarUsers = await this.getSimilarUsers(userId);

      const recommendations = this.generateRecommendations(
        orders,
        catalog,
        popular,
        similarUsers,
      );

      const saved = await this.recommendationModel.create({
        userId,
        recommendations,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      this.logger.log(
        `Created new recommendations for user: ${userId}`,
        recommendations,
      );
      return saved;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error getting recommendations for user ${userId}:`,
        errorMessage,
      );
      throw error;
    }
  }

  async updateRecommendations(userId: string) {
    try {
      this.logger.log(`Updating recommendations for user: ${userId}`);

      const orders = await this.getUserOrders(userId);
      const catalog = await this.getCatalog();
      const popular = await this.getPopularProducts();
      const similarUsers = await this.getSimilarUsers(userId);

      const recommendations = this.generateRecommendations(
        orders,
        catalog,
        popular,
        similarUsers,
      );

      const updated = await this.recommendationModel.findOneAndUpdate(
        { userId },
        {
          recommendations,
          updatedAt: new Date(),
        },
        { new: true },
      );

      this.logger.log(`Updated recommendations for user: ${userId}`);
      return updated;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error updating recommendations for user ${userId}:`,
        errorMessage,
      );
      throw error;
    }
  }

  async deleteRecommendations(userId: string) {
    try {
      this.logger.log(`Deleting recommendations for user: ${userId}`);
      const result = await this.recommendationModel.findOneAndDelete({
        userId,
      });
      this.logger.log(`Deleted recommendations for user: ${userId}`);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error deleting recommendations for user ${userId}:`,
        errorMessage,
      );
      throw error;
    }
  }

  async getUserOrders(userId: string) {
    // TODO: Integrar con el servicio de órdenes (Order Service)
    // Retorna órdenes/compras del usuario
    this.logger.debug(`Fetching orders for user: ${userId}`);
    return [
      { product: 'Laptop', category: 'tech' },
      { product: 'Mouse', category: 'tech' },
    ];
  }

  async getCatalog() {
    // TODO: Integrar con el servicio de catálogo (Catalog Service)
    // Retorna todos los productos disponibles
    this.logger.debug(`Fetching catalog`);
    return [
      { product: 'Laptop', category: 'tech' },
      { product: 'Mouse', category: 'tech' },
      { product: 'Teclado', category: 'tech' },
      { product: 'Monitor', category: 'tech' },
      { product: 'Audifonos', category: 'tech' },
      { product: 'Silla', category: 'home' },
      { product: 'Escritorio', category: 'home' },
      { product: 'Lampara', category: 'home' },
    ];
  }

  async getPopularProducts() {
    // TODO: Integrar con análisis de ventas
    // Retorna productos populares con puntuación de popularidad
    this.logger.debug(`Fetching popular products`);
    return [
      { product: 'Monitor', popularity: 0.9 },
      { product: 'Teclado', popularity: 0.85 },
      { product: 'Audifonos', popularity: 0.8 },
      { product: 'Silla', popularity: 0.6 },
      { product: 'Escritorio', popularity: 0.55 },
    ];
  }

  async getSimilarUsers(userId: string) {
    // TODO: Integrar con análisis colaborativo
    // Retorna usuarios con preferencias similares y sus compras
    this.logger.debug(`Fetching similar users for: ${userId}`);
    return [
      { userId: '999', purchases: ['Monitor', 'Audifonos'] },
      { userId: '888', purchases: ['Teclado', 'Silla'] },
    ];
  }

  private generateRecommendations(
    orders: Array<{ product: string; category: string }>,
    catalog: Array<{ product: string; category: string }>,
    popular: Array<{ product: string; popularity: number }>,
    similarUsers: Array<{ userId: string; purchases: string[] }>,
  ) {
    this.logger.debug('Generating recommendations');

    const bought = orders.map((o) => o.product);
    const categories = orders.map((o) => o.category);
    const collaborativeProducts = similarUsers.flatMap((u) => u.purchases);

    return catalog
      .filter((p) => !bought.includes(p.product))
      .map((p) => {
        const categoryScore = categories.includes(p.category) ? 0.6 : 0.3;

        const pop = popular.find((pp) => pp.product === p.product);
        const popularityScore = pop ? pop.popularity : 0.2;

        const collaborativeScore = collaborativeProducts.includes(p.product)
          ? 0.9
          : 0.1;

        const finalScore =
          categoryScore * 0.4 +
          popularityScore * 0.3 +
          collaborativeScore * 0.3;

        return {
          product: p.product,
          score: Number(finalScore.toFixed(2)),
        };
      })
      .sort((a, b) => b.score - a.score);
  }
}
