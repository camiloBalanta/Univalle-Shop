import { apiClient } from './api.client';
import { PaymentResult } from '../types/domain';

type PaymentPayload = {
  amount: number;
  customerId: string;
  paymentMethod?: string;
  cardNumber?: string;
  cardHolder?: string;
  expiration?: string;
  cvv?: string;
};

export const paymentsService = {
  async simulate(orderId: string, payload: PaymentPayload): Promise<PaymentResult> {
    const { data } = await apiClient.post<PaymentResult>(`/payments/simulate/${orderId}`, payload);
    return data;
  },
};
