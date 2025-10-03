import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {
      const { password: _password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async register(createUserDto: any) {
    const { email } = createUserDto;
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        email,
        password: hashedPassword,
      },
    });

    // Automatically create trial subscription for new users
    await this.userService.createTrialSubscription(user.id);

    const { password: _password, ...result } = user;
    return result;
  }

  async validateHubSpotUser(hubspotUser: any) {
    // For HubSpot App Marketplace users, create account if doesn't exist
    let user = await this.prisma.user.findUnique({
      where: { email: hubspotUser.email },
    });

    if (!user) {
      // Create new user from HubSpot
      user = await this.prisma.user.create({
        data: {
          email: hubspotUser.email,
          name: hubspotUser.name || hubspotUser.email,
          hubspotPortalId: String(hubspotUser.portalId), // Ensure string type
          hubspotAccessToken: hubspotUser.accessToken,
          hubspotRefreshToken: hubspotUser.refreshToken,
          hubspotTokenExpiresAt: hubspotUser.tokenExpiresAt,
        },
      });

      // Automatically create trial subscription for HubSpot users
      await this.userService.createTrialSubscription(user.id);
    } else {
      // Update existing user's HubSpot tokens
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          hubspotPortalId: String(hubspotUser.portalId), // Ensure string type
          hubspotAccessToken: hubspotUser.accessToken,
          hubspotRefreshToken: hubspotUser.refreshToken,
          hubspotTokenExpiresAt: hubspotUser.tokenExpiresAt,
        },
      });
    }

    const { password: _password, ...result } = user;
    return result;
  }

  async validateJwtPayload(payload: { sub: string; email: string }) {
    console.log(
      'AuthService - validateJwtPayload called with payload:',
      payload,
    );

    try {
      // First try to find user by ID
      let user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      
      console.log(
        'AuthService - User found by ID:',
        user ? { id: user.id, email: user.email } : null,
      );

      // If user not found by ID, try to find by email
      if (!user) {
        console.log('AuthService - User not found by ID, trying email lookup...');
        user = await this.prisma.user.findUnique({
          where: { email: payload.email },
        });
        
        console.log(
          'AuthService - User found by email:',
          user ? { id: user.id, email: user.email } : null,
        );
      }

      // If still not found, create user (for HubSpot OAuth users)
      if (!user && payload.email && payload.sub) {
        console.log('AuthService - Creating missing user from JWT payload...');
        try {
          user = await this.prisma.user.create({
            data: {
              id: payload.sub,
              email: payload.email,
              name: payload.email.split('@')[0], // Use email prefix as name
              hubspotPortalId: payload.email.includes('hubspot') 
                ? payload.email.split('-')[1]?.split('@')[0] 
                : null,
            },
          });
          console.log('AuthService - User created successfully:', { id: user.id, email: user.email });
        } catch (createError) {
          console.log('AuthService - Failed to create user:', createError);
          return null;
        }
      }

      return user;
    } catch (error) {
      console.log('AuthService - Error in validateJwtPayload:', error);
      return null;
    }
  }

  async verifyToken(token: string) {
    try {
      console.log(
        'AuthService - Verifying token:',
        token.substring(0, 20) + '...',
      );

      const payload = this.jwtService.verify(token);
      console.log('AuthService - JWT payload verified:', {
        sub: payload.sub,
        email: payload.email,
      });

      const user = await this.validateJwtPayload(payload);
      console.log(
        'AuthService - User found from payload:',
        user ? { id: user.id, email: user.email } : null,
      );

      if (!user) {
        console.log('AuthService - No user found for payload');
        return null;
      }

      // Remove password from user object before returning
      const { password: _, ...userWithoutPassword } = user;
      console.log('AuthService - Returning user without password:', {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
      });
      return userWithoutPassword;
    } catch (error) {
      console.error('AuthService - Token verification failed:', error.message);
      return null;
    }
  }

  generateToken(user: any) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
  }

  async updateUserHubspotPortalId(userId: string, hubspotPortalId: string) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { hubspotPortalId },
      });
    } catch {
      throw new HttpException(
        'Failed to update HubSpot portal ID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUserHubspotTokens(
    userId: string,
    tokens: { access_token: string; refresh_token: string; expires_in: number },
  ) {
    try {
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          hubspotAccessToken: tokens.access_token,
          hubspotRefreshToken: tokens.refresh_token,
          hubspotTokenExpiresAt: expiresAt,
        },
      });
    } catch {
      throw new HttpException(
        'Failed to update HubSpot tokens',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createTrialSubscription(userId: string) {
    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 21); // 21-day trial

      await this.prisma.subscription.upsert({
        where: { userId },
        update: {
          planId: 'professional',
          status: 'trial',
          trialEndDate,
          nextBillingDate: trialEndDate,
        },
        create: {
          userId,
          planId: 'professional',
          status: 'trial',
          trialEndDate,
          nextBillingDate: trialEndDate,
        },
      });
    } catch (error) {
      console.error('Failed to create trial subscription:', error);
      // Don't throw error to avoid breaking OAuth flow
    }
  }
}
