import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Email único del usuario',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña segura (mínimo 8 caracteres)',
    example: 'SecurePassword123!',
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(128)
  password: string;

  @ApiProperty({
    description:
      'Username único opcional (si no se envía, se genera automáticamente)',
    example: 'juan.perez',
    required: false,
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
    example: 'Juan Pérez',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Nombre de la organización',
    example: 'Mi Empresa S.A.',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  organizationName: string;
}
