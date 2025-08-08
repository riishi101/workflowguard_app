import { Controller, Get, Post, Body, Param, Query, Res, Req, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { Public } from '../auth/public.decorator';

@Controller('hubspot-marketplace')
export class HubSpotMarketplaceController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService
  ) {}

  /**
   * Handle HubSpot App Marketplace installation
   * This endpoint is called when a user installs the app from HubSpot marketplace
   */
  @Public()
  @Get('install')
  async handleAppInstallation(
    @Query('portalId') portalId: string,
    @Query('userId') userId: string,
    @Query('userEmail') userEmail: string,
    @Query('userName') userName: string,
    @Res() res: Response
  ) {
    try {
      console.log('HubSpot Marketplace - App installation initiated:', {
        portalId,
        userId,
        userEmail,
        userName
      });

      if (!portalId || !userEmail) {
        console.error('HubSpot Marketplace - Missing required parameters');
        return res.redirect('https://www.workflowguard.pro?error=missing_params');
      }

      // Check if user already exists
      let user = await this.prisma.user.findUnique({
        where: { email: userEmail }
      });

      if (!user) {
        // Create new user from marketplace installation
        user = await this.prisma.user.create({
          data: {
            email: userEmail,
            name: userName || userEmail.split('@')[0],
            hubspotPortalId: portalId,
            // Note: Access tokens will be obtained through OAuth flow
          },
        });

        // Create trial subscription for marketplace user
        await this.userService.createTrialSubscription(user.id);

        console.log('HubSpot Marketplace - New user created:', user.id);
      } else {
        // Update existing user's portal ID
        await this.prisma.user.update({
          where: { id: user.id },
          data: { hubspotPortalId: portalId }
        });

        console.log('HubSpot Marketplace - Existing user updated:', user.id);
      }

      // Generate JWT token for the user
      const token = this.authService.generateToken(user);

      // Redirect to OAuth flow to get HubSpot access tokens
      const oauthUrl = `https://app-na2.hubspot.com/oauth/authorize?client_id=${process.env.HUBSPOT_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.HUBSPOT_REDIRECT_URI)}&scope=${encodeURIComponent('automation oauth crm.objects.companies.read crm.objects.contacts.read crm.objects.deals.read crm.schemas.companies.read crm.schemas.contacts.read crm.schemas.deals.read')}&state=${encodeURIComponent(JSON.stringify({ marketplaceInstall: true, userId: user.id }))}`;

      console.log('HubSpot Marketplace - Redirecting to OAuth flow');
      return res.redirect(oauthUrl);

    } catch (error) {
      console.error('HubSpot Marketplace - Installation error:', error);
      return res.redirect('https://www.workflowguard.pro?error=installation_failed');
    }
  }

  /**
   * Handle HubSpot App Marketplace uninstallation
   * This endpoint is called when a user uninstalls the app from HubSpot marketplace
   */
  @Public()
  @Post('uninstall')
  async handleAppUninstallation(
    @Body() body: { portalId: string; userId?: string },
    @Req() req: Request
  ) {
    try {
      console.log('HubSpot Marketplace - App uninstallation initiated:', body);

      const { portalId, userId } = body;

      if (!portalId) {
        throw new HttpException('Portal ID is required', HttpStatus.BAD_REQUEST);
      }

      // Find users associated with this portal
      const users = await this.prisma.user.findMany({
        where: { hubspotPortalId: portalId }
      });

      if (users.length === 0) {
        console.log('HubSpot Marketplace - No users found for portal:', portalId);
        return { success: true, message: 'No users found for this portal' };
      }

      // Revoke HubSpot tokens and update user status
      for (const user of users) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            hubspotAccessToken: null,
            hubspotRefreshToken: null,
            hubspotTokenExpiresAt: null,
            // Don't delete the user account, just revoke access
          }
        });

        // Cancel any active subscriptions
        await this.prisma.subscription.updateMany({
          where: { userId: user.id },
          data: { status: 'cancelled' }
        });

        console.log('HubSpot Marketplace - User access revoked:', user.id);
      }

      // Log the uninstallation
      await this.prisma.auditLog.create({
        data: {
          action: 'app_uninstalled',
          entityType: 'portal',
          entityId: portalId,
          newValue: { portalId, uninstalledAt: new Date() }
        }
      });

      console.log('HubSpot Marketplace - App uninstallation completed for portal:', portalId);
      return { success: true, message: 'App uninstalled successfully' };

    } catch (error) {
      console.error('HubSpot Marketplace - Uninstallation error:', error);
      throw new HttpException('Failed to uninstall app', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * App status endpoint for HubSpot marketplace
   * This endpoint is called by HubSpot to check if the app is healthy
   */
  @Public()
  @Get('status')
  async getAppStatus() {
    try {
      // Check database connectivity
      const dbStatus = await this.checkDatabaseStatus();
      
      // Check HubSpot API connectivity
      const hubspotStatus = await this.checkHubSpotStatus();

      const status = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: dbStatus,
        hubspot: hubspotStatus,
        features: {
          workflow_protection: true,
          version_history: true,
          rollback: true,
          automated_backups: true,
          audit_logs: true
        }
      };

      console.log('HubSpot Marketplace - App status check:', status);
      return status;

    } catch (error) {
      console.error('HubSpot Marketplace - Status check error:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * App health check endpoint
   * This endpoint is called by HubSpot to verify app health
   */
  @Public()
  @Get('health')
  async getAppHealth() {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
      };

      console.log('HubSpot Marketplace - Health check:', health);
      return health;

    } catch (error) {
      console.error('HubSpot Marketplace - Health check error:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Get app configuration for HubSpot marketplace
   */
  @Public()
  @Get('config')
  async getAppConfig() {
    try {
      const config = {
        name: 'WorkflowGuard',
        description: 'Protect and manage your HubSpot workflows',
        version: '1.0.0',
        scopes: [
          'automation',
          'crm.objects.contacts.read',
          'crm.objects.companies.read',
          'crm.objects.deals.read',
          'crm.schemas.contacts.read',
          'crm.schemas.companies.read',
          'crm.schemas.deals.read',
          'oauth'
        ],
        features: [
          'workflow_protection',
          'version_history',
          'rollback',
          'automated_backups',
          'audit_logs',
          'change_notifications',
          'compliance_reporting'
        ],
        pricing: {
          starter: { price: 19, interval: 'month', workflows: 10 },
          professional: { price: 49, interval: 'month', workflows: 35 },
          enterprise: { price: 99, interval: 'month', workflows: 'unlimited' }
        }
      };

      console.log('HubSpot Marketplace - App config requested');
      return config;

    } catch (error) {
      console.error('HubSpot Marketplace - Config error:', error);
      throw new HttpException('Failed to get app config', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Handle marketplace webhook events
   */
  @Public()
  @Post('webhook')
  async handleMarketplaceWebhook(
    @Body() body: any,
    @Req() req: Request
  ) {
    try {
      console.log('HubSpot Marketplace - Webhook received:', body);

      const eventType = body.subscriptionType || body.eventType;

      switch (eventType) {
        case 'app.installed':
          return await this.handleAppInstallation(
            body.portalId,
            body.userId,
            body.userEmail,
            body.userName,
            null as any
          );

        case 'app.uninstalled':
          return await this.handleAppUninstallation(body);

        case 'subscription.updated':
          return await this.handleSubscriptionUpdate(body);

        default:
          console.log('HubSpot Marketplace - Unknown webhook event:', eventType);
          return { success: true, message: 'Event received' };
      }

    } catch (error) {
      console.error('HubSpot Marketplace - Webhook error:', error);
      throw new HttpException('Webhook processing failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Handle subscription updates from marketplace
   */
  private async handleSubscriptionUpdate(body: any) {
    try {
      const { portalId, planId, status } = body;

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

      console.log('HubSpot Marketplace - Subscription updated for portal:', portalId);
      return { success: true, message: 'Subscription updated' };

    } catch (error) {
      console.error('HubSpot Marketplace - Subscription update error:', error);
      throw error;
    }
  }

  /**
   * Check database connectivity
   */
  private async checkDatabaseStatus() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', connected: true };
    } catch (error) {
      return { status: 'unhealthy', connected: false, error: error.message };
    }
  }

  /**
   * Check HubSpot API connectivity
   */
  private async checkHubSpotStatus() {
    try {
      // Test HubSpot API connectivity
      const response = await fetch('https://api.hubapi.com/integrations/v1/me', {
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_TEST_TOKEN || 'test'}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        connected: response.ok,
        responseTime: Date.now()
      };
    } catch (error) {
      return { status: 'unhealthy', connected: false, error: error.message };
    }
  }
} 