/**
 * Entidad de Dominio: Recomendación
 *
 * Contiene la lógica de negocio pura sin dependencias externas.
 * Esta entidad no conoce sobre MongoDB, NestJS o ningún framework.
 */

export interface IRecommendationItem {
  productId?: string;
  product: string;
  category?: string;
  score: number;
}

export class RecommendationEntity {
  readonly id?: string;
  readonly userId: string;
  readonly recommendations: IRecommendationItem[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(
    userId: string,
    recommendations: IRecommendationItem[],
    createdAt?: Date,
    updatedAt?: Date,
    id?: string,
  ) {
    this.userId = userId;
    this.recommendations = recommendations;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.id = id;
  }

  /**
   * Métodos de lógica de negocio
   */

  /**
   * Obtiene las recomendaciones ordenadas por puntuación
   */
  getTopRecommendations(limit: number = 5): IRecommendationItem[] {
    return this.recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Obtiene solo productos con puntuación alta (score >= 0.7)
   */
  getHighScoringProducts(): IRecommendationItem[] {
    return this.recommendations.filter((rec) => rec.score >= 0.7);
  }

  /**
   * Filtra recomendaciones por rango de puntuación
   */
  filterByScoreRange(
    minScore: number,
    maxScore: number,
  ): IRecommendationItem[] {
    return this.recommendations.filter(
      (rec) => rec.score >= minScore && rec.score <= maxScore,
    );
  }

  /**
   * Verifica si existe una recomendación para un producto específico
   */
  hasRecommendation(productName: string): boolean {
    return this.recommendations.some(
      (rec) => rec.product.toLowerCase() === productName.toLowerCase(),
    );
  }

  /**
   * Obtiene la puntuación promedio de las recomendaciones
   */
  getAverageScore(): number {
    if (this.recommendations.length === 0) return 0;
    const sum = this.recommendations.reduce((acc, rec) => acc + rec.score, 0);
    return parseFloat((sum / this.recommendations.length).toFixed(2));
  }
}
