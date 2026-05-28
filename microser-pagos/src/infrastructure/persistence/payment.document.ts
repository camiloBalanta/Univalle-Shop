export interface PaymentDocument {
  id: string;
  amount: number;
  currency: string;
  orderId: string;
  customerId: string;
  status: string;
  createdAt: string;
  refundAmount?: number;
}
