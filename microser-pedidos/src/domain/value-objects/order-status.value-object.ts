export class OrderStatus {
  private static readonly VALID_STATUSES = [
    'pending',
    'confirmed',
    'payment_processing',
    'paid',
    'approved',
    'completed',
    'payment_rejected',
    'failed',
    'shipped',
    'delivered',
    'cancelled',
  ];

  constructor(private value: string) {
    if (!OrderStatus.VALID_STATUSES.includes(value)) {
      throw new Error(`Invalid order status: ${value}`);
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }

  isPaidLike(): boolean {
    return ['paid', 'approved', 'completed'].includes(this.value);
  }

  isRejectedLike(): boolean {
    return ['payment_rejected', 'failed', 'cancelled'].includes(this.value);
  }

  isPaymentProcessing(): boolean {
    return this.value === 'payment_processing';
  }

  static pending(): OrderStatus {
    return new OrderStatus('pending');
  }

  static confirmed(): OrderStatus {
    return new OrderStatus('confirmed');
  }

  static paymentProcessing(): OrderStatus {
    return new OrderStatus('payment_processing');
  }

  static paid(): OrderStatus {
    return new OrderStatus('paid');
  }

  static approved(): OrderStatus {
    return new OrderStatus('approved');
  }

  static completed(): OrderStatus {
    return new OrderStatus('completed');
  }

  static paymentRejected(): OrderStatus {
    return new OrderStatus('payment_rejected');
  }

  static shipped(): OrderStatus {
    return new OrderStatus('shipped');
  }

  static delivered(): OrderStatus {
    return new OrderStatus('delivered');
  }

  static cancelled(): OrderStatus {
    return new OrderStatus('cancelled');
  }
}
