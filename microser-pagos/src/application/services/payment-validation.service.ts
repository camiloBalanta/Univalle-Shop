import { Payment } from '../../domain/entities/payment.entity';

export class PaymentValidationService {
  validate(payment: Payment): boolean {
    const isValidAmount = payment.amount > 0;
    const isSupportedCurrency = ['USD', 'EUR', 'COP'].includes(payment.currency);
    return isValidAmount && isSupportedCurrency;
  }
}
