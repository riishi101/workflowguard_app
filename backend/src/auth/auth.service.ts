import { Injectable, UnauthorizedException } from '@nestjs/common';
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

  async updateUserHubspotPortalId(userId: string, hubspotPortalId: string) {
    try {
      console.log('Updating user hubspotPortalId:', userId, hubspotPortalId);
      
      const result = await this.prisma.user.update({
        where: { id: userId },
        data: { hubspotPortalId },
      });
      
      console.log('User hubspotPortalId updated successfully');
      return result;
    } catch (error) {
      console.error('Error updating user hubspotPortalId:', error);
      throw error;
    }
  }
}
