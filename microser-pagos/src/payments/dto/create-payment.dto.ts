import { PaymentProductDto } from './payment-product.dto';
import { PaymentStatus } from '../interfaces/payment-status.enum';

export class CreatePaymentDto {
  transactionId?: string;
  paymentId?: string;
  userId?: string;
  customerId?: string;
  orderId: string;
  products?: PaymentProductDto[];
  subtotal?: number;
  taxes?: number;
  totalPaid?: number;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  gatewayReference?: string;
  status?: PaymentStatus | string;
  gatewayResponse?: Record<string, unknown>;
}

