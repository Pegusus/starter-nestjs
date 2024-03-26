// auth/auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { User } from '../entities/user.entity';
import Role from '../auth/user.constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly allowedRoles: Role[]) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return false;
    }

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      const expirationTime = decoded.exp * 1000;
      if (expirationTime && expirationTime < Date.now()) {
        throw new UnauthorizedException('Token expired');
      }
      if (!this.allowedRoles.includes(decoded.role as Role)) {
        throw new UnauthorizedException('Unauthorized Role');
      }
      req.user = decoded as User;
      return true;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException(error.message);
    }
  }
}
