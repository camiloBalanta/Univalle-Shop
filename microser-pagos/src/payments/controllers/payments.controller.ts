import { Body, Controller, Delete, Get, Logger, Param, Patch, Post } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { PaymentStatus } from '../interfaces/payment-status.enum';
import { PaymentsService } from '../services/payments.service';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async findAll() {
    return this.paymentsService.findAll();
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.paymentsService.findByUserId(userId);
  }

  @Get('order/:orderId')
  async findByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrderId(orderId);
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: string) {
    return this.paymentsService.findByStatus(status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  async create(@Body() body: CreatePaymentDto) {
    return this.paymentsService.create(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdatePaymentDto) {
    return this.paymentsService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.paymentsService.delete(id);
  }

  @Post('simulate/:orderId')
  async simulatePayment(
    @Param('orderId') orderId: string,
    @Body() body: { amount: number; customerId: string; currency?: string; paymentMethod?: string },
  ) {
    const transactionId = `PAY-${Date.now()}`;
    const approved = Math.random() < 0.7;
    let paymentStatus = approved ? PaymentStatus.COMPLETED : PaymentStatus.REJECTED;
    let message =
      paymentStatus === PaymentStatus.COMPLETED
        ? 'Pago procesado exitosamente'
        : 'Pago rechazado. Intenta de nuevo.';

    const order = await this.paymentsService.getOrder(orderId);

    try {
      const orderStatus = approved ? 'completed' : 'payment_rejected';
      const ordersServiceUrl =
        this.getEnv('ORDERS_SERVICE_HOST_PORT') || 'http://orders-service:3004';

      this.logger.log(
        `Pago recibido transactionId=${transactionId} orderId=${orderId} status=${paymentStatus}`,
      );

      const response = await fetch(`${ordersServiceUrl}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: orderStatus }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(
          `Error actualizando orden ${orderId} a ${orderStatus}: ${errorBody}`,
        );
        paymentStatus = PaymentStatus.REJECTED;
        message =
          'Pago no aprobado: no fue posible confirmar inventario para la orden.';
      } else if (approved) {
        const recommendationServiceUrl =
          this.getEnv('RECOMMENDATION_SERVICE_URL') ||
          'http://recommendation-service:3000';
        const userId = body.customerId ?? order.customerId;

        try {
          const recResponse = await fetch(
            `${recommendationServiceUrl}/recommendations/${encodeURIComponent(
              userId,
            )}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
            },
          );

          if (!recResponse.ok) {
            const recErrorBody = await recResponse.text();
            this.logger.warn(
              `No se pudo actualizar recomendaciones para usuario ${userId}: ${recErrorBody}`,
            );
          }
        } catch (recError) {
          this.logger.warn(
            `Error actualizando recomendaciones para usuario ${userId}: ${
              recError instanceof Error ? recError.message : String(recError)
            }`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Error actualizando orden ${orderId} despues del pago`,
        error instanceof Error ? error.stack : String(error),
      );
      paymentStatus = PaymentStatus.REJECTED;
      message =
        'Pago no aprobado: no fue posible actualizar la orden y el inventario.';
    }

    const savedPayment = await this.paymentsService.upsertFromGateway({
      transactionId,
      paymentId: transactionId,
      orderId,
      userId: body.customerId ?? order.customerId,
      products: order.items,
      subtotal: order.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
      taxes: 0,
      totalPaid: body.amount,
      currency: body.currency ?? 'COP',
      paymentMethod: body.paymentMethod ?? 'SIMULATED',
      gatewayReference: transactionId,
      status: paymentStatus,
      gatewayResponse: {
        provider: 'SIMULATED',
        approved,
        message,
        orderSnapshot: order,
      },
    });

    return {
      paymentId: savedPayment.transactionId,
      orderId,
      customerId: savedPayment.userId,
      amount: savedPayment.totalPaid,
      status:
        savedPayment.status === PaymentStatus.APPROVED ||
        savedPayment.status === PaymentStatus.COMPLETED
          ? 'approved'
          : 'rejected',
      timestamp: savedPayment.createdAt.toISOString(),
      message,
    };
  }

  private getEnv(key: string): string | undefined {
    return (globalThis as { process?: { env?: Record<string, string> } })
      .process?.env?.[key];
  }
}

