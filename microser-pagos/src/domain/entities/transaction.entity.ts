export class Transaction {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;

  constructor(paymentId: string, amount: number, currency: string) {
    this.id = `txn_${Date.now()}`;
    this.paymentId = paymentId;
    this.amount = amount;
    this.currency = currency;
    this.status = 'pending';
    this.createdAt = new Date().toISOString();
  }
}
