import { Body, Controller, Param, Post, Get } from '@nestjs/common';
import { CreatePaymentDto } from '../../application/dtos/create-payment.dto';
import { RefundDto } from '../../application/dtos/refund.dto';
import { CreatePaymentCommand } from '../../application/commands/create-payment.command';
import { ConfirmPaymentCommand } from '../../application/commands/confirm-payment.command';
import { CancelPaymentCommand } from '../../application/commands/cancel-payment.command';
import { RefundPaymentCommand } from '../../application/commands/refund-payment.command';
import { CreatePaymentHandler } from '../../application/handlers/create-payment.handler';
import { ConfirmPaymentHandler } from '../../application/handlers/confirm-payment.handler';
import { CancelPaymentHandler } from '../../application/handlers/cancel-payment.handler';
import { RefundPaymentHandler } from '../../application/handlers/refund-payment.handler';
import { PaymentSaga } from '../../application/saga/payment.saga';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly createPaymentHandler: CreatePaymentHandler,
    private readonly confirmPaymentHandler: ConfirmPaymentHandler,
    private readonly cancelPaymentHandler: CancelPaymentHandler,
    private readonly refundPaymentHandler: RefundPaymentHandler,
    private readonly paymentSaga: PaymentSaga,
  ) {}

  @Post()
  async create(@Body() body: CreatePaymentDto) {
    const command = new CreatePaymentCommand(
      body.amount,
      body.currency,
      body.orderId,
      body.customerId,
    );

    return this.createPaymentHandler.execute(command);
  }

  @Post(':id/confirm')
  async confirm(@Param('id') id: string) {
    return this.confirmPaymentHandler.execute(new ConfirmPaymentCommand(id));
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.cancelPaymentHandler.execute(new CancelPaymentCommand(id));
  }

  @Post(':id/refund')
  async refund(@Param('id') id: string, @Body() body: RefundDto) {
    return this.refundPaymentHandler.execute(new RefundPaymentCommand(id, body.amount));
  }

  @Get('health')
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'payment-microservice',
      version: '1.0.0',
    };
  }

  @Get('saga/:sagaId')
  async getSagaStatus(@Param('sagaId') sagaId: string) {
    const saga = this.paymentSaga.getSagaState(sagaId);
    if (!saga) {
      return { error: 'Saga not found' };
    }
    return saga;
  }

  @Get('saga')
  async getAllSagas() {
    return this.paymentSaga.getAllSagas();
  }
}

