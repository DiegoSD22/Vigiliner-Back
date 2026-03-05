import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';

/**
 * Decorador que documenta automáticamente las respuestas de error comunes
 * para endpoints públicos (sin autenticación)
 * Formato estándar: { statusCode, message, errors?, timestamp }
 */
export function ApiPublicErrors() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Solicitud inválida o validación fallida',
      schema: {
        example: {
          statusCode: 400,
          message: 'Validación fallida',
          errors: {
            email: ['email must be an email'],
            password: ['password should not be empty'],
          },
          timestamp: new Date().toISOString(),
        },
      },
    }),
    ApiConflictResponse({
      description: 'Conflicto (ej: email ya existe)',
      schema: {
        example: {
          statusCode: 409,
          message: 'El email ya está registrado',
          timestamp: new Date().toISOString(),
        },
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Error interno del servidor',
      schema: {
        example: {
          statusCode: 500,
          message: 'Error interno del servidor',
          timestamp: new Date().toISOString(),
        },
      },
    })
  );
}

/**
 * Decorador para endpoints protegidos (requieren autenticación)
 * Documenta errores de autenticación + respuestas de error comunes
 * Formato estándar: { statusCode, message, errors?, timestamp }
 */
export function ApiProtectedErrors() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Solicitud inválida',
      schema: {
        example: {
          statusCode: 400,
          message: 'Validación fallida',
          errors: {
            name: ['name should not be empty'],
          },
          timestamp: new Date().toISOString(),
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Token inválido o expirado',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
          timestamp: new Date().toISOString(),
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'Acceso denegado (no tienes permisos)',
      schema: {
        example: {
          statusCode: 403,
          message: 'Forbidden - Insufficient permissions',
          timestamp: new Date().toISOString(),
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Recurso no encontrado',
      schema: {
        example: {
          statusCode: 404,
          message: 'Resource not found',
          timestamp: new Date().toISOString(),
        },
      },
    }),
    ApiConflictResponse({
      description: 'Conflicto (ej: recurso duplicado)',
      schema: {
        example: {
          statusCode: 409,
          message: 'Conflict - Resource already exists',
          timestamp: new Date().toISOString(),
        },
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Error interno del servidor',
      schema: {
        example: {
          statusCode: 500,
          message: 'Error interno del servidor',
          timestamp: new Date().toISOString(),
        },
      },
    })
  );
}

/**
 * Decorador simplificado para endpoints simples sin validación
 * Formato estándar: { statusCode, message, timestamp }
 */
export function ApiSimpleErrors() {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: 'Credenciales inválidas',
      schema: {
        example: {
          statusCode: 401,
          message: 'Credenciales inválidas',
          timestamp: new Date().toISOString(),
        },
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Error interno del servidor',
      schema: {
        example: {
          statusCode: 500,
          message: 'Error interno del servidor',
          timestamp: new Date().toISOString(),
        },
      },
    })
  );
}
