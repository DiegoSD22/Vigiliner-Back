import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorador para requerir roles específicos en una ruta
 * 
 * @example
 * ```typescript
 * @RequireRoles('admin', 'manager')
 * @Get('secret')
 * async getSecret() { ... }
 * ```
 * 
 * @param roles - Lista de slugs de roles requeridos
 */
export const RequireRoles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);
