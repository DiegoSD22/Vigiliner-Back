import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiProtectedErrors } from './api-error-responses.decorator';

/**
 * Aplicar a endpoints que requieren autenticación JWT
 * Automáticamente añade documentación de seguridad y errores esperados
 *
 * @example
 * @Get('me')
 * @ApiProtected()
 * async getCurrentUser() { }
 */
export function ApiProtected() {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'), // 'JWT-auth' debe coincidir con el nombre en swagger.config
    ApiProtectedErrors()
  );
}
