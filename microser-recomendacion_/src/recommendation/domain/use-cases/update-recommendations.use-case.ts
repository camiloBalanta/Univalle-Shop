/**
 * USE CASE: Actualizar Recomendaciones
 *
 * Regenera las recomendaciones para un usuario específico.
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { RecommendationEntity } from '../entities/recommendation.entity';
import type { IRecommendationRepository } from '../ports/recommendation.repository.interface';
import type { IExternalServicePort } from '../ports/external-service.port';
import { GetRecommendationsUseCase } from './get-recommendations.use-case';
import { ValidationException } from '../../../common/exceptions';
import {
  RECOMMENDATION_REPOSITORY_TOKEN,
  EXTERNAL_SERVICE_PORT_TOKEN,
} from '../ports/injection-tokens';

@Injectable()
export class UpdateRecommendationsUseCase extends GetRecommendationsUseCase {
  constructor(
    @Inject(RECOMMENDATION_REPOSITORY_TOKEN)
    private readonly repo: IRecommendationRepository,
    @Inject(EXTERNAL_SERVICE_PORT_TOKEN)
    private readonly externalSvc: IExternalServicePort,
  ) {
    super(repo, externalSvc);
  }

  async execute(userId: string): Promise<RecommendationEntity> {
    this.logger.log(
      `[UseCase] Actualizando recomendaciones para usuario: ${userId}`,
    );
    try {
      // Primero eliminar las antiguas
      const exists = await this.repo.exists(userId);
      if (exists) {
        await this.repo.delete(userId);
        this.logger.debug(
          `[UseCase] Recomendaciones antiguas eliminadas para: ${userId}`,
        );
      }

      // Generar nuevas (reutilizando lógica del padre, incluyendo validación)
      return await super.execute(userId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `[UseCase] Error al actualizar recomendaciones para ${userId}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }
}
