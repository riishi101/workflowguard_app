import {
  Controller,
  Get,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getSubscription(@Req() req: any) {
    try {
      let userId = req.user?.sub || req.user?.id || req.user?.userId;
      if (!userId) {
        userId = req.headers['x-user-id'];
      }

      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      const subscription =
        await this.subscriptionService.getUserSubscription(userId);
      return {
        success: true,
        data: subscription,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get subscription: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('trial-status')
  @UseGuards(JwtAuthGuard)
  async getTrialStatus(@Req() req: any) {
    try {
      const userId = req.user.sub || req.user.id || req.user.userId;
      const trialStatus = await this.subscriptionService.getTrialStatus(userId);

      return {
        success: true,
        data: trialStatus,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to get trial status: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Get('expiration-status')
  @UseGuards(JwtAuthGuard)
  async getExpirationStatus(@Req() req: any) {
    try {
      const userId = req.user.sub || req.user.id || req.user.userId;
      const expirationStatus =
        await this.subscriptionService.checkSubscriptionExpiration(userId);

      return {
        success: true,
        data: expirationStatus,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to get expiration status: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Get('next-payment')
  @UseGuards(JwtAuthGuard)
  async getNextPaymentInfo(@Req() req: any) {
    try {
      const userId = req.user.sub || req.user.id || req.user.userId;
      const paymentInfo =
        await this.subscriptionService.getNextPaymentInfo(userId);

      return {
        success: true,
        data: paymentInfo,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to get payment info: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Get('usage')
  @UseGuards(JwtAuthGuard)
  async getUsageStats(@Req() req: any) {
    try {
      let userId = req.user?.sub || req.user?.id || req.user?.userId;
      if (!userId) {
        userId = req.headers['x-user-id'];
      }

      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      const usageStats = await this.subscriptionService.getUsageStats(userId);
      return {
        success: true,
        data: usageStats,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get usage stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
