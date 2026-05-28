# 🚀 Quick Start: MongoDB Atlas + NestJS

## ⚡ 5 Minutos Setup

### 1. Crear .env
```bash
cp .env.example .env
```

Edita `.env`:
```
MONGO_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/catalogo?retryWrites=true&w=majority
NODE_ENV=development
PORT=3001
```

### 2. Instalar dependencias
```bash
npm install
# Ya incluye @nestjs/mongoose y mongoose en package.json
```

### 3. Levantar aplicación
```bash
npm run start:dev
```

### 4. Probar conexión
```bash
curl http://localhost:3001/products
```

---

## 📚 Archivos Principales

| Archivo | Propósito |
|---------|-----------|
| `src/infrastructure/product.schema.ts` | Esquema MongoDB con Mongoose |
| `src/infrastructure/persistence/mongo-product.repository.ts` | Implementación con MongoDB |
| `src/domain/repositories/product.repository.ts` | Interface del puerto |
| `src/domain/entities/product.entity.ts` | Entidad de negocio |
| `.env.example` | Variables de entorno |
| `MONGODB_SETUP.md` | Guía completa de configuración |
| `MONGODB_EXAMPLES.md` | Ejemplos de código |
| `ARCHITECTURE_MONGODB.md` | Diagramas de arquitectura |

---

## 🔍 Consultas Útiles

### Buscar productos
```bash
# Todos
GET /products

# Por categoría
GET /products?category=Laptops

# Búsqueda
GET /products/search?q=laptop

# Por ID
GET /products/650a1b2c3d4e5f

# Mejor valorados
GET /products/top-rated?limit=5

# Stock bajo
GET /products/low-stock?threshold=10
```

### Crear producto
```bash
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Laptop",
    "price":999.99,
    "stock":10,
    "sku":"DELL-001"
  }'
```

### Actualizar stock
```bash
curl -X POST http://localhost:3001/products/ID/purchase \
  -d '{"quantity":2}'
```

---

## 🧪 Verificar Setup

### En MongoDB Atlas
1. Ve a: https://cloud.mongodb.com
2. Selecciona tu cluster
3. Click en "Browse Collections"
4. Ve la BD "catalogo" y colección "products"

### En Terminal
```bash
# Ver si MongoDB conectó exitosamente
npm run start:dev

# Busca en logs:
# [Nest] ... MongooseModule dependencies initialized ✓
```

### Con curl
```bash
# Respuesta exitosa = 200 OK
curl -i http://localhost:3001/products
```

---

## 🆘 Troubleshooting

### Conexión rechazada
- Verifica MONGO_URI en .env
- Whitelist tu IP en MongoDB Atlas (Security → Network Access)
- Verifica usuario/contraseña

### Timeout
- Aumenta timeout en MONGO_URI: `?serverSelectionTimeoutMS=5000`
- Verifica conexión a internet
- Verifica que el cluster esté corriendo

### SKU duplicado
- El schema valida SKU único
- Verifica no haber insertado 2 productos con mismo SKU

### No ve colección en MongoDB Atlas
- Espera 30 segundos después de crear documento
- Refresca la página
- Verifica que esté en BD correcta: "catalogo"

---

## 📦 Struktura Archivos

```
src/
├── domain/
│   ├── entities/
│   │   └── product.entity.ts
│   ├── repositories/
│   │   └── product.repository.ts  ← Interface (Puerto)
│   ├── events/
│   └── ...
├── application/
│   ├── product.service.ts
│   └── dtos/
├── infrastructure/
│   ├── product.schema.ts          ← Mongoose Schema
│   ├── persistence/
│   │   ├── mongo-product.repository.ts  ← Implementación
│   │   └── persistence.module.ts
│   ├── controllers/
│   │   └── product.controller.ts
│   └── ...
├── app.module.ts
└── main.ts

.env                              ← Variables (no commitar)
.env.example                      ← Plantilla (commitear)
MONGODB_SETUP.md                  ← Guía completa
MONGODB_EXAMPLES.md               ← Ejemplos de código
ARCHITECTURE_MONGODB.md           ← Diagramas
```

---

## 🎓 Conceptos Clave

### Entity vs Schema
- **Entity** (dominio): Lógica de negocio, sin BD
- **Schema** (infraestructura): Estructura MongoDB

### Repository Pattern
- **Puerto** (Interface): Define métodos sin implementación
- **Adaptador** (Clase): Implementa con MongoDB

### Índices
- Text: Búsqueda completa `{ $text: { $search: "..." } }`
- Ascendente: Filtros `{ category: 1 }`
- Único: SKU no duplicado `{ sku: 1 }, { unique: true }`

---

## 💡 Tips Productivos

### 1. Use MongoDB Compass (GUI)
```bash
# Descarga: https://www.mongodb.com/products/compass
# Pega MONGO_URI y visualiza datos gráficamente
```

### 2. Postman Collection
```bash
# Importa requests POST/GET/PUT/DELETE
# Para probar sin escribir curl
```

### 3. Logs en desarrollo
```typescript
// Agrega logs en repo:
async findAll() {
  console.log('📖 Buscando productos...');
  return this.productModel.find().exec();
}
```

### 4. Type Safety
```typescript
// Siempre tipos fuertemente tipados
async findById(id: string): Promise<Product | null> {
  // Mongoose + TypeScript = Autocompletado
}
```

---

## ✅ Checklist de Implementación

- [ ] Crear cluster en MongoDB Atlas
- [ ] Crear usuario de BD
- [ ] Whitelist IP
- [ ] Copiar MONGO_URI a .env
- [ ] Instalar `npm install`
- [ ] Levantar con `npm run start:dev`
- [ ] Verificar logs de conexión
- [ ] Probar GET /products
- [ ] Crear primer producto con POST
- [ ] Ver en MongoDB Atlas
- [ ] Probar búsquedas avanzadas
- [ ] Implementar seeding (opcional)

---

## 🔗 Links Útiles

- [MongoDB Atlas Console](https://cloud.mongodb.com)
- [NestJS + MongoDB Docs](https://docs.nestjs.com/techniques/mongodb)
- [Mongoose Schema](https://mongoosejs.com/docs/guide.html)
- [MongoDB Query Operators](https://docs.mongodb.com/manual/reference/operator/query/)
- [MongoDB Compass Download](https://www.mongodb.com/products/compass)

---

**🎯 ¡Listo! Tu microservicio está integrado con MongoDB Atlas. Ahora puedes:**

✅ Crear, leer, actualizar, eliminar productos
✅ Buscar por texto, categoría, precio
✅ Gestionar inventario
✅ Obtener productos por rating
✅ Escalar sin límite de datos

**Happy coding! 🚀**
