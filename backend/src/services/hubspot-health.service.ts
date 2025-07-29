import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HubSpotService } from './hubspot.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

export interface HubSpotHealthMetrics {
  connectionStatus: 'healthy' | 'degraded' | 'unhealthy';
  apiResponseTime: number;
  errorRate: number;
  tokenRefreshSuccess: number;
  lastSyncTime: Date;
  activeConnections: number;
  failedRequests: number;
  rateLimitRemaining: number;
}

@Injectable()
export class HubSpotHealthService {
  private readonly logger = new Logger(HubSpotHealthService.name);
  private healthMetrics: HubSpotHealthMetrics = {
    connectionStatus: 'unhealthy',
    apiResponseTime: 0,
    errorRate: 0,
    tokenRefreshSuccess: 0,
    lastSyncTime: new Date(),
    activeConnections: 0,
    failedRequests: 0,
    rateLimitRemaining: 100,
  };

  constructor(
    private readonly hubSpotService: HubSpotService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async performHealthCheck() {
    try {
      this.logger.log('Starting HubSpot health check...');
      
      // Check active connections
      const activeUsers = await this.getActiveHubSpotUsers();
      this.healthMetrics.activeConnections = activeUsers.length;

      // Test connection for each active user
      let healthyConnections = 0;
      let totalResponseTime = 0;

      for (const user of activeUsers) {
        try {
          const startTime = Date.now();
          const isValid = await this.hubSpotService.validateConnection(user.id);
          const responseTime = Date.now() - startTime;
          
          if (isValid) {
            healthyConnections++;
          }
          
          totalResponseTime += responseTime;
        } catch (error) {
          this.logger.error(`Health check failed for user ${user.id}:`, error);
        }
      }

      // Update metrics
      this.healthMetrics.apiResponseTime = activeUsers.length > 0 ? totalResponseTime / activeUsers.length : 0;
      this.healthMetrics.errorRate = activeUsers.length > 0 ? (activeUsers.length - healthyConnections) / activeUsers.length : 0;
      
      // Determine connection status
      if (healthyConnections === activeUsers.length && activeUsers.length > 0) {
        this.healthMetrics.connectionStatus = 'healthy';
      } else if (healthyConnections > activeUsers.length * 0.5) {
        this.healthMetrics.connectionStatus = 'degraded';
      } else {
        this.healthMetrics.connectionStatus = 'unhealthy';
      }

      this.healthMetrics.lastSyncTime = new Date();
      
      this.logger.log(`Health check completed. Status: ${this.healthMetrics.connectionStatus}`);
      
      // Alert if unhealthy
      if (this.healthMetrics.connectionStatus === 'unhealthy') {
        await this.sendHealthAlert();
      }
      
    } catch (error) {
      this.logger.error('Health check failed:', error);
      this.healthMetrics.connectionStatus = 'unhealthy';
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async performTokenRefreshCheck() {
    try {
      this.logger.log('Starting token refresh check...');
      
      const usersWithTokens = await this.prisma.user.findMany({
        where: {
          hubspotRefreshToken: { not: null },
          hubspotTokenExpiresAt: { not: null },
        },
        select: { id: true, hubspotTokenExpiresAt: true },
      });

      let successfulRefreshes = 0;
      
      for (const user of usersWithTokens) {
        try {
          // Check if token needs refresh
          const expiresAt = user.hubspotTokenExpiresAt;
          const now = new Date();
          const bufferTime = 5 * 60 * 1000; // 5 minutes
          
          if (expiresAt && expiresAt.getTime() - now.getTime() < bufferTime) {
            // Token needs refresh
            await this.hubSpotService.getValidAccessToken(user.id);
            successfulRefreshes++;
          }
        } catch (error) {
          this.logger.error(`Token refresh failed for user ${user.id}:`, error);
        }
      }

      this.healthMetrics.tokenRefreshSuccess = successfulRefreshes;
      this.logger.log(`Token refresh check completed. Successful refreshes: ${successfulRefreshes}`);
      
    } catch (error) {
      this.logger.error('Token refresh check failed:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async performDataRetentionCleanup() {
    try {
      this.logger.log('Starting data retention cleanup...');
      
      const retentionDays = this.configService.get('hubspot.workflowVersionRetentionDays', 365);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Clean up old workflow versions
      const deletedVersions = await this.prisma.workflowVersion.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
        },
      });

      // Clean up old audit logs
      const auditRetentionDays = this.configService.get('hubspot.auditLogRetentionDays', 730);
      const auditCutoffDate = new Date();
      auditCutoffDate.setDate(auditCutoffDate.getDate() - auditRetentionDays);

      const deletedAuditLogs = await this.prisma.auditLog.deleteMany({
        where: {
          timestamp: { lt: auditCutoffDate },
        },
      });

      this.logger.log(`Data retention cleanup completed. Deleted ${deletedVersions.count} versions and ${deletedAuditLogs.count} audit logs`);
      
    } catch (error) {
      this.logger.error('Data retention cleanup failed:', error);
    }
  }

  async getHealthMetrics(): Promise<HubSpotHealthMetrics> {
    return this.healthMetrics;
  }

  async getActiveHubSpotUsers() {
    return this.prisma.user.findMany({
      where: {
        hubspotAccessToken: { not: null },
        hubspotPortalId: { not: null },
      },
      select: { id: true, email: true, hubspotPortalId: true },
    });
  }

  async getConnectionStatus(userId: string): Promise<boolean> {
    try {
      return await this.hubSpotService.validateConnection(userId);
    } catch (error) {
      this.logger.error(`Connection status check failed for user ${userId}:`, error);
      return false;
    }
  }

  async getPortalRequirements(portalId: string): Promise<{
    meetsRequirements: boolean;
    missingFeatures: string[];
    planLevel: string;
  }> {
    try {
      // This would typically check against HubSpot's portal API
      // For now, we'll return a basic check
      return {
        meetsRequirements: true,
        missingFeatures: [],
        planLevel: 'professional',
      };
    } catch (error) {
      this.logger.error(`Portal requirements check failed for portal ${portalId}:`, error);
      return {
        meetsRequirements: false,
        missingFeatures: ['api_access'],
        planLevel: 'unknown',
      };
    }
  }

  async getRateLimitStatus(): Promise<{
    remaining: number;
    resetTime: Date;
    limit: number;
  }> {
    // This would typically check HubSpot's rate limit headers
    // For now, we'll return estimated values
    return {
      remaining: this.healthMetrics.rateLimitRemaining,
      resetTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      limit: 1000,
    };
  }

  private async sendHealthAlert() {
    // This would send alerts via email, webhook, or other notification channels
    this.logger.error('HubSpot integration is unhealthy! Sending alert...');
    
    // Example alert implementation
    const alert = {
      type: 'hubspot_health_alert',
      severity: 'critical',
      message: 'HubSpot integration is experiencing issues',
      metrics: this.healthMetrics,
      timestamp: new Date(),
    };

    // TODO: Implement actual alert sending
    this.logger.error('Health alert:', alert);
  }

  async incrementFailedRequests() {
    this.healthMetrics.failedRequests++;
  }

  async updateRateLimitRemaining(remaining: number) {
    this.healthMetrics.rateLimitRemaining = remaining;
  }

  async getDetailedHealthReport(): Promise<{
    summary: HubSpotHealthMetrics;
    activeUsers: any[];
    recentErrors: any[];
    recommendations: string[];
  }> {
    const activeUsers = await this.getActiveHubSpotUsers();
    const recommendations: string[] = [];

    if (this.healthMetrics.errorRate > 0.1) {
      recommendations.push('High error rate detected. Check HubSpot API status and user tokens.');
    }

    if (this.healthMetrics.apiResponseTime > 5000) {
      recommendations.push('Slow API response times. Consider implementing caching.');
    }

    if (this.healthMetrics.rateLimitRemaining < 100) {
      recommendations.push('Rate limit nearly exceeded. Implement rate limiting strategies.');
    }

    return {
      summary: this.healthMetrics,
      activeUsers,
      recentErrors: [], // Would be populated from error logs
      recommendations,
    };
  }
} 