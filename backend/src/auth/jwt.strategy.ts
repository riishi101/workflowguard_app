import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    const jwtSecret = process.env.JWT_SECRET || 'supersecretkey';
    console.log(
      '🔑 JwtStrategy - Initializing with secret:',
      jwtSecret.substring(0, 10) + '...',
    );

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    console.log('🔑 JwtStrategy - validate called with payload:', payload);

    try {
      const user = await this.authService.validateJwtPayload(payload);
      console.log(
        '🔑 JwtStrategy - validateJwtPayload result:',
        user ? { id: user.id, email: user.email } : null,
      );

      if (!user) {
        console.log('❌ JwtStrategy - No user found for payload');
        return null;
      }

      console.log('✅ JwtStrategy - Returning validated user:', {
        id: user.id,
        email: user.email,
      });
      return user;
    } catch (error) {
      console.log('❌ JwtStrategy - Error during validation:', error);
      return null;
    }
  }
}
