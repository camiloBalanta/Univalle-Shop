/**
 * DTO (Data Transfer Object) para crear productos
 * Valida y transporta datos desde el cliente hacia la capa de aplicación
 */
export class CreateProductDto {
  name: string;
  price: number;
  description?: string;
}
