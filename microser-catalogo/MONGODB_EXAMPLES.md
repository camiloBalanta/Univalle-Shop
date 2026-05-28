# 📝 Ejemplos Prácticos: Usando MongoDB en el Catálogo

## 🎯 Tabla de Contenidos
1. [Crear Productos](#crear-productos)
2. [Buscar y Filtrar](#buscar-y-filtrar)
3. [Actualizar Inventario](#actualizar-inventario)
4. [Casos de Uso Reales](#casos-de-uso-reales)

---

## ➕ Crear Productos

### Mediante REST (POST /products)

```bash
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Dell XPS 13",
    "description": "Ultrabook portátil con pantalla FHD",
    "price": 1299.99,
    "stock": 25,
    "sku": "DELL-XPS-13-2024",
    "category": "Laptops",
    "tags": ["laptop", "dell", "portable"],
    "images": ["https://example.com/img1.jpg"],
    "active": true,
    "supplier": "Dell Inc."
  }'
```

### En TypeScript (Service)

```typescript
import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IProductRepository } from '../domain/repositories/product.repository';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(createProductDto: CreateProductDTO): Promise<any> {
    // Validaciones
    const existingSku = await this.productRepository.findBySku(
      createProductDto.sku,
    );
    if (existingSku) {
      throw new Error(`SKU ${createProductDto.sku} ya existe`);
    }

    // Crear producto
    const newProduct = await this.productRepository.create(createProductDto);

    return {
      id: newProduct._id,
      message: 'Producto creado exitosamente',
      data: newProduct,
    };
  }
}
```

---

## 🔍 Buscar y Filtrar

### 1. Búsqueda de Texto Completo

```typescript
// Por nombre o descripción
const results = await this.productRepository.search('laptop 4k gaming');

// Resultado:
// [
//   { name: "Laptop ASUS 4K Gaming", price: 2499.99, ... },
//   { name: "Laptop Dell 4K", price: 1899.99, ... },
//   { name: "Monitor Gaming 4K", price: 599.99, ... }
// ]
```

### 2. Filtro por Categoría

```typescript
// Obtener todas las laptops
const laptops = await this.productRepository.findByCategory('Laptops');

// En el servicio:
@Get('category/:category')
async findByCategory(@Param('category') category: string) {
  const products = await this.productRepository.findByCategory(category);
  return {
    category,
    count: products.length,
    products,
  };
}
```

**REST:**
```bash
GET http://localhost:3001/products/category/Laptops
```

### 3. Filtro por Rango de Precio

```typescript
// Productos entre $100 y $500
const midRangeProducts = await this.productRepository.findByPriceRange(100, 500);

@Get('price-range')
async findByPriceRange(
  @Query('min') min: number,
  @Query('max') max: number,
) {
  const products = await this.productRepository.findByPriceRange(min, max);
  return {
    range: { min, max },
    count: products.length,
    products,
  };
}
```

**REST:**
```bash
GET http://localhost:3001/products/price-range?min=100&max=500
```

### 4. Productos por SKU (ID único)

```typescript
// Encontrar producto específico
const product = await this.productRepository.findBySku('DELL-XPS-13-2024');

@Get('sku/:sku')
async findBySku(@Param('sku') sku: string) {
  const product = await this.productRepository.findBySku(sku);
  if (!product) {
    throw new NotFoundException(`Producto ${sku} no encontrado`);
  }
  return product;
}
```

**REST:**
```bash
GET http://localhost:3001/products/sku/DELL-XPS-13-2024
```

### 5. Top Productos (Mejor Valorados)

```typescript
// Top 10 productos
const topRated = await this.productRepository.getTopRated(10);

@Get('top-rated')
async getTopRated(@Query('limit', new DefaultValuePipe(10)) limit: number) {
  const products = await this.productRepository.getTopRated(limit);
  return {
    count: products.length,
    products: products.map(p => ({
      name: p.name,
      price: p.price,
      rating: p.rating,
      reviewCount: p.reviewCount,
    })),
  };
}
```

**REST:**
```bash
GET http://localhost:3001/products/top-rated?limit=5
```

---

## 📦 Actualizar Inventario

### 1. Actualizar Stock en Venta

```typescript
@Post('order/:productId/purchase')
async purchaseProduct(
  @Param('productId') productId: string,
  @Body('quantity') quantity: number,
) {
  // Verificar stock disponible
  const product = await this.productRepository.findById(productId);
  if (!product || product.stock < quantity) {
    throw new Error('Stock insuficiente');
  }

  // Restar del inventario
  const updated = await this.productRepository.updateStock(
    productId,
    -quantity,
  );

  return {
    message: 'Compra procesada',
    productId,
    previousStock: product.stock,
    newStock: updated.stock,
  };
}
```

**REST:**
```bash
POST http://localhost:3001/products/order/650a1b2c3d4e5f/purchase \
  -H "Content-Type: application/json" \
  -d '{"quantity": 2}'
```

### 2. Restock de Productos

```typescript
@Post('restock/:productId')
async restockProduct(
  @Param('productId') productId: string,
  @Body('quantity') quantity: number,
) {
  const updated = await this.productRepository.updateStock(productId, quantity);
  
  return {
    message: 'Producto reabastecido',
    productId,
    newStock: updated.stock,
    timestamp: new Date(),
  };
}
```

**REST:**
```bash
POST http://localhost:3001/products/restock/650a1b2c3d4e5f \
  -d '{"quantity": 50}'
```

### 3. Obtener Productos con Stock Bajo

```typescript
@Get('low-stock')
async getLowStockProducts(
  @Query('threshold', new DefaultValuePipe(10)) threshold: number,
) {
  const products = await this.productRepository.findLowStock(threshold);
  
  return {
    threshold,
    count: products.length,
    products: products.map(p => ({
      name: p.name,
      sku: p.sku,
      currentStock: p.stock,
      needsRestock: threshold - p.stock,
    })),
  };
}
```

**REST:**
```bash
GET http://localhost:3001/products/low-stock?threshold=15
```

---

## 🚀 Casos de Uso Reales

### Caso 1: Sistema de Carrito de Compras

```typescript
@Injectable()
export class CartService {
  constructor(
    @Inject('IProductRepository')
    private productRepository: IProductRepository,
  ) {}

  async addToCart(cartItems: { sku: string; quantity: number }[]) {
    const items = [];

    for (const item of cartItems) {
      const product = await this.productRepository.findBySku(item.sku);
      
      if (!product) {
        throw new Error(`Producto ${item.sku} no existe`);
      }
      
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}`);
      }

      items.push({
        product,
        quantity: item.quantity,
        subtotal: product.price * item.quantity,
      });
    }

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      items,
      total,
      tax: total * 0.16, // 16% IVA
      grandTotal: total * 1.16,
    };
  }
}
```

### Caso 2: Recomendaciones Personalizadas

```typescript
@Injectable()
export class RecommendationService {
  constructor(
    @Inject('IProductRepository')
    private productRepository: IProductRepository,
  ) {}

