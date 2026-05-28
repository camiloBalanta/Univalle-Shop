export interface PaymentProps {
  id?: string;
  amount: number;
  currency: string;
  orderId: string;
  customerId: string;
  status?: string;
  createdAt?: string;
  refundAmount?: number;
}

export class Payment {
  id: string;
  amount: number;
  currency: string;
  orderId: string;
  customerId: string;
  status: string;
  createdAt: string;
  refundAmount?: number;

  constructor(props: PaymentProps) {
    this.id = props.id ?? `payment_${Date.now()}`;
    this.amount = props.amount;
    this.currency = props.currency;
    this.orderId = props.orderId;
    this.customerId = props.customerId;
    this.status = props.status ?? 'pending';
    this.createdAt = props.createdAt ?? new Date().toISOString();
    this.refundAmount = props.refundAmount;
  }
}
