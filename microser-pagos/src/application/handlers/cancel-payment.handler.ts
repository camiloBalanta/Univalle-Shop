import { CancelPaymentCommand } from '../commands/cancel-payment.command';
import { CompensatePaymentUseCase } from '../use-cases/compensate-payment.use-case';

export class CancelPaymentHandler {
  constructor(private readonly compensatePaymentUseCase: CompensatePaymentUseCase) {}

  execute(command: CancelPaymentCommand) {
    return this.compensatePaymentUseCase.cancel(command.paymentId);
  }
}
