import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email único del usuario',
    example: 'admin.cliente@empresa.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description:
      'Username único opcional (si no se envía, se genera automáticamente)',
    example: 'admin-cliente',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'El username solo puede contener letras, números, punto, guion y guion bajo',
  })
  username?: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Administrador Cliente',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Contraseña inicial del usuario',
    example: '12345678',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiPropertyOptional({
    description:
      'Slugs de roles a asignar en la organización. Por defecto se asigna org-admin.',
    type: [String],
    example: ['org-admin'],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roleSlugs?: string[];
}
