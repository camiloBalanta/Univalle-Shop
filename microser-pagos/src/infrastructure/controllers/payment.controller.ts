import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
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
  private readonly logger = new Logger(PaymentController.name);

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
    return this.refundPaymentHandler.execute(
      new RefundPaymentCommand(id, body.amount),
    );
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

  @Post('simulate/:orderId')
  async simulatePayment(
    @Param('orderId') orderId: string,
    @Body() body: { amount: number; customerId: string },
  ) {
    const approved = Math.random() < 0.7;
    let paymentStatus = approved ? 'approved' : 'rejected';
    let message =
      paymentStatus === 'approved'
        ? 'Pago procesado exitosamente'
        : 'Pago rechazado. Intenta de nuevo.';

    try {
      const orderStatus = approved ? 'paid' : 'payment_rejected';
      const ordersServiceUrl =
        this.getEnv('ORDERS_SERVICE_HOST_PORT') || 'http://orders-service:3004';

      this.logger.log(
        `Pago simulado orden=${orderId} estadoPago=${paymentStatus} estadoOrden=${orderStatus}`,
      );

      const response = await fetch(`${ordersServiceUrl}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: orderStatus }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(
          `No se pudo actualizar orden ${orderId} a estado ${orderStatus}: ${errorBody}`,
        );
        paymentStatus = 'rejected';
        message =
          'Pago no aprobado: no fue posible confirmar inventario para la orden.';
      }
    } catch (error) {
      this.logger.error(
        `Error actualizando orden ${orderId} despues del pago`,
        error instanceof Error ? error.stack : String(error),
      );
      paymentStatus = 'rejected';
      message =
        'Pago no aprobado: no fue posible actualizar la orden y el inventario.';
    }

    return {
      paymentId: `PAY-${Date.now()}`,
      orderId,
      customerId: body.customerId,
      amount: body.amount,
      status: paymentStatus,
      timestamp: new Date().toISOString(),
      message,
    };
  }

  private getEnv(key: string): string | undefined {
    return (globalThis as { process?: { env?: Record<string, string> } })
      .process?.env?.[key];
  }
}
