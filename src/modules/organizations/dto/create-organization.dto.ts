import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { OrganizationStatus } from '@/prisma';

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Nombre de la organización cliente',
    example: 'Transportes Andina S.A.S.',
    minLength: 2,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Estado inicial de la organización',
    enum: OrganizationStatus,
    example: OrganizationStatus.ACTIVE,
    default: OrganizationStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus = OrganizationStatus.ACTIVE;
}
