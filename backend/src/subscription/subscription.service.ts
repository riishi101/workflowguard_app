import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async getUserSubscription(userId: string) {
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

      // Mock subscription data
      return {
        id: user.subscription?.id || 'mock-subscription-id',
        planId: user.subscription?.planId || 'starter',
        planName: 'Starter Plan',
        status: user.subscription?.status || 'active',
        currentPeriodStart: user.subscription?.createdAt || new Date().toISOString(),
        currentPeriodEnd: user.subscription?.trialEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        trialEndDate: user.subscription?.trialEndDate,
        nextBillingDate: user.subscription?.nextBillingDate,
        features: ['workflow_selection', 'dashboard_overview', 'basic_version_history', 'manual_backups', 'basic_rollback'],
        limits: {
          workflows: 5,
          versionHistory: 30,
          teamMembers: 1,
        },
        usage: {
          workflows: 0,
          versionHistory: 0,
          teamMembers: 1,
        }
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get user subscription: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
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
      const isTrialExpired = trialEndDate && trialEndDate <= now;
      
      let trialDaysRemaining = 0;
      if (isTrialActive && trialEndDate) {
        const diffTime = trialEndDate.getTime() - now.getTime();
        trialDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        isTrialActive,
        isTrialExpired,
        trialDaysRemaining,
        trialEndDate: trialEndDate?.toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get trial status: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getUsageStats(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
          workflows: true,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Mock usage stats
      return {
        workflows: {
          used: user.workflows?.length || 0,
          limit: 5,
          percentage: Math.min(((user.workflows?.length || 0) / 5) * 100, 100),
        },
        versionHistory: {
          used: 0,
          limit: 30,
          percentage: 0,
        },
        teamMembers: {
          used: 1,
          limit: 1,
          percentage: 100,
        },
        storage: {
          used: 0,
          limit: 1000, // MB
          percentage: 0,
        },
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get usage stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 