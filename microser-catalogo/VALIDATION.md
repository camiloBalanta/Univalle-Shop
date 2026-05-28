# ✅ Verificación y Validación - MongoDB Integration

## 🔍 Checklist de Validación

Usa este documento para verificar que toda la integración está correcta.

### ✅ Fase 1: Configuración

- [ ] **Archivo .env existe**
  ```bash
  ls -la .env
  # Debe mostrar el archivo .env
  ```

- [ ] **MONGO_URI configurada**
  ```bash
  grep MONGO_URI .env
  # Debe mostrar: MONGO_URI=mongodb+srv://...
  ```

- [ ] **Variables opcionales configuradas**
  ```bash
  grep -E "NODE_ENV|PORT|APP_NAME" .env
  # Debe mostrar las variables
  ```

### ✅ Fase 2: Dependencias

- [ ] **@nestjs/mongoose instalado**
  ```bash
  npm list @nestjs/mongoose
  # Debe mostrar versión (^11.0.4)
  ```

- [ ] **mongoose instalado**
  ```bash
  npm list mongoose
  # Debe mostrar versión (^7.8.9)
  ```

- [ ] **@nestjs/config instalado** (opcional pero recomendado)
  ```bash
  npm list @nestjs/config
  ```

### ✅ Fase 3: Archivos de Código

- [ ] **Esquema MongoDB existe**
  ```bash
  ls src/infrastructure/product.schema.ts
  ```

- [ ] **Repositorio MongoDB existe**
  ```bash
  ls src/infrastructure/persistence/mongo-product.repository.ts
  ```

- [ ] **Módulo de persistencia existe**
  ```bash
  ls src/infrastructure/persistence/persistence.module.ts
  ```

- [ ] **Interface del puerto actualizada**
  ```bash
  grep -c "findByCategory\|search\|updateStock" src/domain/repositories/product.repository.ts
  # Debe mostrar: 3 (mínimo)
  ```

### ✅ Fase 4: Ejecución

- [ ] **Aplicación inicia sin errores**
  ```bash
  npm run start:dev
  # Busca en logs: "MongooseModule dependencies initialized"
  ```

- [ ] **Puerto 3001 escucha**
  ```bash
  # En otra terminal:
  curl -i http://localhost:3001/products
  # Debe retornar: HTTP/1.1 200 OK
  ```

### ✅ Fase 5: Conectividad

- [ ] **Conecta a MongoDB**
  ```bash
  # Verifica en logs de NestJS durante startup
  # Debe mostrar: "Successfully connected to MongoDB"
  ```

- [ ] **Puede escribir datos**
  ```bash
  curl -X POST http://localhost:3001/products \
    -H "Content-Type: application/json" \
    -d '{
      "name":"Test Product",
      "price":99.99,
      "stock":10,
      "sku":"TEST-001"
    }'
  # HTTP/1.1 201 Created
  ```

- [ ] **Puede leer datos**
  ```bash
  curl http://localhost:3001/products
  # HTTP/1.1 200 OK
  # Debe mostrar array de productos (vacío o con datos)
  ```

## 🧪 Tests Funcionales

### Test 1: Crear Producto

```bash
#!/bin/bash
# Guardar como test-create.sh

RESPONSE=$(curl -s -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Laptop Test",
    "description":"Test laptop",
    "price":1299.99,
    "stock":5,
    "sku":"LAPTOP-TEST-001",
    "category":"Laptops",
    "active":true
  }')

echo "Response: $RESPONSE"

# Verificar que tiene _id
if echo "$RESPONSE" | grep -q "_id"; then
  echo "✅ Producto creado exitosamente"
else
  echo "❌ Error al crear producto"
fi
```

### Test 2: Buscar Todos

```bash
curl -s http://localhost:3001/products | \
  jq '.[] | {name: .name, price: .price}'

# Esperado:
# {
#   "name": "Laptop Test",
#   "price": 1299.99
# }
```

### Test 3: Buscar por Categoría

```bash
curl -s "http://localhost:3001/products?category=Laptops" | jq '.'

# Esperado: Array de laptops
```

