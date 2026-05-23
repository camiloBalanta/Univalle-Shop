# UnivalleShop Microservices - Docker Compose Guide

## Descripción

Este archivo `docker-compose.yml` raíz levanta todos los microservicios del proyecto UnivalleShop en una única orquestación:

- **Search Service** (Búsqueda) - Puerto 3001
- **Catalog Service** (Catálogo) - Puerto 3000
- **Payment Service** (Pagos) - Puerto 3002
- **Orders Service** (Pedidos) - Puerto 3004
- **Users Service** (Usuarios) - Puerto 3003
- **Recommendation Service** (Recomendación) - Puerto 3006

Cada servicio tiene su propia instancia de MongoDB y está conectado a través de la red `univalle-network`.

## Requisitos

- Docker >= 20.10
- Docker Compose >= 3.9
- Al menos 4GB de RAM disponibles
- Conexión a internet para descargar las imágenes base

## Pasos para iniciar

### 1. Clonar o descargar el proyecto

```bash
cd c:\Users\camil\Documents\UnivalleShop
```

### 2. Verificar que el `.env` raíz está configurado

El archivo `.env` raíz ya contiene los valores de puerto y las URIs de MongoDB para cada servicio. Si necesitas cambiar puertos o usar otra base de datos, edítalo en `c:\Users\camil\Documents\UnivalleShop\.env`.

Valores importantes en `.env`:
- `NODE_ENV` — ambiente general (production por defecto)
- `SEARCH_SERVICE_HOST_PORT`, `CATALOG_SERVICE_HOST_PORT`, `PAYMENT_SERVICE_HOST_PORT`, `ORDERS_SERVICE_HOST_PORT`, `USERS_SERVICE_HOST_PORT`, `RECOMMENDATION_SERVICE_HOST_PORT`
- `SEARCH_MONGO_URI`, `CATALOG_MONGO_URI`, `ORDERS_MONGO_URI`, `USERS_MONGO_URI`, `RECOMMENDATION_MONGO_URI`

### 3. Levantar todos los servicios

```bash
docker-compose up -d --build
```

Esto:
- Construye todas las imágenes Docker
- Crea todas las redes y volúmenes
- Inicia todos los contenedores en background

### 4. Verificar que todo está corriendo

```bash
docker-compose ps
```

Deberías ver todos los servicios con estado `Up`.

## Puertos y Acceso

| Servicio | Puerto | URL |
|----------|--------|-----|
| Search API | 3001 | http://localhost:3001 |
| Catalog API | 3000 | http://localhost:3000 |
| Search API | 3001 | http://localhost:3001 |
| Payment API | 3002 | http://localhost:3002 |
| Orders API | 3004 | http://localhost:3004 |
| Users API | 3003 | http://localhost:3003 |
| Recommendation API | 3006 | http://localhost:3006 |

## Bases de Datos MongoDB

- `search-mongo:27017` → Database: `microsearch`
- `catalog-mongo:27017` → Database: `catalogo`
- `orders-mongo:27017` → Database: `pedidos`
- `users-mongo:27017` → Database: `usuarios`
- `recommendation-mongo:27017` → Database: `recommendation-db`

## Ver logs

Ver logs de todos los servicios:
```bash
docker-compose logs -f
```

Ver logs de un servicio específico:
```bash
docker-compose logs -f search-service
```

## Parar todos los servicios

```bash
docker-compose down
```

Esto detiene y elimina los contenedores, pero preserva los volúmenes de datos.

## Eliminar todo (incluyendo datos)

```bash
docker-compose down -v
```

⚠️ **Advertencia**: Esto elimina los volúmenes, lo que borra todas las bases de datos.

## Reiniciar un servicio específico

```bash
docker-compose restart search-service
```

## Reconstruir una imagen específica

```bash
docker-compose up -d --build search-service
```

## Configuración de Variables de Entorno

### Raíz (.env)
- `SEARCH_MONGO_URI` (opcional): Override del URI de MongoDB para Search Service
- `NODE_ENV`: Ambiente (production por defecto)

### Por microservicio

Cada microservicio tiene su propio `.env` en su directorio. Los principales son:
- `PORT`: Puerto en el que corre el servicio
- `MONGO_URI`: URI de conexión a MongoDB
- `NODE_ENV`: Ambiente (development/production)

## Troubleshooting

### Los contenedores no inician
```bash
docker-compose logs -f
```
Revisa los logs para identificar errores.

### Error de puerto en uso
Si algún puerto está ocupado, edita `docker-compose.yml` y cambia el mapeo de puertos.

### Error de conexión a MongoDB
Verifica que el contenedor MongoDB correspondiente esté corriendo:
```bash
docker-compose ps | grep mongo
```

### Reconstruir todo desde cero
```bash
docker-compose down -v
docker-compose up -d --build
```

## Notas

- Los datos de MongoDB se persisten en volúmenes Docker locales (`search-mongo-data`, etc.)
- Los servicios están configurados para reiniciarse automáticamente si fallan
- El healthcheck del servicio de pagos valida cada 30 segundos
- Todos los servicios están en la red `univalle-network` para comunicarse entre sí

## URLs para Desarrollo Interno (dentro de Docker)

Los servicios pueden comunicarse entre sí usando:
- `http://search-service:3001`
- `http://catalog-service:3000`
- `http://payment-service:3000` (intenta portar desde 3002 externo)
- `http://orders-service:3004`
- `http://users-service:3000`
- `http://recommendation-service:3000`

