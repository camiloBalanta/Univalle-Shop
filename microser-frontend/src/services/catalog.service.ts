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

  async createProduct(payload: Partial<Omit<Product, 'id'>>) {
    const { data } = await apiClient.post<Product>('/catalog/products', payload);
    return data;
  },

  async updateProduct(id: string, payload: Partial<Omit<Product, 'id'>>) {
    // Eliminamos IDs internos del payload para evitar errores en el backend
    const { productId, ...cleanPayload } = payload as any;
    // Cambiamos explícitamente a PATCH para permitir actualizaciones parciales
    // y coincidir con la lógica del microservicio de catálogo.
    const { data } = await apiClient.patch<Product>(`/catalog/products/${id}`, cleanPayload);
    return data;
  },

  async deleteProduct(id: string) {
    const { data } = await apiClient.delete<boolean>(`/catalog/products/${id}`);
    return data;
  },

  async syncSearchIndex() {
    const { data } = await apiClient.post<{ synced: number; total: number }>(
      '/catalog/products/sync-search',
    );
    return data;
  },
};
