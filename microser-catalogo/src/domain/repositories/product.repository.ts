import { Product } from '../entities/product.entity';

/**
 * Puerto (Interface) del repositorio de productos
 * Define el contrato que deben cumplir todos los adaptadores
 * Principio Hexagonal: Define el contrato sin conocer la implementación
 */
export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(product: Product): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}
