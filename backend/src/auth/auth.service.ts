import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async validateUser(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(email: string, name?: string, role: string = 'viewer', password?: string) {
    let data: any = { email, name, role };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    return this.prisma.user.create({
      data,
    });
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(user as any).password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, (user as any).password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Remove password from user object before returning
    const { password: _, ...userWithoutPassword } = user as any;
    return {
      access_token: this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }),
      user: userWithoutPassword,
    };
  }

  async findOrCreateUser(email: string, name?: string) {
    try {
      console.log('Finding or creating user with email:', email);
      
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
        console.log('User not found, creating new user');
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          role: 'viewer',
        },
      });
        console.log('New user created with ID:', user.id);
      } else {
        console.log('Existing user found with ID:', user.id);
    }

    return user;
    } catch (error) {
      console.error('Error in findOrCreateUser:', error);
      throw error;
    }
  }

  async validateJwtPayload(payload: { sub: string; email: string; role: string }) {
    return this.prisma.user.findUnique({ where: { id: payload.sub } });
  }

  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.validateJwtPayload(payload);
      if (!user) {
        return null;
      }
      // Remove password from user object before returning
      const { password: _, ...userWithoutPassword } = user as any;
      return userWithoutPassword;
    } catch (error) {
      return null;
    }
  }

  generateToken(user: any) {
    return this.jwtService.sign({ 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    });
  }

  async updateUserHubspotPortalId(userId: string, hubspotPortalId: string) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { hubspotPortalId },
      });
    } catch (error) {
      throw new HttpException('Failed to update HubSpot portal ID', HttpStatus.INTERNAL_SERVER_ERROR);
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
