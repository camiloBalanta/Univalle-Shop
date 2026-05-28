import { Payment } from '../../domain/entities/payment.entity';

export class PaymentGatewayService {
  process(payment: Payment): Payment {
    payment.status = 'processed';
    return payment;
  }
}
