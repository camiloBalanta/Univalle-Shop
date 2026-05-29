import {
  BadRequestException,
  ConflictException,
  Injectable,
  Inject,
  Logger,
} from '@nestjs/common';
import { Order } from '../../../domain/entities/order.entity';
import { OrderStatus } from '../../../domain/value-objects/order-status.value-object';
import { ORDER_REPOSITORY, type OrderRepository } from '../../../domain/ports/order.repository';

@Injectable()
export class UpdateOrderStatusUseCase {
  private readonly logger = new Logger(UpdateOrderStatusUseCase.name);
  private readonly catalogServiceUrl =
    this.getEnv('CATALOG_SERVICE_URL') || 'http://catalog-service:3000';

  constructor(@Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string, status: OrderStatus): Promise<Order | null> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status.isPaidLike() && status.isPaidLike()) {
      this.logger.warn(
        `Orden ${orderId} ya estaba pagada; se omite descuento duplicado`,
      );
      return order;
    }

    if (status.isPaidLike() && !order.status.isPaidLike()) {
      const claimedOrder = await this.claimOrderForPayment(order);
      if (!claimedOrder) {
        return this.orderRepository.findById(orderId);
      }
      await this.decreaseCatalogStock(claimedOrder);
    }

    const updatedOrder = new Order(
      order.id,
      order.customerId,
      order.items,
      order.totalAmount,
      status,
      order.createdAt,
    );

    return this.orderRepository.update(orderId, updatedOrder);
  }

  private async claimOrderForPayment(order: Order): Promise<Order | null> {
    if (order.status.isPaymentProcessing()) {
      throw new ConflictException(
        `La orden ${order.id.toString()} ya esta procesando el pago`,
      );
    }

    const claimedOrder = await this.orderRepository.updateStatusIfCurrent(
      order.id.toString(),
      order.status.toString(),
      OrderStatus.paymentProcessing().toString(),
    );

    if (!claimedOrder) {
      const currentOrder = await this.orderRepository.findById(order.id.toString());
      if (currentOrder?.status.isPaidLike()) {
        this.logger.warn(
          `Orden ${order.id.toString()} ya fue pagada por otra solicitud`,
        );
        return null;
      }

      throw new ConflictException(
        `No se pudo reservar la orden ${order.id.toString()} para procesar pago`,
      );
    }

    return claimedOrder;
  }

  private async decreaseCatalogStock(order: Order): Promise<void> {
    const discountedItems: Array<{ productId: string; quantity: number }> = [];
    this.logger.log(`Iniciando descuento de inventario orden=${order.id.toString()}`);

    try {
      for (const item of order.items) {
        const productId = item.productId.toString();
        const quantity = item.quantity.toNumber();

        this.logger.log(
          `Descontando inventario orden=${order.id.toString()} producto=${productId} cantidad=${quantity}`,
        );

        const response = await fetch(
          `${this.catalogServiceUrl}/products/${productId}/stock/decrease`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity }),
          },
        );

        if (!response.ok) {
          const errorBody = await response.text();
          throw new BadRequestException(
            `No se pudo descontar stock del producto ${productId}: ${errorBody}`,
          );
        }

        discountedItems.push({ productId, quantity });
      }
    } catch (error) {
      this.logger.error(
        `Fallo el descuento de inventario orden=${order.id.toString()}. Revirtiendo ${discountedItems.length} item(s).`,
        error instanceof Error ? error.stack : String(error),
      );
      await this.rollbackCatalogStock(discountedItems);
      await this.markOrderAsPaymentRejected(order);
      throw error;
    }
  }

  private async markOrderAsPaymentRejected(order: Order): Promise<void> {
    const rejectedOrder = new Order(
      order.id,
      order.customerId,
      order.items,
      order.totalAmount,
      OrderStatus.paymentRejected(),
      order.createdAt,
    );
    await this.orderRepository.update(order.id.toString(), rejectedOrder);
  }

  private getEnv(key: string): string | undefined {
    return (globalThis as { process?: { env?: Record<string, string> } })
      .process?.env?.[key];
  }

  private async rollbackCatalogStock(
    discountedItems: Array<{ productId: string; quantity: number }>,
  ): Promise<void> {
    await Promise.all(
      discountedItems.map(async (item) => {
        try {
          await fetch(
            `${this.catalogServiceUrl}/products/${item.productId}/stock/increase`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ quantity: item.quantity }),
            },
          );
        } catch (error) {
          this.logger.error(
            `No se pudo revertir stock producto=${item.productId}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }),
    );
  }
}
