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

  @Post('simulate/:orderId')
  async simulatePayment(
    @Param('orderId') orderId: string,
    @Body() body: { amount: number; customerId: string },
  ) {
    const approved = Math.random() < 0.7; // 70% aprobado, 30% rechazado
    const paymentStatus = approved ? 'approved' : 'rejected';

    try {
      // Intenta actualizar el estado de la orden en el microservicio de órdenes
      const orderStatus = approved ? 'paid' : 'payment_rejected';
      const ordersServiceUrl =
        process.env.ORDERS_SERVICE_HOST_PORT || 'http://orders-service:3004';

      await fetch(`http://orders-service:3004/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: orderStatus }),
      }).catch(() => {
        // Si falla, seguimos de todos modos porque la orden ya existe
        console.log(
          `No se pudo actualizar orden ${orderId} a estado ${orderStatus}`,
        );
      });
    } catch (error) {
      console.error('Error updating order status:', error);
    }

    return {
      paymentId: `PAY-${Date.now()}`,
      orderId,
      customerId: body.customerId,
      amount: body.amount,
      status: paymentStatus,
      timestamp: new Date().toISOString(),
      message:
        paymentStatus === 'approved'
          ? 'Pago procesado exitosamente'
          : 'Pago rechazado. Intenta de nuevo.',
    };
  }
}

