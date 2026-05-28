import { RefundPaymentCommand } from '../commands/refund-payment.command';
import { CompensatePaymentUseCase } from '../use-cases/compensate-payment.use-case';

export class RefundPaymentHandler {
  constructor(private readonly compensatePaymentUseCase: CompensatePaymentUseCase) {}

  execute(command: RefundPaymentCommand) {
    return this.compensatePaymentUseCase.refund(command.paymentId, command.amount);
  }
}
