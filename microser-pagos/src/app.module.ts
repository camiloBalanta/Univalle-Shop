import { Module } from '@nestjs/common';
import { PaymentController } from './infrastructure/controllers/payment.controller';
import { PaymentRepositoryImpl } from './infrastructure/persistence/payment.repository.impl';
import { ProcessPaymentUseCase } from './application/use-cases/process-payment.use-case';
import { ValidatePaymentUseCase } from './application/use-cases/validate-payment.use-case';
import { CompensatePaymentUseCase } from './application/use-cases/compensate-payment.use-case';
import { PaymentGatewayService } from './application/services/payment-gateway.service';
import { PaymentValidationService } from './application/services/payment-validation.service';
import { NotificationService } from './application/services/notification.service';
import { CreatePaymentHandler } from './application/handlers/create-payment.handler';
import { ConfirmPaymentHandler } from './application/handlers/confirm-payment.handler';
import { CancelPaymentHandler } from './application/handlers/cancel-payment.handler';
import { RefundPaymentHandler } from './application/handlers/refund-payment.handler';
import { PaymentSaga } from './application/saga/payment.saga';

@Module({
  imports: [],
  controllers: [PaymentController],
  providers: [
    PaymentRepositoryImpl,
    ProcessPaymentUseCase,
    ValidatePaymentUseCase,
    CompensatePaymentUseCase,
    PaymentGatewayService,
    PaymentValidationService,
    NotificationService,
    CreatePaymentHandler,
    ConfirmPaymentHandler,
    CancelPaymentHandler,
    RefundPaymentHandler,
    PaymentSaga,
  ],
})
export class AppModule {}
