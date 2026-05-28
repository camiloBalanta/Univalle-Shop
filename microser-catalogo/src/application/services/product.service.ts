import { Injectable, Inject } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Product } from '../../domain/entities/product.entity';
import { IProductRepository } from '../../domain/repositories/product.repository';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { ProductCreatedEvent } from '../../domain/events/product-created.event';
import { ProductUpdatedEvent } from '../../domain/events/product-updated.event';
import { ProductDeletedEvent } from '../../domain/events/product-deleted.event';

/**
 * Servicio de aplicación: ProductService
 * Orquesta la lógica de negocio entre DTOs, entidades y puertos
 * No contiene lógica de dominio, solo coordina
 */
@Injectable()
export class ProductService {
  constructor(
    @Inject('IProductRepository')
    private readonly repository: IProductRepository,
    private readonly eventBus: EventBus,
  ) {}

  /**
   * Obtener todos los productos
   */
  async getAllProducts(): Promise<Product[]> {
    return this.repository.findAll();
  }

  /**
   * Obtener producto por ID
   */
  async getProductById(id: string): Promise<Product | null> {
    return this.repository.findById(id);
  }

  /**
   * Crear un nuevo producto
   * Valida el DTO y crea la entidad de dominio
   */
  async createProduct(dto: CreateProductDto): Promise<Product> {
    const product = new Product(
      Date.now().toString(),
      dto.name,
      dto.price,
      dto.description,
    );

    const created = await this.repository.create(product);
    this.eventBus.publish(
      new ProductCreatedEvent(
        created.id,
        created.name,
        created.price,
        created.description,
      ),
    );

    return created;
  }

  /**
   * Actualizar un producto existente
   */
  async updateProduct(
    id: string,
    dto: UpdateProductDto,
  ): Promise<Product | null> {
    const updated = await this.repository.update(id, dto);

    if (updated) {
      this.eventBus.publish(
        new ProductUpdatedEvent(updated.id, {
          name: updated.name,
          price: updated.price,
          description: updated.description,
        }),
      );
    }

    return updated;
  }

  /**
   * Eliminar un producto
   */
  async deleteProduct(id: string): Promise<boolean> {
    const deleted = await this.repository.delete(id);

    if (deleted) {
      this.eventBus.publish(new ProductDeletedEvent(id));
    }

    return deleted;
  }
}
