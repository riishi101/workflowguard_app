import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { NotificationService } from '../notification/notification.service';
import { PLAN_CONFIG } from '../plan-config';
import { randomBytes, createHash } from 'crypto';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
    private notificationService: NotificationService,
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...data,
        role: data.role ?? 'viewer',
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getWorkflowCountByOwner(ownerId: string): Promise<number> {
    return this.prisma.workflow.count({ where: { ownerId } });
  }

  async findOneWithSubscription(id: string): Promise<(User & { subscription: any; hubspotPortalId: string | null }) | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { subscription: true },
    });
  }

  async getPlanById(planId: string) {
    return (this.prisma as any).plan.findUnique({ where: { id: planId } });
  }

  async updateUserPlan(userId: string, newPlanId: string, actorUserId: string) {
    // Find the user's current subscription
    const subscription = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!subscription) throw new Error('Subscription not found');
    const oldValue = { ...subscription };
    // Update the planId
    const updated = await this.prisma.subscription.update({
      where: { userId },
      data: { planId: newPlanId },
    });
    // Log the change
    await this.auditLogService.create({
      userId: actorUserId,
      action: 'plan_change',
      entityType: 'subscription',
      entityId: updated.id,
      oldValue,
      newValue: updated,
    });
    return updated;
  }

  async getUserOverages(userId: string, periodStart?: Date, periodEnd?: Date) {
    const where: any = { userId };
    if (periodStart && periodEnd) {
      where.periodStart = { gte: periodStart };
      where.periodEnd = { lte: periodEnd };
    }
    return this.prisma.overage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOverageStats(userId: string) {
    const overages = await this.prisma.overage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    const totalOverages = overages.reduce((sum, overage) => sum + overage.amount, 0);
    const unbilledOverages = overages
      .filter(overage => !overage.billed)
      .reduce((sum, overage) => sum + overage.amount, 0);
    
    return {
      totalOverages,
      unbilledOverages,
      overagePeriods: overages.length,
      currentPeriodOverages: overages.find((o: any) => {
        const now = new Date();
        return o.periodStart && o.periodEnd && o.periodStart <= now && o.periodEnd >= now;
      })?.amount || 0,
    };
  }

  async getUserPlan(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    return subscription;
  }

  async trackOverage(userId: string, type: string, amount: number, periodStart: Date, periodEnd: Date) {
    const month = `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}`;
    const overage = await this.prisma.overage.create({
      data: {
        userId,
        type,
        amount,
        periodStart,
        periodEnd,
        month,
        workflowCount: Math.ceil(amount), // Convert amount to workflow count
        limit: 100, // Default limit
        overage: Math.max(0, Math.ceil(amount) - 100), // Calculate overage
      },
    });

    // Send notification for the overage
    await this.notificationService.sendOverageAlert(userId, {
      overageId: overage.id,
      type,
      amount,
      periodStart,
      periodEnd,
    });

    return overage;
  }

  async getNotificationSettings(userId: string) {
    return this.prisma.notificationSettings.findUnique({ where: { userId } });
  }

  async updateNotificationSettings(userId: string, dto: any) {
    return this.prisma.notificationSettings.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
  }

  async getApiKeys(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId, revoked: false },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        description: true,
        createdAt: true,
        lastUsed: true,
        revoked: true,
      },
    });
  }

  async createApiKey(userId: string, description: string) {
    // Generate a random API key
    const rawKey = randomBytes(32).toString('hex');
    // Store the key directly (in production, you'd want to hash it)
    const apiKey = await this.prisma.apiKey.create({
      data: {
        userId,
        name: `API Key ${new Date().toISOString().split('T')[0]}`,
        key: rawKey,
        description,
      },
    });
    // Return the raw key only once
    return { id: apiKey.id, description: apiKey.description, createdAt: apiKey.createdAt, key: rawKey };
  }

  async deleteApiKey(userId: string, id: string) {
    // Mark as revoked
    return this.prisma.apiKey.updateMany({
      where: { id, userId },
      data: { revoked: true },
    });
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        jobTitle: true,
        timezone: true,
        language: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateMe(userId: string, dto: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
  }

  async deleteMe(userId: string) {
    try {
      const user = await this.prisma.user.delete({
        where: { id: userId },
      });
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getMySubscription(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return {
        plan: user.subscription?.planId || 'starter',
        status: user.subscription?.status || 'active',
        currentPeriodEnd: user.subscription?.nextBillingDate,
        cancelAtPeriodEnd: false, // Not implemented in schema yet
        nextBillingDate: user.subscription?.nextBillingDate,
        trialEndDate: user.subscription?.trialEndDate,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to get subscription', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async cancelMySubscription(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (!user.subscription) {
        throw new HttpException('No subscription found', HttpStatus.NOT_FOUND);
      }

      // Update subscription to canceled status
      await this.prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          status: 'canceled',
        },
      });

      return { message: 'Subscription has been canceled' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to cancel subscription', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getTrialStatus(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const now = new Date();
      const trialEndDate = user.subscription?.trialEndDate;
      const isTrialActive = trialEndDate && trialEndDate > now;
      const trialDaysRemaining = trialEndDate ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

      return {
        isTrialActive,
        trialDaysRemaining: Math.max(0, trialDaysRemaining),
        trialEndDate: trialEndDate,
        isTrialExpired: trialEndDate && trialEndDate <= now,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to get trial status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUsageStats(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
          workflows: {
            include: {
              versions: true,
            },
          },
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const totalWorkflows = user.workflows.length;
      const totalVersions = user.workflows.reduce((sum, workflow) => sum + workflow.versions.length, 0);
      const activeWorkflows = user.workflows.filter(w => w.versions.length > 0).length;

      // Get plan limits based on subscription
      const planId = user.subscription?.planId || 'starter';
      const plan = await this.getPlanById(planId);
      const workflowLimit = plan?.workflowLimit || 5;

      return {
        totalWorkflows,
        totalVersions,
        activeWorkflows,
        workflowLimit,
        usagePercentage: Math.round((totalWorkflows / workflowLimit) * 100),
        isOverLimit: totalWorkflows > workflowLimit,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to get usage stats', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createTrialSubscription(userId: string) {
    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 21); // 21-day trial

      const subscription = await this.prisma.subscription.upsert({
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

      return subscription;
    } catch (error) {
      throw new HttpException('Failed to create trial subscription', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async checkTrialAccess(userId: string) {
    try {
      const trialStatus = await this.getTrialStatus(userId);
      
      if (trialStatus.isTrialExpired) {
        throw new HttpException('Trial has expired. Please upgrade to continue using WorkflowGuard.', HttpStatus.PAYMENT_REQUIRED);
      }

      return { hasAccess: true };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to check trial access', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async upgradeSubscription(userId: string, planId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const plan = await this.getPlanById(planId);
      if (!plan) {
        throw new HttpException('Invalid plan', HttpStatus.BAD_REQUEST);
      }

      // Calculate next billing date
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      const subscription = await this.prisma.subscription.upsert({
        where: { userId },
        update: {
          planId,
          status: 'active',
          trialEndDate: null,
          nextBillingDate,
        },
        create: {
          userId,
          planId,
          status: 'active',
          nextBillingDate,
        },
      });

      return subscription;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to upgrade subscription', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
