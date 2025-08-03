import { Controller, Get, Post, Body, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { HubSpotBillingService } from '../services/hubspot-billing.service';

@Controller('hubspot-billing')
export class HubSpotBillingController {
  constructor(private readonly hubSpotBillingService: HubSpotBillingService) {}
  
  @Get('subscription-status')
  @UseGuards(JwtAuthGuard)
  async getSubscriptionStatus(@Req() req: Request) {
    try {
      const user = (req.user as any);
      if (!user?.id) {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }

      const status = await this.hubSpotBillingService.getSubscriptionStatus(user.id);
      return status;
    } catch (error) {
      console.error('HubSpot Billing Controller - Error getting subscription status:', error);
      throw new HttpException(
        error.message || 'Failed to get subscription status',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('create-subscription')
  @UseGuards(JwtAuthGuard)
  async createSubscription(@Req() req: Request, @Body() body: { planId: string }) {
    try {
      const user = (req.user as any);
      if (!user?.id) {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }

      const subscription = await this.hubSpotBillingService.createSubscription(user.id, body.planId);
      return subscription;
    } catch (error) {
      console.error('HubSpot Billing Controller - Error creating subscription:', error);
      throw new HttpException(
        error.message || 'Failed to create subscription',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('cancel-subscription')
  @UseGuards(JwtAuthGuard)
  async cancelSubscription(@Req() req: Request) {
    try {
      const user = (req.user as any);
      if (!user?.id) {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }

      const result = await this.hubSpotBillingService.cancelSubscription(user.id);
      return result;
    } catch (error) {
      console.error('HubSpot Billing Controller - Error canceling subscription:', error);
      throw new HttpException(
        error.message || 'Failed to cancel subscription',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('available-plans')
  @UseGuards(JwtAuthGuard)
  async getAvailablePlans(@Req() req: Request) {
    try {
      const plans = await this.hubSpotBillingService.getAvailablePlans();
      return plans;
    } catch (error) {
      console.error('HubSpot Billing Controller - Error getting available plans:', error);
      throw new HttpException(
        error.message || 'Failed to get available plans',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('process-payment')
  @UseGuards(JwtAuthGuard)
  async processPayment(@Req() req: Request, @Body() body: { amount: number; planId: string }) {
    try {
      const user = (req.user as any);
      if (!user?.id) {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }

      const payment = await this.hubSpotBillingService.processPayment(user.id, body.amount, body.planId);
      return payment;
    } catch (error) {
      console.error('HubSpot Billing Controller - Error processing payment:', error);
      throw new HttpException(
        error.message || 'Failed to process payment',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('create-invoice')
  @UseGuards(JwtAuthGuard)
  async createInvoice(@Req() req: Request, @Body() body: { amount: number; description: string }) {
    try {
      const user = (req.user as any);
      if (!user?.id) {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }

      const invoice = await this.hubSpotBillingService.createInvoice(user.id, body.amount, body.description);
      return invoice;
    } catch (error) {
      console.error('HubSpot Billing Controller - Error creating invoice:', error);
      throw new HttpException(
        error.message || 'Failed to create invoice',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 