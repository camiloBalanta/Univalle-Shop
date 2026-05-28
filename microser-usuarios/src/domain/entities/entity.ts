export abstract class Entity<T extends { id: any }> {
  protected readonly _id: T['id'];
  protected readonly domainEvents: any[] = [];

  constructor(id: T['id']) {
    this._id = id;
  }

  get id(): T['id'] {
    return this._id;
  }

  get events() {
    return this.domainEvents;
  }

  addDomainEvent(event: any): void {
    this.domainEvents.push(event);
  }

  removeDomainEvent(event: any): void {
    const index = this.domainEvents.indexOf(event);
    if (index >= 0) {
      this.domainEvents.splice(index, 1);
    }
  }

  clearDomainEvents(): void {
    this.domainEvents.length = 0;
  }

  equals(object?: Entity<T>): boolean {
    if (!object) return false;
    return this._id === object._id;
  }
}