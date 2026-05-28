import { apiClient } from './api.client';
import { RecommendationsResponse } from '../types/domain';

export const recommendationsService = {
  async fetchByUser(userId: string): Promise<RecommendationsResponse> {
    const { data } = await apiClient.get<RecommendationsResponse>(`/recommendation/${encodeURIComponent(userId)}`);
    return data;
  },
};
