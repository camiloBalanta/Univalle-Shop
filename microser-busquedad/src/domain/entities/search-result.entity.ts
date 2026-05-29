export class ProductSearchResult {
  constructor(
    public readonly productId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly category: string,
    public readonly price: number,
    public readonly imageUrl: string,
    public readonly stock: number,
    public readonly seller: string,
    public readonly tags: string[] = [],
  ) {}
}
