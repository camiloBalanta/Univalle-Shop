/**
 * Entidad de dominio: Product
 * Representa un producto en el sistema
 * Contiene la lógica de negocio relacionada con productos
 */
export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public price: number,
    public description?: string,
    public images: string[] = [],
  ) {
    this.validate();
  }

  /**
   * Valida que el precio sea positivo
   * Lógica de negocio: Un producto no puede tener precio negativo
   */
  private validate(): void {
    if (this.price < 0) {
      throw new Error('El precio del producto no puede ser negativo');
    }
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('El nombre del producto no puede estar vacío');
    }
  }

  /**
   * Método de dominio: Actualizar nombre
   */
  updateName(name: string): void {
    this.name = name;
    this.validate();
  }

  /**
   * Método de dominio: Actualizar precio
   */
  updatePrice(price: number): void {
    this.price = price;
    this.validate();
  }

  /**
   * Método de dominio: Actualizar descripción
   */
  updateDescription(description: string | undefined): void {
    this.description = description;
  }

  /**
   * Método de dominio: Actualizar imágenes
   */
  updateImages(images: string[]): void {
    this.images = images || [];
  }

  /**
   * Getter para obtener la imagen principal.
   * Ayuda a que el frontend siempre tenga algo que mostrar.
   */
  get mainImage(): string {
    return this.images.length > 0 
      ? this.images[0] 
      : 'https://placehold.co/600x400?text=Sin+Imagen';
  }
}
