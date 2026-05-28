/**
 * SERVICIO DE APLICACIÓN: RecommendationApplicationService
 *
 * Orquesta los casos de uso y convierte entre DTOs y entidades de dominio.
 * Actúa como intermediario entre la presentación (Controller) y el dominio (Use Cases).
 */

import { Injectable, Logger } from '@nestjs/common';
import { GetRecommendationsUseCase } from '../../domain/use-cases/get-recommendations.use-case';
import { UpdateRecommendationsUseCase } from '../../domain/use-cases/update-recommendations.use-case';
import { DeleteRecommendationsUseCase } from '../../domain/use-cases/delete-recommendations.use-case';
import { GetRecommendationsResponseDto } from '../dto/get-recommendations.dto';
import { RecommendationEntity } from '../../domain/entities/recommendation.entity';

@Injectable()
export class RecommendationApplicationService {
  private readonly logger = new Logger(RecommendationApplicationService.name);

  constructor(
    private readonly getRecommendationsUseCase: GetRecommendationsUseCase,
    private readonly updateRecommendationsUseCase: UpdateRecommendationsUseCase,
    private readonly deleteRecommendationsUseCase: DeleteRecommendationsUseCase,
  ) {}

  /**
   * Obtiene las recomendaciones para un usuario
   */
  async getRecommendations(
    userId: string,
  ): Promise<GetRecommendationsResponseDto> {
    this.logger.log(
      `[Aplicación] Obteniendo recomendaciones para usuario: ${userId}`,
    );

    try {
      const recommendation =
        await this.getRecommendationsUseCase.execute(userId);
      return this.mapEntityToDto(recommendation);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[Aplicación] Error al obtener recomendaciones para ${userId}:`,
        errorMessage,
      );
      throw error;
    }
  }

  /**
   * Actualiza las recomendaciones para un usuario
   */
  async updateRecommendations(
    userId: string,
  ): Promise<GetRecommendationsResponseDto> {
    this.logger.log(
      `[Aplicación] Actualizando recomendaciones para usuario: ${userId}`,
    );

    try {
      const recommendation =
        await this.updateRecommendationsUseCase.execute(userId);
      return this.mapEntityToDto(recommendation);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[Aplicación] Error al actualizar recomendaciones para ${userId}:`,
        errorMessage,
      );
      throw error;
    }
  }

  /**
   * Elimina las recomendaciones de un usuario
   */
  async deleteRecommendations(userId: string): Promise<void> {
    this.logger.log(
      `[Aplicación] Eliminando recomendaciones para usuario: ${userId}`,
    );

    try {
      await this.deleteRecommendationsUseCase.execute(userId);
      this.logger.log(
        `[Aplicación] Recomendaciones eliminadas para usuario: ${userId}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[Aplicación] Error al eliminar recomendaciones para ${userId}:`,
        errorMessage,
      );
      throw error;
    }
  }

  /**
   * Mapea una entidad de dominio a DTO
   */
  private mapEntityToDto(
    entity: RecommendationEntity,
  ): GetRecommendationsResponseDto {
    return new GetRecommendationsResponseDto(
      entity.userId,
      entity.recommendations,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
