/**
 * USE CASE: Obtener Recomendaciones
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  RecommendationEntity,
  IRecommendationItem,
} from '../entities/recommendation.entity';
import type { IRecommendationRepository } from '../ports/recommendation.repository.interface';
import type { IExternalServicePort } from '../ports/external-service.port';
import { ValidationException } from '../../../common/exceptions';
import {
  RECOMMENDATION_REPOSITORY_TOKEN,
  EXTERNAL_SERVICE_PORT_TOKEN,
} from '../ports/injection-tokens';

@Injectable()
export class GetRecommendationsUseCase {
  protected readonly logger = new Logger(GetRecommendationsUseCase.name);

  constructor(
    @Inject(RECOMMENDATION_REPOSITORY_TOKEN)
    private readonly repository: IRecommendationRepository,
    @Inject(EXTERNAL_SERVICE_PORT_TOKEN)
    private readonly externalService: IExternalServicePort,
  ) {}

  async execute(userId: string): Promise<RecommendationEntity> {
    this.validateUserId(userId);

    this.logger.log(
      `[UseCase] Obteniendo recomendaciones para usuario: ${userId}`,
    );
    const existing = await this.repository.findByUserId(userId);
    if (existing) {
      this.logger.log(
        `[UseCase] Recomendaciones en cache encontradas para: ${userId}`,
      );
      return existing;
    }
    this.logger.log(
      `[UseCase] Generando nuevas recomendaciones para: ${userId}`,
    );
    return await this.generateNewRecommendations(userId);
  }

  private validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new ValidationException(
        'El userId es requerido y debe ser una cadena no vacía',
      );
    }
  }

  private async generateNewRecommendations(
    userId: string,
  ): Promise<RecommendationEntity> {
    try {
      const [orders, catalog, popular, similarUsers] = await Promise.all([
        this.externalService.getUserOrders(userId),
        this.externalService.getCatalog(),
        this.externalService.getPopularProducts(),
        this.externalService.getSimilarUsers(userId),
      ]);
      this.logger.debug(
        `[UseCase] Datos externos obtenidos para usuario: ${userId}`,
      );

      const recommendations = this.calculateRecommendations(
        orders.map((o) => o.product),
        orders.map((o) => o.category),
        catalog,
        popular,
        similarUsers.flatMap((u) => u.purchases),
      );

      const recommendation = new RecommendationEntity(userId, recommendations);
      const created = await this.repository.create(recommendation);
      this.logger.log(
        `[UseCase] Recomendaciones creadas para usuario: ${userId}`,
      );
      return created;
    } catch (error) {
      this.logger.error(
        `[UseCase] Error al generar recomendaciones para ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private calculateRecommendations(
    boughtProducts: string[],
    userCategories: string[],
    catalog: Array<{ product: string; category: string }>,
    popular: Array<{ product: string; popularity: number }>,
    collaborativeProducts: string[],
  ): IRecommendationItem[] {
    return catalog
      .filter((p) => !boughtProducts.includes(p.product))
      .map((p) => {
        const categoryScore = userCategories.includes(p.category) ? 0.6 : 0.3;
        const pop = popular.find((pp) => pp.product === p.product);
        const popularityScore = pop ? pop.popularity : 0.2;
        const collaborativeScore = collaborativeProducts.includes(p.product)
          ? 0.9
          : 0.1;
        const finalScore =
          categoryScore * 0.4 +
          popularityScore * 0.3 +
          collaborativeScore * 0.3;
        return { product: p.product, score: Number(finalScore.toFixed(2)) };
      })
      .sort((a, b) => b.score - a.score);
  }
}
