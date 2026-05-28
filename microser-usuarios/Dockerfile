# Etapa 1: Build (Construcción)
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# Etapa 2: Runtime (Ejecución)
FROM node:20-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar el código compilado desde la etapa builder
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "run", "start:prod"]
