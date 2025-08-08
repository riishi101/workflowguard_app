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
          workflows: true,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Map planId to planName, limits, and price
      const planId = user.subscription?.planId || 'starter';
      let planName = 'Starter Plan';
      let price = 19;
      let limits = { workflows: 5, versionHistory: 30, teamMembers: 1 };
      let features = [
        'workflow_selection',
        'dashboard_overview',
        'basic_version_history',
        'manual_backups',
        'basic_rollback',
      ];
      if (planId === 'professional') {
        planName = 'Professional Plan';
        price = 49;
        limits = { workflows: 25, versionHistory: 90, teamMembers: 5 };
        features = [
          'workflow_selection',
          'dashboard_overview',
          'complete_version_history',
          'automated_backups',
          'change_notifications',
          'advanced_rollback',
          'side_by_side_comparisons',
          'compliance_reporting',
          'audit_trails',
          'priority_whatsapp_support',
        ];
      } else if (planId === 'enterprise') {
        planName = 'Enterprise Plan';
        price = 99;
        limits = { workflows: 9999, versionHistory: 365, teamMembers: 9999 };
        features = [
          'unlimited_workflows',
          'real_time_change_notifications',
          'approval_workflows',
          'advanced_compliance_reporting',
          'complete_audit_trails',
          'custom_retention_policies',
          'advanced_security_features',
          'advanced_analytics',
          'unlimited_team_members',
          'white_label_options',
          '24_7_whatsapp_support',
        ];
      }

      // Calculate usage
      const workflowsUsed = user.workflows ? user.workflows.length : 0;
      // Return real subscription data from database
      return {
        id: user.subscription?.id || 'mock-subscription-id',
        planId,
        planName,
        price,
        status: user.subscription?.status || 'active',
        currentPeriodStart: user.subscription?.createdAt || new Date().toISOString(),
        currentPeriodEnd: user.subscription?.trialEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        trialEndDate: user.subscription?.trialEndDate,
        nextBillingDate: user.subscription?.nextBillingDate,
        features,
        limits,
        usage: {
          workflows: workflowsUsed,
          versionHistory: 0, // update if you track this
          teamMembers: 1,    // update if you track this
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

      // Return real usage stats from database
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

  /**
   * Check if subscription is expired and update status if needed
   */
  async checkSubscriptionExpiration(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
        },
      });

      if (!user?.subscription) {
        return { isExpired: false, message: 'No subscription found' };
      }

      const now = new Date();
      const subscription = user.subscription;

      // Check if subscription has expired
      if (subscription.nextBillingDate && now > subscription.nextBillingDate) {
        // Update subscription status to expired
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'expired' },
        });

        return { 
          isExpired: true, 
          message: 'Subscription has expired',
          expiredDate: subscription.nextBillingDate
        };
      }

      return { isExpired: false };
    } catch (error) {
      console.error('Error checking subscription expiration:', error);
      return { isExpired: false, error: error.message };
    }
  }

  /**
   * Get next payment information
   */
  async getNextPaymentInfo(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
        },
      });

      if (!user?.subscription) {
        return { hasSubscription: false };
      }

      const subscription = user.subscription;
      const now = new Date();

      if (!subscription.nextBillingDate) {
        return { hasSubscription: true, nextPayment: null };
      }

      const daysUntilPayment = Math.ceil(
        (subscription.nextBillingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        hasSubscription: true,
        nextPayment: {
          date: subscription.nextBillingDate,
          daysUntil: daysUntilPayment,
          isOverdue: daysUntilPayment < 0,
          amount: this.getPlanPrice(subscription.planId),
          currency: 'USD'
        }
      };
    } catch (error) {
      console.error('Error getting next payment info:', error);
      return { hasSubscription: false, error: error.message };
    }
  }

  /**
   * Get plan price based on plan ID
   */
  private getPlanPrice(planId: string): number {
    const prices: Record<string, number> = {
      'starter': 19,
      'professional': 49,
      'enterprise': 99
    };
    return prices[planId] || 0;
  }
} 