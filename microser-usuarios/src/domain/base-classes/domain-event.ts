export abstract class DomainEvent {
  public readonly dateTimeOccurred: Date;

  constructor() {
    this.dateTimeOccurred = new Date();
  }

  abstract getAggregateId(): string;
}
