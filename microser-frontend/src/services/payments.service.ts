import { apiClient } from './api.client';
import { PaymentResult } from '../types/domain';

export const paymentsService = {
  async simulate(orderId: string, payload: { amount: number; customerId: string }): Promise<PaymentResult> {
    const { data } = await apiClient.post<PaymentResult>(`/payments/simulate/${orderId}`, payload);
    return data;
  },
};
