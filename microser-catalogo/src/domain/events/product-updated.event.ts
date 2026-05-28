export class ProductUpdatedEvent {
  constructor(
    public readonly productId: string,
    public readonly changes: {
      name?: string;
      price?: number;
      description?: string;
    },
  ) {}
}
