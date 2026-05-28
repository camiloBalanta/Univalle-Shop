export class SyncCatalogCommand {
  constructor(
    public readonly productId: string,
    public readonly name?: string,
    public readonly price?: number,
    public readonly description?: string,
  ) {}
}
