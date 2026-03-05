import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsArray,
  IsUUID,
  Matches,
  IsEnum,
} from 'class-validator';
import { RoleScope } from '@/prisma';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Nombre del rol',
    example: 'Administrador de Sucursal',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Slug único del rol (formato: kebab-case)',
    example: 'branch-admin',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'El slug debe estar en formato kebab-case (ej: branch-admin)',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Descripción del rol',
    example: 'Administra todas las operaciones de una sucursal específica',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Alcance del rol',
    enum: RoleScope,
    example: RoleScope.ORGANIZATION,
    default: RoleScope.ORGANIZATION,
  })
  @IsEnum(RoleScope)
  @IsOptional()
  scope?: RoleScope = RoleScope.ORGANIZATION;

  @ApiPropertyOptional({
    description: 'IDs de permisos a asignar al rol',
    type: [String],
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds?: string[];
}
