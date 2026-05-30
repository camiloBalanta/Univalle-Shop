import { Usuario } from '../types/domain';
import { apiClient } from './api.client';

export type CreateUserPayload = {
  codigo: string;
  anioRegistro: number;
  fullName?: string;
  email?: string;
  isActive?: boolean;
};

export type CreateUserResponse = {
  userId: string;
  codigo: string;
  anioRegistro: number;
  rol: string;
  fullName: string;
  email: string;
  isActive: boolean;
  mustChangePassword: boolean;
  message: string;
  temporaryPassword: string;
};

export type UpdateUserPayload = Partial<CreateUserPayload>;

export const usersService = {
  async listUsers() {
    const { data } = await apiClient.get<Usuario[]>('/users');
    return data;
  },

  async createUser(payload: CreateUserPayload) {
    const { data } = await apiClient.post<CreateUserResponse>('/users', payload);
    return data;
  },

  async updateUser(id: string, payload: UpdateUserPayload) {
    await apiClient.put(`/users/${id}`, payload);
  },

  async deleteUser(id: string) {
    await apiClient.delete(`/users/${id}`);
  },
};
