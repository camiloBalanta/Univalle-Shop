export class CreatePaymentDto {
  amount: number;
  currency: string;
  orderId: string;
  customerId: string;
}
