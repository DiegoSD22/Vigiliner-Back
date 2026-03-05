export interface SeedPermission {
  name: string;
  resource: string;
  action: string;
  description: string;
}

/**
 * Permisos predefinidos del sistema
 * 
 * Formato slug: {resource}:{action}
 * 
 * Actions comunes:
 * - read: Leer/ver recursos
 * - write: Crear y actualizar recursos
 * - delete: Eliminar recursos
 * - admin: Administración completa del recurso
 * - export: Exportar datos
 * - import: Importar datos
 */
export const SEED_PERMISSIONS: SeedPermission[] = [
  // Organizations
  {
    name: 'Ver organizaciones',
    resource: 'organizations',
    action: 'read',
    description: 'Permite visualizar información de organizaciones',
  },
  {
    name: 'Gestionar organizaciones',
    resource: 'organizations',
    action: 'write',
    description: 'Permite crear y actualizar organizaciones',
  },
  {
    name: 'Eliminar organizaciones',
    resource: 'organizations',
    action: 'delete',
    description: 'Permite eliminar organizaciones del sistema',
  },
  {
    name: 'Administrar organizaciones',
    resource: 'organizations',
    action: 'admin',
    description: 'Acceso completo a todas las funciones de organizaciones',
  },

  // Users
  {
    name: 'Ver usuarios',
    resource: 'users',
    action: 'read',
    description: 'Permite visualizar la lista de usuarios y sus detalles',
  },
  {
    name: 'Gestionar usuarios',
    resource: 'users',
    action: 'write',
    description: 'Permite crear, actualizar e invitar usuarios',
  },
  {
    name: 'Eliminar usuarios',
    resource: 'users',
    action: 'delete',
    description: 'Permite eliminar usuarios del sistema',
  },
  {
    name: 'Administrar usuarios',
    resource: 'users',
    action: 'admin',
    description: 'Acceso completo a todas las funciones de usuarios',
  },

  // Roles
  {
    name: 'Ver roles',
    resource: 'roles',
    action: 'read',
    description: 'Permite visualizar roles y sus permisos',
  },
  {
    name: 'Gestionar roles',
    resource: 'roles',
    action: 'write',
    description: 'Permite crear y actualizar roles',
  },
  {
    name: 'Eliminar roles',
    resource: 'roles',
    action: 'delete',
    description: 'Permite eliminar roles del sistema',
  },
  {
    name: 'Asignar roles',
    resource: 'roles',
    action: 'assign',
    description: 'Permite asignar y remover roles de usuarios',
  },

  // Permissions
  {
    name: 'Ver permisos',
    resource: 'permissions',
    action: 'read',
    description: 'Permite visualizar la lista de permisos disponibles',
  },
  {
    name: 'Gestionar permisos',
    resource: 'permissions',
    action: 'write',
    description: 'Permite crear y actualizar permisos del sistema',
  },
];
