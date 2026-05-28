import axios from 'axios';
import { API_BASE_URL } from '../constants/api';
import { useAuthStore } from '../store/auth.store';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().session?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function apiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | string | undefined;
    if (typeof data === 'string') return data;
    return data?.message || data?.error || error.message;
  }
  return error instanceof Error ? error.message : 'Ocurrio un error inesperado';
}
