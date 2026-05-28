# Sistema de Pagos Simulado - UnivalleShop

## Descripción General

El sistema de pagos simulado permite procesar pagos de órdenes con una lógica aleatoria (70% aprobado, 30% rechazado) para demostración de arquitectura hexagonal y microservicios.

## Endpoints

### Crear Pago Simulado

```http
POST /payment/simulate/{orderId}
```

**Ruta**: A través del Gateway

```
POST http://localhost:3005/payment/simulate/{orderId}
```

**Body**:
```json
{
  "amount": 12000,
  "customerId": "user-123"
}
```

**Response**:
```json
{
  "paymentId": "PAY-1716854400000",
  "orderId": "order-id-123",
  "customerId": "user-123",
  "amount": 12000,
  "status": "approved",
  "timestamp": "2024-05-27T10:20:00.000Z",
  "message": "Pago procesado exitosamente"
}
```

**Estados posibles**:
- `approved`: Pago aceptado (70% probabilidad)
- `rejected`: Pago rechazado (30% probabilidad)

---

## Flujo Completo

### 1. Usuario se Conecta

```bash
# Solicitar acceso
POST /auth/solicitar-acceso
{
  "codigo": "3000001",
  "anioRegistro": 2024
}

# Respuesta incluye temporaryPassword
```

### 2. Login

```bash
POST /auth/login
{
  "codigo": "3000001",
  "anioRegistro": 2024,
  "password": "<temporaryPassword>"
}

# Respuesta incluye token JWT
```

### 3. Cargar Catálogo

```bash
# Crear productos demo
POST /catalog/products
{
  "name": "Cuaderno Univalle",
  "price": 12000,
  "description": "Cuaderno universitario"
}

# Listar productos
GET /catalog/products
```

### 4. Crear Carrito y Agregar Ítems

```bash
# Agregar producto al carrito
POST /cart/{userId}/items
{
  "productId": "prod-123",
  "quantity": 1,
  "price": 12000
}

# Ver carrito
GET /cart/{userId}

# Actualizar cantidad
PATCH /cart/{userId}/items/{productId}
{
  "quantity": 2
}
```

### 5. Crear Orden (Checkout)

```bash
POST /orders
{
  "customerId": "user-123",
  "items": [
    {
      "productId": "prod-123",
      "quantity": 1,
      "price": 12000
    }
  ],
  "totalAmount": 12000,
  "clearCart": true
}

# Respuesta
{
  "id": "order-123",
  "customerId": "user-123",
  "status": "pending",
  "totalAmount": 12000,
  "items": [...],
  "createdAt": "2024-05-27T..."
}
```

### 6. Procesar Pago ⭐ (NUEVO)

```bash
POST /payment/simulate/{orderId}
{
  "amount": 12000,
  "customerId": "user-123"
}

# Respuesta
{
  "paymentId": "PAY-...",
  "status": "approved",
  "message": "Pago procesado exitosamente"
}
```

**¿Qué ocurre internamente?**
1. Simula el procesamiento del pago
2. Genera un resultado aleatorio (70% aprobado)
3. Actualiza la orden en microser-pedidos:
   - Si aprobado → `status: "paid"`
   - Si rechazado → `status: "payment_rejected"`

### 7. Ver Historial de Órdenes

```bash
GET /orders/user/{userId}

# Respuesta
[
  {
    "id": "order-123",
    "status": "paid",
    "totalAmount": 12000,
    "createdAt": "2024-05-27T..."
  }
]
```

---

## Estados de Orden

| Estado | Descripción |
|--------|-----------|
| `pending` | Orden creada, esperando pago |
| `paid` | Pago aprobado ✅ |
| `payment_rejected` | Pago rechazado ❌ (se puede reintentar) |
| `cancelled` | Orden cancelada |

---

## Frontend - Interfaz de Usuario

### Panel de Órdenes

Cada orden muestra:
- **ID**: Identificador único
- **Fecha**: Cuándo se creó
- **Estado**: Badge con color
  - 🟡 `pending`: Amarillo
  - 🟢 `paid`: Verde
  - 🔴 `payment_rejected`: Rojo
- **Monto**: Total en COP
- **Botón Pagar**:
  - Visible si estado es `pending`
  - Si se rechaza, cambia a "Reintentar"

### Flujo Frontend

1. Usuario hace login
2. Ve catálogo
3. Agrega productos al carrito
4. Hace checkout → orden creada
5. Ve botón "Pagar" en la orden
6. Click en "Pagar" → API simula pago
7. Se actualiza automáticamente el estado

---

## Arquitectura Interna

