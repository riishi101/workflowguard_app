import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HubSpotMarketplaceBillingService } from '../services/hubspot-marketplace-billing.service';

@Controller('hubspot-billing')
export class HubSpotBillingController {
  constructor(private readonly billingService: HubSpotMarketplaceBillingService) {}

  /**
   * Get available plans
   */
  @Get('plans')
  @UseGuards(JwtAuthGuard)
  async getAvailablePlans(@Req() req: Request) {
    try {
      const plans = await this.billingService.getMarketplacePlans();
      return {
        success: true,
        data: plans,
        message: 'Available plans retrieved successfully'
      };
    } catch (error) {
      console.error('HubSpot Billing - Get plans error:', error);
      throw new HttpException('Failed to get available plans', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Create a subscription
   */
  @Post('subscriptions')
  @UseGuards(JwtAuthGuard)
  async createSubscription(
    @Body() body: { planId: string },
    @Req() req: Request
  ) {
    try {
      const userId = (req.user as any)?.sub || (req.user as any)?.id;
      const user = await this.getUserWithPortalId(userId);

      const subscription = await this.billingService.createMarketplaceSubscription(
        user.hubspotPortalId,
        body.planId,
        userId
      );

      return {
        success: true,
        data: subscription,
        message: 'Subscription created successfully'
      };
    } catch (error) {
      console.error('HubSpot Billing - Create subscription error:', error);
      throw new HttpException(
        error.message || 'Failed to create subscription',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Cancel a subscription
   */
  @Post('subscriptions/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelSubscription(@Req() req: Request) {
    try {
      const userId = (req.user as any)?.sub || (req.user as any)?.id;
      const user = await this.getUserWithPortalId(userId);

      const result = await this.billingService.cancelMarketplaceSubscription(
        user.hubspotPortalId,
        userId
      );

      return {
        success: true,
        data: result,
        message: 'Subscription canceled successfully'
      };
    } catch (error) {
      console.error('HubSpot Billing - Cancel subscription error:', error);
      throw new HttpException(
        error.message || 'Failed to cancel subscription',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get subscription status
   */
  @Get('subscriptions/status')
  @UseGuards(JwtAuthGuard)
  async getSubscriptionStatus(@Req() req: Request) {
    try {
      const userId = (req.user as any)?.sub || (req.user as any)?.id;
      const user = await this.getUserWithPortalId(userId);

      const subscription = await this.billingService.getMarketplaceSubscriptionStatus(
        user.hubspotPortalId
      );

      return {
        success: true,
        data: subscription,
        message: 'Subscription status retrieved successfully'
      };
    } catch (error) {
      console.error('HubSpot Billing - Get subscription status error:', error);
      throw new HttpException(
        error.message || 'Failed to get subscription status',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Process a payment
   */
  @Post('payments')
  @UseGuards(JwtAuthGuard)
  async processPayment(
    @Body() body: { planId: string; amount: number },
    @Req() req: Request
  ) {
    try {
      const userId = (req.user as any)?.sub || (req.user as any)?.id;
      const user = await this.getUserWithPortalId(userId);

      const payment = await this.billingService.processMarketplacePayment(
        user.hubspotPortalId,
        body.planId,
        body.amount,
        userId
      );

      return {
        success: true,
        data: payment,
        message: 'Payment processed successfully'
      };
    } catch (error) {
      console.error('HubSpot Billing - Process payment error:', error);
      throw new HttpException(
        error.message || 'Failed to process payment',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get payment history
   */
  @Get('payments/history')
  @UseGuards(JwtAuthGuard)
  async getPaymentHistory(@Req() req: Request) {
    try {
      const userId = (req.user as any)?.sub || (req.user as any)?.id;
      const user = await this.getUserWithPortalId(userId);

      const payments = await this.billingService.getPaymentHistory(
        user.hubspotPortalId,
        userId
      );

      return {
        success: true,
        data: payments,
        message: 'Payment history retrieved successfully'
      };
    } catch (error) {
      console.error('HubSpot Billing - Get payment history error:', error);
      throw new HttpException(
        error.message || 'Failed to get payment history',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Create an invoice
   */
  @Post('invoices')
  @UseGuards(JwtAuthGuard)
  async createInvoice(
    @Body() body: { amount: number; description: string },
    @Req() req: Request
  ) {
    try {
      const userId = (req.user as any)?.sub || (req.user as any)?.id;
      const user = await this.getUserWithPortalId(userId);

      const invoice = await this.billingService.createInvoice(
        user.hubspotPortalId,
        body.amount,
        body.description,
        userId
      );

      return {
        success: true,
        data: invoice,
        message: 'Invoice created successfully'
      };
    } catch (error) {
      console.error('HubSpot Billing - Create invoice error:', error);
      throw new HttpException(
        error.message || 'Failed to create invoice',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get billing summary
   */
  @Get('summary')
  @UseGuards(JwtAuthGuard)
  async getBillingSummary(@Req() req: Request) {
    try {
      const userId = (req.user as any)?.sub || (req.user as any)?.id;
      const user = await this.getUserWithPortalId(userId);

      // Get subscription status
      const subscription = await this.billingService.getMarketplaceSubscriptionStatus(
        user.hubspotPortalId
      );

      // Get payment history
      const payments = await this.billingService.getPaymentHistory(
        user.hubspotPortalId,
        userId
      );

      // Get available plans
      const plans = await this.billingService.getMarketplacePlans();

      const summary = {
        subscription,
        payments: payments.slice(0, 5), // Last 5 payments
        totalPayments: payments.length,
        totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
        availablePlans: plans,
        currentPlan: subscription ? plans.find(p => p.id === subscription.planId) : null
      };

      return {
        success: true,
        data: summary,
        message: 'Billing summary retrieved successfully'
      };
    } catch (error) {
      console.error('HubSpot Billing - Get billing summary error:', error);
      throw new HttpException(
        error.message || 'Failed to get billing summary',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Upgrade subscription
   */
  @Post('upgrade')
  @UseGuards(JwtAuthGuard)
  async upgradeSubscription(
    @Body() body: { planId: string },
    @Req() req: Request
  ) {
    try {
      const userId = (req.user as any)?.sub || (req.user as any)?.id;
      const user = await this.getUserWithPortalId(userId);

      // Get current subscription
      const currentSubscription = await this.billingService.getMarketplaceSubscriptionStatus(
        user.hubspotPortalId
      );

      if (currentSubscription) {
        // Cancel current subscription
        await this.billingService.cancelMarketplaceSubscription(
          user.hubspotPortalId,
          userId
        );
      }

      // Create new subscription
      const newSubscription = await this.billingService.createMarketplaceSubscription(
        user.hubspotPortalId,
        body.planId,
        userId
      );

      return {
        success: true,
        data: newSubscription,
        message: 'Subscription upgraded successfully'
      };
    } catch (error) {
      console.error('HubSpot Billing - Upgrade subscription error:', error);
      throw new HttpException(
        error.message || 'Failed to upgrade subscription',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Downgrade subscription
   */
  @Post('downgrade')
  @UseGuards(JwtAuthGuard)
  async downgradeSubscription(
    @Body() body: { planId: string },
    @Req() req: Request
  ) {
    try {
      const userId = (req.user as any)?.sub || (req.user as any)?.id;
      const user = await this.getUserWithPortalId(userId);

      // Get current subscription
      const currentSubscription = await this.billingService.getMarketplaceSubscriptionStatus(
        user.hubspotPortalId
      );

      if (!currentSubscription) {
        throw new HttpException('No active subscription found', HttpStatus.BAD_REQUEST);
      }

      // Cancel current subscription
      await this.billingService.cancelMarketplaceSubscription(
        user.hubspotPortalId,
        userId
      );

      // Create new subscription
      const newSubscription = await this.billingService.createMarketplaceSubscription(
        user.hubspotPortalId,
        body.planId,
        userId
      );

      return {
        success: true,
        data: newSubscription,
        message: 'Subscription downgraded successfully'
      };
    } catch (error) {
      console.error('HubSpot Billing - Downgrade subscription error:', error);
      throw new HttpException(
        error.message || 'Failed to downgrade subscription',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Helper method to get user with portal ID
   */
  private async getUserWithPortalId(userId: string) {
    // This would typically use a user service
    // For now, we'll use the billing service's prisma instance
    const user = await (this.billingService as any).prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (!user.hubspotPortalId) {
      throw new HttpException('HubSpot not connected', HttpStatus.BAD_REQUEST);
    }

    return user;
  }
} 