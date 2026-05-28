import { CartItem, Order } from '../types/domain';
import { apiClient } from './api.client';

export const ordersService = {
  async listOrders() {
    const { data } = await apiClient.get<Order[]>('/orders');
    return data;
  },

  async listUserOrders(userId: string) {
    const { data } = await apiClient.get<Order[]>(`/orders/user/${userId}`);
    return data;
  },

  async createOrder(payload: { customerId: string; items: CartItem[]; totalAmount: number }) {
    const { data } = await apiClient.post<Order>('/orders', { ...payload, clearCart: true });
    return data;
  },
};
