# MongoDB Atlas Guide

Este proyecto puede correr con MongoDB local en Docker o con MongoDB Atlas.

## 1. Crear archivo de variables

Copia el ejemplo:

```powershell
Copy-Item .env.atlas.example .env.atlas
```

Edita `.env.atlas` y reemplaza `USUARIO`, `PASSWORD` y `CLUSTER` con los datos reales de Atlas.

Usa una base por microservicio:

- `microsearch`
- `catalogo`
- `pedidos`
- `usuarios`
- `recommendation-db`

## 2. Permitir conexión desde tu equipo

En MongoDB Atlas:

- Network Access
- Add IP Address
- Agrega tu IP actual o temporalmente `0.0.0.0/0` para demo

## 3. Levantar usando Atlas

```powershell
docker compose -f docker-compose.yml -f docker-compose.atlas.yml --env-file .env.atlas up -d --build
```

Frontend:

```text
http://localhost:5173
```

Gateway:

```text
http://localhost:3005/health
```

## Nota

`microser-pagos` todavía usa persistencia en memoria. Para entrega completa con Atlas, el siguiente paso es cambiar su repositorio a MongoDB.
