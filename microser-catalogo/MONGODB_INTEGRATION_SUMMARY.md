# 🗄️ Resumen: Integración MongoDB Atlas - Microservicio Catálogo

## ✅ Archivos Creados/Modificados

### 1. **Esquema MongoDB**
```
src/infrastructure/product.schema.ts
├─ @Schema({ timestamps: true, collection: 'products' })
├─ Campos: name, description, price, stock, sku, category, tags, rating, etc.
└─ Índices: texto completo, categoría, SKU (único), stock, fecha
```

### 2. **Repositorio MongoDB** 
```
src/infrastructure/persistence/mongo-product.repository.ts
├─ Implementa: IProductRepository
├─ Métodos: findAll, findById, search, create, update, delete
├─ Métodos especializados: updateStock, findLowStock, findByPriceRange
└─ Bulk operations: bulkCreate, getTopRated
```

### 3. **Módulo de Persistencia**
```
src/infrastructure/persistence/persistence.module.ts
├─ Importa MongooseModule con Product schema
├─ Registra MongoProductRepository
└─ Exporta 'IProductRepository' para inyección
```

### 4. **Interfaz Actualizada**
```
src/domain/repositories/product.repository.ts
├─ Interfaz IProductRepository ampliada
├─ Nuevos métodos para búsquedas avanzadas
└─ Compatible con MongoDB Atlas
```

### 5. **Configuración de Entorno**
```
.env.example (actualizado)
├─ MONGO_URI para MongoDB Atlas
├─ NODE_ENV, PORT, APP_NAME
└─ Variables opcionales: SSL, REPLICA_SET
```

### 6. **Archivos de Guía**
```
MONGODB_SETUP.md
├─ Guía paso-a-paso de MongoDB Atlas
├─ Estructura de colecciones
├─ Scripts de seeding
└─ Índices y optimización

MONGODB_INTEGRATION_SUMMARY.md (este archivo)
```

### 7. **Seeder (Opcional)**
```
src/product.seeder.ts
├─ Datos de prueba: 6 productos
├─ Evita duplicados si ya existen
└─ Úsalo en app.module.ts onModuleInit()
```

---

## 🚀 Pasos para Implementar

### 1️⃣ Configurar MongoDB Atlas
```bash
# Ve a MongoDB Atlas y:
1. Crea cluster (M0 gratuito)
2. Crea usuario de BD
3. Whitelist tu IP
4. Copia connection string
```

### 2️⃣ Configurar variables de entorno
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env y pega tu MONGO_URI
```

### 3️⃣ Instala dependencias (si falta)
```bash
npm install @nestjs/mongoose mongoose @nestjs/config dotenv
```

### 4️⃣ Actualiza app.module.ts
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PersistenceModule } from './infrastructure/persistence/persistence.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    PersistenceModule,
    // ... otros módulos
  ],
})
export class AppModule {}
```

### 5️⃣ Inicia la aplicación
```bash
npm run start:dev
```

### 6️⃣ Verifica conexión
```bash
# Deberías ver en logs:
# [Nest] PID MongooseModule dependencies initialized
```

---

## 📊 Estructura de Datos MongoDB

```javascript
// Colección: products
db.products.insertOne({
  _id: ObjectId("650a1b2c3d4e5f6g7h8i9j"),
  name: "Laptop Dell XPS 13",
  description: "Ultrabook portátil...",
  price: 1299.99,
  stock: 25,
  sku: "DELL-XPS-13-2024",           // Único
  category: "Laptops",
  tags: ["laptop", "dell", "ultrabook"],
  rating: 4.8,
  reviewCount: 156,
  images: ["url1", "url2"],
  active: true,
  supplier: "Dell Inc.",
  createdAt: ISODate("2024-04-16"),
  updatedAt: ISODate("2024-04-16")
})
```

---

## 🔍 Consultas Ejemplo (MongoDB)

### Buscar por texto
```javascript
db.products.find({ 
  $text: { $search: "laptop dell" } 
})
```

### Buscar por categoría
```javascript
db.products.find({ 
  category: "Laptops",
  active: true 
})
```

### Buscar por rango de precio
```javascript
db.products.find({ 
  price: { $gte: 100, $lte: 500 },
  active: true 
})
```

### Productos con stock bajo
```javascript
db.products.find({
  stock: { $lt: 10 },
  active: true
})
```

### Top 5 productos mejor valorados
```javascript
db.products.find({ active: true })
  .sort({ rating: -1 })
  .limit(5)
```

