<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# 🛍️ Microservicio de Catálogo - Ecommerce

Microservicio de **catálogo de productos** construido con **NestJS**, **MongoDB Atlas** y **arquitectura hexagonal**.

## 📊 Características

- ✅ **CRUD completo** de productos
- ✅ **Búsqueda de texto completo** (full-text search)
- ✅ **Filtros avanzados** (categoría, precio, rating)
- ✅ **Gestión de inventario** (stock real-time)
- ✅ **MongoDB Atlas** en la nube
- ✅ **Arquitectura hexagonal** (puertos y adaptadores)
- ✅ **Type-safe** con TypeScript
- ✅ **Escalable** para microservicios

## 🚀 Quick Start

### 1. Setup MongoDB Atlas
```bash
# Ve a https://www.mongodb.com/cloud/atlas
# - Crea cluster (M0 gratuito)
# - Crea usuario de BD
# - Whitelist tu IP
# - Copia la connection string
```

### 2. Configurar Variables de Entorno
```bash
cp .env.example .env
# Edita .env con tu MONGO_URI
```

### 3. Instalar y Ejecutar
```bash
npm install
npm run start:dev
```

### 4. Probar Endpoints
```bash
# Obtener todos los productos
curl http://localhost:3001/products

# Buscar productos
curl "http://localhost:3001/products/search?q=laptop"

# Crear producto
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":999.99,"stock":10,"sku":"PROD-001"}'
```

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [QUICKSTART.md](./QUICKSTART.md) | Setup en 5 minutos |
| [MONGODB_SETUP.md](./MONGODB_SETUP.md) | Guía completa de MongoDB Atlas |
| [MONGODB_EXAMPLES.md](./MONGODB_EXAMPLES.md) | Ejemplos de código y casos de uso |
| [ARCHITECTURE_MONGODB.md](./ARCHITECTURE_MONGODB.md) | Diagramas de arquitectura |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitectura hexagonal del proyecto |

## 🏗️ Estructura del Proyecto

```
src/
├── domain/                      # Lógica de negocio
│   ├── entities/
│   │   └── product.entity.ts   # Entidad Product
│   ├── repositories/
│   │   └── product.repository.ts # Interface (Puerto)
│   └── ...
├── application/                 # Casos de uso
│   ├── product.service.ts       # Lógica de aplicación
│   └── dtos/
├── infrastructure/              # Adaptadores
│   ├── product.schema.ts        # Mongoose Schema
│   ├── persistence/
│   │   ├── mongo-product.repository.ts # Implementación MongoDB
│   │   └── persistence.module.ts
│   ├── controllers/
│   │   └── product.controller.ts # REST endpoints
│   └── ...
└── main.ts                      # Punto de entrada
```

## 🔍 Endpoints Principales

### Búsqueda y Consultas
```
GET    /products                           # Todos los productos
GET    /products/:id                       # Por ID
GET    /products/search?q=laptop          # Búsqueda de texto
GET    /products?category=Laptops         # Por categoría
GET    /products?min=100&max=500          # Rango de precio
GET    /products/low-stock?threshold=10   # Stock bajo
GET    /products/top-rated?limit=5        # Mejor valorados
```

### Crear y Actualizar
```
POST   /products                           # Crear producto
PUT    /products/:id                      # Actualizar producto
DELETE /products/:id                      # Eliminar producto
PATCH  /products/:id/stock                # Actualizar stock
```

## 🗄️ Modelo de Datos MongoDB

```typescript
{
  _id: ObjectId,
  name: String,              // "Laptop Dell XPS 13"
  description: String,       // Descripción detallada
  price: Number,            // 1299.99
  stock: Number,            // Unidades disponibles
  sku: String,              // ID único: "DELL-XPS-13-2024"
  category: String,         // "Laptops"
  tags: [String],           // ["laptop", "dell", "portable"]
  rating: Number,           // 0-5
  reviewCount: Number,      // Cantidad de reviews
  images: [String],         // URLs de imágenes
  active: Boolean,          // true/false
  supplier: String,         // Proveedor
  createdAt: Date,          // Auto-generada
  updatedAt: Date           // Auto-generada
}
```

## 🔐 Características de Seguridad

- ✅ SSL/TLS encryption (MongoDB Atlas)
- ✅ IP whitelist
- ✅ Usuarios con permisos mínimos
- ✅ Validación de datos con Mongoose
- ✅ Backups automáticos
- ✅ Rate limiting (implementable)

