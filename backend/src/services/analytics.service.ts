import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UsageTrend {
  period: string;
  value: number;
  change: number;
}

export interface UserAnalytics {
  userId: string;
  email: string;
  riskLevel: string;
  avgOveragesPerMonth: number;
}

export interface RevenueAnalytics {
  period: string;
  revenue: number;
  growth: number;
}

export interface PredictiveAnalytics {
  prediction: string;
  confidence: number;
  factors: string[];
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getUsageTrends(): Promise<UsageTrend[]> {
    try {
      // Get workflow creation trends over last 12 months
      const trends = await this.prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as period,
          COUNT(*)::int as value,
          0 as change
        FROM "Workflow" 
        WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY period DESC
        LIMIT 12
      `;
      
      return (trends as any[]).map((trend, index, arr) => ({
        period: new Date(trend.period).toISOString().substring(0, 7), // YYYY-MM format
        value: trend.value,
        change: index < arr.length - 1 ? 
          ((trend.value - arr[index + 1].value) / arr[index + 1].value * 100) : 0
      }));
    } catch (error) {
      console.error('Error fetching usage trends:', error);
      return [];
    }
  }

  async getUserAnalytics(): Promise<UserAnalytics[]> {
    try {
      // Get user analytics with risk levels based on workflow count
      const users = await this.prisma.user.findMany({
        include: {
          workflows: true,
          subscription: true,
          paymentTransactions: {
            where: { status: 'success' },
            orderBy: { createdAt: 'desc' }
          }
        },
        take: 100 // Limit for performance
      });

      return users.map(user => {
        const workflowCount = user.workflows.length;
        const riskLevel = workflowCount > 50 ? 'high' : workflowCount > 20 ? 'medium' : 'low';
        
        return {
          userId: user.id,
          email: user.email,
          riskLevel,
          avgOveragesPerMonth: 0 // Calculate based on actual overage data if available
        };
      });
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return [];
    }
  }

  async getRevenueAnalytics(): Promise<RevenueAnalytics[]> {
    try {
      // Get revenue analytics from successful payments
      const revenue = await this.prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "paidAt") as period,
          SUM("amount")::int as revenue_paise,
          0 as growth
        FROM "PaymentTransaction" 
        WHERE "status" = 'success' 
          AND "paidAt" >= NOW() - INTERVAL '12 months'
          AND "paidAt" IS NOT NULL
        GROUP BY DATE_TRUNC('month', "paidAt")
        ORDER BY period DESC
        LIMIT 12
      `;
      
      return (revenue as any[]).map((rev, index, arr) => {
        const currentRevenue = rev.revenue_paise / 100; // Convert paise to rupees
        const previousRevenue = index < arr.length - 1 ? arr[index + 1].revenue_paise / 100 : 0;
        
        return {
          period: new Date(rev.period).toISOString().substring(0, 7),
          revenue: currentRevenue,
          growth: previousRevenue > 0 ? 
            ((currentRevenue - previousRevenue) / previousRevenue * 100) : 0
        };
      });
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      return [];
    }
  }

  async getPredictiveAnalytics(): Promise<PredictiveAnalytics[]> {
    try {
      // Simple predictive analytics based on current trends
      const activeUsers = await this.prisma.user.count({
        where: {
          workflows: {
            some: {}
          }
        }
      });
      
      const totalWorkflows = await this.prisma.workflow.count();
      const avgWorkflowsPerUser = totalWorkflows / Math.max(activeUsers, 1);
      
      const predictions: PredictiveAnalytics[] = [];
      
      if (avgWorkflowsPerUser > 10) {
        predictions.push({
          prediction: 'High user engagement - consider enterprise features',
          confidence: 85,
          factors: ['High workflow count per user', 'Active user base']
        });
      }
      
      if (activeUsers > 50) {
        predictions.push({
          prediction: 'Scaling infrastructure may be needed soon',
          confidence: 70,
          factors: ['Growing user base', 'Increased workflow creation']
        });
      }
      
      return predictions;
    } catch (error) {
      console.error('Error generating predictive analytics:', error);
      return [];
    }
  }
}
