import {
  BadRequestException,
  Injectable,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { Product } from '../../domain/entities/product.entity';
import { IProductRepository } from '../../domain/repositories/product.repository';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { ProductCreatedEvent } from '../../domain/events/product-created.event';
import { ProductUpdatedEvent } from '../../domain/events/product-updated.event';
import { ProductDeletedEvent } from '../../domain/events/product-deleted.event';
import { SearchIndexClient } from '../../infrastructure/search/search-index.client';

/**
 * Servicio de aplicación: ProductService
 * Orquesta la lógica de negocio entre DTOs, entidades y puertos
 * No contiene lógica de dominio, solo coordina
 */
@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @Inject('IProductRepository')
    private readonly repository: IProductRepository,
    private readonly eventBus: EventBus,
    private readonly searchIndexClient: SearchIndexClient,
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

  async syncSearchIndex(): Promise<{
    deletedFromIndex: number;
    synced: number;
    total: number;
  }> {
    const products = await this.repository.findAll();
    const deletedFromIndex = await this.searchIndexClient.clearProducts();

    for (const product of products) {
      await this.searchIndexClient.upsertProduct(product);
    }

    return {
      deletedFromIndex,
      synced: products.length,
      total: products.length,
    };
  }

  /**
   * Crear un nuevo producto
   * Valida el DTO y crea la entidad de dominio
   */
  async createProduct(dto: CreateProductDto): Promise<Product> {
    const images = dto.images?.length
      ? dto.images
      : dto.imageUrl
      ? [dto.imageUrl]
      : [];

    const product = new Product(
      randomUUID(),
      dto.name,
      dto.price,
      dto.description,
      images,
      dto.category,
      dto.stock ?? 0,
    );

    const created = await this.repository.create(product);
    await this.searchIndexClient.upsertProduct(created);
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
    const updates: Partial<UpdateProductDto> = { ...dto };
    if (!updates.images?.length && updates.imageUrl) {
      updates.images = [updates.imageUrl];
    }

    const updated = await this.repository.update(id, updates);

    if (updated) {
      await this.searchIndexClient.upsertProduct(updated);
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
      await this.searchIndexClient.deleteProduct(id);
      this.eventBus.publish(new ProductDeletedEvent(id));
    }

    return deleted;
  }

  async decreaseStock(id: string, quantity: number): Promise<Product> {
    this.validateStockQuantity(quantity);
    this.logger.log(`Descontando stock producto=${id} cantidad=${quantity}`);

    const updated = await this.repository.decreaseStock(id, quantity);
    if (!updated) {
      this.logger.warn(
        `Stock insuficiente o producto inexistente producto=${id} cantidad=${quantity}`,
      );
      throw new BadRequestException(
        `Stock insuficiente para el producto ${id}`,
      );
    }

    await this.searchIndexClient.upsertProduct(updated);
    this.eventBus.publish(
      new ProductUpdatedEvent(updated.id, {
        name: updated.name,
        price: updated.price,
        description: updated.description,
      }),
    );
    this.logger.log(`Stock actualizado producto=${id} stock=${updated.stock}`);
    return updated;
  }

  async increaseStock(id: string, quantity: number): Promise<Product> {
    this.validateStockQuantity(quantity);
    this.logger.log(`Reintegrando stock producto=${id} cantidad=${quantity}`);

    const updated = await this.repository.increaseStock(id, quantity);
    if (!updated) {
      throw new NotFoundException(`Producto ${id} no encontrado`);
    }

    await this.searchIndexClient.upsertProduct(updated);
    this.eventBus.publish(
      new ProductUpdatedEvent(updated.id, {
        name: updated.name,
        price: updated.price,
        description: updated.description,
      }),
    );
    return updated;
  }

  private validateStockQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('La cantidad debe ser un entero positivo');
    }
  }
}
