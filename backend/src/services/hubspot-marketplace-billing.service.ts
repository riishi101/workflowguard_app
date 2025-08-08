import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

export interface MarketplaceSubscription {
  id: string;
  portalId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface MarketplacePlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  description: string;
}

export interface HubSpotBillingSubscription {
  id: string;
  portalId: string;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
}

export interface HubSpotBillingPayment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

@Injectable()
export class HubSpotMarketplaceBillingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a subscription through HubSpot marketplace billing
   */
  async createMarketplaceSubscription(
    portalId: string,
    planId: string,
    userId: string
  ): Promise<MarketplaceSubscription> {
    try {
      console.log('HubSpot Marketplace Billing - Creating subscription:', {
        portalId,
        planId,
        userId
      });

      // Validate plan
      const plan = await this.getMarketplacePlan(planId);
      if (!plan) {
        throw new HttpException('Invalid plan ID', HttpStatus.BAD_REQUEST);
      }

      // Get user's HubSpot access token
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user?.hubspotAccessToken) {
        throw new HttpException('HubSpot not connected', HttpStatus.BAD_REQUEST);
      }

      // Create subscription in HubSpot marketplace billing
      const subscription = await this.createHubSpotSubscription(portalId, planId, user.hubspotAccessToken);

      // Update local database
      await this.prisma.subscription.upsert({
        where: { userId },
        update: {
          planId: planId,
          status: 'active',
          nextBillingDate: new Date(subscription.currentPeriodEnd)
        },
        create: {
          userId,
          planId: planId,
          status: 'active',
          nextBillingDate: new Date(subscription.currentPeriodEnd)
        }
      });

      // Log the subscription creation
      await this.prisma.auditLog.create({
        data: {
          action: 'marketplace_subscription_created',
          entityType: 'subscription',
          entityId: subscription.id,
          newValue: {
            portalId,
            planId,
            status: subscription.status,
            amount: plan.price,
            hubspotSubscriptionId: subscription.id
          }
        }
      });

      console.log('HubSpot Marketplace Billing - Subscription created:', subscription.id);
      return subscription;

    } catch (error) {
      console.error('HubSpot Marketplace Billing - Create subscription error:', error);
      throw new HttpException('Failed to create subscription', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Cancel a subscription through HubSpot marketplace billing
   */
  async cancelMarketplaceSubscription(portalId: string, userId: string): Promise<any> {
    try {
      console.log('HubSpot Marketplace Billing - Canceling subscription:', { portalId, userId });

      // Get user's HubSpot access token
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user?.hubspotAccessToken) {
        throw new HttpException('HubSpot not connected', HttpStatus.BAD_REQUEST);
      }

      // Cancel subscription in HubSpot marketplace billing
      const result = await this.cancelHubSpotSubscription(portalId, user.hubspotAccessToken);

      // Update local database
      await this.prisma.subscription.updateMany({
        where: { userId },
        data: { status: 'canceled' }
      });

      // Log the cancellation
      await this.prisma.auditLog.create({
        data: {
          action: 'marketplace_subscription_canceled',
          entityType: 'subscription',
          entityId: portalId,
          newValue: { portalId, canceledAt: new Date() }
        }
      });

      console.log('HubSpot Marketplace Billing - Subscription canceled for portal:', portalId);
      return { success: true, message: 'Subscription canceled successfully' };

    } catch (error) {
      console.error('HubSpot Marketplace Billing - Cancel subscription error:', error);
      throw new HttpException('Failed to cancel subscription', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get subscription status from HubSpot marketplace billing
   */
  async getMarketplaceSubscriptionStatus(portalId: string): Promise<MarketplaceSubscription | null> {
    try {
      console.log('HubSpot Marketplace Billing - Getting subscription status:', portalId);

      // Get subscription from HubSpot marketplace billing
      const subscription = await this.getHubSpotSubscription(portalId);

      if (!subscription) {
        console.log('HubSpot Marketplace Billing - No subscription found for portal:', portalId);
        return null;
      }

      console.log('HubSpot Marketplace Billing - Subscription status retrieved:', subscription.id);
      return subscription;

    } catch (error) {
      console.error('HubSpot Marketplace Billing - Get subscription status error:', error);
      throw new HttpException('Failed to get subscription status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get available plans from HubSpot marketplace
   */
  async getMarketplacePlans(): Promise<MarketplacePlan[]> {
    try {
      console.log('HubSpot Marketplace Billing - Getting available plans');

      // In a real implementation, this would fetch from HubSpot's marketplace API
      const plans: MarketplacePlan[] = [
        {
          id: 'starter',
          name: 'Starter',
          price: 19,
          interval: 'month',
          description: 'Perfect for small teams',
          features: [
            'Up to 10 workflows',
            'Workflow Selection',
            'Dashboard Overview',
            'Basic Version History',
            'Manual Backups',
            'Basic Rollback',
            'Simple Comparison',
            'Email Support'
          ]
        },
        {
          id: 'professional',
          name: 'Professional',
          price: 49,
          interval: 'month',
          description: 'Ideal for growing businesses',
          features: [
            'Up to 35 workflows',
            'Enhanced Dashboard',
            'Complete Version History',
            'Automated Backups',
            'Change Notifications',
            'Advanced Rollback',
            'Side-by-side Comparisons',
            'Compliance Reporting',
            'Audit Trails',
            'Priority WhatsApp Support'
          ]
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: 99,
          interval: 'month',
          description: 'For large organizations',
          features: [
            'Unlimited workflows',
            'Real-time Change Notifications',
            'Approval Workflows',
            'Advanced Compliance Reporting',
            'Complete Audit Trails',
            'Custom Retention Policies',
            'Advanced Security Features',
            'Unlimited Team Members',
            'White-label Options',
            '24/7 WhatsApp Support'
          ]
        }
      ];

      console.log('HubSpot Marketplace Billing - Available plans retrieved:', plans.length);
      return plans;

    } catch (error) {
      console.error('HubSpot Marketplace Billing - Get plans error:', error);
      throw new HttpException('Failed to get available plans', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get a specific plan by ID
   */
  async getMarketplacePlan(planId: string): Promise<MarketplacePlan | null> {
    try {
      const plans = await this.getMarketplacePlans();
      return plans.find(plan => plan.id === planId) || null;
    } catch (error) {
      console.error('HubSpot Marketplace Billing - Get plan error:', error);
      return null;
    }
  }

  /**
   * Process payment through HubSpot marketplace billing
   */
  async processMarketplacePayment(
    portalId: string,
    planId: string,
    amount: number,
    userId: string
  ): Promise<any> {
    try {
      console.log('HubSpot Marketplace Billing - Processing payment:', {
        portalId,
        planId,
        amount,
        userId
      });

      // Get user's HubSpot access token
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user?.hubspotAccessToken) {
        throw new HttpException('HubSpot not connected', HttpStatus.BAD_REQUEST);
      }

      // Process payment through HubSpot marketplace billing
      const payment = await this.processHubSpotPayment(portalId, planId, amount, user.hubspotAccessToken);

      // Log the payment
      await this.prisma.auditLog.create({
        data: {
          action: 'marketplace_payment_processed',
          entityType: 'payment',
          entityId: payment.id,
          newValue: {
            portalId,
            planId,
            amount,
            status: payment.status,
            hubspotPaymentId: payment.id
          }
        }
      });

      console.log('HubSpot Marketplace Billing - Payment processed:', payment.id);
      return payment;

    } catch (error) {
      console.error('HubSpot Marketplace Billing - Process payment error:', error);
      throw new HttpException('Payment processing failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get payment history for a portal
   */
  async getPaymentHistory(portalId: string, userId: string): Promise<HubSpotBillingPayment[]> {
    try {
      console.log('HubSpot Marketplace Billing - Getting payment history:', portalId);

      // Get user's HubSpot access token
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user?.hubspotAccessToken) {
        throw new HttpException('HubSpot not connected', HttpStatus.BAD_REQUEST);
      }

      // Get payment history from HubSpot
      const payments = await this.getHubSpotPaymentHistory(portalId, user.hubspotAccessToken);

      console.log('HubSpot Marketplace Billing - Payment history retrieved:', payments.length);
      return payments;

    } catch (error) {
      console.error('HubSpot Marketplace Billing - Get payment history error:', error);
      throw new HttpException('Failed to get payment history', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Create invoice through HubSpot marketplace billing
   */
  async createInvoice(
    portalId: string,
    amount: number,
    description: string,
    userId: string
  ): Promise<any> {
    try {
      console.log('HubSpot Marketplace Billing - Creating invoice:', {
        portalId,
        amount,
        description,
        userId
      });

      // Get user's HubSpot access token
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user?.hubspotAccessToken) {
        throw new HttpException('HubSpot not connected', HttpStatus.BAD_REQUEST);
      }

      // Create invoice through HubSpot
      const invoice = await this.createHubSpotInvoice(portalId, amount, description, user.hubspotAccessToken);

      // Log the invoice creation
      await this.prisma.auditLog.create({
        data: {
          action: 'marketplace_invoice_created',
          entityType: 'invoice',
          entityId: invoice.id,
          newValue: {
            portalId,
            amount,
            description,
            hubspotInvoiceId: invoice.id
          }
        }
      });

      console.log('HubSpot Marketplace Billing - Invoice created:', invoice.id);
      return invoice;

    } catch (error) {
      console.error('HubSpot Marketplace Billing - Create invoice error:', error);
      throw new HttpException('Failed to create invoice', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Handle subscription webhook events from HubSpot marketplace
   */
  async handleSubscriptionWebhook(event: any): Promise<any> {
    try {
      console.log('HubSpot Marketplace Billing - Webhook event received:', event);

      const eventType = event.eventType || event.type;
      const portalId = event.portalId;
      const planId = event.planId;

      switch (eventType) {
        case 'subscription.created':
          return await this.handleSubscriptionCreated(event);

        case 'subscription.updated':
          return await this.handleSubscriptionUpdated(event);

        case 'subscription.canceled':
          return await this.handleSubscriptionCanceled(event);

        case 'payment.succeeded':
          return await this.handlePaymentSucceeded(event);

        case 'payment.failed':
          return await this.handlePaymentFailed(event);

        case 'invoice.created':
          return await this.handleInvoiceCreated(event);

        case 'invoice.paid':
          return await this.handleInvoicePaid(event);

        default:
          console.log('HubSpot Marketplace Billing - Unknown webhook event:', eventType);
          return { success: true, message: 'Event received' };
      }

    } catch (error) {
      console.error('HubSpot Marketplace Billing - Webhook error:', error);
      throw new HttpException('Webhook processing failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Handle subscription created event
   */
  private async handleSubscriptionCreated(event: any) {
    try {
      const { portalId, planId, userId } = event;

      // Find user by portal ID
      const user = await this.prisma.user.findFirst({
        where: { hubspotPortalId: portalId }
      });

      if (user) {
        await this.prisma.subscription.upsert({
          where: { userId: user.id },
          update: {
            planId: planId,
            status: 'active'
          },
          create: {
            userId: user.id,
            planId: planId,
            status: 'active'
          }
        });
      }

      console.log('HubSpot Marketplace Billing - Subscription created for portal:', portalId);
      return { success: true, message: 'Subscription created' };

    } catch (error) {
      console.error('HubSpot Marketplace Billing - Handle subscription created error:', error);
      throw error;
    }
  }

  /**
   * Handle subscription updated event
   */
  private async handleSubscriptionUpdated(event: any) {
    try {
      const { portalId, planId, status } = event;

      const users = await this.prisma.user.findMany({
        where: { hubspotPortalId: portalId }
      });

      for (const user of users) {
        await this.prisma.subscription.updateMany({
          where: { userId: user.id },
          data: {
            planId: planId || 'professional',
            status: status || 'active'
          }
        });
      }

      console.log('HubSpot Marketplace Billing - Subscription updated for portal:', portalId);
      return { success: true, message: 'Subscription updated' };

    } catch (error) {
      console.error('HubSpot Marketplace Billing - Handle subscription updated error:', error);
      throw error;
    }
  }

  /**
   * Handle subscription canceled event
   */
  private async handleSubscriptionCanceled(event: any) {
    try {
      const { portalId } = event;

      const users = await this.prisma.user.findMany({
        where: { hubspotPortalId: portalId }
      });

      for (const user of users) {
        await this.prisma.subscription.updateMany({
          where: { userId: user.id },
          data: { status: 'canceled' }
        });
      }

      console.log('HubSpot Marketplace Billing - Subscription canceled for portal:', portalId);
      return { success: true, message: 'Subscription canceled' };

    } catch (error) {
      console.error('HubSpot Marketplace Billing - Handle subscription canceled error:', error);
      throw error;
    }
  }

  /**
   * Handle payment succeeded event
   */
  private async handlePaymentSucceeded(event: any) {
    try {
      const { portalId, amount, planId, paymentId } = event;

      // Log successful payment
      await this.prisma.auditLog.create({
        data: {
          action: 'marketplace_payment_succeeded',
          entityType: 'payment',
          entityId: paymentId || portalId,
          newValue: { portalId, amount, planId, status: 'succeeded', paymentId }
        }
      });

      console.log('HubSpot Marketplace Billing - Payment succeeded for portal:', portalId);
      return { success: true, message: 'Payment succeeded' };

    } catch (error) {
      console.error('HubSpot Marketplace Billing - Handle payment succeeded error:', error);
      throw error;
    }
  }

  /**
   * Handle payment failed event
   */
  private async handlePaymentFailed(event: any) {
    try {
      const { portalId, amount, planId, reason, paymentId } = event;

      // Log failed payment
      await this.prisma.auditLog.create({
        data: {
          action: 'marketplace_payment_failed',
          entityType: 'payment',
          entityId: paymentId || portalId,
          newValue: { portalId, amount, planId, reason, status: 'failed', paymentId }
        }
      });

      console.log('HubSpot Marketplace Billing - Payment failed for portal:', portalId);
      return { success: true, message: 'Payment failed logged' };

    } catch (error) {
      console.error('HubSpot Marketplace Billing - Handle payment failed error:', error);
      throw error;
    }
  }

  /**
   * Handle invoice created event
   */
  private async handleInvoiceCreated(event: any) {
    try {
      const { portalId, amount, description, invoiceId } = event;

      // Log invoice creation
      await this.prisma.auditLog.create({
        data: {
          action: 'marketplace_invoice_created',
          entityType: 'invoice',
          entityId: invoiceId,
          newValue: { portalId, amount, description, status: 'created' }
        }
      });

      console.log('HubSpot Marketplace Billing - Invoice created for portal:', portalId);
      return { success: true, message: 'Invoice created' };

    } catch (error) {
      console.error('HubSpot Marketplace Billing - Handle invoice created error:', error);
      throw error;
    }
  }

  /**
   * Handle invoice paid event
   */
  private async handleInvoicePaid(event: any) {
    try {
      const { portalId, amount, invoiceId } = event;

      // Log invoice payment
      await this.prisma.auditLog.create({
        data: {
          action: 'marketplace_invoice_paid',
          entityType: 'invoice',
          entityId: invoiceId,
          newValue: { portalId, amount, status: 'paid' }
        }
      });

      console.log('HubSpot Marketplace Billing - Invoice paid for portal:', portalId);
      return { success: true, message: 'Invoice paid' };

    } catch (error) {
      console.error('HubSpot Marketplace Billing - Handle invoice paid error:', error);
      throw error;
    }
  }

  // HubSpot API calls using actual HubSpot billing endpoints
  private async createHubSpotSubscription(portalId: string, planId: string, accessToken: string): Promise<MarketplaceSubscription> {
    try {
      const response = await axios.post(
        `https://api.hubapi.com/integrations/v1/${portalId}/subscriptions`,
        {
          planId,
          portalId,
          status: 'active'
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const subscription: HubSpotBillingSubscription = response.data;
      
      return {
        id: subscription.id,
        portalId: subscription.portalId,
        planId: subscription.planId,
        status: subscription.status as any,
        currentPeriodStart: new Date(subscription.currentPeriodStart),
        currentPeriodEnd: new Date(subscription.currentPeriodEnd),
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      };
    } catch (error) {
      console.error('HubSpot API - Create subscription error:', error.response?.data || error.message);
      throw new HttpException('Failed to create HubSpot subscription', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async cancelHubSpotSubscription(portalId: string, accessToken: string): Promise<any> {
    try {
      const response = await axios.post(
        `https://api.hubapi.com/integrations/v1/${portalId}/subscriptions/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('HubSpot API - Cancel subscription error:', error.response?.data || error.message);
      throw new HttpException('Failed to cancel HubSpot subscription', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async getHubSpotSubscription(portalId: string): Promise<MarketplaceSubscription | null> {
    try {
      // First get the user to get their access token
      const user = await this.prisma.user.findFirst({
        where: { hubspotPortalId: portalId }
      });

      if (!user?.hubspotAccessToken) {
        return null;
      }

      const response = await axios.get(
        `https://api.hubapi.com/integrations/v1/${portalId}/subscriptions`,
        {
          headers: {
            'Authorization': `Bearer ${user.hubspotAccessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.length > 0) {
        const subscription: HubSpotBillingSubscription = response.data[0];
        
        return {
          id: subscription.id,
          portalId: subscription.portalId,
          planId: subscription.planId,
          status: subscription.status as any,
          currentPeriodStart: new Date(subscription.currentPeriodStart),
          currentPeriodEnd: new Date(subscription.currentPeriodEnd),
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
        };
      }

      return null;
    } catch (error) {
      console.error('HubSpot API - Get subscription error:', error.response?.data || error.message);
      return null;
    }
  }

  private async processHubSpotPayment(portalId: string, planId: string, amount: number, accessToken: string): Promise<any> {
    try {
      const response = await axios.post(
        `https://api.hubapi.com/integrations/v1/${portalId}/payments`,
        {
          amount,
          planId,
          portalId,
          currency: 'USD'
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('HubSpot API - Process payment error:', error.response?.data || error.message);
      throw new HttpException('Failed to process HubSpot payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async getHubSpotPaymentHistory(portalId: string, accessToken: string): Promise<HubSpotBillingPayment[]> {
    try {
      const response = await axios.get(
        `https://api.hubapi.com/integrations/v1/${portalId}/payments`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data || [];
    } catch (error) {
      console.error('HubSpot API - Get payment history error:', error.response?.data || error.message);
      return [];
    }
  }

  private async createHubSpotInvoice(portalId: string, amount: number, description: string, accessToken: string): Promise<any> {
    try {
      const response = await axios.post(
        `https://api.hubapi.com/integrations/v1/${portalId}/invoices`,
        {
          amount,
          description,
          portalId,
          currency: 'USD'
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('HubSpot API - Create invoice error:', error.response?.data || error.message);
      throw new HttpException('Failed to create HubSpot invoice', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 