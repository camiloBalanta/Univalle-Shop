# Microservicio de Usuarios

Microservicio NestJS para gestionar usuarios, acceso y cambio de contrasena usando MongoDB.

## Regla de acceso

El ingreso se realiza con:

- `codigo`: numero institucional del usuario.
- `anioRegistro`: ano en el que se registro.
- `password`: contrasena temporal o definitiva.

El rol se calcula automaticamente desde el primer digito del codigo:

- `1`: administrativo
- `2`: docente
- `3`: estudiante

Ejemplo:

```json
{
  "codigo": "30045",
  "anioRegistro": 2026
}
```

Rol: `estudiante`

## Manejo de contrasena

Cuando se crea un usuario o se solicita acceso, el sistema genera una contrasena temporal.

Esa contrasena no se guarda en texto plano. En MongoDB se almacena solamente:

- `passwordHash`
- `mustChangePassword: true`

Cuando el usuario ingresa con la contrasena temporal, el login responde que debe cambiarla. Luego debe llamar al endpoint de cambio de contrasena. Al cambiarla correctamente, `mustChangePassword` pasa a `false`.

## Endpoints principales

### Solicitar acceso

```http
POST /auth/solicitar-acceso
```

```json
{
  "codigo": "30045",
  "anioRegistro": 2026
}
```

Respuesta:

```json
{
  "userId": "uuid",
  "codigo": "30045",
  "anioRegistro": 2026,
  "rol": "estudiante",
  "mustChangePassword": true,
  "message": "Se genero una contrasena temporal que debe cambiarse al ingresar.",
  "temporaryPassword": "contrasena-temporal"
}
```

### Login

```http
POST /auth/login
```

```json
{
  "codigo": "30045",
  "anioRegistro": 2026,
  "password": "contrasena-temporal-o-definitiva"
}
```

### Cambiar contrasena

```http
POST /auth/cambiar-password
```

```json
{
  "codigo": "30045",
  "anioRegistro": 2026,
  "currentPassword": "contrasena-actual",
  "newPassword": "nueva-contrasena"
}
```

### Crear usuario

```http
POST /usuarios
```

```json
{
  "codigo": "20045",
  "anioRegistro": 2026
}
```

Tambien devuelve una `temporaryPassword`.

## Datos guardados en MongoDB

La coleccion `usuarios` guarda:

- `id`
- `codigo`
- `anioRegistro`
- `rol`
- `passwordHash`
- `mustChangePassword`
- `createdAt`
- `updatedAt`

Existe un indice unico por `codigo + anioRegistro`.

## Instalacion

```bash
npm install
```

## Ejecucion

```bash
npm run start:dev
```

## Frontend de pruebas

Puedes abrir `frontend-pruebas-login/index.html` en el navegador para probar:

- generacion de contrasena temporal
- login por `codigo + anioRegistro`
- identificacion de rol
- cambio de contrasena

## Validacion

```bash
npm run build
npm test
```
