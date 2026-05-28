import { PaymentRepositoryImpl } from '../../infrastructure/persistence/payment.repository.impl';

export class CompensatePaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepositoryImpl) {}

  async cancel(paymentId: string) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }
    payment.status = 'cancelled';
    return this.paymentRepository.update(payment);
  }

  async refund(paymentId: string, amount: number) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }
    payment.status = 'refunded';
    payment.refundAmount = amount;
    return this.paymentRepository.update(payment);
  }
}