### Test 4: Búsqueda de Texto

```bash
curl -s "http://localhost:3001/products/search?q=laptop" | jq '.[] | .name'

# Esperado: "Laptop Test"
```

### Test 5: Actualizar Stock

```bash
# Primero obtener el ID del producto creado
PRODUCT_ID=$(curl -s http://localhost:3001/products | jq -r '.[0]._id')

# Actualizar stock (restar 2)
curl -X POST "http://localhost:3001/products/$PRODUCT_ID/purchase" \
  -H "Content-Type: application/json" \
  -d '{"quantity":2}'

# Verificar nuevo stock
curl -s "http://localhost:3001/products/$PRODUCT_ID" | jq '.stock'

# Esperado: 3 (5 - 2)
```

### Test 6: Stock Bajo

```bash
curl -s "http://localhost:3001/products/low-stock?threshold=3" | jq '.products[] | {name: .name, stock: .stock}'

# Esperado: Productos con stock < 3
```

### Test 7: Productos Top Rated

```bash
# Actualizar rating de un producto
PRODUCT_ID=$(curl -s http://localhost:3001/products | jq -r '.[0]._id')

curl -X PUT "http://localhost:3001/products/$PRODUCT_ID" \
  -H "Content-Type: application/json" \
  -d '{"rating":4.8}'

# Obtener top rated
curl -s "http://localhost:3001/products/top-rated?limit=5" | \
  jq '.products[] | {name: .name, rating: .rating}'

# Esperado: Productos ordenados por rating descendente
```

## 📊 Validación en MongoDB Atlas

### 1. Ver Documentos en Atlas

```bash
# En tu navegador:
1. Ve a https://cloud.mongodb.com
2. Selecciona tu cluster
3. Click en "Browse Collections"
4. Ve a catalogo → products
5. Verifica que los documentos existan
```

### 2. Ver Índices

```bash
# En MongoDB Atlas:
1. catalogo → products
2. Pestaña "Indexes"
3. Verifica que existan:
   - _id (default)
   - sku (unique)
   - category
   - name, description, tags (text)
   - active
   - stock
   - createdAt
```

### 3. Monitorear Tráfico

```bash
# En MongoDB Atlas:
1. Cluster → Metrics
2. Observa:
   - Query count
   - Read operations
   - Write operations
   - Network I/O
```

## 🐛 Troubleshooting

### Problema: "Cannot connect to MongoDB"

**Solución:**
```bash
# 1. Verificar MONGO_URI
cat .env | grep MONGO_URI

# 2. Verificar IP whitelist en MongoDB Atlas
# Security → Network Access → ¿Tu IP está listada?

# 3. Verificar credenciales
# El formato debe ser:
# mongodb+srv://username:password@cluster.xxxxx.mongodb.net/database?retryWrites=true&w=majority

# 4. Prueba conexión manual (instala mongosh)
mongosh "mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/catalogo"
```

### Problema: "SKU already exists"

**Solución:**
```bash
# El índice unique previene SKUs duplicados
# Soluciones:
# 1. Usa diferente SKU
# 2. O elimina el documento anterior
# 3. O cambia el SKU del documento existente

curl -X PUT "http://localhost:3001/products/ID" \
  -H "Content-Type: application/json" \
  -d '{"sku":"NEW-SKU-123"}'
```

### Problema: "Timeout"

**Solución:**
```bash
# Aumentar timeout en MONGO_URI:
MONGO_URI=mongodb+srv://...?serverSelectionTimeoutMS=10000&connectTimeoutMS=10000

# O verificar conexión a internet:
ping 8.8.8.8
```

### Problema: No aparecen índices en MongoDB Atlas

**Solución:**
```bash
# Los índices se crean automáticamente con el primer documento
# Si no ves los índices:
# 1. Crea un producto: POST /products
# 2. Espera 30 segundos
# 3. Refresca MongoDB Atlas
# 4. Ve a Products → Indexes
```

### Problema: "Cast to ObjectId failed"

