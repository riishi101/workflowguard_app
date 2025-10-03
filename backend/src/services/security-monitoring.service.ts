import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

interface FailedAccessAttempt {
  userId?: string;
  ipAddress: string;
  endpoint: string;
  method: string;
  error: string;
  userAgent?: string;
  timestamp: Date;
}

interface SecurityAlert {
  type: 'SUSPICIOUS_ACTIVITY' | 'MULTIPLE_FAILED_ATTEMPTS' | 'UNAUTHORIZED_ACCESS' | 'RATE_LIMIT_EXCEEDED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  details: any;
  timestamp: Date;
}

@Injectable()
export class SecurityMonitoringService {
  private readonly logger = new Logger(SecurityMonitoringService.name);
  private readonly maxFailedAttempts = 5;
  private readonly monitoringWindowMinutes = 15;
  private failedAttempts = new Map<string, FailedAccessAttempt[]>();
  private securityAlerts: SecurityAlert[] = [];

  constructor(private prisma: PrismaService) {
    // Clean up old failed attempts every hour
    setInterval(() => this.cleanupOldAttempts(), 60 * 60 * 1000);

    // Ensure logs directory exists
    if (!fs.existsSync('./logs')) {
      fs.mkdirSync('./logs', { recursive: true });
    }
  }

  /**
   * Write security events to log file
   */
  private writeSecurityLog(type: string, data: any): void {
    try {
      const logEntry = {
        type,
        timestamp: new Date().toISOString(),
        ...data,
      };

      const logFile = path.join('./logs', `security-${new Date().toISOString().split('T')[0]}.log`);
      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      this.logger.error('Error writing security log:', error);
    }
  }

  /**
   * Record a failed access attempt
   */
  async recordFailedAccess(attempt: FailedAccessAttempt): Promise<void> {
    try {
      // Store the failed attempt in memory
      const key = attempt.userId ? `user:${attempt.userId}` : `ip:${attempt.ipAddress}`;
      if (!this.failedAttempts.has(key)) {
        this.failedAttempts.set(key, []);
      }

      this.failedAttempts.get(key)!.push(attempt);

      // Write to security log file
      this.writeSecurityLog('FAILED_ACCESS', attempt);

      // Check if this triggers any security alerts
      await this.checkSecurityThresholds(attempt);

      this.logger.warn(`Failed access attempt recorded: ${attempt.endpoint} from IP ${attempt.ipAddress}`);
    } catch (error) {
      this.logger.error('Error recording failed access attempt:', error);
    }
  }

  /**
   * Record a successful access for pattern analysis
   */
  async recordSuccessfulAccess(userId: string, endpoint: string, ipAddress: string): Promise<void> {
    try {
      this.writeSecurityLog('SUCCESSFUL_ACCESS', {
        userId,
        ipAddress,
        endpoint,
        method: 'SUCCESS',
      });
    } catch (error) {
      this.logger.error('Error recording successful access:', error);
    }
  }

  /**
   * Record rate limit violation
   */
  async recordRateLimitViolation(userId: string, endpoint: string, ipAddress: string): Promise<void> {
    try {
      this.writeSecurityLog('RATE_LIMIT_EXCEEDED', {
        userId,
        ipAddress,
        endpoint,
        error: 'Rate limit exceeded',
      });

      // Create security alert
      await this.createSecurityAlert({
        type: 'RATE_LIMIT_EXCEEDED',
        severity: 'MEDIUM',
        message: `Rate limit exceeded for endpoint: ${endpoint}`,
        details: { userId, ipAddress, endpoint },
        timestamp: new Date(),
      });

      this.logger.warn(`Rate limit violation: ${endpoint} for user ${userId} from IP ${ipAddress}`);
    } catch (error) {
      this.logger.error('Error recording rate limit violation:', error);
    }
  }

