import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RazorpaySubscription } from '../razorpay/razorpay.service';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

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
      let limits = { workflows: 5, versionHistory: 30 };
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
        limits = { workflows: 25, versionHistory: 90 };
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
        limits = { workflows: 9999, versionHistory: 365 };
        features = [
          'unlimited_workflows',
          'real_time_change_notifications',
          'approval_workflows',
          'advanced_compliance_reporting',
          'complete_audit_trails',
          'custom_retention_policies',
          'advanced_security_features',
          'advanced_analytics',
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
        currentPeriodStart:
          user.subscription?.createdAt || new Date().toISOString(),
        currentPeriodEnd:
          user.subscription?.trialEndDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        trialEndDate: user.subscription?.trialEndDate,
        nextBillingDate: user.subscription?.nextBillingDate,
        razorpayCustomerId: (user.subscription as any)?.razorpayCustomerId,
        razorpaySubscriptionId: (user.subscription as any)?.razorpaySubscriptionId,
        features,
        limits,
        usage: {
          workflows: workflowsUsed,
          versionHistory: 0, // update if you track this
        },
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get user subscription: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
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
        HttpStatus.INTERNAL_SERVER_ERROR,
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
        storage: {
          used: 0,
          limit: 1000, // MB
          percentage: 0,
        },
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get usage stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
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
          expiredDate: subscription.nextBillingDate,
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
        (subscription.nextBillingDate.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      return {
        hasSubscription: true,
        nextPayment: {
          date: subscription.nextBillingDate,
          daysUntil: daysUntilPayment,
          isOverdue: daysUntilPayment < 0,
          amount: this.getPlanPrice(subscription.planId, 'INR'),
          currency: 'INR',
        },
      };
    } catch (error) {
      console.error('Error getting next payment info:', error);
      return { hasSubscription: false, error: error.message };
    }
  }

  /**
   * Get plan price based on plan ID and currency
   */
  private getPlanPrice(planId: string, currency: string = 'INR'): number {
    const prices: Record<string, Record<string, number>> = {
      starter: {
        INR: 19,
        USD: 19,
        GBP: 15,
        EUR: 18,
        CAD: 25,
      },
      professional: {
        INR: 49,
        USD: 49,
        GBP: 39,
        EUR: 45,
        CAD: 65,
      },
      enterprise: {
        INR: 99,
        USD: 99,
        GBP: 79,
        EUR: 89,
        CAD: 129,
      },
    };
    return prices[planId]?.[currency] || prices[planId]?.['INR'] || 0;
  }

  // Razorpay Integration Methods
  async updateSubscriptionFromRazorpay(userId: string, razorpaySubscription: RazorpaySubscription) {
    try {
      this.logger.log(`Updating subscription from Razorpay for user: ${userId}`);
      
      const subscription = await this.prisma.subscription.upsert({
        where: { userId },
        update: {
          ...(razorpaySubscription.id && { razorpaySubscriptionId: razorpaySubscription.id } as any),
          status: this.mapRazorpayStatus(razorpaySubscription.status),
          nextBillingDate: new Date(razorpaySubscription.current_end * 1000),
        },
        create: {
          userId,
          planId: this.mapRazorpayPlanToLocal(razorpaySubscription.plan_id),
          status: this.mapRazorpayStatus(razorpaySubscription.status),
          ...(razorpaySubscription.id && { razorpaySubscriptionId: razorpaySubscription.id } as any),
          nextBillingDate: new Date(razorpaySubscription.current_end * 1000),
        },
      });

      this.logger.log(`Subscription updated successfully: ${subscription.id}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to update subscription from Razorpay: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to update subscription',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async handleSubscriptionCancellation(userId: string, razorpaySubscriptionId: string) {
    try {
      this.logger.log(`Handling subscription cancellation for user: ${userId}`);
      
      const subscription = await this.prisma.subscription.update({
        where: { userId },
        data: {
          status: 'cancelled',
        },
      });

      this.logger.log(`Subscription cancelled successfully: ${subscription.id}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to handle subscription cancellation: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to cancel subscription',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateSubscriptionStatus(razorpaySubscriptionId: string, status: string) {
    try {
      this.logger.log(`Updating subscription status: ${razorpaySubscriptionId} to ${status}`);
      
      const subscription = await this.prisma.subscription.findFirst({
        where: { razorpaySubscriptionId } as any,
      });

      if (!subscription) {
        throw new HttpException('Subscription not found', HttpStatus.NOT_FOUND);
      }

      const updatedSubscription = await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: this.mapRazorpayStatus(status),
        },
      });

      this.logger.log(`Subscription status updated successfully: ${updatedSubscription.id}`);
      return updatedSubscription;
    } catch (error) {
      this.logger.error(`Failed to update subscription status: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to update subscription status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async recordPayment(razorpaySubscriptionId: string, paymentData: any) {
    try {
      this.logger.log(`Recording payment for subscription: ${razorpaySubscriptionId}`);
      
      const subscription = await this.prisma.subscription.findFirst({
        where: { razorpaySubscriptionId } as any,
      });

      if (!subscription) {
        throw new HttpException('Subscription not found', HttpStatus.NOT_FOUND);
      }

      const payment = await (this.prisma as any).payment.create({
        data: {
          subscriptionId: subscription.id,
          razorpayPaymentId: paymentData.id,
          amount: paymentData.amount / 100, // Convert from paise to rupees
          currency: paymentData.currency,
          status: paymentData.status,
          method: paymentData.method,
          description: paymentData.description,
        },
      });

      this.logger.log(`Payment recorded successfully: ${payment.id}`);
      return payment;
    } catch (error) {
      this.logger.error(`Failed to record payment: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to record payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async handleFailedPayment(paymentData: any) {
    try {
      this.logger.log(`Handling failed payment: ${paymentData.id}`);
      
      // You can implement logic here to:
      // 1. Send notification to user
      // 2. Update subscription status if needed
      // 3. Log the failure for analytics
      
      this.logger.warn(`Payment failed: ${paymentData.id}, reason: ${paymentData.error_description}`);
      
      return { success: true, message: 'Failed payment handled' };
    } catch (error) {
      this.logger.error(`Failed to handle failed payment: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to handle failed payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Helper Methods
  private mapRazorpayStatus(razorpayStatus: string): string {
    const statusMap: Record<string, string> = {
      'created': 'trial',
      'authenticated': 'trial',
      'active': 'active',
      'paused': 'paused',
      'halted': 'overdue',
      'cancelled': 'cancelled',
      'completed': 'completed',
      'expired': 'cancelled',
    };
    
    return statusMap[razorpayStatus] || 'active';
  }

  private mapRazorpayPlanToLocal(razorpayPlanId: string): string {
    // Map Razorpay plan IDs to local plan IDs (Multi-currency support)
    const planMap: Record<string, string> = {
      // INR Plans (Active)
      'plan_R6RI02CsUCUlDz': 'starter',
      'plan_R6RKEg5mqJK6Ky': 'professional', 
      'plan_R6RKnjqXu0BZsH': 'enterprise',
      
      // USD Plans (Placeholder)
      'plan_starter_usd_monthly': 'starter',
      'plan_professional_usd_monthly': 'professional',
      'plan_enterprise_usd_monthly': 'enterprise',
      
      // GBP Plans (Placeholder)
      'plan_starter_gbp_monthly': 'starter',
      'plan_professional_gbp_monthly': 'professional',
      'plan_enterprise_gbp_monthly': 'enterprise',
      
      // EUR Plans (Placeholder)
      'plan_starter_eur_monthly': 'starter',
      'plan_professional_eur_monthly': 'professional',
      'plan_enterprise_eur_monthly': 'enterprise',
      
      // CAD Plans (Placeholder)
      'plan_starter_cad_monthly': 'starter',
      'plan_professional_cad_monthly': 'professional',
      'plan_enterprise_cad_monthly': 'enterprise',
    };
    
    return planMap[razorpayPlanId] || 'starter';
  }

  /**
   * Get currency from Razorpay plan ID
   */
  private getCurrencyFromPlanId(razorpayPlanId: string): string {
    // Extract currency from plan ID
    if (razorpayPlanId.includes('_usd_')) return 'USD';
    if (razorpayPlanId.includes('_gbp_')) return 'GBP';
    if (razorpayPlanId.includes('_eur_')) return 'EUR';
    if (razorpayPlanId.includes('_cad_')) return 'CAD';
    
    // Default to INR for existing plans
    return 'INR';
  }

  /**
   * Get billing history for a user
   */
  async getBillingHistory(userId: string) {
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

      // For now, return mock billing history since Razorpay integration is basic
      // In production, this would fetch from Razorpay API using user.razorpayCustomerId
      const mockBillingHistory = [
        {
          id: 'pay_1',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          amount: user.subscription?.planId === 'professional' ? 49 : user.subscription?.planId === 'enterprise' ? 99 : 19,
          currency: 'USD',
          status: 'paid',
          planName: user.subscription?.planId === 'professional' ? 'Professional Plan' : user.subscription?.planId === 'enterprise' ? 'Enterprise Plan' : 'Starter Plan',
          description: 'Monthly subscription payment',
        },
        {
          id: 'pay_2',
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
          amount: user.subscription?.planId === 'professional' ? 49 : user.subscription?.planId === 'enterprise' ? 99 : 19,
          currency: 'USD',
          status: 'paid',
          planName: user.subscription?.planId === 'professional' ? 'Professional Plan' : user.subscription?.planId === 'enterprise' ? 'Enterprise Plan' : 'Starter Plan',
          description: 'Monthly subscription payment',
        },
      ];

      return mockBillingHistory;
    } catch (error) {
      this.logger.error(`Failed to get billing history for user ${userId}:`, error);
      throw new HttpException(
        'Failed to retrieve billing history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cancel subscription for a user
   */
  async cancelSubscription(userId: string) {
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
        throw new HttpException('No active subscription found', HttpStatus.NOT_FOUND);
      }

      // Update subscription to cancelled status
      const updatedSubscription = await this.prisma.subscription.update({
        where: { userId },
        data: {
          status: 'cancelled',
        },
      });

      // In production, this would also call Razorpay API to cancel the subscription
      // await razorpayInstance.subscriptions.cancel(user.razorpaySubscriptionId);

      return {
        message: 'Subscription cancelled successfully',
        subscription: updatedSubscription,
      };
    } catch (error) {
      this.logger.error(`Failed to cancel subscription for user ${userId}:`, error);
      throw new HttpException(
        'Failed to cancel subscription',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Export billing history as CSV
   */
  async exportBillingHistoryCSV(userId: string): Promise<string> {
    try {
      const billingHistory = await this.getBillingHistory(userId);
      
      // Create CSV header
      const csvHeader = 'Date,Amount,Currency,Status,Plan Name,Description\n';
      
      // Create CSV rows
      const csvRows = billingHistory.map(item => 
        `${item.date},${item.amount},${item.currency},${item.status},"${item.planName}","${item.description}"`
      ).join('\n');
      
      return csvHeader + csvRows;
    } catch (error) {
      this.logger.error(`Failed to export billing history for user ${userId}:`, error);
      throw new HttpException(
        'Failed to export billing history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get payment method update URL
   */
  async getPaymentMethodUpdateUrl(userId: string): Promise<string> {
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

      // In production, this would generate a Razorpay customer portal URL
      // For now, return a mock URL
      const mockUpdateUrl = `https://dashboard.razorpay.com/app/subscriptions/${user.subscription?.razorpayCustomerId || 'mock-customer-id'}/update-payment-method`;
      
      return mockUpdateUrl;
    } catch (error) {
      this.logger.error(`Failed to get payment method update URL for user ${userId}:`, error);
      throw new HttpException(
        'Failed to get payment method update URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get invoice URL
   */
  async getInvoice(userId: string, invoiceId: string): Promise<string> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // In production, this would fetch the actual invoice from Razorpay
      // For now, return a mock invoice URL
      const mockInvoiceUrl = `https://dashboard.razorpay.com/app/invoices/${invoiceId}/download`;
      
      return mockInvoiceUrl;
    } catch (error) {
      this.logger.error(`Failed to get invoice for user ${userId}, invoice ${invoiceId}:`, error);
      throw new HttpException(
        'Failed to get invoice',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get Razorpay plan ID for a given plan and currency
   */
  getRazorpayPlanId(planType: string, currency: string = 'INR'): string {
    const envKey = `RAZORPAY_PLAN_ID_${planType.toUpperCase()}_${currency}`;
    const planId = process.env[envKey];
    
    if (!planId) {
      this.logger.warn(`No Razorpay plan ID found for ${planType} in ${currency}, falling back to INR`);
      return process.env[`RAZORPAY_PLAN_ID_${planType.toUpperCase()}_INR`] || '';
    }
    
    return planId;
  }
}
