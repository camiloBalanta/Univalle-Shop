import { Payment } from '../entities/payment.entity';

export interface PaymentRepository {
  create(payment: Payment): Promise<Payment>;
  findById(paymentId: string): Promise<Payment | null>;
  update(payment: Payment): Promise<Payment>;
}
