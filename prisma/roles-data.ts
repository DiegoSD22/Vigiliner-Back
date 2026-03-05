import { RoleScope } from './generated/client';

export interface SeedRole {
  name: string;
  slug: string;
  description: string;
  scope: RoleScope;
  isSystem: boolean;
  permissions: string[]; // Slugs de permisos
}

/**
 * Roles predefinidos del sistema
 * 
 * - SUPER_ADMIN: Rol global con todos los permisos, cruza organizaciones
 * - ORG_ADMIN: Administrador de organización, todos los permisos dentro de su org
 * - MANAGER: Gestor de usuarios y roles dentro de su organización
 * - VIEWER: Solo lectura de recursos básicos
 */
export const SEED_ROLES: SeedRole[] = [
  {
    name: 'Super Administrador',
    slug: 'super-admin',
    description:
      'Administrador global del sistema con acceso total a todas las organizaciones',
    scope: RoleScope.GLOBAL,
    isSystem: true,
    permissions: [
      // Todas las organizaciones
      'organizations:read',
      'organizations:write',
      'organizations:delete',
      'organizations:admin',
      // Todos los usuarios
      'users:read',
      'users:write',
      'users:delete',
      'users:admin',
      // Todos los roles
      'roles:read',
      'roles:write',
      'roles:delete',
      'roles:assign',
      // Todos los permisos
      'permissions:read',
      'permissions:write',
    ],
  },
  {
    name: 'Administrador de Organización',
    slug: 'org-admin',
    description:
      'Administrador con control total sobre su organización y sus recursos',
    scope: RoleScope.ORGANIZATION,
    isSystem: true,
    permissions: [
      // Organización
      'organizations:read',
      'organizations:write',
      // Usuarios
      'users:read',
      'users:write',
      'users:delete',
      'users:admin',
      // Roles
      'roles:read',
      'roles:write',
      'roles:delete',
      'roles:assign',
      // Permisos
      'permissions:read',
    ],
  },
  {
    name: 'Gerente',
    slug: 'manager',
    description: 'Gestiona usuarios y asigna roles dentro de la organización',
    scope: RoleScope.ORGANIZATION,
    isSystem: true,
    permissions: [
      // Usuarios
      'users:read',
      'users:write',
      // Roles
      'roles:read',
      'roles:assign',
      // Permisos
      'permissions:read',
    ],
  },
  {
    name: 'Visualizador',
    slug: 'viewer',
    description: 'Acceso de solo lectura a recursos de la organización',
    scope: RoleScope.ORGANIZATION,
    isSystem: true,
    permissions: [
      // Solo lectura
      'users:read',
      'roles:read',
      'permissions:read',
    ],
  },
];
