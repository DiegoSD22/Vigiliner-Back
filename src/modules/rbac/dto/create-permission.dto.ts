import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Nombre descriptivo del permiso',
    example: 'Leer usuarios',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Recurso al que aplica el permiso',
    example: 'users',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[a-z0-9_-]+$/, {
    message: 'El recurso debe contener solo letras minúsculas, números, guiones y guiones bajos',
  })
  resource: string;

  @ApiProperty({
    description: 'Acción permitida sobre el recurso',
    example: 'read',
    maxLength: 50,
    enum: ['read', 'write', 'delete', 'admin', 'export', 'import'],
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[a-z0-9_-]+$/, {
    message: 'La acción debe contener solo letras minúsculas, números, guiones y guiones bajos',
  })
  action: string;

  @ApiPropertyOptional({
    description: 'Descripción del permiso',
    example: 'Permite visualizar la lista de usuarios y sus detalles',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
