# Microservicio de busqueda de UnivalleShop

Servicio de busqueda construido con NestJS y MongoDB para consultar productos del e-commerce UnivalleShop. Expone un endpoint REST que consulta la coleccion `product_search_results` y devuelve la consulta recibida, la categoria filtrada, el total de coincidencias y la lista de productos encontrados.

El flujo principal hoy es:

```text
GET /search -> SearchController -> SearchService -> SearchSaga -> SearchUseCase -> ProductSearchRepositoryImpl -> MongoDB
```

## Stack

- NestJS 11
- TypeScript
- Mongoose / MongoDB
- React + Vite en `frontend/`
- Docker y Docker Compose

## Estructura del proyecto

```text
src/
|-- application/
|   |-- dtos/
|   `-- use-cases/
|-- domain/
|   |-- entities/
|   |-- ports/
|   `-- value-objects/
|-- infrastructure/
|   |-- repositories/
|   `-- schemas/
|-- saga/
|   |-- search.controller.ts
|   |-- search.model.ts
|   |-- search.module.ts
|   |-- search.saga.ts
|   `-- search.service.ts
|-- app.controller.ts
|-- app.module.ts
|-- app.service.ts
`-- main.ts

frontend/
|-- src/
`-- package.json

mongo-seed.json
test.http
```

## Variables de entorno

Crea un archivo `.env` a partir de `.env.example`.

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/microsearch?retryWrites=true&w=majority
MONGO_DB_NAME=microsearch
PORT=3000
```

Valores relevantes:

- `MONGO_URI`: cadena de conexion a MongoDB. Si no se define, el backend intenta `mongodb://localhost:27017/microsearch`.
- `MONGO_DB_NAME`: nombre de la base de datos. Si no se define, usa `microsearch`.
- `PORT`: puerto HTTP del backend. Si no se define, usa `3000`.

## Ejecucion local del backend

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Crea el archivo `.env`:

   ```bash
   Copy-Item .env.example .env
   ```

3. Ajusta `MONGO_URI` y `MONGO_DB_NAME` con tu entorno.

4. Inicia el backend:

   ```bash
   npm run start:dev
   ```

5. La API quedara disponible en `http://localhost:3000` o en el valor definido en `PORT`.

## Cargar datos de ejemplo

El repositorio incluye `mongo-seed.json` con productos de ejemplo para la coleccion `product_search_results`.

Importa ese archivo en la base configurada en `.env` usando MongoDB Compass o la interfaz de MongoDB Atlas.

Nota: hoy no existe un script de seed automatico dentro del proyecto.

## Endpoints

### `GET /`

Responde:

```text
Hello World!
```

### `GET /search`

Devuelve todos los productos de `product_search_results` si no se envia el parametro `q`.

### `GET /search?q=camiseta`

Realiza una busqueda case-insensitive sobre los campos:

- `name`
- `description`
- `category`
- `seller`

### `GET /search?category=Accesorios`

Filtra los productos por categoria sin texto de busqueda.

### `GET /search?q=univalle&category=Ropa`

Combina busqueda de texto con filtro exacto por categoria.

Ejemplo de respuesta:

```json
{
  "query": "camiseta",
  "category": "Ropa",
  "total": 1,
  "results": [
    {
      "productId": "UVS-001",
      "name": "Camiseta UnivalleShop",
      "description": "Camiseta roja con estampado institucional para estudiantes de Univalle.",
      "category": "Ropa",
      "price": 45000,
      "imageUrl": "https://placehold.co/600x400?text=Camiseta+Univalle",
      "stock": 18,
      "seller": "Tienda Central"
    }
  ]
}
```

## Frontend

El cliente React en `frontend/` permite probar el endpoint de busqueda desde una interfaz simple.

1. Entra a la carpeta:

   ```bash
   cd frontend
   ```

2. Instala dependencias:

   ```bash
   npm install
   ```

3. Inicia Vite:

   ```bash
   npm run dev
   ```

4. Abre `http://localhost:5173`.

Importante: el frontend actual consulta `http://localhost:3000/search`. Si ejecutas el backend con Docker Compose, el servicio queda expuesto en `http://localhost:3001`, asi que tendras que levantar el backend localmente en `3000` o ajustar esa URL en `frontend/src/App.tsx`.

## Docker Compose

Para construir y levantar el backend en contenedor:

```bash
docker compose up --build
```

El servicio quedara disponible en:

```text
http://localhost:3001
```

Notas:

- El contenedor expone `3001`.
- El archivo `.env` se copia dentro de la imagen durante el build.
- Si cambias `.env`, vuelve a ejecutar `docker compose up --build`.

## Scripts utiles

Backend:

- `npm run start:dev`: inicia el servicio en modo desarrollo
- `npm run build`: compila el proyecto
- `npm run start:prod`: ejecuta la version compilada
- `npm run test`: pruebas unitarias
- `npm run test:e2e`: pruebas end-to-end

Frontend:

- `cd frontend && npm run dev`: servidor local de desarrollo
- `cd frontend && npm run build`: build de produccion

## Pruebas manuales

- Usa `test.http` para probar la API desde VS Code con la extension REST Client.
- Puedes probar, por ejemplo:

```http
GET http://localhost:3000/search?q=camiseta
```
