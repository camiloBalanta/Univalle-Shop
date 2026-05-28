export class PaymentResponseDto {
  id: string;
  status: string;
  amount: number;
  currency: string;
  orderId: string;
  customerId: string;
  createdAt: string;
}
