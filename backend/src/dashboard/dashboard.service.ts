import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getDashboardStats(userId: string): Promise<any> {
    try {
      const cacheKey = `dashboard_stats_${userId}`;
      const cachedStats = this.cache.get(cacheKey);

      if (cachedStats) {
        console.log(`Cache hit for dashboard stats for user ${userId}`);
        return cachedStats;
      }

      console.log(`Cache miss for dashboard stats for user ${userId}, fetching from database`);

      // Get user with subscription for plan limits
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Get protected workflows with optimized query
      const protectedWorkflows = await this.prisma.workflow.findMany({
        where: { ownerId: userId },
        include: {
          versions: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Only get latest version for count
          },
        },
      });

      // Calculate stats efficiently
      const totalWorkflows = protectedWorkflows.length;
      const activeWorkflows = protectedWorkflows.filter(
        (w: any) => w.versions.length > 0,
      ).length;
      const totalVersions = protectedWorkflows.reduce(
        (sum: number, w: any) => sum + w.versions.length,
        0,
      );

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentActivity = await this.prisma.auditLog.count({
        where: {
          userId: userId,
          timestamp: { gte: sevenDaysAgo },
        },
      });

      // Calculate plan usage
      const planCapacity =
        user.subscription?.planId === 'professional'
          ? 25
          : user.subscription?.planId === 'enterprise'
            ? 999999
            : 5;
      const planUsed = totalWorkflows;

      // Uptime calculation should be implemented if available, else omit or set to null
      const uptime = null;

      // Get last snapshot time
      const lastSnapshot =
        protectedWorkflows.length > 0
          ? Math.max(
              ...protectedWorkflows.map((w: any) =>
                w.versions.length > 0
                  ? new Date(w.versions[0].createdAt).getTime()
                  : 0,
              ),
            )
          : Date.now();

      const stats = {
        totalWorkflows,
        activeWorkflows,
        protectedWorkflows: totalWorkflows,
        totalVersions,
        uptime,
        lastSnapshot: new Date(lastSnapshot).toISOString(),
        planCapacity,
        planUsed,
        recentActivity,
        planId: user.subscription?.planId || 'starter',
        planStatus: user.subscription?.status || 'active',
      };

      // Cache the stats for 5 minutes (300000 ms)
      this.cache.set(cacheKey, stats, 300000);

      return stats;
    } catch (error) {
      throw new HttpException(
        `Failed to get dashboard stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}