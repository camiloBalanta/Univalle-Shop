export class NotifyPaymentCommand {
  constructor(public readonly paymentId: string, public readonly event: string) {}
}
