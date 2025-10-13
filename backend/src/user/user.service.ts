import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { randomUUID } from 'crypto';
import { PLAN_CONFIG, PlanId } from '../plan-config';

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

  async findByHubSpotPortalId(hubspotPortalId: string) {
    return this.prisma.user.findUnique({
      where: { hubspotPortalId },
      include: {
        subscription: true,
        workflows: true,
      },
    });
  }

  async getPortalInfo(hubspotPortalId: string) {
    if (!hubspotPortalId) {
      throw new HttpException('HubSpot Portal ID is required', HttpStatus.BAD_REQUEST);
    }

    // Get all users for this portal
    const users = await this.prisma.user.findMany({
      where: { hubspotPortalId },
      include: {
        subscription: true,
      },
      orderBy: { createdAt: 'asc' }, // First user is primary
    });

    if (users.length === 0) {
      throw new HttpException('No users found for this portal', HttpStatus.NOT_FOUND);
    }

    const primaryUser = users[0]; // First registered user is primary
    const subscription = primaryUser.subscription;

    // Calculate trial info if subscription exists
    let trialInfo = null;
    if (subscription) {
      const now = new Date();
      const trialEndDate = subscription.trialEndDate;
      const isTrialActive = trialEndDate && trialEndDate > now;
      const isTrialExpired = trialEndDate && trialEndDate <= now;
      
      let trialDaysRemaining = 0;
      if (isTrialActive && trialEndDate) {
        const diffTime = trialEndDate.getTime() - now.getTime();
        trialDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      trialInfo = {
        isTrialActive,
        isTrialExpired,
        trialDaysRemaining,
        trialEndDate: trialEndDate?.toISOString(),
      };
    }

    return {
      totalUsers: users.length,
      primaryUser: {
        id: primaryUser.id,
        email: primaryUser.email,
        name: primaryUser.name,
        createdAt: primaryUser.createdAt,
      },
      subscription: subscription ? {
        planId: subscription.planId,
        status: subscription.status,
        createdAt: subscription.createdAt,
        trialEndDate: subscription.trialEndDate,
      } : null,
      trial: trialInfo,
    };
  }

  async validateTrialEligibility(hubspotPortalId: string): Promise<boolean> {
    if (!hubspotPortalId) {
      return false;
    }

    // Check if any user from this portal already has a trial or active subscription
    const existingUser = await this.prisma.user.findFirst({
      where: { 
        hubspotPortalId,
        subscription: {
          OR: [
            { status: 'trial' },
            { status: 'active' },
            { status: 'past_due' },
          ]
        }
      },
      include: { subscription: true },
    });

    // Portal is eligible for trial if no existing subscription found
    return !existingUser;
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
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    // If plan doesn't exist in DB, fallback to in-app PLAN_CONFIG
    if (!plan) {
      const fallback = (PLAN_CONFIG as any)[planId as PlanId];
      if (fallback) {
        // Normalize feature slugs from PLAN_CONFIG (already slugs)
        return {
          id: planId,
          name: planId,
          price: 0,
          interval: 'month',
          features: [...fallback.features],
        } as any;
      }
      return null as any;
    }

    // Normalize DB features to consistent slug array
    let featuresNormalized: string[] = [];
    const rawFeatures = plan.features;

    if (typeof rawFeatures === 'string' && rawFeatures.length > 0) {
      try {
        const parsed = JSON.parse(rawFeatures);
        if (Array.isArray(parsed)) {
          featuresNormalized = parsed.map((f) => String(f));
        } else {
          // Fallback: treat as comma-separated list
          featuresNormalized = rawFeatures.split(',');
        }
      } catch {
        // Not JSON, treat as comma-separated
        featuresNormalized = rawFeatures.split(',');
      }
    }

    // Lowercase and trim
    featuresNormalized = featuresNormalized
      .map((f) => f.toLowerCase().trim())
      .filter((f) => f.length > 0);

    // Add semantic aliases to align with feature gates used in controllers
    // If any feature mentions audit trail(s), expose 'audit_logs' gate
    if (featuresNormalized.some((f) => f.includes('audit trail'))) {
      featuresNormalized.push('audit_logs');
    }

    // If any feature mentions api access, expose 'api_access' slug
    if (featuresNormalized.some((f) => f.includes('api access'))) {
      featuresNormalized.push('api_access');
    }

    // Deduplicate
    const uniqueFeatures = Array.from(new Set(featuresNormalized));

    return {
      ...plan,
      // Overwrite features with normalized slugs array so `includes('audit_logs')` works reliably
      features: uniqueFeatures,
    } as any;
  }

  async getOverageStats(userId: string) {
    // Overages not implemented - return default values
    return {
      totalOverage: 0,
      unbilledOverage: 0,
      overageCount: 0,
      unbilledCount: 0,
    };
  }

  async createOverage(userId: string, amount: number, description?: string) {
    // Overages not implemented
    throw new HttpException(
      'Overage functionality not implemented',
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  async getApiKeys(userId: string) {
    const apiKeys = await this.prisma.apiKey.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        lastUsed: true,
        isActive: true,
      },
    });

    return apiKeys.map((key: any) => ({
      ...key,
      key: key.id.substring(0, 8) + '...' + key.id.substring(key.id.length - 4), // Mask the actual key
    }));
  }

  async createApiKey(userId: string, apiKeyData: any) {
    const { name, description } = apiKeyData;

    if (!name) {
      throw new HttpException(
        'API key name is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Generate a secure API key
    const apiKeyValue = `wg_${randomUUID().replace(/-/g, '')}`;

    const apiKey = await this.prisma.apiKey.create({
      data: {
        userId,
        name,
        description: description || '',
        key: apiKeyValue, // Store the actual key
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        key: true, // Return the actual key only on creation
        createdAt: true,
        isActive: true,
      },
    });

    return {
      ...apiKey,
      message:
        "Store this API key securely. You won't be able to see it again.",
    };
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
        planId: 'professional', // Use professional plan for trial
        status: 'trial',
        trialEndDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days trial
      },
    });
    return trialSubscription;
  }

  async checkTrialAccess(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'trial',
        planId: 'professional',
      },
    });

    if (!subscription) {
      return { hasTrial: false, message: 'No trial subscription found' };
    }

    const now = new Date();
    const isExpired =
      subscription.trialEndDate && subscription.trialEndDate < now;

    return {
      hasTrial: !isExpired,
      isExpired,
      endDate: subscription.trialEndDate,
      daysRemaining: subscription.trialEndDate
        ? Math.max(
            0,
            Math.ceil(
              (subscription.trialEndDate.getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : 0,
    };
  }

  async upgradeSubscription(userId: string, planId: string) {
    // Cancel existing trial subscription
    await this.prisma.subscription.updateMany({
      where: {
        userId,
        planId: 'professional',
        status: 'trial',
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
        status: 'active',
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
      overages: [],
      totalAmount: 0,
      count: 0,
    };
  }

  async cancelMySubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
    });

    if (!subscription) {
      throw new HttpException(
        'No active subscription found',
        HttpStatus.NOT_FOUND,
      );
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

    return (
      settings || {
        userId,
        enabled: true,
        email: '',
        workflowDeleted: true,
        enrollmentTriggerModified: true,
        workflowRolledBack: true,
        criticalActionModified: true,
      }
    );
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
    const result = await this.prisma.apiKey.updateMany({
      where: {
        userId,
        id: keyId,
        isActive: true,
      },
      data: { isActive: false },
    });

    if (result.count === 0) {
      throw new HttpException(
        'API key not found or already inactive',
        HttpStatus.NOT_FOUND,
      );
    }

    return { success: true };
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
        status: 'active',
      },
    });

    return subscription || { plan: null, status: 'no_subscription' };
  }
}
