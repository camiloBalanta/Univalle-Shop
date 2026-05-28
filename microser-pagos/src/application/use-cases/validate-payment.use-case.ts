import { PaymentRepositoryImpl } from '../../infrastructure/persistence/payment.repository.impl';
import { PaymentValidationService } from '../services/payment-validation.service';

export class ValidatePaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepositoryImpl,
    private readonly validationService: PaymentValidationService,
  ) {}

  async execute(paymentId: string) {
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    const valid = this.validationService.validate(payment);
    payment.status = valid ? 'confirmed' : 'failed';

    return this.paymentRepository.update(payment);
  }
}
