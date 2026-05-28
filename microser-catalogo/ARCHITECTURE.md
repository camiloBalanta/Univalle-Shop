## Refactorización de Arquitectura - Microservicio de Catálogo

### ✨ Cambios Realizados

Se ha refactorizado el proyecto para implementar una arquitectura **moderna y escalable** que combina:

- **Arquitectura Hexagonal (Puertos y Adaptadores)**: Separación clara entre puertos (contratos) y adaptadores (implementaciones)
- **Domain-Driven Design (DDD)**: Énfasis en la lógica de dominio y estructuración clara de capas
- **Vertical Slice Architecture**: Cada feature (Product) tiene su propia estructura vertical

---

## 📁 Estructura de Carpetas Refactorizada

```
src/
├── adapters/                    ← 🔌 ADAPTADORES (Implementaciones concretas)
│   ├── product.controller.ts    • Controller REST (HTTP)
│   └── product.repository.impl.ts • Implementación del repositorio
│
├── application/                 ← 🎯 CASOS DE USO (Lógica de aplicación)
│   ├── dtos/
│   │   ├── create-product.dto.ts
│   │   └── update-product.dto.ts
│   └── product.service.ts       • Orquestación de lógica
│
├── domain/                      ← 💎 LÓGICA DE DOMINIO (Núcleo del negocio)
│   ├── entities/
│   │   └── product.entity.ts    • Entidades con validaciones
│   └── repositories/            • Interfaces de dominio
│
├── ports/                       ← 🚪 PUERTOS (Contratos/Interfaces)
│   └── product.repository.ts    • IProductRepository
│
├── handlers/                    ← 📨 MANEJADORES DE EVENTOS
│   └── product.handler.ts       • Message Pattern Handlers
│
├── app.module.ts                ← 📦 Módulo raíz con inyección de dependencias
└── main.ts                      ← 🚀 Punto de entrada
```

---

## 🏗️ Principios de Arquitectura Implementados

### 1️⃣ **Arquitectura Hexagonal**

**Puertos (Contracts):**
```typescript
// src/ports/product.repository.ts
export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  // ...
}
```

**Adaptadores de Salida (Output Adapters):**
```typescript
// src/adapters/product.repository.impl.ts
@Injectable()
export class ProductRepositoryImpl implements IProductRepository {
  // Implementación concreta
}
```

**Adaptadores de Entrada (Input Adapters):**
- REST HTTP: `src/adapters/product.controller.ts`
- Mensajería TCP: `src/handlers/product.handler.ts`

### 2️⃣ **Domain-Driven Design (DDD)**

**Entidad de Dominio:**
```typescript
// src/domain/entities/product.entity.ts
export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public price: number,
    public description?: string,
  ) {
    this.validatePrice(); // Validación en el dominio
  }

  updatePrice(price: number): void {
    if (price < 0) {
      throw new Error('El precio no puede ser negativo');
    }
    this.price = price;
  }
}
```

### 3️⃣ **Inyección de Dependencias**

```typescript
// src/app.module.ts
@Module({
  providers: [
    ProductService,
    {
      provide: 'IProductRepository',
      useClass: ProductRepositoryImpl,  // Cambiar implementación fácilmente
    },
  ],
})
```

---

## 🔄 Flujo de Datos (Request/Response)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CLIENT (REST o TCP)                                       │
└────────────────┬──────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ADAPTATION LAYER (Entrada)                                │
│    • ProductController (HTTP)                                │
│    • ProductHandler (TCP/Mensajería)                         │
└────────────────┬──────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. APPLICATION LAYER (Casos de Uso)                          │
│    • ProductService: Orquesta la lógica                      │
│    • DTOs: Valida y transporta datos                         │
└────────────────┬──────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. DOMAIN LAYER (Lógica de Negocio)                         │
│    • Product Entity: Validaciones del dominio               │
│    • Método updatePrice(), updateName()                     │
└────────────────┬──────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. PORT (Contrato)                                          │
│    • IProductRepository: Define el contrato                 │
└────────────────┬──────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. ADAPTER LAYER (Salida - Data Access)                    │
│    • ProductRepositoryImpl: Implementación                  │
│      (en este caso, in-memory; en BD real con TypeORM)     │
└────────────────┬──────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. DATABASE / STORAGE                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Ventajas de esta Arquitectura

| Ventaja | Descripción |
|---------|-------------|
| **Testabilidad** | Cada capa es independiente y fácil de testear |
| **Escalabilidad** | Agregar nuevas features es sencillo (vertical slices) |
| **Mantenibilidad** | Código organizado y responsabilidades claras |
| **Flexibilidad** | Cambiar implementaciones sin afectar la lógica de dominio |
| **Independencia de Framework** | El dominio no depende de NestJS |
| **Reutilización** | DTOs, entidades y servicios son agnósticos del transporte |

---

## 🔧 Ejemplos de Uso

### REST HTTP
```bash
# Crear producto
POST /products
{
  "name": "Laptop",
  "price": 1000,
  "description": "High-end laptop"
}

# Obtener todos
GET /products

# Obtener por ID
GET /products/123456

# Actualizar
PUT /products/123456
{
  "price": 950
}

# Eliminar
DELETE /products/123456
```

### Mensajería TCP (Microservicios)
```typescript
// Desde otro servicio
// client.send('products.create', { name: 'Phone', price: 500 }).toPromise();
```

---

## 📝 Próximos Pasos Recomendados

1. **Base de Datos Reales**: Reemplazar `ProductRepositoryImpl` con TypeORM/Mongoose
2. **Validación**: Agregar `class-validator` y `class-transformer`
3. **Excepciones**: Crear excepciones personalizadas del dominio
4. **Logging**: Implementar sistema de logging (Winston/Pino)
5. **Tests**: Agregar unit tests y e2e tests
6. **Documentación API**: Agregar Swagger/OpenAPI

---

## ✅ Arquivos Actualizados

- ✅ `src/adapters/product.controller.ts` (nuevo)
- ✅ `src/adapters/product.repository.impl.ts` (nuevo)
- ✅ `src/application/product.service.ts` (actualizado)
- ✅ `src/application/dtos/create-product.dto.ts` (actualizado)
- ✅ `src/application/dtos/update-product.dto.ts` (actualizado)
- ✅ `src/domain/entities/product.entity.ts` (mejorado)
- ✅ `src/ports/product.repository.ts` (nuevo)
- ✅ `src/handlers/product.handler.ts` (actualizado)
- ✅ `src/app.module.ts` (refactorizado)
- ✅ `src/main.ts` (mejorado)

---

**¡Tu microservicio ahora tiene una arquitectura profesional y escalable!** 🚀
