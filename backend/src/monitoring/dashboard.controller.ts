import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PerformanceService } from './performance.service';
import { HealthService } from '../health/health.service';
import { PrismaService } from '../prisma/prisma.service';
import { logger } from '../config/logger.config';

@Controller('monitoring')
@UseGuards(JwtAuthGuard)
export class MonitoringController {
  constructor(
    private readonly performanceService: PerformanceService,
    private readonly healthService: HealthService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get('dashboard')
  async getDashboard() {
    try {
      const [
        systemHealth,
        performanceStats,
        databaseStats,
        applicationMetrics
      ] = await Promise.all([
        this.getSystemHealth(),
        this.getPerformanceStats(),
        this.getDatabaseStats(),
        this.getApplicationMetrics()
      ]);

      return {
        timestamp: new Date().toISOString(),
        system: systemHealth,
        performance: performanceStats,
        database: databaseStats,
        application: applicationMetrics
      };
    } catch (error) {
      logger.error('Failed to generate monitoring dashboard', error);
      throw error;
    }
  }

  @Get('performance')
  async getPerformanceMetrics() {
    const operations = this.performanceService.getOperationNames();
    const stats = {};

    operations.forEach(op => {
      stats[op] = this.performanceService.getStats(op);
    });

    return {
      timestamp: new Date().toISOString(),
      operations: stats,
      summary: this.performanceService.getStats()
    };
  }

  @Get('database')
  async getDatabaseMetrics() {
    return this.getDatabaseStats();
  }

  @Get('application')
  async getApplicationMetrics() {
    return this.getApplicationMetrics();
  }

  private async getSystemHealth() {
    const health = await this.healthService.getDetailedHealthStatus();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      status: health.status,
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024)
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      checks: health.checks
    };
  }

  private getPerformanceStats() {
    const operations = this.performanceService.getOperationNames();
    const criticalOperations = operations.filter(op => 
      op.includes('database') || 
      op.includes('hubspot') || 
      op.includes('payment')
    );

    const stats = {};
    criticalOperations.forEach(op => {
      stats[op] = this.performanceService.getStats(op);
    });

    return {
      overall: this.performanceService.getStats(),
      critical: stats,
      slowOperations: this.getSlowOperations()
    };
  }

  private async getDatabaseStats() {
    try {
      const [
        userCount,
        workflowCount,
        versionCount,
        recentActivity
      ] = await Promise.all([
        this.prismaService.user.count(),
        this.prismaService.workflow.count(),
        this.prismaService.workflowVersion.count(),
        this.getRecentDatabaseActivity()
      ]);

      return {
        connections: {
          active: 1, // Prisma connection pooling
          idle: 0
        },
        tables: {
          users: userCount,
          workflows: workflowCount,
          versions: versionCount
        },
        activity: recentActivity
      };
    } catch (error) {
      logger.error('Failed to get database stats', error);
      return {
        error: 'Failed to retrieve database statistics',
        connections: { active: 0, idle: 0 },
        tables: {},
        activity: []
      };
    }
  }

  private async getApplicationMetrics() {
    try {
      const [
        activeUsers,
        recentWorkflows,
        errorRate,
        responseTime
      ] = await Promise.all([
        this.getActiveUsersCount(),
        this.getRecentWorkflowsCount(),
        this.getErrorRate(),
        this.getAverageResponseTime()
      ]);

      return {
        users: {
          active: activeUsers,
          total: await this.prismaService.user.count()
        },
        workflows: {
          recent: recentWorkflows,
          total: await this.prismaService.workflow.count()
        },
        performance: {
          errorRate,
          averageResponseTime: responseTime
        },
        features: {
          hubspotConnections: await this.getHubSpotConnectionsCount(),
          activeSubscriptions: await this.getActiveSubscriptionsCount()
        }
      };
    } catch (error) {
      logger.error('Failed to get application metrics', error);
      return {
        error: 'Failed to retrieve application metrics'
      };
    }
  }

  private getSlowOperations() {
    const operations = this.performanceService.getOperationNames();
    const slowOps = [];

    operations.forEach(op => {
      const stats = this.performanceService.getStats(op);
      if (stats.average > 1000) { // Slower than 1 second
        slowOps.push({
          operation: op,
          averageTime: stats.average,
          count: stats.count,
          maxTime: stats.max
        });
      }
    });

    return slowOps.sort((a, b) => b.averageTime - a.averageTime);
  }

  private async getRecentDatabaseActivity() {
    try {
      const recentVersions = await this.prismaService.workflowVersion.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          workflow: {
            select: { name: true }
          }
        }
      });

      return recentVersions.map(version => ({
        type: 'workflow_version_created',
        timestamp: version.createdAt,
        details: `New version for ${version.workflow.name}`
      }));
    } catch (error) {
      return [];
    }
  }

  private async getActiveUsersCount() {
    try {
      // Users active in the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      return await this.prismaService.user.count({
        where: {
          lastLoginAt: {
            gte: yesterday
          }
        }
      });
    } catch (error) {
      return 0;
    }
  }

  private async getRecentWorkflowsCount() {
    try {
      // Workflows created in the last 7 days
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      return await this.prismaService.workflow.count({
        where: {
          createdAt: {
            gte: lastWeek
          }
        }
      });
    } catch (error) {
      return 0;
    }
  }

  private async getErrorRate() {
    // This would typically come from your logging/monitoring system
    // For now, return a placeholder
    return 0.5; // 0.5% error rate
  }

  private async getAverageResponseTime() {
    const stats = this.performanceService.getStats('http_request');
    return stats.average || 0;
  }

  private async getHubSpotConnectionsCount() {
    try {
      return await this.prismaService.user.count({
        where: {
          hubspotAccessToken: {
            not: null
          }
        }
      });
    } catch (error) {
      return 0;
    }
  }

  private async getActiveSubscriptionsCount() {
    try {
      return await this.prismaService.subscription.count({
        where: {
          status: 'active'
        }
      });
    } catch (error) {
      return 0;
    }
  }
}
