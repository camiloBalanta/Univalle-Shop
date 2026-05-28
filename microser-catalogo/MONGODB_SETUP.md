# 🗄️ Guía: MongoDB Atlas para Microservicio de Catálogo

## 📋 Tabla de Contenidos
1. [Configuración MongoDB Atlas](#configuración-mongodb-atlas)
2. [Estructura de la BD](#estructura-de-la-bd)
3. [Configuración en NestJS](#configuración-en-nestjs)
4. [Scripts de Seeding](#scripts-de-seeding)
5. [Índices y Optimización](#índices-y-optimización)

---

## 🔧 Configuración MongoDB Atlas

### Paso 1: Crear Cuenta y Cluster en MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita o usa la existente
3. Haz clic en **"Create"** para crear un nuevo cluster
4. Selecciona:
   - **Provider**: AWS, Google Cloud, o Azure
   - **Region**: Elige la más cercana a tus servidores
   - **Cluster Tier**: M0 (Gratuito) para desarrollo
5. Espera a que se cree (5-10 minutos)

### Paso 2: Crear Usuario de Base de Datos

1. En la vista del cluster, ve a **"Security" → "Database Access"**
2. Haz clic en **"Add New Database User"**
3. Configura:
   ```
   Username: catalogo_user
   Password: (genera una contraseña fuerte)
   Database User Privileges: Read and write to any database
   ```
4. Copia las credenciales (las usaremos luego)

### Paso 3: Obtener Connection String

1. Ve a **"Databases"** en el panel
2. Haz clic en **"Connect"** en tu cluster
3. Selecciona **"Drivers"**
4. Elige **"Node.js"** y versión **"4.x"**
5. Copia la connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/catalogo?retryWrites=true&w=majority
   ```

### Paso 4: Configurar IP Whitelist

1. Ve a **"Security" → "Network Access"**
2. Haz clic en **"Add IP Address"**
3. Elige uno de:
   - **"Add Current IP Address"** (para desarrollo local)
   - **"Allow Access from Anywhere"** (0.0.0.0/0 - menos seguro)
4. Haz clic en **"Confirm"**

---

## 🏗️ Estructura de la Base de Datos

### Colecciones

#### 1. **products** (Catálogo de Productos)
```javascript
{
  _id: ObjectId,
  name: String,              // "Laptop Dell XPS"
  description: String,       // Descripción detallada
  price: Number,            // Precio en USD
  stock: Number,            // Unidades disponibles
  sku: String,              // Identificador único: "DELL-XPS-123"
  category: String,         // "Electronics"
  tags: [String],           // ["laptop", "dell", "portable"]
  rating: Number,           // 0-5
  reviewCount: Number,      // Número de reviews
  images: [String],         // URLs de imágenes
  active: Boolean,          // true/false
  supplier: String,         // Proveedor
  createdAt: Date,          // Auto-generada
  updatedAt: Date           // Auto-generada
}
```

#### 2. **categories** (Categorías de Productos)
```javascript
{
  _id: ObjectId,
  name: String,            // "Electronics"
  slug: String,            // "electronics"
  description: String,
  imageUrl: String,
  active: Boolean,
  createdAt: Date
}
```

#### 3. **inventory_logs** (Auditoría de Stock)
```javascript
{
  _id: ObjectId,
  productId: ObjectId,     // Referencia a product
  action: String,          // "ADD", "REMOVE", "ADJUSTMENT"
  quantity: Number,
  previousStock: Number,
  newStock: Number,
  reason: String,          // "Sale", "Restock", "Return"
  createdAt: Date
}
```

---

## ⚙️ Configuración en NestJS

### 1. Variables de Entorno

Crea `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita `.env`:
```
MONGO_URI=mongodb+srv://catalogo_user:TuPassword123@cluster0.abcde.mongodb.net/catalogo?retryWrites=true&w=majority
NODE_ENV=development
PORT=3001
APP_NAME=catalog-microservice
```

### 2. Importa MongooseModule en app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Product, ProductSchema } from './infrastructure/product.schema';
import { MongoProductRepository } from './infrastructure/persistence/mongo-product.repository';
import { PersistenceModule } from './infrastructure/persistence/persistence.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema }
    ]),
    PersistenceModule,
  ],
  providers: [
    {
      provide: 'IProductRepository',
      useClass: MongoProductRepository,
    },
  ],
})
export class AppModule {}
```

### 3. Instala dependencias (si no las tienes)

```bash
npm install @nestjs/config dotenv
npm install --save @nestjs/mongoose mongoose
```

---

## 🌱 Scripts de Seeding

### Crear archivo: `src/database/seeds/product.seed.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../infrastructure/product.schema';

@Injectable()
export class ProductSeed {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async seed() {
    const count = await this.productModel.countDocuments();
    if (count > 0) {
      console.log('✓ Base de datos ya tiene datos. Skipping seed.');
      return;
    }

