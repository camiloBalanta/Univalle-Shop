import { OrderId } from '../value-objects/order-id.value-object';
import { CustomerId } from '../value-objects/customer-id.value-object';
import { ProductId } from '../value-objects/product-id.value-object';
import { Quantity } from '../value-objects/quantity.value-object';
import { Money } from '../value-objects/money.value-object';
import { OrderStatus } from '../value-objects/order-status.value-object';

export class OrderItem {
  constructor(
    public productId: ProductId,
    public quantity: Quantity,
    public price: Money,
  ) {}
}

export class Order {
  constructor(
    public id: OrderId,
    public customerId: CustomerId,
    public items: OrderItem[],
    public totalAmount: Money,
    public status: OrderStatus,
    public createdAt: Date,
  ) {}
}