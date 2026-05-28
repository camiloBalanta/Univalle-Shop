# UnivalleShop Microservices - Docker Compose Guide

## Descripción

Este archivo `docker-compose.yml` raíz levanta todos los microservicios del proyecto UnivalleShop en una única orquestación:

- **Search Service** (Búsqueda) - Puerto 3001
- **Catalog Service** (Catálogo) - Puerto 3000
- **Payment Service** (Pagos) - Puerto 3002
- **Orders Service** (Pedidos) - Puerto 3004
- **Users Service** (Usuarios) - Puerto 3003
- **Recommendation Service** (Recomendación) - Puerto 3006
- **Gateway Service** (API Gateway) - Puerto 3005

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

El archivo `.env` raíz ya contiene las URIs de MongoDB y la configuración de puertos. En esta orquestación, solo el **API Gateway** se expone a la máquina host. Los demás microservicios son internos y se comunican a través de la red `univalle-network`.

Valores importantes en `.env`:
- `NODE_ENV` — ambiente general (production por defecto)
- `GATEWAY_SERVICE_HOST_PORT` — puerto expuesto para el API Gateway
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
| Search API | internal only via gateway | http://localhost:3005/search/ |
| Catalog API | internal only via gateway | http://localhost:3005/catalog/ |
| Payment API | internal only via gateway | http://localhost:3005/payment/ |
| Orders API | internal only via gateway | http://localhost:3005/orders/ |
| Users API | internal only via gateway | http://localhost:3005/users/ |
| Authentication API | internal only via gateway | http://localhost:3005/auth/ |
| Recommendation API | internal only via gateway | http://localhost:3005/recommendation/ |
| API Gateway | 3005 | http://localhost:3005 |

## Bases de Datos MongoDB

> Nota: El gateway es el único punto de entrada externo. Los microservicios internos se comunican entre sí en la red `univalle-network`.

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
- `http://gateway-service:3000`