## 📦 Métodos del Repositorio

```typescript
// Búsquedas
findAll()                               // Todos los activos
findById(id)                            // Por MongoDB ID
findByCategory(category)                // Por categoría
findBySku(sku)                          // Por SKU único
search(query)                           // Búsqueda de texto
getTopRated(limit)                      // Top rated

// Mutaciones
create(product)                         // Crear
update(id, data)                        // Actualizar
delete(id)                              // Eliminar permanente
softDelete(id)                          // Marcar como inactivo
updateStock(id, quantity)               // Ajustar stock

// Búsquedas avanzadas
findLowStock(threshold)                 // Stock bajo
findByPriceRange(min, max)              // Rango de precio
bulkCreate(products)                    // Insertar múltiples
```

## 💡 Casos de Uso

### Carrito de Compras
```typescript
// Verificar stock disponible
const product = await repo.findBySku('DELL-XPS-13');
if (product.stock >= quantity) {
  await repo.updateStock(product._id, -quantity);
}
```

### Recomendaciones
```typescript
// Top 5 productos mejor valorados
const topRated = await repo.getTopRated(5);
```

### Inventario
```typescript
// Alertas de stock bajo
const lowStock = await repo.findLowStock(10);
```

### Búsqueda Avanzada
```typescript
// Combinar múltiples filtros
const expensive = await repo.findByPriceRange(1000, 5000);
const search = await repo.search('laptop gaming 4k');
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 🔨 Commands Útiles

```bash
# Desarrollo
npm run start:dev              # Watch mode
npm run start:debug            # Debug mode

# Producción
npm run build                  # Compilar
npm run start:prod             # Ejecutar producción

# Linting y Formato
npm run lint                   # ESLint
npm run format                 # Prettier

# Testing
npm run test:watch             # Tests en watch mode
```

## 📚 Stack Tecnológico

- **NestJS 11** - Framework Node.js
- **TypeScript** - Type safety
- **Mongoose 8** - ODM para MongoDB
- **MongoDB Atlas** - Base de datos en la nube
- **Jest** - Testing
- **ESLint** - Linting
- **Prettier** - Code formatting

## 🚢 Deployment

### Docker
```bash
# Build image
docker build -t catalogo-microservice .

# Run container
docker run -e MONGO_URI=<tu-uri> -p 3001:3001 catalogo-microservice
```

### Docker Compose
```bash
docker-compose up
```

## 🔗 Links Útiles

- [NestJS Documentation](https://docs.nestjs.com)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Mongoose Documentation](https://mongoosejs.com)
- [MongoDB Query Language](https://docs.mongodb.com/manual/reference/operator/query/)
- [MongoDB Compass](https://www.mongodb.com/products/compass) - GUI para MongoDB

## 📖 Arquitectura Hexagonal

Este proyecto implementa arquitectura hexagonal (puertos y adaptadores):

```
┌─────────────────────────────────────────┐
│         CLIENTES (HTTP, Events)         │
└────────────────┬────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ▼                     ▼
   ADAPTADORES (Input) = Controllers, Handlers
      │                     │
      └──────────┬──────────┘
                 │
    ┌────────────▼────────────┐
    │   APLICACIÓN (Services) │
    │   - Casos de uso        │
    │   - DTOs               │
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │   DOMINIO (Entities)    │
    │   - Lógica negocio     │
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │ PUERTOS (Interfaces)    │
    │ - IProductRepository    │
    └────────────┬────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ▼                     ▼
   ADAPTADORES (Output) = MongoDB Repository, etc.
      │                     │
      └──────────┬──────────┘
                 │
                 ▼
         BASES DE DATOS (MongoDB)
```

Beneficios:
- ✅ Independencia de frameworks
- ✅ Fácil de testear
- ✅ Flexible para cambiar BD
- ✅ Código más organizado

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 License

Este proyecto está bajo MIT License - ver [LICENSE](./LICENSE) file para más detalles.

## ❓ Soporte

Para preguntas o problemas:
- Abre un issue en GitHub
- Consulta la documentación en [MONGODB_SETUP.md](./MONGODB_SETUP.md)
- Revisa los ejemplos en [MONGODB_EXAMPLES.md](./MONGODB_EXAMPLES.md)

---

**Hecho con ❤️ para microservicios escalables**

