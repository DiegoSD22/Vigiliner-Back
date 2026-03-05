# Configuración de Swagger/OpenAPI

Esta carpeta contiene la configuración de Swagger/OpenAPI para la API de Vigiliner.

## Estructura

```
swagger/
├── swagger.config.ts     # Configuración del DocumentBuilder
├── swagger.setup.ts      # Función para configurar Swagger en la app
└── index.ts             # Barrel export
```

## Uso

La documentación está disponible en: **http://localhost:3000/api/docs**

## Decoradores disponibles

### En Controllers

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')  // Agrupa endpoints
@ApiBearerAuth('JWT-auth')  // Requiere autenticación JWT
@Controller('users')
export class UsersController {
  
  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado', type: UserDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id') id: string) {
    // ...
  }
}
```

### En DTOs

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com', description: 'Email del usuario' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ required: false, example: 'admin' })
  role?: string;
}
```

## Tags configurados

- `health` - Health check
- `auth` - Autenticación y autorización
- `users` - Gestión de usuarios
- `devices` - Gestión de dispositivos GPS
- `units` - Gestión de unidades/vehículos

## Opciones personalizadas

- ✅ Persistencia de autorización (no se pierde el token al recargar)
- ✅ Filtro de búsqueda de endpoints
- ✅ Muestra duración de requests
- ✅ Endpoints colapsados por defecto
- ✅ Topbar de Swagger oculto