  async getRecommendations(
    category: string,
    excludeProductId: string,
    limit: number = 5,
  ) {
    // Obtener los mejor valorados de la categoría
    const topProducts = await this.productRepository.getTopRated(10);
    
    const recommendations = topProducts
      .filter(p => p._id.toString() !== excludeProductId && p.category === category)
      .slice(0, limit);

    return {
      message: 'Productos recomendados',
      category,
      recommendations: recommendations.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        rating: p.rating,
        reviewCount: p.reviewCount,
      })),
    };
  }
}
```

### Caso 3: Búsqueda Avanzada

```typescript
@Post('advanced-search')
async advancedSearch(
  @Body() filters: {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
  },
) {
  let results = [];

  // Búsqueda de texto
  if (filters.query) {
    results = await this.productRepository.search(filters.query);
  } else {
    results = await this.productRepository.findAll();
  }

  // Filtrar por categoría
  if (filters.category) {
    results = results.filter(p => p.category === filters.category);
  }

  // Filtrar por precio
  if (filters.minPrice && filters.maxPrice) {
    results = results.filter(
      p => p.price >= filters.minPrice && p.price <= filters.maxPrice,
    );
  }

  // Filtrar por rating
  if (filters.minRating) {
    results = results.filter(p => p.rating >= filters.minRating);
  }

  // Ordenar por relevancia (rating descendente)
  results.sort((a, b) => b.rating - a.rating);

  return {
    totalResults: results.length,
    filters,
    products: results.slice(0, 20), // Paginar: primeros 20
  };
}
```

**REST:**
```bash
POST http://localhost:3001/products/advanced-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "laptop gaming",
    "category": "Laptops",
    "minPrice": 1000,
    "maxPrice": 2500,
    "minRating": 4.5
  }'
