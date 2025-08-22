import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    
    // Debug JWT guard activation
    const request = context.switchToHttp().getRequest();
    console.log('🔒 JwtAuthGuard - canActivate called for:', request.url);
    console.log('🔒 JwtAuthGuard - Authorization header:', request.headers.authorization);
    
    return super.canActivate(context);
  }
}
