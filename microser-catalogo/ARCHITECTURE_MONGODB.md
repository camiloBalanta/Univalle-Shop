# 🏛️ Diagrama: Arquitectura MongoDB en Microservicios

## 📐 Flujo Completo de Datos

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🌐 CLIENTE (REST, Mobile, Web)                                      │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       │ HTTP Request
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 🚪 ENTRADA (Adaptadores Input)                                      │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ ProductController                                              │  │
│ │ • POST   /products              (crear)                        │  │
│ │ • GET    /products              (listar)                       │  │
│ │ • GET    /products/:id          (obtener)                      │  │
│ │ • PUT    /products/:id          (actualizar)                   │  │
│ │ • DELETE /products/:id          (eliminar)                     │  │
│ │ • GET    /products/category/:cat                               │  │
│ │ • GET    /products/search?q=    (búsqueda)                    │  │
│ └────────────────────────────────────────────────────────────────┘  │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ ProductHandler (Mensajería TCP/Event Bus)                      │  │
│ │ • pattern: 'products.find'                                     │  │
│ │ • pattern: 'products.create'                                   │  │
│ │ • pattern: 'products.update'                                   │  │
│ └────────────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       │ Validación de DTOs
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 🎯 APLICACIÓN (Casos de Uso)                                        │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ ProductService                                                 │  │
│ │ • create(dto)                                                  │  │
│ │ • findAll()                                                    │  │
│ │ • findById(id)                                                 │  │
│ │ • update(id, dto)                                              │  │
│ │ • delete(id)                                                   │  │
│ │ • search(query)                                                │  │
│ │ • getByCategory(cat)                                           │  │
│ │ • updateStock(id, qty)                                         │  │
│ │ • getTopRated()                                                │  │
│ └────────────────────────────────────────────────────────────────┘  │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ DTOs (Data Transfer Objects)                                   │  │
│ │ • CreateProductDTO                                             │  │
│ │ • UpdateProductDTO                                             │  │
│ │ • ProductResponseDTO                                           │  │
│ └────────────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       │ Lógica de negocio
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 💎 DOMINIO (Lógica de Negocio)                                      │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ Product Entity                                                 │  │
│ │ • Propiedades: name, price, stock, rating, etc.              │  │
│ │ • Métodos: validatePrice(), updateStock()                     │  │
│ │ • Validaciones de reglas de negocio                           │  │
│ └────────────────────────────────────────────────────────────────┘  │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ IProductRepository (Puerto/Interface)                          │  │
│ │ • Define contrato sin detalles de BD                           │  │
│ │ • Independiente de MongoDB                                     │  │
│ └────────────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       │ Inyección de dependencias
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 🔌 SALIDA (Adaptadores - Persistencia)                              │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ MongoProductRepository (Implementación)                         │  │
│ │ • Implementa: IProductRepository                               │  │
│ │ • Traduce métodos del dominio a queries MongoDB                │  │
│ │                                                                │  │
│ │ Métodos:                                                       │  │
│ │ • findAll()         → db.products.find({active: true})        │  │
│ │ • findById(id)      → db.products.findById(id)                │  │
│ │ • search(q)         → db.products.find({$text: ...})          │  │
│ │ • updateStock(id)   → db.products.updateOne({$inc: ...})      │  │
│ │ • create(data)      → db.products.insertOne(data)             │  │
│ │ • delete(id)        → db.products.deleteOne({_id: id})        │  │
│ └────────────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       │ Mongoose ODM
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 🐘 MONGOOSE (Object Document Mapper)                                │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ ProductSchema                                                  │  │
│ │ • Define estructura de documentos                              │  │
│ │ • Validaciones en nivel de esquema                             │  │
│ │ • Middleware pre/post save                                     │  │
│ │ • Índices para optimización                                    │  │
│ │                                                                │  │
│ │ Índices automáticos:                                           │  │
│ │ • db.products.createIndex({ sku: 1 }, { unique: true })      │  │
│ │ • db.products.createIndex({ category: 1 })                    │  │
│ │ • db.products.createIndex({ name: "text", desc: "text" })    │  │
│ │ • db.products.createIndex({ stock: 1 })                       │  │
│ │ • db.products.createIndex({ createdAt: -1 })                 │  │
│ └────────────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       │ Driver MongoDB
                       │ (Sobre TCP/SSL)
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ ☁️  MONGODB ATLAS (Base de Datos Cloud)                             │
│                                                                     │
│ Cluster (con Replica Set):                                          │
│ ┌─────────────┬──────────────┬──────────────┐                       │
│ │   PRIMARY   │  SECONDARY 1 │  SECONDARY 2 │                       │
│ │ (Escritura) │  (Lectura)   │  (Lectura)   │                       │
│ └─────────────┴──────────────┴──────────────┘                       │
│                                                                     │
│ Base de datos: catalogo                                             │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ Colecciones:                                                   │  │
│ │ • products (Catálogo de productos)                             │  │
│ │ • categories (Categorías)                                      │  │
│ │ • inventory_logs (Auditoría)                                   │  │
│ │ • reviews (Reseñas de productos)                               │  │
│ │ • suppliers (Proveedores)                                      │  │
│ │                                                                │  │
│ │ Documento ejemplo (products):                                  │  │
│ │ {                                                              │  │
│ │   "_id": ObjectId("650a1b2c3d4e5f6g7h8i9j"),                 │  │
│ │   "name": "Laptop Dell XPS 13",                                │  │
│ │   "price": 1299.99,                                            │  │
│ │   "stock": 25,                                                 │  │
│ │   "sku": "DELL-XPS-13-2024",                                   │  │
│ │   "category": "Laptops",                                       │  │
│ │   "rating": 4.8,                                               │  │
│ │   "active": true,                                              │  │
│ │   "createdAt": ISODate("2024-04-16"),                          │  │
│ │   "updatedAt": ISODate("2024-04-16")                           │  │
│ │ }                                                              │  │
│ └────────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ Características de Atlas:                                           │
│ • ✅ SSL/TLS Encryption                                            │
│ • ✅ Automatic Backups (cada 12h en M0)                            │
│ • ✅ Monitoring & Alerts                                           │
│ • ✅ Auto-scaling (en M10+)                                        │
│ • ✅ IP Whitelist Security                                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Ciclo de una Solicitud: GET /products/search?q=laptop

