import { Exclude } from 'class-transformer';
import { User, Role } from '@prisma/client';

export class UserEntity implements User {
  id: string;
  email: string;
  name: string;
  role: Role;
  units?: any[];
  devicesCreated?: any[];
  unitsCreated?: any[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

  @Exclude()
  password: string;
}
