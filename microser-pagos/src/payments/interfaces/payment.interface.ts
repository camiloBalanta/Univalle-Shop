import { PaymentStatus } from './payment-status.enum';

export type PaymentProduct = {
  productId: string;
  name?: string;
  quantity: number;
  price: number;
  subtotal: number;
};

export type PaymentGatewayResponse = Record<string, unknown>;

export interface PaymentRecord {
  id: string;
  transactionId: string;
  userId: string;
  orderId: string;
  products: PaymentProduct[];
  subtotal: number;
  taxes: number;
  totalPaid: number;
  currency: string;
  paymentMethod: string;
  gatewayReference: string;
  status: PaymentStatus;
  gatewayResponse?: PaymentGatewayResponse;
  createdAt: Date;
  updatedAt: Date;
}

