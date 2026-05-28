import { SearchResponse } from '../types/domain';
import { apiClient } from './api.client';

export const searchService = {
  async searchProducts(params: { q?: string; category?: string }): Promise<SearchResponse> {
    const searchParams = new URLSearchParams();
    if (params.q?.trim()) searchParams.set('q', params.q.trim());
    if (params.category?.trim()) searchParams.set('category', params.category.trim());

    const query = searchParams.toString();
    const { data } = await apiClient.get<SearchResponse>(`/search${query ? `?${query}` : ''}`);
    return data;
  },
};
