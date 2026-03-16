import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  ArrayNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  @ApiPropertyOptional({
    description: 'Nueva contraseña del usuario',
    example: 'NuevaClave123!',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password?: string;

  @ApiPropertyOptional({
    description:
      'Slugs de roles para reemplazar asignaciones actuales en la organización',
    type: [String],
    example: ['org-admin', 'manager'],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roleSlugs?: string[];
}
