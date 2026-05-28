/**
 * PUERTO: Interfaz de Repositorio de Recomendaciones
 *
 * Define el contrato que cualquier adaptador de persistencia debe implementar.
 * Esta es la interfaz que el dominio espera del mundo exterior.
 */

import { RecommendationEntity } from '../entities/recommendation.entity';

export interface IRecommendationRepository {
  /**
   * Obtiene una recomendación por ID de usuario
   */
  findByUserId(userId: string): Promise<RecommendationEntity | null>;

  /**
   * Obtiene todas las recomendaciones (para admin)
   */
  findAll(): Promise<RecommendationEntity[]>;

  /**
   * Crea una nueva recomendación
   */
  create(recommendation: RecommendationEntity): Promise<RecommendationEntity>;

  /**
   * Actualiza una recomendación existente
   */
  update(recommendation: RecommendationEntity): Promise<RecommendationEntity>;

  /**
   * Elimina una recomendación por ID de usuario
   */
  delete(userId: string): Promise<void>;

  /**
   * Verifica si existe una recomendación para un usuario
   */
  exists(userId: string): Promise<boolean>;
}
