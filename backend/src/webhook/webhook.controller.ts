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
  HttpCode,
  Headers,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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

  @Post('hubspot')
  @HttpCode(HttpStatus.OK)
  async handleHubSpotWebhook(@Body() body: any, @Headers() headers: any) {
    try {
      console.log(
        '🔔 Received HubSpot webhook:',
        JSON.stringify(body, null, 2),
      );

      // Verify webhook signature if needed
      const signature =
        headers['x-hubspot-signature-v3'] || headers['x-hubspot-signature'];
      if (signature && process.env.HUBSPOT_WEBHOOK_SECRET) {
        // Add signature verification logic here if needed
      }

      // Handle workflow update events
      if (body.subscriptionType === 'automation.workflow.updated') {
        const { portalId, objectId: workflowId } = body;

        if (portalId && workflowId) {
          console.log(
            `📝 Webhook: Processing workflow update for portal ${portalId}, workflow ${workflowId}`,
          );
          // Note: Workflow update handling will be processed by the workflow service
          // This webhook confirms receipt but actual processing happens via the workflow service
        }
      }

      // Handle workflow deletion events
      if (body.subscriptionType === 'automation.workflow.deleted') {
        const { portalId, objectId: workflowId } = body;

        if (portalId && workflowId) {
          console.log(
            `🗑️ Webhook: Processing workflow deletion for portal ${portalId}, workflow ${workflowId}`,
          );

          // Import WorkflowService dynamically to avoid circular dependencies
          const { WorkflowService } = await import(
            '../workflow/workflow.service'
          );
          const { EncryptionService } = await import(
            '../services/encryption.service'
          );
          const { PrismaService } = await import('../prisma/prisma.service');
          const { HubSpotService } = await import(
            '../services/hubspot.service'
          );
          const { SubscriptionService } = await import(
            '../subscription/subscription.service'
          );
          const { WorkflowVersionService } = await import(
            '../workflow-version/workflow-version.service'
          );

          const prismaService = new PrismaService();
          const hubspotService = new HubSpotService(prismaService);
          const subscriptionService = new SubscriptionService(prismaService);
          const workflowVersionService = new WorkflowVersionService(
            prismaService,
          );
          const encryptionService = new EncryptionService();
          const workflowService = new WorkflowService(
            prismaService,
            hubspotService,
            subscriptionService,
            workflowVersionService,
            encryptionService,
          );

          // Handle workflow deletion
          await workflowService.handleWorkflowDeletion(portalId, workflowId);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Error handling HubSpot webhook:', error);
      return { success: false, error: error.message };
    }
  }
}
