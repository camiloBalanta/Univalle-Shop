import { SessionUser } from '../types/domain';
import { apiClient } from './api.client';

export const authService = {
  async login(payload: { codigo: string; password: string }) {
    const { data } = await apiClient.post<SessionUser>('/auth/login', payload);
    return data;
  },
};
