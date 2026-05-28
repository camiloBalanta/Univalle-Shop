export class NotifyInventoryCommand {
  constructor(
    public readonly productId: string,
    public readonly name: string,
    public readonly price: number,
  ) {}
}
