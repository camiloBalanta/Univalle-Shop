# Microservicio de Pagos - Arquitectura Hexagonal

Un microservicio de pagos construido con NestJS siguiendo los principios de la **Arquitectura Hexagonal** (Ports & Adapters), implementando el patrón **Saga** para manejo de transacciones distribuidas y contenerizado con **Docker**.

## 🏗️ Arquitectura

### Estructura Hexagonal
```
src/
├── application/          # Capa de Aplicación
│   ├── commands/         # Comandos CQRS
│   ├── dtos/            # Data Transfer Objects
│   ├── handlers/        # Manejadores de comandos
│   ├── saga/           # Coordinación de Sagas
│   ├── services/       # Servicios de aplicación
│   └── use-cases/      # Casos de uso
├── domain/             # Capa de Dominio
│   ├── entities/       # Entidades de negocio
│   ├── events/         # Eventos de dominio
│   └── repositories/   # Interfaces de repositorio
└── infrastructure/     # Capa de Infraestructura
    ├── controllers/    # Controladores REST
    ├── messaging/      # Manejo de eventos/mensajería
    └── persistence/    # Implementaciones de persistencia
```

### Patrón Saga
Implementa transacciones distribuidas con compensación automática:
- **Estados**: STARTED → PAYMENT_PROCESSING → COMPLETED
- **Compensación**: Rollback automático en caso de fallos
- **Pasos**: Crear pago → Procesar pago → Enviar notificación

## 🚀 Inicio Rápido

### Con Docker (Recomendado)
```bash
# Construir y ejecutar
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up -d

# Ver logs
docker-compose logs -f payment-microservice
```

### Desarrollo Local
```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run start:dev

# Ejecutar tests
npm run test

# Ejecutar con Docker en desarrollo
docker build -t payment-microservice .
docker run -p 3000:3000 payment-microservice
```

## 📡 API Endpoints

### Pagos
```http
POST /payments                    # Crear pago
POST /payments/:id/confirm       # Confirmar pago
POST /payments/:id/cancel        # Cancelar pago
POST /payments/:id/refund        # Reembolsar pago
```

### Monitoreo
```http
GET /payments/health             # Health check
GET /payments/saga               # Ver todas las sagas
GET /payments/saga/:sagaId       # Ver estado de saga específica
```

### Ejemplo de Request
```bash
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.50,
    "currency": "USD",
    "orderId": "order-123",
    "customerId": "customer-456"
  }'
```

## 🐳 Docker

### Dockerfile
- **Base**: Node.js 18 Alpine
- **Multi-stage**: Optimizado para producción
- **Health Check**: Endpoint `/health`
- **Security**: Usuario no-root

### Docker Compose
```yaml
services:
  payment-microservice:
    build: .
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
```

## 🔄 Patrón Saga en Acción

1. **Inicio**: Se crea una saga con ID único
2. **Ejecución**: Pasos secuenciales con rollback automático
3. **Compensación**: Si falla un paso, se revierten los anteriores
4. **Monitoreo**: Estado de saga accesible via API

### Estados de Saga
- `STARTED`: Saga iniciada
- `PAYMENT_PROCESSING`: Procesando pago
- `PAYMENT_COMPLETED`: Pago completado
- `NOTIFICATION_SENT`: Notificación enviada
- `COMPLETED`: Saga exitosa
- `FAILED`: Error en algún paso
- `COMPENSATING`: Revirtiendo cambios
- `COMPENSATED`: Compensación completada

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e

# Cobertura
npm run test:cov
```

## 📦 Despliegue

### Producción con Docker
```bash
# Construir imagen
docker build -t payment-microservice:latest .

# Ejecutar contenedor
docker run -d \
  --name payment-service \
  -p 3000:3000 \
  -e NODE_ENV=production \
  payment-microservice:latest
```

### Variables de Entorno
```env
NODE_ENV=production
PORT=3000
# Agregar más variables según necesidades
```

## 🏗️ Arquitectura Hexagonal - Beneficios

✅ **Separación de responsabilidades**: Dominio independiente de frameworks
✅ **Testabilidad**: Cada capa se puede probar en aislamiento
✅ **Mantenibilidad**: Cambios en infraestructura no afectan el dominio
✅ **Escalabilidad**: Fácil agregar nuevas implementaciones
✅ **CQRS Pattern**: Comandos y queries separados claramente
✅ **Saga Pattern**: Transacciones distribuidas confiables

## 📋 Tecnologías

- **NestJS**: Framework Node.js
- **TypeScript**: Tipado fuerte
- **Docker**: Contenerización
- **Arquitectura Hexagonal**: Diseño modular
- **Saga Pattern**: Transacciones distribuidas
- **CQRS**: Separación de comandos y queries

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
