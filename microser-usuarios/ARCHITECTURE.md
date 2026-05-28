# Arquitectura DDD + Hexagonal + Clean + Sagas

## Descripción General

Este proyecto implementa una arquitectura profesional combinando:
- **Domain-Driven Design (DDD)**: Modelado del negocio en el corazón
- **Arquitectura Hexagonal**: Desacoplamiento de la lógica de negocio
- **Clean Architecture**: Separación de responsabilidades
- **Saga Pattern**: Orquestación de procesos complejos con eventos

## Estructura de Carpetas

```
src/
├── shared/                          # Código compartido
│   ├── domain/
│   │   ├── entities/               # Entidades base reutilizables
│   │   ├── value-objects/          # Value Objects base
│   │   ├── events/                 # Eventos de dominio base
│   │   └── exceptions/             # Excepciones base
│   ├── application/
│   │   └── mappers/                # Mappers reutilizables
│   └── infrastructure/
│       └── providers/              # Providers globales (EventEmitter)
│
├── usuarios/                        # MÓDULO: Usuarios
│   ├── domain/                      # Capa de Dominio (Reglas de Negocio Puras)
│   │   ├── aggregates/             # Agregados (Usuario)
│   │   ├── value-objects/          # Value Objects (Email, Name)
│   │   ├── events/                 # Eventos de Dominio (UsuarioCreado, etc)
│   │   ├── ports/                  # Interfaces (IUsuarioRepository)
│   │   └── exceptions/             # Excepciones de Dominio
│   │
│   ├── application/                # Capa de Aplicación (Use Cases & Orquestación)
│   │   ├── dto/                    # Data Transfer Objects
│   │   ├── use-cases/              # Casos de Uso (CrearUsuario, etc)
│   │   ├── sagas/                  # Sagas (Orquestación de eventos)
│   │   └── services/               # Servicios de Aplicación
│   │
│   ├── infrastructure/             # Capa de Infraestructura (Adaptadores)
│   │   ├── persistence/
│   │   │   ├── repositories/       # Implementaciones de Repositorio
│   │   │   └── mappers/            # Mappers específicos del módulo
│   │   ├── controllers/            # REST Controllers (Puertos Entrantes)
│   │   ├── events/                 # Publishers de Eventos
│   │   └── providers/              # Providers específicos del módulo
│   │
│   └── usuarios.module.ts          # Módulo NestJS
│
└── main.ts                          # Punto de entrada
```

## Capas de la Arquitectura

### 1. **Domain Layer (Capa de Dominio)**
Contiene toda la lógica de negocio, independiente de frameworks.

**Elementos:**
- **Agregados** (`usuario.aggregate.ts`): Raíces de agregado que encapsulan la lógica
- **Entities** (`entity.ts`): Objetos con identidad
- **Value Objects** (`email.ts`, `name.ts`): Objetos inmutables sin identidad
- **Domain Events** (`usuario-events.ts`): Eventos que ocurrieron en el dominio
- **Exceptions** (`usuario-domain-exception.ts`): Excepciones de negocio
- **Ports** (`usuario-repository.port.ts`): Interfaces (contrato con infraestructura)

**Ejemplo:**
```typescript
// El Usuario es un Agregado que encapsula toda la lógica
const usuario = Usuario.create(id, email, nombre);
usuario.actualizar(newEmail, newName);
// Genera automáticamente un evento de dominio
```

### 2. **Application Layer (Capa de Aplicación)**
Orquesta la lógica de negocio (Use Cases) y maneja eventos.

**Elementos:**
- **Use Cases**: Implementan acciones del negocio (Crear, Actualizar, etc)
- **DTOs**: Objetos de transferencia de datos (entrada/salida)
- **Sagas**: Orquestadores de procesos complejos basados en eventos
- **Services**: Lógica transversal

**Flujo:**
```
Controller → UseCase → Domain Model → Repository
```

### 3. **Infrastructure Layer (Capa de Infraestructura)**
Implementa interfaces técnicas (BD, APIs, etc).

**Elementos:**
- **Controllers**: REST endpoints
- **Repositories**: Implementaciones del puerto IUsuarioRepository
- **Mappers**: Transformación entre dominio ↔ persistencia
- **Event Publishers**: Emite eventos a través de EventEmitter2

## Conceptos Clave

### Domain-Driven Design (DDD)

1. **Agregado**: Colección de entidades tratadas como una unidad
   - Usuario es el agregado raíz
   - Contiene la lógica cohesiva del negocio

2. **Value Objects**: Valores inmutables
   - Email, Name
   - No tienen identidad, solo valor

3. **Domain Events**: Lo que sucedió
   - UsuarioCreado, UsuarioActualizado
   - Base para comunicación entre agregados

### Arquitectura Hexagonal (Puertos y Adaptadores)

- **Puertos**: Interfaces que define el negocio (`IUsuarioRepository`)
- **Adaptadores**: Implementaciones concretas (`UsuarioRepository`)
- **Aislamiento**: La lógica de negocio no conoce detalles técnicos

### Saga Pattern

