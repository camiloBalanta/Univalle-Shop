export class PaymentEventHandler {
  handle(event: unknown) {
    return {
      handled: true,
      event,
    };
  }
}
