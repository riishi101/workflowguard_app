import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        subscription: true,
        workflows: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
        workflows: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        subscription: true,
        workflows: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async findOneWithSubscription(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
      },
    });
  }

  async getPlanById(planId: string) {
    return this.prisma.plan.findUnique({
      where: { id: planId },
    });
  }

  async getOverageStats(userId: string) {
    const overages = await this.prisma.overage.findMany({
      where: { userId },
      include: {
        user: true,
      },
    });

    return {
      totalOverage: overages.reduce((sum, o) => sum + o.amount, 0),
      unbilledOverage: overages
        .filter(overage => !overage.isBilled)
        .reduce((sum, o) => sum + o.amount, 0),
      overageCount: overages.length,
      unbilledCount: overages.filter(o => !o.isBilled).length,
    };
  }

  async createOverage(userId: string, amount: number, description?: string) {
    return this.prisma.overage.create({
      data: {
        userId,
        planId: 'starter', // Default plan
        amount,
        description,
      },
    });
  }

  async getApiKeys(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        lastUsed: true,
      },
    });
  }

  async createApiKey(userId: string, name: string, description?: string) {
    const key = `wg_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    
    return this.prisma.apiKey.create({
      data: {
        userId,
        name,
        description,
        key,
      },
    });
  }

  async revokeApiKey(userId: string, keyId: string) {
    return this.prisma.apiKey.updateMany({
      where: { userId, id: keyId },
      data: { isActive: false },
    });
  }

  async revokeAllApiKeys(userId: string) {
    return this.prisma.apiKey.updateMany({
      where: { userId },
      data: { isActive: false },
    });
  }
}
