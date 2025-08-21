import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get()
  async getUserWebhooks(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const webhooks = await this.webhookService.getUserWebhooks(userId);
      return {
        success: true,
        data: webhooks,
        message: 'Webhooks retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get webhooks: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async createWebhook(@Body() webhookData: any, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const webhook = await this.webhookService.createWebhook(
        userId,
        webhookData,
      );
      return {
        success: true,
        data: webhook,
        message: 'Webhook created successfully',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to create webhook: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async updateWebhook(
    @Param('id') webhookId: string,
    @Body() webhookData: any,
    @Req() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const webhook = await this.webhookService.updateWebhook(
        webhookId,
        userId,
        webhookData,
      );
      return {
        success: true,
        data: webhook,
        message: 'Webhook updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to update webhook: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteWebhook(@Param('id') webhookId: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      await this.webhookService.deleteWebhook(webhookId, userId);
      return {
        success: true,
        message: 'Webhook deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to delete webhook: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
