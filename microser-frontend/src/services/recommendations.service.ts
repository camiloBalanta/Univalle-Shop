import { apiClient } from './api.client';
import { ProductRating, RecommendationsResponse } from '../types/domain';

export const recommendationsService = {
  async fetchByUser(userId: string): Promise<RecommendationsResponse> {
    const { data } = await apiClient.get<RecommendationsResponse>(`/recommendation/${encodeURIComponent(userId)}`);
    return data;
  },

  async fetchRatings(userId: string): Promise<ProductRating[]> {
    const { data } = await apiClient.get<ProductRating[]>(
      `/recommendations/ratings/${encodeURIComponent(userId)}`,
    );
    return data;
  },

  async rateProduct(payload: {
    userId: string;
    productId: string;
    productName: string;
    category?: string;
    rating: number;
    review?: string;
  }): Promise<ProductRating> {
    const { data } = await apiClient.post<ProductRating>(
      '/recommendations/ratings',
      payload,
    );
    return data;
  },
};
