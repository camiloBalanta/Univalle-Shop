# Microservicio de Recomendaciones

Recomendaciones personalizadas para Univalle Shop con Arquitectura Hexagonal.

## Stack

- Node.js + NestJS 11
- MongoDB + Mongoose
- class-validator, class-transformer
- Jest para testing
- Docker & Docker Compose

## Arquitectura Correcta

El microservicio de recomendaciones NO debe contener productos completos.
Debe comportarse como un motor de datos ligero que:

- consume catálogo desde `catalog-service`
- consume historial de órdenes desde `orders-service`
- consulta datos del usuario desde `users-service`
- almacena solo metadatos de recomendaciones, calificaciones y preferencias resumidas

### Lo que almacena

- calificaciones de producto (`rating`, `review`, `userId`, `productId`, `productName`, `category`, `createdAt`, `updatedAt`)
- historial resumido de compras para validar ratings
- preferencias de usuario extraídas de órdenes y/o perfil
- recomendaciones precomputadas para cada usuario

### Reglas de calificación

- Solo el usuario que ha comprado realmente el producto puede calificarlo.
- La validación se hace con el servicio de órdenes (`orders-service`).
- Las calificaciones son de 1 a 5 estrellas.
- Las reseñas son opcionales, pero se almacenan junto a la calificación.

## Instalación

```bash
npm install
```

## Configuración

Crea `.env`:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/recommendation-db
```

## Ejecutar

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Tests
npm run test
npm run test:e2e

# Docker
docker-compose up -d
```

## API

- `GET /recommendations/:userId` - Obtener recomendaciones
- `PUT /recommendations/:userId` - Actualizar recomendaciones
- `DELETE /recommendations/:userId` - Eliminar recomendaciones

Swagger: http://localhost:3000/api

## Estructura

```
src/
├── common/              # Excepciones, filtros, validadores
├── recommendation/
│   ├── domain/          # Lógica de negocio
│   ├── application/     # Servicios
│   └── infrastructure/  # Controllers, adapters
```

## Tests

```
✅ Unit Tests: 24/24 PASSED
✅ E2E Tests: 5/5 PASSED
✅ MongoDB Atlas: Conectado
```
