import { Product } from '../types/domain';
import { apiClient } from './api.client';

export const catalogService = {
  async listProducts() {
    const { data } = await apiClient.get<Product[]>('/catalog/products');
    return data;
  },

  async getProduct(id: string) {
    const { data } = await apiClient.get<Product | null>(`/catalog/products/${id}`);
    return data;
  },

  async createProduct(payload: Omit<Product, 'id'>) {
    const { data } = await apiClient.post<Product>('/catalog/products', payload);
    return data;
  },

  async updateProduct(id: string, payload: Partial<Omit<Product, 'id'>>) {
    const { data } = await apiClient.put<Product | null>(`/catalog/products/${id}`, payload);
    return data;
  },

  async deleteProduct(id: string) {
    const { data } = await apiClient.delete<boolean>(`/catalog/products/${id}`);
    return data;
  },
};