```
1. CLIENTE
   ┌─────────────────────────────────────────┐
   │ curl "...?q=laptop"                     │
   └────────────┬────────────────────────────┘
                │
                ▼
2. CONTROLLER
   ┌─────────────────────────────────────────┐
   │ @Get('search')                          │
   │ async search(@Query('q') query: string) │
   │ {                                       │
   │   return this.service.search(query);    │
   │ }                                       │
   └────────────┬────────────────────────────┘
                │
                ▼
3. SERVICE
   ┌─────────────────────────────────────────┐
   │ async search(query: string) {           │
   │   return this.repository.search(query); │
   │ }                                       │
   └────────────┬────────────────────────────┘
                │
                ▼
4. REPOSITORY
   ┌─────────────────────────────────────────┐
   │ async search(query: string) {           │
   │   return this.productModel              │
   │     .find({                             │
   │       $text: { $search: query },        │
   │       active: true                      │
   │     })                                  │
   │     .exec();                            │
   │ }                                       │
   └────────────┬────────────────────────────┘
                │
                ▼
5. MONGOOSE
   ┌─────────────────────────────────────────┐
   │ Ejecuta query en MongoDB Atlas          │
   │ Usando índices de texto creados         │
   │ en ProductSchema                        │
   └────────────┬────────────────────────────┘
                │
                ▼
6. MONGODB
   ┌─────────────────────────────────────────┐
   │ db.products.find({                      │
   │   $text: { $search: "laptop" },         │
   │   active: true                          │
   │ })                                      │
   │                                         │
   │ Resultado:                              │
   │ [                                       │
   │   { _id: "...", name: "Laptop Dell" }, │
   │   { _id: "...", name: "Laptop ASUS" }, │
   │   { _id: "...", name: "Laptop Lenovo" }│
   │ ]                                       │
   └────────────┬────────────────────────────┘
                │
                │ Retorna array de documentos
                ▼
7. RESPUESTA
   ┌─────────────────────────────────────────┐
   │ HTTP 200 OK                             │
   │ [                                       │
   │   {                                     │
   │     "_id": "650a1b2c3d4e5f",            │
   │     "name": "Laptop Dell XPS 13",       │
   │     "price": 1299.99,                   │
   │     "stock": 25,                        │
   │     "rating": 4.8                       │
   │   },                                    │
   │   ...                                   │
   │ ]                                       │
   └─────────────────────────────────────────┘
```

---

## 🎭 Patrones Arquitectónicos Implementados

### 1. Hexagonal Architecture
```
┌──────────────────────────────────────────┐
│              EXTERNAL WORLD               │
│      (Clients, APIs, Services)           │
└────────────────────┬─────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
    ┌─────────┐             ┌──────────┐
    │  Input  │             │  Output  │
    │Adapters │             │ Adapters │
    └────┬────┘             └────┬─────┘
         │                       │
    ┌────▼───────────────────────▼────┐
    │  APPLICATION LAYER               │
    │  (Services, Use Cases, DTOs)     │
    └────┬────────────────────┬────────┘
         │                    │
    ┌────▼────────────────────▼────┐
    │  DOMAIN LAYER                 │
    │  (Entities, Business Logic)   │
    └────┬────────────────────┬─────┘
         │                    │
    ┌────▼────────────────────▼────┐
    │  PORTS (Interfaces)          │
    │  IProductRepository          │
    └────┬────────────────────┬─────┘
         │                    │
    ┌────▼────────────────────▼────┐
    │  INFRASTRUCTURE LAYER        │
    │  (MongoDB Implementations)   │
    └──────────────────────────────┘
```

