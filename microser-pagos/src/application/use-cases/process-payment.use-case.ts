import { Payment } from '../../domain/entities/payment.entity';
import { PaymentRepositoryImpl } from '../../infrastructure/persistence/payment.repository.impl';
import { PaymentGatewayService } from '../services/payment-gateway.service';
import { NotificationService } from '../services/notification.service';
import { PaymentSaga } from '../saga/payment.saga';

export class ProcessPaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepositoryImpl,
    private readonly paymentGateway: PaymentGatewayService,
    private readonly notificationService: NotificationService,
    private readonly paymentSaga: PaymentSaga,
  ) {}

  async execute(input: {
    amount: number;
    currency: string;
    orderId: string;
    customerId: string;
  }) {
    const payment = new Payment({
      amount: input.amount,
      currency: input.currency,
      orderId: input.orderId,
      customerId: input.customerId,
    });

    // Save initial payment
    await this.paymentRepository.create(payment);

    // Execute saga
    const sagaResult = await this.paymentSaga.start(payment);

    return {
      payment,
      sagaId: sagaResult.sagaId,
      status: sagaResult.status,
    };
  }
}