```

### Caso 4: Importar Catálogo Masivo

```typescript
@Post('bulk-import')
async bulkImportProducts(@Body() productsData: CreateProductDTO[]) {
  try {
    // Validar no duplicados
    const skus = productsData.map(p => p.sku);
    const duplicates = skus.filter((sku, i) => skus.indexOf(sku) !== i);
    
    if (duplicates.length > 0) {
      throw new Error(`SKUs duplicados: ${duplicates.join(', ')}`);
    }

    // Insertar todos
    const inserted = await this.productRepository.bulkCreate(productsData);

    return {
      message: 'Importación completada',
      totalInserted: inserted.length,
      timestamp: new Date(),
    };
  } catch (error) {
    throw new BadRequestException(`Error en importación: ${error.message}`);
  }
}
```

**REST:**
```bash
POST http://localhost:3001/products/bulk-import \
  -H "Content-Type: application/json" \
  -d '[
    {
      "name": "Product 1",
      "price": 99.99,
      "sku": "PROD-001",
      ...
    },
    {
      "name": "Product 2",
      "price": 199.99,
      "sku": "PROD-002",
      ...
    }
  ]'
```

### Caso 5: Dashboard de Inventario

```typescript
@Get('inventory-report')
async getInventoryReport() {
  const allProducts = await this.productRepository.findAll();
  const lowStock = await this.productRepository.findLowStock(10);
  const topRated = await this.productRepository.getTopRated(5);

  return {
    summary: {
      totalProducts: allProducts.length,
      totalInventoryValue: allProducts.reduce(
        (sum, p) => sum + p.price * p.stock,
        0,
      ),
      averagePrice: (
        allProducts.reduce((sum, p) => sum + p.price, 0) / allProducts.length
      ).toFixed(2),
      averageRating: (
        allProducts.reduce((sum, p) => sum + p.rating, 0) / allProducts.length
      ).toFixed(2),
    },
    alerts: {
      lowStockCount: lowStock.length,
      lowStockProducts: lowStock.map(p => ({
        name: p.name,
        sku: p.sku,
        stock: p.stock,
      })),
    },
    topPerformers: topRated.map(p => ({
      name: p.name,
      rating: p.rating,
      reviews: p.reviewCount,
    })),
    generatedAt: new Date(),
  };
}
```

**REST:**
```bash
GET http://localhost:3001/products/inventory-report
```

---

## 📊 Respuestas Ejemplo

### Búsqueda Exitosa
```json
{
  "totalResults": 3,
  "filters": {
    "query": "laptop",
    "minPrice": 1000
  },
  "products": [
    {
      "_id": "650a1b2c3d4e5f",
      "name": "Laptop Dell XPS 13",
      "price": 1299.99,
      "rating": 4.8,
      "stock": 25
    }
  ]
}
```

### Actualización de Stock
```json
{
  "message": "Compra procesada",
  "productId": "650a1b2c3d4e5f",
  "previousStock": 25,
  "newStock": 23
}
```

### Dashboard
```json
{
  "summary": {
    "totalProducts": 150,
    "totalInventoryValue": 250000,
    "averagePrice": "1666.67",
    "averageRating": "4.63"
  },
  "alerts": {
    "lowStockCount": 8,
    "lowStockProducts": []
  }
}
```

---

**💡 Tip:** Usa Postman o Insomnia para testear estos endpoints. ¡Puedes importar colecciones!
