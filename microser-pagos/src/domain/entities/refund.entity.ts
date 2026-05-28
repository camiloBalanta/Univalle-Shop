export class Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason?: string;
  createdAt: string;

  constructor(paymentId: string, amount: number, reason?: string) {
    this.id = `refund_${Date.now()}`;
    this.paymentId = paymentId;
    this.amount = amount;
    this.reason = reason;
    this.createdAt = new Date().toISOString();
  }
}