---

## 🎯 Métodos del Repositorio

| Método | Descripción | Ejemplo |
|--------|-------------|---------|
| `findAll()` | Obtiene todos los productos activos | - |
| `findById(id)` | Obtiene producto por MongoDB ObjectId | `"650a1b2c3d4e5f6g7h8i9j"` |
| `findByCategory(cat)` | Obtiene productos de una categoría | `"Laptops"` |
| `findBySku(sku)` | Obtiene producto por SKU único | `"DELL-XPS-13-2024"` |
| `search(query)` | Búsqueda de texto completo | `"laptop dell 4k"` |
| `create(product)` | Crea nuevo producto | Objeto Product |
| `update(id, data)` | Actualiza producto | `id` y datos parciales |
| `delete(id)` | Elimina producto permanentemente | - |
| `softDelete(id)` | Marca como inactivo | - |
| `updateStock(id, qty)` | Aumenta/disminuye stock | `qty: -5` (venta) |
| `findLowStock(threshold)` | Productos con stock bajo | `threshold: 10` |
| `findByPriceRange(min, max)` | Rango de precio | `min: 100, max: 500` |
| `bulkCreate(products)` | Inserta múltiples | Array de productos |
| `getTopRated(limit)` | Productos mejor valorados | `limit: 10` |

---

## 💡 Casos de Uso en Microservicios

### 📋 Servicio de Pedidos
```typescript
// Necesita: findBySku, updateStock
const product = await this.productRepo.findBySku('DELL-XPS-13-2024');
await this.productRepo.updateStock(product._id, -1); // Resta stock
```

### 🔍 Motor de Búsqueda
```typescript
// Necesita: search, findByCategory, findByPriceRange
const results = await this.productRepo.search('laptop 4k');
```

### 📦 Inventario
```typescript
// Necesita: findLowStock, bulkCreate
const lowStock = await this.productRepo.findLowStock(10);
await this.sendAlert(lowStock);
```

### ⭐ Recomendaciones
```typescript
// Necesita: getTopRated
const topProducts = await this.productRepo.getTopRated(5);
```

---

## 🔐 Seguridad Checklist

- [ ] ✅ Conexión SSL/TLS (MongoDB Atlas por defecto)
- [ ] ⚠️ Cambiar contraseña cada 3 meses
- [ ] ⚠️ Whitelist de IPs en producción
- [ ] ✅ No commitear `.env` (añadido a .gitignore)
- [ ] ⚠️ Usar roles mínimos en usuario BD
- [ ] ✅ Backups automáticos habilitados

---

## 🧪 Testing

### Prueba rápida en terminal
```bash
# 1. Conecta a MongoDB
npm run start:dev

# 2. En otra terminal, prueba un endpoint
curl -X GET http://localhost:3001/products

# 3. Deberías ver respuesta []  o datos si hay seed
```

### Con MongoDB Compass (GUI)
```
1. Descarga MongoDB Compass
2. Pega tu MONGO_URI en "New Connection"
3. Conecta
4. Ve a catalogo > products
5. Visualiza datos en tiempo real
```

---

## 📚 Documentación Oficial

- [MongoDB Atlas](https://docs.atlas.mongodb.com)
- [NestJS + Mongoose](https://docs.nestjs.com/techniques/mongodb)
- [Mongoose Docs](https://mongoosejs.com)
- [MongoDB Query Language](https://docs.mongodb.com/manual/reference/operator/query)

---

## ❓ FAQ

### P: ¿Dónde veo mi URI de MongoDB?
**R:** MongoDB Atlas → Cluster → Connect → Drivers → Copia la URI

### P: ¿Cuánta data puedo almacenar en M0 gratis?
**R:** 512 MB (suficiente para desarrollo)

### P: ¿Cómo migro a pago?
**R:** Cluster Settings → Billing → Upgrade (sin downtime)

### P: ¿Mi IP cambió y no conecto?
**R:** Security → Network Access → Whitelist nueva IP

### P: ¿Cómo respaldar datos?
**R:** Backup → Enable on-demand backup (automático cada 12h)

---

**🎉 ¡Tu microservicio está listo para MongoDB Atlas!**

Próximos pasos recomendados:
1. Implementar validación con `class-validator`
2. Agregar paginación en búsquedas
3. Implementar caché con Redis
4. Crear tests unitarios
5. Documentar API con Swagger
