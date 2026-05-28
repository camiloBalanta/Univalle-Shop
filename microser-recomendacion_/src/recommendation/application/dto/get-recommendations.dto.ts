

export interface IRecommendationItemDto {
  product: string;
  score: number;
}

export class GetRecommendationsResponseDto {
  userId: string;
  recommendations: IRecommendationItemDto[];
  createdAt: Date;
  updatedAt: Date;
  topRecommendations?: IRecommendationItemDto[];
  averageScore?: number;

  constructor(
    userId: string,
    recommendations: IRecommendationItemDto[],
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.userId = userId;
    this.recommendations = recommendations;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.topRecommendations = recommendations.slice(0, 5);
    this.averageScore =
      recommendations.length > 0
        ? Number(
            (
              recommendations.reduce((sum, rec) => sum + rec.score, 0) /
              recommendations.length
            ).toFixed(2),
          )
        : 0;
  }
}
