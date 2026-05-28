export class Query {
  public readonly value: string;

  constructor(value: string) {
    this.value = String(value ?? '').trim();
  }

  isEmpty(): boolean {
    return this.value.length === 0;
  }
}
