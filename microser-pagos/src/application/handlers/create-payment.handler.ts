import { CreatePaymentCommand } from '../commands/create-payment.command';
import { ProcessPaymentUseCase } from '../use-cases/process-payment.use-case';

export class CreatePaymentHandler {
  constructor(private readonly processPaymentUseCase: ProcessPaymentUseCase) {}

  execute(command: CreatePaymentCommand) {
    return this.processPaymentUseCase.execute({
      amount: command.amount,
      currency: command.currency,
      orderId: command.orderId,
      customerId: command.customerId,
    });
  }
}
