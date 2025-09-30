import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { logger } from '../config/logger.config';
import axios from 'axios';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async getHealthStatus() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0'
    };
  }

  async getDetailedHealthStatus() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkHubSpotAPI(),
      this.checkRazorpayAPI(),
      this.checkMemoryUsage(),
      this.checkDiskSpace()
    ]);

    const results = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
      checks: {
        database: this.getCheckResult(checks[0]),
        hubspot: this.getCheckResult(checks[1]),
        razorpay: this.getCheckResult(checks[2]),
        memory: this.getCheckResult(checks[3]),
        disk: this.getCheckResult(checks[4])
      }
    };

    // Overall status is unhealthy if any critical check fails
    const criticalChecks = ['database'];
    const hasCriticalFailure = criticalChecks.some(
      check => results.checks[check as keyof typeof results.checks]?.status === 'error'
    );

    if (hasCriticalFailure) {
      results.status = 'error';
    } else if (Object.values(results.checks).some(check => check.status === 'warning')) {
      results.status = 'warning';
    }

    return results;
  }

  async getReadinessStatus() {
    try {
      await this.checkDatabase();
      return { status: 'ready', timestamp: new Date().toISOString() };
    } catch (error) {
      logger.error('Readiness check failed', error);
      return { status: 'not ready', error: error.message };
    }
  }

  async getLivenessStatus() {
    const memoryUsage = process.memoryUsage();
    const maxMemory = 400 * 1024 * 1024; // 400MB limit for Cloud Run

    if (memoryUsage.heapUsed > maxMemory * 0.9) {
      return { status: 'unhealthy', reason: 'High memory usage' };
    }

    return { status: 'healthy', timestamp: new Date().toISOString() };
  }

  private async checkDatabase() {
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const duration = Date.now() - start;

      return {
        status: duration < 1000 ? 'ok' : 'warning',
        responseTime: `${duration}ms`,
        message: duration < 1000 ? 'Database connection healthy' : 'Database response slow'
      };
    } catch (error) {
      logger.error('Database health check failed', error);
      return {
        status: 'error',
        message: 'Database connection failed',
        error: error.message
      };
    }
  }

  private async checkHubSpotAPI() {
    try {
      const start = Date.now();
      const response = await axios.get('https://api.hubapi.com/oauth/v1/access-tokens/validate', {
        timeout: 5000,
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN || 'test'}`
        }
      });
      const duration = Date.now() - start;

      return {
        status: response.status === 200 ? 'ok' : 'warning',
        responseTime: `${duration}ms`,
        message: 'HubSpot API accessible'
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'HubSpot API check failed (non-critical)',
        error: error.response?.status || error.message
      };
    }
  }

  private async checkRazorpayAPI() {
    try {
      // Simple connectivity check (don't make actual API calls)
      const start = Date.now();
      await axios.head('https://api.razorpay.com', { timeout: 5000 });
      const duration = Date.now() - start;

      return {
        status: 'ok',
        responseTime: `${duration}ms`,
        message: 'Razorpay API accessible'
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'Razorpay API check failed (non-critical)',
        error: error.message
      };
    }
  }

  private checkMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    const maxMemory = 400 * 1024 * 1024; // 400MB Cloud Run limit
    const usagePercent = (memoryUsage.heapUsed / maxMemory) * 100;

    return {
      status: usagePercent < 80 ? 'ok' : usagePercent < 90 ? 'warning' : 'error',
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      usagePercent: `${usagePercent.toFixed(1)}%`,
      message: usagePercent < 80 ? 'Memory usage normal' : 
               usagePercent < 90 ? 'Memory usage high' : 'Memory usage critical'
    };
  }

  private checkDiskSpace() {
    // For Cloud Run, disk space is not a major concern, but we can check tmp
    try {
      const stats = require('fs').statSync('/tmp');
      return {
        status: 'ok',
        message: 'Disk space check passed',
        tmpDir: '/tmp accessible'
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'Disk space check failed',
        error: error.message
      };
    }
  }

  private getCheckResult(result: PromiseSettledResult<any>) {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        status: 'error',
        message: 'Health check failed',
        error: result.reason?.message || 'Unknown error'
      };
    }
  }
}
