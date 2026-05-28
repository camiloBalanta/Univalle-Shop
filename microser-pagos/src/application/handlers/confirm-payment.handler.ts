import { ConfirmPaymentCommand } from '../commands/confirm-payment.command';
import { ValidatePaymentUseCase } from '../use-cases/validate-payment.use-case';

export class ConfirmPaymentHandler {
  constructor(private readonly validatePaymentUseCase: ValidatePaymentUseCase) {}

  execute(command: ConfirmPaymentCommand) {
    return this.validatePaymentUseCase.execute(command.paymentId);
  }
}
