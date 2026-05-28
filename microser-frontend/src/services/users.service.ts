import { Usuario } from '../types/domain';
import { apiClient } from './api.client';

export const usersService = {
  async listUsers() {
    const { data } = await apiClient.get<Usuario[]>('/users');
    return data;
  },
};
