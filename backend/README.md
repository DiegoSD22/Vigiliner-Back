# Vigiliner Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  Backend del sistema Vigiliner - Plataforma de monitoreo y gestión de dispositivos GPS
</p>

---

## 📋 Descripción

Backend desarrollado con **NestJS** que proporciona una API RESTful robusta para la gestión de dispositivos GPS, unidades vehiculares y usuarios. Incluye autenticación JWT, conexión TCP para recepción de datos de dispositivos GPS en tiempo real, y WebSockets para comunicación bidireccional.

## 🏗️ Arquitectura

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/              # Autenticación JWT
│   │   │   ├── decorators/    # Decoradores personalizados
│   │   │   ├── dto/           # Data Transfer Objects
│   │   │   ├── guards/        # Guards de autenticación y roles
│   │   │   ├── interfaces/    # Interfaces TypeScript
│   │   │   └── strategies/    # Passport Strategies
│   │   ├── devices/           # Gestión de dispositivos GPS
│   │   ├── units/             # Gestión de unidades vehiculares
│   │   └── users/             # Gestión de usuarios
│   ├── tcp/                   # Servidor TCP para GPS
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma          # Schema de base de datos
│   ├── migrations/            # Migraciones
│   └── seed.ts                # Datos de prueba
└── test/                      # Tests E2E
```

## 🚀 Tecnologías Principales

- **Framework**: NestJS 10.x
- **ORM**: Prisma 5.x
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT + Passport
- **Validación**: class-validator, class-transformer
- **comunicación en Tiempo Real**: Socket.IO + TCP Server
- **Parseo GPS**: queclink-parser

## ⚙️ Instalación

### Prerequisitos

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm o yarn

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Ejecutar migraciones de base de datos
npx prisma migrate dev

# 4. Poblar base de datos con datos de prueba
npm run prisma:seed
```

## 🔧 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto backend:

```env
# Puerto del servidor
PORT=3000

# Base de datos PostgreSQL
DATABASE_URL=postgresql://usuario:password@localhost:5432/vigiliner

# Autenticación JWT
JWT_SECRET=tu_clave_secreta_super_segura_cambiar_en_produccion
JWT_EXPIRATION=24h

# Redis (opcional, para caché)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 🏃 Ejecutar la Aplicación

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod

# Modo debug
npm run start:debug
```

El servidor estará disponible en `http://localhost:3000`

## 📡 Módulos Principales

### 1. **Autenticación (Auth)**

Sistema completo de autenticación con JWT siguiendo las mejores prácticas de NestJS.

#### Endpoints:

- `POST /auth/signin` - Inicio de sesión
- `GET /auth/profile` - Perfil del usuario autenticado (requiere JWT)

#### Uso:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser, AuthenticatedUser } from './modules/auth';

@Get('protected')
@UseGuards(JwtAuthGuard)
getProtectedData(@CurrentUser() user: AuthenticatedUser) {
  return { userId: user.id, email: user.email };
}
```

#### Protección por roles:

```typescript
import { Roles, RolesGuard } from './modules/auth';

@Delete(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
deleteResource(@Param('id') id: string) {
  return this.service.delete(id);
}
```

**Credenciales de prueba** (después de ejecutar seed):
- Admin: `admin@vigiliner.com` / `password123`
- User: `user@vigiliner.com` / `password123`

### 2. **Dispositivos (Devices)**

Gestión de dispositivos GPS con seguimiento de ubicación en tiempo real.

#### Características:
- CRUD completo de dispositivos
- Recepción de datos GPS vía TCP
- WebSocket Gateway para actualizaciones en tiempo real
- Historial de ubicaciones

#### Servidor TCP:
Puerto por defecto: **8080** (configurable)
- Recibe datos de dispositivos GPS Queclink
- Parser automático de protocolos
- Almacenamiento en base de datos

### 3. **Unidades (Units)**

Gestión de unidades vehiculares asociadas a dispositivos.

#### Características:
- Asignación de dispositivos a unidades
- Información de vehículos (placa, modelo, marca, año)
- Relación con usuarios responsables

### 4. **Usuarios (Users)**

Gestión de usuarios del sistema.

#### Roles disponibles:
- `ADMIN` - Acceso completo al sistema
- `USER` - Acceso limitado a recursos propios

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🗄️ Base de Datos

### Modelos Principales:

- **User**: Usuarios del sistema
- **Device**: Dispositivos GPS
- **Unit**: Unidades vehiculares
- **DeviceLocation**: Historial de ubicaciones

### Comandos Prisma:

```bash
# Generar cliente Prisma
npx prisma generate

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Abrir Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

## 📝 Buenas Prácticas Implementadas

### Clean Code:
- ✅ Separación de responsabilidades (SRP)
- ✅ Nombres descriptivos y auto-documentados
- ✅ Funciones pequeñas con una sola responsabilidad
- ✅ Comentarios JSDoc en métodos públicos
- ✅ Manejo de errores consistente

### Arquitectura NestJS:
- ✅ Módulos bien organizados y cohesivos
- ✅ DTOs con validaciones automáticas
- ✅ Guards personalizados para autorización
- ✅ Decoradores reutilizables
- ✅ Inyección de dependencias consistente
- ✅ ConfigModule para variables de entorno
- ✅ ValidationPipe global habilitado

### Seguridad:
- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT con expiración configurable
- ✅ Validación de entrada con class-validator
- ✅ Soft delete para datos sensibles
- ✅ CORS configurado
- ✅ Logging de eventos críticos

### TypeScript:
- ✅ Tipado fuerte en toda la aplicación
- ✅ Interfaces compartidas y reutilizables
- ✅ Enums para valores constantes
- ✅ Barrel exports organizados

## 📚 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Inicia servidor en modo watch
npm run start:debug        # Inicia con debugger

# Build
npm run build              # Compila TypeScript a JavaScript

# Tests
npm run test               # Unit tests
npm run test:watch         # Tests en modo watch
npm run test:cov           # Tests con coverage
npm run test:e2e           # Tests end-to-end

# Code Quality
npm run lint               # ESLint
npm run format             # Prettier

# Database
npm run prisma:seed        # Poblar BD con datos de prueba
```

## 🔒 Seguridad

### Recomendaciones para Producción:

1. **Variables de Entorno**:
   - Cambiar `JWT_SECRET` por un valor fuerte y aleatorio
   - No commitear archivos `.env`
   - Usar servicios de gestión de secrets (AWS Secrets Manager, etc.)

2. **Base de Datos**:
   - Usar SSL para conexiones
   - Implementar backups automáticos
   - Restringir acceso por IP

3. **API**:
   - Implementar rate limiting
   - Configurar CORS apropiadamente
   - Usar HTTPS en producción
   - Implementar helmet para headers de seguridad

4. **Autenticación**:
   - Implementar refresh tokens
   - Considerar 2FA
   - Agregar blacklist de tokens para logout
   - Implementar políticas de contraseñas fuertes

## 📊 Monitoreo y Logs

- Logger personalizado por módulo
- Logs de autenticación y errores
- Tracking de eventos críticos

## 🚧 Próximas Funcionalidades

- [ ] Refresh tokens
- [ ] Rate limiting
- [ ] Email notifications
- [ ] Geofencing
- [ ] Reports generation
- [ ] Dashboard analytics
- [ ] Multi-tenant support

## 📖 Documentación Adicional

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Passport JWT](http://www.passportjs.org/packages/passport-jwt/)

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al Branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

UNLICENSED - Proyecto privado

---

Desarrollado con ❤️ usando NestJS
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
