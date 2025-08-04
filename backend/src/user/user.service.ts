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

  // Add missing methods that UserController expects
  async createTrialSubscription(userId: string) {
    // Create a trial subscription for the user (21 days for HubSpot App Marketplace)
    const trialSubscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId: 'trial',
        status: 'active',
        trialEndDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days trial
      },
    });
    return trialSubscription;
  }

  async checkTrialAccess(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { 
        userId,
        status: 'active',
        planId: 'trial'
      },
    });
    
    if (!subscription) {
      return { hasTrial: false, message: 'No trial subscription found' };
    }

    const now = new Date();
    const isExpired = subscription.trialEndDate && subscription.trialEndDate < now;
    
    return {
      hasTrial: !isExpired,
      isExpired,
      endDate: subscription.trialEndDate,
      daysRemaining: subscription.trialEndDate ? Math.max(0, Math.ceil((subscription.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0,
    };
  }

  async upgradeSubscription(userId: string, planId: string) {
    // Cancel existing trial subscription
    await this.prisma.subscription.updateMany({
      where: { 
        userId,
        planId: 'trial',
        status: 'active'
      },
      data: { status: 'cancelled' },
    });

    // Create new paid subscription
    const newSubscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId,
        status: 'active',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });
    
    return newSubscription;
  }

  async getUserPlan(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { 
        userId,
        status: 'active'
      },
    });
    
    return subscription || { plan: null, status: 'no_subscription' };
  }

  async getUserOverages(userId: string, startDate?: Date, endDate?: Date) {
    const whereClause: any = { userId };
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const overages = await this.prisma.overage.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return {
      overages,
      totalAmount: overages.reduce((sum, o) => sum + o.amount, 0),
      count: overages.length,
    };
  }

  async cancelMySubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { 
        userId,
        status: 'active'
      },
    });

    if (!subscription) {
      throw new HttpException('No active subscription found', HttpStatus.NOT_FOUND);
    }

    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'cancelled' },
    });
  }

  // Add remaining missing methods
  async getWorkflowCountByOwner(userId: string) {
    const count = await this.prisma.workflow.count({
      where: { ownerId: userId },
    });
    return count;
  }

  async getNotificationSettings(userId: string) {
    const settings = await this.prisma.notificationSettings.findUnique({
      where: { userId },
    });
    
    return settings || {
      userId,
      enabled: true,
      email: '',
      workflowDeleted: true,
      enrollmentTriggerModified: true,
      workflowRolledBack: true,
      criticalActionModified: true,
    };
  }

  async updateNotificationSettings(userId: string, dto: any) {
    return this.prisma.notificationSettings.upsert({
      where: { userId },
      update: dto,
      create: {
        userId,
        ...dto,
      },
    });
  }

  async deleteApiKey(userId: string, keyId: string) {
    return this.prisma.apiKey.updateMany({
      where: { userId, id: keyId },
      data: { isActive: false },
    });
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        workflows: true,
      },
    });
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
  }

  async deleteMe(userId: string) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async getMySubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { 
        userId,
        status: 'active'
      },
    });
    
    return subscription || { plan: null, status: 'no_subscription' };
  }
}
