import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ProductService } from '../../application/use-cases/product.service';
import { CreateProductDto } from '../../application/dtos/create-product.dto';
import { UpdateProductDto } from '../../application/dtos/update-product.dto';

/**
 * Adaptador: ProductHandler
 * Maneja mensajes de eventos en el patrón de microservicios
 * Permite comunicación asincrónica con otros microservicios
 * Arquitectura Hexagonal: Adaptador de entrada (por mensajería)
 */
@Controller()
export class ProductHandler {
  constructor(private readonly productService: ProductService) {}

  /**
   * Obtiene todos los productos mediante mensaje
   */
  @MessagePattern('products.getAll')
  async getAllProducts() {
    return this.productService.getAllProducts();
  }

  /**
   * Obtiene un producto por ID mediante mensaje
   */
  @MessagePattern('products.getById')
  async getProductById(data: { id: string }) {
    return this.productService.getProductById(data.id);
  }

  /**
   * Crea un producto mediante mensaje
   */
  @MessagePattern('products.create')
  async createProduct(dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  /**
   * Actualiza un producto mediante mensaje
   */
  @MessagePattern('products.update')
  async updateProduct(data: { id: string; dto: UpdateProductDto }) {
    return this.productService.updateProduct(data.id, data.dto);
  }

  /**
   * Elimina un producto mediante mensaje
   */
  @MessagePattern('products.delete')
  async deleteProduct(data: { id: string }) {
    return this.productService.deleteProduct(data.id);
  }
}
