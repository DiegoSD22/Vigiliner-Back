import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email o username del usuario',
    example: 'super-admin',
  })
  @IsString()
  @MinLength(3)
  identifier: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'SecurePassword123!',
  })
  @IsString()
  password: string;
}
