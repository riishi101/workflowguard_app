import {
  Controller,
  Get,
  Post,
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

  @Get('billing-history')
  @UseGuards(JwtAuthGuard)
  async getBillingHistory(@Req() req: any) {
    try {
      let userId = req.user?.sub || req.user?.id || req.user?.userId;
      if (!userId) {
        userId = req.headers['x-user-id'];
      }

      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      const billingHistory = await this.subscriptionService.getBillingHistory(userId);
      return {
        success: true,
        data: billingHistory,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get billing history: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  async cancelSubscription(@Req() req: any) {
    try {
      let userId = req.user?.sub || req.user?.id || req.user?.userId;
      if (!userId) {
        userId = req.headers['x-user-id'];
      }

      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      const result = await this.subscriptionService.cancelSubscription(userId);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to cancel subscription: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('billing-history/export')
  @UseGuards(JwtAuthGuard)
  async exportBillingHistory(@Req() req: any) {
    try {
      let userId = req.user?.sub || req.user?.id || req.user?.userId;
      if (!userId) {
        userId = req.headers['x-user-id'];
      }

      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      const csvData = await this.subscriptionService.exportBillingHistoryCSV(userId);
      return {
        success: true,
        data: csvData,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to export billing history: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('payment-method-update-url')
  @UseGuards(JwtAuthGuard)
  async getPaymentMethodUpdateUrl(@Req() req: any) {
    try {
      let userId = req.user?.sub || req.user?.id || req.user?.userId;
      if (!userId) {
        userId = req.headers['x-user-id'];
      }

      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      const updateUrl = await this.subscriptionService.getPaymentMethodUpdateUrl(userId);
      return {
        success: true,
        data: { updateUrl },
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get payment method update URL: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('invoice/:invoiceId')
  @UseGuards(JwtAuthGuard)
  async getInvoice(@Req() req: any) {
    try {
      let userId = req.user?.sub || req.user?.id || req.user?.userId;
      if (!userId) {
        userId = req.headers['x-user-id'];
      }

      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      const invoiceId = req.params.invoiceId;
      const invoiceUrl = await this.subscriptionService.getInvoice(userId, invoiceId);
      return {
        success: true,
        data: { invoiceUrl },
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get invoice: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
