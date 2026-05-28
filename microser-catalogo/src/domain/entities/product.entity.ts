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
  ) {
    this.validatePrice();
  }

  /**
   * Valida que el precio sea positivo
   * Lógica de negocio: Un producto no puede tener precio negativo
   */
  private validatePrice(): void {
    if (this.price < 0) {
      throw new Error('El precio del producto no puede ser negativo');
    }
  }

  /**
   * Método de dominio: Actualizar nombre
   */
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('El nombre del producto no puede estar vacío');
    }
    this.name = name;
  }

  /**
   * Método de dominio: Actualizar precio
   */
  updatePrice(price: number): void {
    if (price < 0) {
      throw new Error('El precio del producto no puede ser negativo');
    }
    this.price = price;
  }

  /**
   * Método de dominio: Actualizar descripción
   */
  updateDescription(description: string | undefined): void {
    this.description = description;
  }
}