Orquesta procesos complejos respondiendo a eventos:

```typescript
@OnEvent('usuario.creado')
handleUsuarioCreado(event: UsuarioCreado) {
  // - Enviar email
  // - Crear en sistema de auditoría
  // - Notificar otros servicios
}
```

## Flujo de una Solicitud

### 1. Crear Usuario

```
POST /api/usuarios
{
  "email": "user@example.com",
  "firstName": "Juan",
  "lastName": "Pérez"
}
  ↓
UsuarioController.crearUsuario()
  ↓
CrearUsuarioUseCase.execute()
  ├─ Valida email único (Repository)
  ├─ Crea Value Objects (Email, Name)
  ├─ Crea Agregado Usuario (Usuario.create)
  │  └─ Genera evento UsuarioCreado
  ├─ Persiste en Repository
  ├─ Emite evento a EventEmitter2
  └─ Retorna ID
  ↓
UsuarioSaga.handleUsuarioCreado()
  ├─ Enviar email de bienvenida
  ├─ Crear registro en auditoría
  └─ Notificar otros servicios
```

## Clean Code Principles

### 1. **Single Responsibility**
- `Email` solo valida emails
- `CrearUsuarioUseCase` solo crea usuarios
- `UsuarioRepository` solo persiste

### 2. **Open/Closed**
- Nuevos use cases sin modificar existentes
- Nuevas sagas sin cambiar el resto

### 3. **Liskov Substitution**
- `IUsuarioRepository` puede ser implementado por SQL, NoSQL, Redis, etc

### 4. **Interface Segregation**
- `IUsuarioRepository` define solo lo necesario

### 5. **Dependency Inversion**
- Los módulos dependen de abstracciones (puertos), no de implementaciones

## Cómo Agregar un Nuevo Use Case

### 1. Definir lógica de dominio
```typescript
// usuario.aggregate.ts
public cambiarEmail(nuevoEmail: Email): void {
  this.email = nuevoEmail;
  this.addDomainEvent(new EmailCambiado(this.id, nuevoEmail.value));
}
```

### 2. Crear Value Object si es necesario
```typescript
// email.ts
public static create(email: string): Email { ... }
```

### 3. Implementar Use Case
```typescript
// cambiar-email.use-case.ts
@Injectable()
export class CambiarEmailUseCase {
  async execute(usuarioId: string, nuevoEmail: string): Promise<void> {
    const usuario = await this.repo.findById(usuarioId);
    usuario.cambiarEmail(Email.create(nuevoEmail));
    await this.repo.save(usuario);
  }
}
```

### 4. Agregar a controlador
```typescript
// usuario.controller.ts
@Put(':id/email')
async cambiarEmail(@Param('id') id: string, @Body() { email }): Promise<void> {
  return this.cambiarEmailUseCase.execute(id, email);
}
```

### 5. (Opcional) Crear Saga
```typescript
@OnEvent('email.cambiado')
handleEmailCambiado(event: EmailCambiado) {
  // Enviar confirmación
}
```

## Dependencias

```json
{
  "@nestjs/common": "^11.0.1",
  "@nestjs/event-emitter": "^2.x.x",
  "reflect-metadata": "^0.2.2",
  "uuid": "^9.x.x"
}
```

## Testing

### Unit Test (Dominio)
```typescript
describe('Usuario', () => {
  it('debería crear un usuario válido', () => {
    const usuario = Usuario.create('1', Email.create('test@example.com'), Name.create('Juan', 'Pérez'));
    expect(usuario.id).toBe('1');
    expect(usuario.events).toHaveLength(1);
  });
});
```

### Integration Test (Application)
```typescript
describe('CrearUsuarioUseCase', () => {
  it('debería crear usuario con email único', async () => {
    const useCase = new CrearUsuarioUseCase(repository);
    const id = await useCase.execute({ email: 'test@example.com', firstName: 'Juan', lastName: 'Pérez' });
    expect(id).toBeDefined();
  });
});
```

## Ventajas de esta Arquitectura

✅ **Independencia de Frameworks**: La lógica de negocio no depende de NestJS
✅ **Testeable**: Cada capa se puede testear independientemente
✅ **Escalable**: Agregar nuevos use cases sin afectar existentes
✅ **Mantenible**: Clara separación de responsabilidades
✅ **Flexible**: Cambiar implementaciones (BD, eventos, etc)
✅ **Reusable**: Compartir lógica de dominio entre módulos
✅ **Eventos**: Comunicación desacoplada entre agregados

## Próximos Pasos

1. **Base de Datos**: Reemplazar `UsuarioRepository` en-memory con SQL/NoSQL
2. **Message Broker**: Integrar Kafka/RabbitMQ para eventos asíncronos
3. **API Documentation**: Swagger/OpenAPI
4. **Validaciones**: Agregar decoradores de validación
5. **Logging**: Structured logging
6. **Metrics**: Prometheus/StatsD
7. **Trazabilidad**: Distributed Tracing

---

**Autor**: Equipo de Arquitectura
**Versión**: 1.0.0
