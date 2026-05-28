# 🚀 Guía de Despliegue - Servicio de Recomendación

## Despliegue con Docker Compose

### Paso 1: Clonar el Repositorio
```bash
git clone <URL_DEL_REPO>
cd microser-recomendacion
```

### Paso 2: Configurar Variables de Entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar si es necesario (opcional para desarrollo)
# vim .env
```

### Paso 3: Construir e Iniciar los Servicios
```bash
# Construir las imágenes y arrancar los contenedores
docker-compose up -d

# Verificar que todo esté corriendo
docker-compose ps

# Debería mostrar:
# CONTAINER ID   IMAGE           COMMAND                  STATUS
# xxxxxxxxxx     recommendation-service   "node dist/main"    Up
# yyyyyyyyy      mongo:latest    "docker-entrypoint.s…"   Up
```

### Paso 4: Verificar que el Servicio está Funcionando
```bash
# Health check
curl http://localhost:3006/health

# Respuesta esperada:
# {"status":"healthy","timestamp":"2024-04-11T10:30:00.000Z"}

# Home
curl http://localhost:3006/

# Respuesta esperada:
# "Univalle Shop - Recommendation Service v1.0.0"
```

### Paso 5: Probar el Servicio de Recomendaciones
```bash
# Obtener recomendaciones
curl http://localhost:3006/recommendations/user123

# Respuesta esperada:
# {
#   "_id": "...",
#   "userId": "user123",
#   "recommendations": [
#     {"product": "Monitor", "score": 0.82},
#     {"product": "Teclado", "score": 0.78}
#   ]
# }
```

## Comandos Útiles

### Logs
```bash
# Ver logs de la aplicación
docker-compose logs -f recommendation-service

# Ver logs de MongoDB
docker-compose logs -f mongo

# Ver todos los logs
docker-compose logs -f
```

### Acceder a la Shell del Contenedor
```bash
# NestJS Container
docker-compose exec recommendation-service sh

# MongoDB Container (con mongo CLI)
docker-compose exec mongo mongosh
```

### Detener y Eliminar Servicios
```bash
# Detener sin eliminar
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Eliminar todo incluyendo volúmenes
docker-compose down -v
```

### Reconstruir la Imagen
```bash
# Forzar reconstrucción
docker-compose up -d --build

# Reconstruir solo el servicio
docker-compose build --no-cache recommendation-service
```

## Despliegue en Producción

### Pre-requisitos
- Docker & Docker Compose instalados
- Servidor con al menos 2GB RAM
- Puerto 3006 disponible (configurable)

### Configuración Recomendada

#### docker-compose.prod.yml
```yaml
version: '3.8'

services:
  recommendation-service:
    image: univalle/recommendation-service:1.0.0
    container_name: recommendation-service
    ports:
      - "3006:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGO_URI=mongodb://mongo:27017/recommendation-db
    depends_on:
      - mongo
    restart: always
    networks:
      - univalle-network
    # Limitar recursos
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  mongo:
    image: mongo:latest
    container_name: recommendation-mongo
    environment:
      - MONGO_INITDB_DATABASE=recommendation-db
    volumes:
      - mongo_data:/data/db
      - ./mongod.conf:/etc/mongod.conf
    ports:
      - "27017:27017"
    restart: always
    networks:
      - univalle-network
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M

volumes:
  mongo_data:
    driver: local

networks:
  univalle-network:
    driver: bridge
```

### Iniciando en Producción
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoreo

### Health Check
```bash
# Script para monitorear continuamente
watch -n 5 'curl -s http://localhost:3006/health | jq'
```

### Métricas
```bash
# Uso de contenedores
docker stats

# Logs detallados
docker-compose logs --follow --tail=100 recommendation-service
```

## Troubleshooting

### El contenedor se detiene inmediatamente
```bash
# Ver los logs de error
docker-compose logs recommendation-service

# Verificar la configuración de variables de entorno
docker-compose exec recommendation-service env | grep -i mongo
```

### MongoDB no conecta
```bash
# Verificar que MongoDB está corriendo
docker-compose ps mongo

# Revisar logs de MongoDB
docker-compose logs mongo

# Reiniciar MongoDB
docker-compose restart mongo
```

### Puerto 3006 en uso
```bash
# Cambiar el puerto en docker-compose.yml
# De: "3006:3000"
# A: "3007:3000"  (o el puerto disponible)

docker-compose down
docker-compose up -d
```

### Problemas de permisos
```bash
# Si hay problemas con volúmenes
docker-compose down -v
docker-compose up -d
```

## Actualización del Servicio

### Con nuevas imágenes
```bash
# 1. Descargar la última imagen
docker pull univalle/recommendation-service:latest

# 2. Detener el servicio
docker-compose down

# 3. Actualizar el tag en docker-compose.yml
# De: image: univalle/recommendation-service:1.0.0
# A: image: univalle/recommendation-service:latest

# 4. Reiniciar
docker-compose up -d
```

### Con código local actualizado
```bash
# 1. Reconstruir la imagen
docker-compose build --no-cache recommendation-service

# 2. Reiniciar el servicio
docker-compose up -d
```

## Respaldo de Base de Datos

### Backup
```bash
docker-compose exec mongo mongodump --out /data/backup

# O directamente desde el host
docker exec recommendation-mongo mongodump --out /data/backup
```

### Restore
```bash
docker-compose exec mongo mongorestore /data/backup
```

---

**Última actualización**: Abril 2024
**Versión**: 1.0.0
