export class PaymentCompensatedEvent {
  constructor(public readonly paymentId: string, public readonly type: 'cancel' | 'refund') {}
}
