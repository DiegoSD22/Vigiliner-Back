import { ApiProperty } from '@nestjs/swagger';

class UserResponse {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'john-doe' })
  username: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: '2026-03-05T10:00:00Z' })
  createdAt: Date;

  organization: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
}

class RoleResponse {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  id: string;

  @ApiProperty({ example: 'super-admin' })
  slug: string;

  @ApiProperty({ example: 'Super Administrador' })
  name: string;

  @ApiProperty({ example: 'Administrador global del sistema' })
  description: string;

  @ApiProperty({ example: 'GLOBAL', enum: ['GLOBAL', 'ORGANIZATION'] })
  scope: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Datos del usuario autenticado',
    type: UserResponse,
  })
  user: UserResponse;

  @ApiProperty({
    description: 'Token JWT para autenticación',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJvcmdhbml6YXRpb25JZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMSIsInJvbGVzIjpbInN1cGVyLWFkbWluIl0sInBlcm1pc3Npb25zIjpbInVzZXJzOnJlYWQiXSwiaWF0IjoxNzQxMTc2NDAwLCJleHAiOjE3NDEyNjI4MDB9.abcd1234',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Tipo de token (siempre Bearer)',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description:
      'Array de slugs de roles del usuario en su organización. Incluye roles globales.',
    type: [String],
    example: ['super-admin', 'org-admin'],
  })
  roles: string[];

  @ApiProperty({
    description: 'Array de slugs de permisos del usuario agregados de sus roles',
    type: [String],
    example: ['users:read', 'users:write', 'organizations:admin'],
  })
  permissions: string[];

  @ApiProperty({
    description:
      'Rol principal (primer rol) - Útil para determinar el dashboard a mostrar',
    example: 'super-admin',
  })
  primaryRole: string;


}
