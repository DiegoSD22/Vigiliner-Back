import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Si no hay roles requeridos, el usuario autenticado pasa
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    return requiredRoles.includes(user.role);
  }
}