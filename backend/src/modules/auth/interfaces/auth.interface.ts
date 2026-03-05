import { Role } from '@prisma/client';

/**
 * Payload del JWT que se almacena en el token
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: Role;
}

/**
 * Usuario autenticado que se adjunta a request.user
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}