### Microservicio de Pagos

**Ruta**: `/microser-pagos/src/infrastructure/controllers/payment.controller.ts`

```typescript
@Post('simulate/:orderId')
async simulatePayment(
  @Param('orderId') orderId: string,
  @Body() body: { amount: number; customerId: string }
) {
  // 1. Simula pago (70% aprobado)
  const approved = Math.random() < 0.7;
  
  // 2. Actualiza orden en microser-pedidos
  await fetch(`http://orders-service:3004/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: approved ? 'paid' : 'payment_rejected' })
  });
  
  // 3. Retorna resultado
  return { paymentId, status, message };
}
```

### Comunicación Inter-Microservicios

```
Frontend (React)
    ↓
Gateway (nginx:3005)
    ↓
Payment Service (3002)
    ↓ (fetch interno)
Orders Service (3004) ← Actualiza estado
    ↓
MongoDB (pedidos)
```

---

## Scripts de Prueba

### Prueba Completa (API)

```bash
# 1. Crear usuario
curl -X POST http://localhost:3005/auth/solicitar-acceso \
  -H "Content-Type: application/json" \
  -d '{"codigo":"3000001","anioRegistro":2024}'

# 2. Login
curl -X POST http://localhost:3005/auth/login \
  -H "Content-Type: application/json" \
  -d '{"codigo":"3000001","anioRegistro":2024,"password":"<temp>"}'

# 3. Crear producto
curl -X POST http://localhost:3005/catalog/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Cuaderno","price":12000,"description":"Test"}'

# 4. Ver catálogo
curl http://localhost:3005/catalog/products

# 5. Crear orden
curl -X POST http://localhost:3005/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId":"user-123",
    "items":[{"productId":"prod-123","quantity":1,"price":12000}],
    "totalAmount":12000
  }'

# 6. Procesar pago
curl -X POST http://localhost:3005/payment/simulate/order-123 \
  -H "Content-Type: application/json" \
  -d '{"amount":12000,"customerId":"user-123"}'

# 7. Ver orden actualizada
curl http://localhost:3005/orders/order-123
```

---

## Demo en Frontend

### Pasos

1. Abre `http://localhost:5173`
2. Click en "Solicitar acceso"
3. Copy la contraseña temporal
4. Click en "Iniciar sesión"
5. Click en "Crear demo" para cargar productos
6. Selecciona un producto
7. Click en "Agregar"
8. Click en "Checkout"
9. ⭐ En la sección "Órdenes" verás botón **"Pagar"**
10. Click en "Pagar" → se procesa aleatoriamente (70% éxito)
11. El estado cambia a "paid" o "payment_rejected"
12. Si rechaza, click en "Reintentar"

---

## Documentación Hexagonal

### Directorio Estructura

```
microser-pagos/
├── domain/
│   ├── entities/
│   ├── ports/
│   └── value-objects/
├── application/
│   ├── use-cases/
│   ├── handlers/
│   └── dtos/
└── infrastructure/
    ├── controllers/
    ├── persistence/
    └── repositories/
```

### Entidades de Dominio

- **Payment**: Entidad principal que representa un pago
- **PaymentStatus**: Value Object para estados (approved, rejected, pending)

### Puertos (Interfaces)

- **PaymentRepository**: Puerto para persistencia
- **PaymentGatewayService**: Puerto para procesamiento externo

### Adaptadores

- **PaymentController**: Adaptador HTTP
- **PaymentRepositoryImpl**: Adaptador MongoDB

---

## Principios SOLID Aplicados

| Principio | Aplicación |
|-----------|-----------|
| **S** (Single Responsibility) | Cada handler tiene una responsabilidad |
| **O** (Open/Closed) | Fácil extender con nuevos tipos de pago |
| **L** (Liskov Substitution) | PaymentRepositoryImpl intercambiable |
| **I** (Interface Segregation) | DTOs específicos por operación |
| **D** (Dependency Inversion) | Inyección de dependencias en handlers |

---

## Manejo de Errores

- **Pago rechazado**: El usuario puede reintentar
- **Servicio de órdenes no disponible**: El pago se procesa igual, pero no se actualiza la orden (graceful degradation)
- **Validación**: Se valida amount > 0, customerId y orderId obligatorios

---

## Próximas Mejoras

- [ ] Integración con gateway de pagos real (Stripe, etc.)
- [ ] Persistencia de pagos en MongoDB
- [ ] Logging y auditoría de transacciones
- [ ] Refund automático en caso de error
- [ ] Notificaciones por email
- [ ] Dashboard de reportes de pagos
