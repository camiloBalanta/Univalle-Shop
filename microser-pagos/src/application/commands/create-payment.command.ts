export class CreatePaymentCommand {
  constructor(
    public readonly amount: number,
    public readonly currency: string,
    public readonly orderId: string,
    public readonly customerId: string,
  ) {}
}
