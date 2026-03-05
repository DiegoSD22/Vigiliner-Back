import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

/**
 * Documenta una respuesta 201 Created con formato estándar
 * Formato: { statusCode: 201, message, data, timestamp }
 */
export function ApiCreatedResponse(
  description: string = 'Recurso creado exitosamente',
  example?: any
) {
  return ApiResponse({
    status: HttpStatus.CREATED,
    description,
    schema: {
      example: {
        statusCode: 201,
        message: description,
        data: example || {},
        timestamp: new Date().toISOString(),
      },
    },
  });
}

/**
 * Documenta una respuesta 200 OK con formato estándar
 * Formato: { statusCode: 200, message, data, timestamp }
 */
export function ApiOkResponse(
  description: string = 'Operación exitosa',
  example?: any
) {
  return ApiResponse({
    status: HttpStatus.OK,
    description,
    schema: {
      example: {
        statusCode: 200,
        message: description,
        data: example || {},
        timestamp: new Date().toISOString(),
      },
    },
  });
}

/**
 * Documenta operaciones comunes sin retorno de datos (204 No Content)
 */
export function ApiNoContentResponse(description: string = 'Operación completada') {
  return ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description,
  });
}

/**
 * Documenta respuestas paginadas con formato estándar
 * Formato: { statusCode: 200, message, data: { items, pagination }, timestamp }
 */
export function ApiPaginatedResponse(
  description: string = 'Listado paginado',
  example?: any
) {
  return ApiResponse({
    status: HttpStatus.OK,
    description,
    schema: {
      example: {
        statusCode: 200,
        message: description,
        data: example || {
          items: [],
          pagination: {
            total: 0,
            page: 1,
            pageSize: 10,
            totalPages: 0,
          },
        },
        timestamp: new Date().toISOString(),
      },
    },
  });
}
