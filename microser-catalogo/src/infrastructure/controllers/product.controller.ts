import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ProductService } from '../../application/use-cases/product.service';
import { CreateProductDto } from '../../application/dtos/create-product.dto';
import { UpdateProductDto } from '../../application/dtos/update-product.dto';

/**
 * Adaptador: ProductController
 * Expone la API REST para la entidad Product
 * Es el punto de entrada HTTP para el microservicio
 * Arquitectura Hexagonal: Adaptador de entrada (driving adapter)
 */
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * GET /products
   * Obtiene todos los productos
   */
  @Get()
  async getAllProducts() {
    return this.productService.getAllProducts();
  }

  /**
   * GET /products/:id
   * Obtiene un producto por su ID
   */
  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  /**
   * POST /products
   * Crea un nuevo producto
   */
  @Post()
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  /**
   * PUT /products/:id
   * Actualiza un producto existente
   */
  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(id, dto);
  }

  /**
   * DELETE /products/:id
   * Elimina un producto
   */
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