  /**
   * Check if failed attempts exceed security thresholds
   */
  private async checkSecurityThresholds(attempt: FailedAccessAttempt): Promise<void> {
    const windowStart = new Date(Date.now() - this.monitoringWindowMinutes * 60 * 1000);

    // Count failed attempts for this IP in the monitoring window (in-memory)
    const ipAttempts = this.failedAttempts.get(`ip:${attempt.ipAddress}`) || [];
    const ipFailedAttempts = ipAttempts.filter(a => a.timestamp >= windowStart).length;

    // Count failed attempts for this user in the monitoring window (in-memory)
    const userAttempts = attempt.userId ? (this.failedAttempts.get(`user:${attempt.userId}`) || []) : [];
    const userFailedAttempts = userAttempts.filter(a => a.timestamp >= windowStart).length;

    // Check IP-based thresholds
    if (ipFailedAttempts >= this.maxFailedAttempts) {
      await this.createSecurityAlert({
        type: 'MULTIPLE_FAILED_ATTEMPTS',
        severity: 'HIGH',
        message: `Multiple failed access attempts from IP: ${attempt.ipAddress}`,
        details: {
          ipAddress: attempt.ipAddress,
          attemptCount: ipFailedAttempts,
          endpoint: attempt.endpoint,
          windowMinutes: this.monitoringWindowMinutes,
        },
        timestamp: new Date(),
      });
    }

    // Check user-based thresholds
    if (userFailedAttempts >= this.maxFailedAttempts) {
      await this.createSecurityAlert({
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'CRITICAL',
        message: `User ${attempt.userId} has multiple failed access attempts`,
        details: {
          userId: attempt.userId,
          attemptCount: userFailedAttempts,
          endpoint: attempt.endpoint,
          windowMinutes: this.monitoringWindowMinutes,
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Create a security alert
   */
  private async createSecurityAlert(alert: SecurityAlert): Promise<void> {
    try {
      // Store alert in memory
      this.securityAlerts.push(alert);

      // Write alert to security log file
      this.writeSecurityLog('SECURITY_ALERT', {
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        details: alert.details,
      });

      // Log the alert
      this.logger.error(`🚨 SECURITY ALERT [${alert.severity}]: ${alert.message}`, alert.details);

      // Here you could integrate with external monitoring services
      // await this.sendAlertToExternalService(alert);
    } catch (error) {
      this.logger.error('Error creating security alert:', error);
    }
  }

  /**
   * Get security statistics for monitoring dashboard
   */
  async getSecurityStats(timeRangeHours: number = 24): Promise<any> {
    const startTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);

    try {
      // Count from in-memory data
      let totalFailedAttempts = 0;
      let totalSuccessfulAccess = 0;
      let rateLimitViolations = 0;

      // Count from all stored attempts
      for (const [key, attempts] of this.failedAttempts.entries()) {
        const recentAttempts = attempts.filter(a => a.timestamp >= startTime);
        if (key.startsWith('user:') || key.startsWith('ip:')) {
          totalFailedAttempts += recentAttempts.length;
        }
      }

      // Count active alerts
      const activeAlerts = this.securityAlerts.filter(
        alert => alert.timestamp >= startTime && alert.severity !== 'LOW'
      ).length;

      // Calculate top failed IPs and endpoints from in-memory data
      const ipCounts = new Map<string, number>();
      const endpointCounts = new Map<string, number>();

      for (const [key, attempts] of this.failedAttempts.entries()) {
        if (key.startsWith('ip:')) {
          const ip = key.substring(3);
          const recentAttempts = attempts.filter(a => a.timestamp >= startTime);
          ipCounts.set(ip, (ipCounts.get(ip) || 0) + recentAttempts.length);
        }
      }

      // Convert to sorted arrays
      const topFailedIPs = Array.from(ipCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([ipAddress, count]) => ({ ipAddress, count }));

      return {
        timeRangeHours,
        totalFailedAttempts,
        totalSuccessfulAccess,
        rateLimitViolations,
        activeAlerts,
        topFailedIPs,
        topFailedEndpoints: [], // Would need log file parsing for complete implementation
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Error getting security stats:', error);
      throw error;
    }
  }

  /**
   * Clean up old security logs and alerts
   */
  private async cleanupOldAttempts(): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

      // Clean up old failed attempts from memory
      for (const [key, attempts] of this.failedAttempts.entries()) {
        const recentAttempts = attempts.filter(a => a.timestamp >= cutoffDate);
        if (recentAttempts.length === 0) {
          this.failedAttempts.delete(key);
        } else {
          this.failedAttempts.set(key, recentAttempts);
        }
      }

      // Clean up old alerts from memory
      this.securityAlerts = this.securityAlerts.filter(
        alert => alert.timestamp >= cutoffDate
      );

      this.logger.log('Security monitoring cleanup completed');
    } catch (error) {
      this.logger.error('Error during security monitoring cleanup:', error);
    }
  }

  /**
   * Get recent security events for real-time monitoring
   */
  async getRecentSecurityEvents(limit: number = 50): Promise<any[]> {
    try {
      // Return recent failed attempts from memory
      const recentEvents: any[] = [];

      for (const [key, attempts] of this.failedAttempts.entries()) {
        const recentAttempts = attempts
          .filter(a => a.timestamp >= new Date(Date.now() - 60 * 60 * 1000))
          .slice(0, limit - recentEvents.length);

        recentEvents.push(...recentAttempts.map(attempt => ({
          id: `${attempt.ipAddress}-${attempt.timestamp.getTime()}`,
          type: 'FAILED_ACCESS',
          ipAddress: attempt.ipAddress,
          endpoint: attempt.endpoint,
          method: attempt.method,
          error: attempt.error,
          userAgent: attempt.userAgent,
          timestamp: attempt.timestamp,
        })));
      }

      return recentEvents
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    } catch (error) {
      this.logger.error('Error getting recent security events:', error);
      return [];
    }
  }
}