### 2. Inyección de Dependencias
```
NestJS Module Tree:

AppModule
├─ ConfigModule (carga .env)
├─ MongooseModule (conexión MongoDB)
├─ PersistenceModule
│  ├─ MongooseModule.forFeature([Product])
│  └─ Provider: 'IProductRepository' → MongoProductRepository
├─ ProductModule
│  ├─ ProductController
│  ├─ ProductService (inject 'IProductRepository')
│  └─ ProductSeeder (opcional)
└─ MessagingModule (handlers TCP)
```

### 3. Data Access Pattern
```
Service Layer
    │
    ├─ Calls: repository.findAll()
    │
Repository (Puerto)
    │
    ├─ Define: abstract methods
    │
MongoProductRepository (Adaptador)
    │
    ├─ Mongoose Model
    │   └─ ProductSchema
    │
    ├─ Ejecuta queries MongoDB
    │   └─ db.products.find()
    │
    └─ Retorna entidades
        └─ Product[]
```

---

## 📊 Índices en MongoDB Atlas

```
Colección: products

┌─────────────────────────────────────────────────────┐
│ ÍNDICES CREADOS AUTOMÁTICAMENTE                      │
├─────────────────────────────────────────────────────┤
│ 1. _id (primario)                                   │
│    Orden: Ascendente                                │
│    Único: Sí                                        │
│    Uso: Identificación única de documentos          │
├─────────────────────────────────────────────────────┤
│ 2. { name, description, tags } (Texto)             │
│    Tipo: Text Index                                 │
│    Uso: Búsqueda de texto completo                  │
│    Query: db.products.find({$text: {$search: "..."│
├─────────────────────────────────────────────────────┤
│ 3. { category: 1 } (Ascendente)                    │
│    Uso: Filtro rápido por categoría                │
│    Query: db.products.find({category: "Laptops"})  │
├─────────────────────────────────────────────────────┤
│ 4. { sku: 1 } (Ascendente, Único)                  │
│    Uso: Búsqueda por SKU (nunca duplicado)         │
│    Query: db.products.findOne({sku: "..."})        │
├─────────────────────────────────────────────────────┤
│ 5. { active: 1 } (Ascendente)                      │
│    Uso: Filtro de productos activos/inactivos      │
│    Query: db.products.find({active: true})         │
├─────────────────────────────────────────────────────┤
│ 6. { stock: 1 } (Ascendente)                       │
│    Uso: Búsqueda de productos por stock            │
│    Query: db.products.find({stock: {$lt: 10}})     │
├─────────────────────────────────────────────────────┤
│ 7. { createdAt: -1 } (Descendente)                │
│    Uso: Ordenar por fecha más reciente             │
│    Query: .sort({createdAt: -1})                   │
└─────────────────────────────────────────────────────┘

Tamaño típico: ~2 MB por índice (varía con datos)
```

---

## 🔐 Flujo de Seguridad

```
CLIENTE REQUEST
    │
    ├─ ✅ SSL/TLS Encryption (MongoDB Atlas)
    │
    ▼
IP WHITELIST CHECK
    │
    ├─ ✅ Validar IP del cliente
    │
    ▼
AUTENTICACIÓN
    │
    ├─ ✅ Usuario/Contraseña de BD
    │
    ▼
AUTORIZACIÓN
    │
    ├─ ✅ Roles mínimos en usuario BD
    │
    ▼
QUERY EXECUTION
    │
    ├─ ✅ Mongoose validation
    │ ├─ Tipos de datos
    │ ├─ Restricciones (min, max)
    │ └─ Campos requeridos
    │
    ▼
MONGODB ATLAS
    │
    ├─ ✅ Automatic backups
    │ ├─ Every 12 hours (M0)
    │ └─ Every 6 hours (M10+)
    │
    ├─ ✅ Audit logging
    │ └─ Track all DB operations
    │
    └─ ✅ Data at rest encryption
        └─ Automático en clusters M10+
```

---

**🎯 Resumen:** 
- Arquitectura **hexagonal** = Flexibilidad y testabilidad
- MongoDB **Atlas** = Escalabilidad y mantenimiento
- Mongoose **ODM** = Type safety y validación
- **Índices** = Queries optimizadas