**Solución:**
```bash
# El ID debe ser un ObjectId válido de MongoDB
# Verifica:
# 1. El ID tiene 24 caracteres hex
# 2. Viene de una respuesta anterior de la BD

# Ejemplo válido:
curl "http://localhost:3001/products/650a1b2c3d4e5f6g7h8i9j0a"

# Ejemplo inválido:
curl "http://localhost:3001/products/123"  # Muy corto
```

## 📈 Verificación de Performance

### Queries por segundo

```bash
# Instala: siege
brew install siege  # macOS
# apt-get install siege  # Linux

# Prueba de carga
siege -u http://localhost:3001/products -c 10 -r 100

# Resultados esperados:
# - Response time: < 200ms
# - Success rate: > 95%
```

### Tamaño de BD

```bash
# En MongoDB Atlas:
# Cluster → Collections → Storage size

# Esperado después de 100 productos:
# ~5-10 MB (incluyendo índices)
```

### Índice Usage

```bash
# Ver si los índices se usan:
# 1. Cluster → Collections → products
# 2. Pestaña "Indexes"
# 3. Busca "accesses.ops" > 0
```

## ✨ Validación Completa (Script)

```bash
#!/bin/bash
# Guardar como validate.sh
# chmod +x validate.sh
# ./validate.sh

echo "🔍 Iniciando validación..."

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

check() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ $1${NC}"
  else
    echo -e "${RED}❌ $1${NC}"
    exit 1
  fi
}

# 1. Verificar .env
test -f .env
check ".env existe"

grep "MONGO_URI" .env > /dev/null
check "MONGO_URI configurada"

# 2. Verificar dependencias
npm list @nestjs/mongoose > /dev/null 2>&1
check "@nestjs/mongoose instalado"

npm list mongoose > /dev/null 2>&1
check "mongoose instalado"

# 3. Verificar archivos
test -f src/infrastructure/product.schema.ts
check "product.schema.ts existe"

test -f src/infrastructure/persistence/mongo-product.repository.ts
check "mongo-product.repository.ts existe"

# 4. Verificar servidor
timeout 5 bash -c 'cat < /dev/null > /dev/tcp/127.0.0.1/3001' 2>/dev/null
if [ $? -eq 0 ] || [ $? -eq 124 ]; then
  echo -e "${GREEN}✅ Servidor escucha en puerto 3001${NC}"
else
  echo -e "${RED}❌ Servidor no escucha en puerto 3001${NC}"
fi

# 5. Test HTTP
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/products)
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ GET /products retorna 200${NC}"
else
  echo -e "${RED}❌ GET /products retorna $HTTP_CODE${NC}"
fi

echo ""
echo -e "${GREEN}✨ Validación completada${NC}"
```

## 📋 Validación Manual Paso a Paso

1. **Inicia servidor**
   ```bash
   npm run start:dev
   # Espera logs: "Listening on port 3001"
   ```

2. **Abre otra terminal y crea un producto**
   ```bash
   curl -X POST http://localhost:3001/products \
     -H "Content-Type: application/json" \
     -d '{
       "name":"Laptop",
       "price":999.99,
       "stock":10,
       "sku":"TEST-001"
     }'
   ```

3. **Verifica en MongoDB Atlas**
   - Ve a tu cluster
   - Busca "catalogo" → "products"
   - Debe mostrar el documento insertado

4. **Busca el producto**
   ```bash
   curl http://localhost:3001/products
   ```

5. **Actualiza stock**
   ```bash
   # Obtén el ID de la respuesta anterior
   curl -X POST http://localhost:3001/products/ID/purchase \
     -H "Content-Type: application/json" \
     -d '{"quantity":2}'
   ```

6. **Verifica en Atlas**
   - Refresca la colección
   - El stock debe haber disminuido

**✅ Si todo funcionó = ¡Éxito!**

---

**Próximos pasos:**
- [ ] Agregar validación con `class-validator`
- [ ] Implementar paginación
- [ ] Agregar rate limiting
- [ ] Configurar logging centralizado
- [ ] Crear tests unitarios
- [ ] Documentar API con Swagger
