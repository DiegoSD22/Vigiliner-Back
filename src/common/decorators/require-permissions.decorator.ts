import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorador para requerir permisos específicos en una ruta
 * 
 * @example
 * ```typescript
 * @RequirePermissions('users:read', 'users:write')
 * @Get('users')
 * async getUsers() { ... }
 * ```
 * 
 * @param permissions - Lista de permisos requeridos (formato: resource:action)
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
