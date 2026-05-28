# Microservicio de Recomendaciones

Recomendaciones personalizadas para Univalle Shop con Arquitectura Hexagonal.

## Stack

- Node.js + NestJS 11
- MongoDB + Mongoose
- class-validator, class-transformer
- Jest para testing
- Docker & Docker Compose

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
