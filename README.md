# 🚀 Vigiliner-Back

**NestJS + Prisma + PostgreSQL** - Backend escalable con arquitectura limpia

> Setup profesional siguiendo principios YAGNI (You Aren't Gonna Need It) - solo lo necesario, nada más.

## ⚡ Quick Start (5 minutos)

```bash
# 1. Definir modelos en prisma/schema.prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}

# 2. Crear migración
npx prisma migrate dev --name init

# 3. Crear service+controller (ver abajo)

# 4. Ejecutar
npm run start:dev
```

---

## 🏗️ Arquitectura YAGNI

**Principio:** Abstrae solo cuando realmente lo necesites

- ✅ DTOs → Validación de entrada
- ✅ Service → Lógica de negocio + CRUD
- ✅ Controller → HTTP + Respuestas
- ✅ Module → Encapsulación
- ❌ **NO** BaseService genérico hasta tener duplicación clara

### Estructura

```
src/
├── prisma/
│   ├── prisma.service.ts       # Singleton PrismaClient
│   ├── prisma.module.ts        # Exports PrismaService
│   └── index.ts
├── modules/
│   └── users/
│       ├── dto/
│       │   ├── create-user.dto.ts
│       │   └── update-user.dto.ts
│       ├── user.controller.ts
│       ├── user.service.ts
│       └── users.module.ts
├── config/
├── app.module.ts               # Importa PrismaModule + UsersModule
└── main.ts
```

---

## 📝 Ejemplo: Módulo de Usuarios

### 1. DTOs

```typescript
// src/modules/users/dto/create-user.dto.ts
import { IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(3)
  name?: string;
}

export class UpdateUserDto {
  name?: string;
  email?: string;
}
```

### 2. Service

```typescript
// src/modules/users/user.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { User, Prisma } from '../../../prisma/generated';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
    try {
      return await this.prisma.user.create({ data });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Email ya existe');
      }
      throw error;
    }
  }

  async findAll(skip = 0, take = 10) {
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count(),
    ]);
    return { data, total };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: number, data: UpdateUserDto): Promise<User> {
    try {
      return await this.prisma.user.update({ where: { id }, data });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Email ya existe');
      }
      throw error;
    }
  }

  async delete(id: number): Promise<User> {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }
      throw error;
    }
  }
}
```

### 3. Controller

```typescript
// src/modules/users/user.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, Query, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getAll(
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
  ) {
    return this.userService.findAll(+skip, +take);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Post()
  async create(@Body(ValidationPipe) dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) dto: UpdateUserDto) {
    return this.userService.update(+id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userService.delete(+id);
  }
}
```

### 4. Module

```typescript
// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UsersModule {}
```

### 5. AppModule

```typescript
// src/app.module.ts
import { PrismaModule } from './prisma';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [ConfigModule.forRoot(...), PrismaModule, UsersModule],
})
export class AppModule {}
```

---

## 🔧 Comandos

```bash
# Setup
npm install

# Desarrollo
npm run start:dev

# Tests
npm run test

# Prisma
npx prisma migrate dev --name xxx    # Nueva migración
npx prisma generate                  # Regenerar types
npx prisma studio                    # Ver datos en GUI
npx prisma migrate reset              # Resetear BD (⚠️ SOLO DEV)
```

---

## 🛡️ Errores Prisma Comunes

| Código | Problema | Solución |
|--------|----------|----------|
| P2002 | Violación de unicidad | Validar entrada, email duplicado |
| P2025 | Registro no encontrado | Verificar ID existe |
| P2003 | Foreign key falla | Verificar relación existe |
| P2014 | No puedes eliminar | Agregar `onDelete: Cascade` al modelo |

---

## 🧪 Testing

```typescript
const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

const module = await Test.createTestingModule({
  providers: [
    UserService,
    { provide: PrismaService, useValue: mockPrismaService },
  ],
}).compile();
```

---

## 📖 Live Development

```bash
# Terminal 1 - BD (docker)
docker-compose up

# Terminal 2 - NestJS
npm run start:dev

# Terminal 3 - Prisma Studio (ver datos)
npx prisma studio
```

---

## 📚 Referencias

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Errors](https://www.prisma.io/docs/reference/api-reference/error-reference)

---

## ✅ Setup Completado

- ✅ @prisma/client instalado
- ✅ @prisma/adapter-pg instalado (PostgreSQL directo)
- ✅ pg driver instalado
- ✅ PrismaService (singleton con auto-connect y pool management)
- ✅ PrismaModule exportado
- ✅ postgresql datasource en prisma.config.ts
- ✅ Tipos generados en `prisma/generated/`
- ✅ .env con DATABASE_URL

**Listo para:** Edita `prisma/schema.prisma` → crea migración → implementa módulos 🚀
