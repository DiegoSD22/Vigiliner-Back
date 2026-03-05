import { DocumentBuilder } from '@nestjs/swagger';

/**
 * Configuración de Swagger/OpenAPI
 * Define esquema global, autenticación y documentación de endpoints
 */
export const swaggerConfig = new DocumentBuilder()
  .setTitle('Vigiliner API')
  .setDescription(
    `
# Bienvenido a la API de Vigiliner

Sistema de gestión integrado para vigilancia, flotas y conectividad.

## Características Principales
- 🔐 Autenticación basada en JWT
- 👥 Gestión multi-tenant de organizaciones
- 📍 Seguimiento GPS en tiempo real
- 🚗 Administración de flotas completa
- 📊 Reportes y análisis avanzados

## Autenticación
Todos los endpoints protegidos requieren un token JWT en el header:
\`\`\`
Authorization: Bearer <tu_token_jwt>
\`\`\`

Obtén tu token mediante el endpoint \`POST /auth/login\`.

## Estructura de Respuestas
### Respuesta Exitosa (2xx)
\`\`\`json
{
  "message": "Operación exitosa",
  "data": { }
}
\`\`\`

### Respuesta de Error (4xx/5xx)
\`\`\`json
{
  "statusCode": 400,
  "message": "Descripción del error",
  "errors": [ ]
}
\`\`\`

## Códigos de Estado HTTP
- \`200 OK\` - Solicitud exitosa
- \`201 Created\` - Recurso creado exitosamente
- \`400 Bad Request\` - Datos inválidos o validación fallida
- \`401 Unauthorized\` - Token inválido o expirado
- \`403 Forbidden\` - Acceso denegado (permisos insuficientes)
- \`404 Not Found\` - Recurso no encontrado
- \`409 Conflict\` - Conflicto (ej: recurso duplicado)
- \`500 Internal Server Error\` - Error interno del servidor

## Contacto
Para soporte: support@vigiliner.com
    `.trim(),
  )
  .setVersion('1.0')
  .setContact(
    'Vigiliner Support',
    'https://vigiliner.com',
    'support@vigiliner.com'
  )
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  // Tags con descripción
  .addTag(
    'Authentication',
    'Endpoints de autenticación y autorización'
  )
  .addTag(
    'Users',
    'Gestión de usuarios dentro de una organización'
  )
  .addTag(
    'Organizations',
    'Administración de organizaciones multi-tenant'
  )
  .addTag(
    'Devices',
    'Gestión de dispositivos GPS y sensores'
  )
  .addTag(
    'Units',
    'Administración de unidades/vehículos en la flota'
  )
  .addTag(
    'Reports',
    'Generación de reportes y análisis'
  )
  .addTag(
    'Health',
    'Verificación del estado de la aplicación'
  )
  // Configuración de seguridad JWT
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Token JWT obtenido en /auth/login',
      in: 'header',
    },
    'JWT-auth' // Este nombre se usará en @ApiBearerAuth('JWT-auth')
  )
  .build();
