export class NotificationService {
  notify(paymentId: string, event: string) {
    return {
      paymentId,
      event,
      message: `Notification sent for ${event}`,
    };
  }
}
