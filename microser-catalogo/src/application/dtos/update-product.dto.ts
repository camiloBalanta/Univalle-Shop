/**
 * DTO (Data Transfer Object) para actualizar productos
 * Todos los campos son opcionales para permitir actualizaciones parciales
 */
export class UpdateProductDto {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  stock?: number;
  images?: string[];
  imageUrl?: string;
}
