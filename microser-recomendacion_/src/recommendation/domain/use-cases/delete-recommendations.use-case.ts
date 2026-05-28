/**
 * USE CASE: Eliminar Recomendaciones
 *
 * Elimina las recomendaciones de un usuario del repositorio.
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IRecommendationRepository } from '../ports/recommendation.repository.interface';
import {
  NotFoundException,
  ValidationException,
} from '../../../common/exceptions';
import { RECOMMENDATION_REPOSITORY_TOKEN } from '../ports/injection-tokens';

@Injectable()
export class DeleteRecommendationsUseCase {
  private readonly logger = new Logger(DeleteRecommendationsUseCase.name);

  constructor(
    @Inject(RECOMMENDATION_REPOSITORY_TOKEN)
    private readonly repository: IRecommendationRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    this.validateUserId(userId);

    this.logger.log(
      `[UseCase] Eliminando recomendaciones para usuario: ${userId}`,
    );
    const exists = await this.repository.exists(userId);
    if (!exists) {
      this.logger.warn(
        `[UseCase] No se encontraron recomendaciones para: ${userId}`,
      );
      throw new NotFoundException(
        `No se encontraron recomendaciones para el usuario: ${userId}`,
      );
    }
    await this.repository.delete(userId);
    this.logger.log(
      `[UseCase] Recomendaciones eliminadas para usuario: ${userId}`,
    );
  }

  private validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new ValidationException(
        'El userId es requerido y debe ser una cadena no vac\u00eda',
      );
    }
  }
}
