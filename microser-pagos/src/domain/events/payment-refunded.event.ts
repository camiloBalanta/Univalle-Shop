export class PaymentRefundedEvent {
  constructor(public readonly paymentId: string, public readonly amount: number) {}
}
