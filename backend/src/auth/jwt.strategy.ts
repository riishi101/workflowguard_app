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

  async validate(payload: { sub: string; email: string }) {try {
      const user = await this.authService.validateJwtPayload(payload);if (!user) {return null;
      }return user;
    } catch (error) {return null;
    }
  }
}
