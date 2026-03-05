import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignRoleToUserDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID('4')
  userId: string;

  @ApiProperty({
    description: 'ID del rol',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID('4')
  roleId: string;
}
