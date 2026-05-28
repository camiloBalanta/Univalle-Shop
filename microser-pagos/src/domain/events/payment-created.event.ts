export class PaymentCreatedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly amount: number,
    public readonly currency: string,
  ) {}
}