    const products = [
      {
        name: 'Laptop Dell XPS 13',
        description: 'Ultrabook portátil con pantalla 4K',
        price: 1299.99,
        stock: 25,
        sku: 'DELL-XPS-13-2024',
        category: 'Laptops',
        tags: ['laptop', 'dell', 'ultrabook', '4k'],
        rating: 4.8,
        reviewCount: 156,
        images: [
          'https://example.com/dell-xps-1.jpg',
          'https://example.com/dell-xps-2.jpg',
        ],
        active: true,
        supplier: 'Dell Inc.',
      },
      {
        name: 'Mouse Logitech MX Master',
        description: 'Mouse inalámbrico profesional',
        price: 99.99,
        stock: 150,
        sku: 'LOGITECH-MX-MASTER',
        category: 'Accesorios',
        tags: ['mouse', 'logitech', 'inalámbrico'],
        rating: 4.9,
        reviewCount: 892,
        images: ['https://example.com/logitech-mx.jpg'],
        active: true,
        supplier: 'Logitech',
      },
      {
        name: 'Monitor LG 27" 4K',
        description: 'Monitor profesional 4K con color accuracy',
        price: 599.99,
        stock: 10,
        sku: 'LG-27-4K-PRO',
        category: 'Monitores',
        tags: ['monitor', '4k', 'profissional', 'lg'],
        rating: 4.7,
        reviewCount: 245,
        images: ['https://example.com/lg-monitor.jpg'],
        active: true,
        supplier: 'LG Electronics',
      },
    ];

    await this.productModel.insertMany(products);
    console.log('✓ Seed ejecutado exitosamente con 3 productos');
  }
}
```

### Usar en app.module.ts

```typescript
// En app.module.ts
async onModuleInit() {
  if (process.env.NODE_ENV === 'development') {
    const seed = this.moduleRef.get(ProductSeed);
    await seed.seed();
  }
}
```

---

## 📊 Índices y Optimización

### Índices Automáticos en MongoDB Atlas

El `ProductSchema` incluye estos índices:

```typescript
// Búsqueda de texto completo
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Búsquedas por categoría
ProductSchema.index({ category: 1 });

// SKU único
ProductSchema.index({ sku: 1 }, { unique: true });

// Filtros por estado
ProductSchema.index({ active: 1 });

// Filtros por stock
ProductSchema.index({ stock: 1 });

// Ordenamiento por fecha
ProductSchema.index({ createdAt: -1 });
```

### Ver Índices en Atlas

1. Ve a **"Databases" → Tu Cluster**
2. Haz clic en **"Browse Collections"**
3. Selecciona **"catalogo" → "products"**
4. Ve a la pestaña **"Indexes"** para ver todos

---

## 🔐 Seguridad Recomendada

### 1. Usa Conexión Encriptada
✓ MongoDB Atlas usa SSL/TLS por defecto

### 2. Ip Whitelist
- En producción: whitelist solo las IPs de tus servidores
- En desarrollo: temporalmente 0.0.0.0/0

### 3. Rotación de Credenciales
```bash
# Cada 3 meses:
# - Ve a "Database Access"
# - Genera nueva contraseña
# - Actualiza .env
```

### 4. Backups Automáticos
- Habilita en **"Backup"** (automático cada 12 horas en gratuito)

---

## ✅ Checklist de Configuración

- [ ] Crear cluster en MongoDB Atlas
- [ ] Crear usuario de base de datos
- [ ] Whitelist IP address
- [ ] Copiar connection string a `.env`
- [ ] Instalar `@nestjs/mongoose` y `mongoose`
- [ ] Actualizar `app.module.ts` con MongooseModule
- [ ] Ejecutar `npm install`
- [ ] Ejecutar `npm run start:dev`
- [ ] Verificar conexión en MongoDB Atlas Atlas (Metrics)
- [ ] Ejecutar seed (si lo creaste)
- [ ] Crear primeira request POST /products

---

## 🧪 Pruebas de Conexión

### En tu controlador ProductController:

```typescript
@Get('health')
async healthCheck() {
  try {
    await this.productModel.findOne().exec();
    return { status: 'ok', message: 'MongoDB connected' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}
```

Luego:
```bash
curl http://localhost:3001/products/health
```

---

## 📚 Recursos Útiles

- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [NestJS + Mongoose](https://docs.nestjs.com/techniques/mongodb)
- [MongoDB Query Language](https://docs.mongodb.com/manual/reference/operator/query/)
- [Mongoose Documentation](https://mongoosejs.com/)

---

## 🚀 Próximos Pasos

1. **Agregaciones**: Usar `aggregation()` para reportes
2. **Transacciones**: Para operaciones multi-documento
3. **Change Streams**: Para real-time updates
4. **Caching**: Redis + MongoDB para mejor performance
5. **Monitoring**: MongoDB Charts para dashboards

