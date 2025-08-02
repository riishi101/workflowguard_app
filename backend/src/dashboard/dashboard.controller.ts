import { Controller, Get, Req, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { WorkflowService } from '../workflow/workflow.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly workflowService: WorkflowService) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getDashboardStats(@Req() req: Request) {
    try {
      const userId = (req.user as any)?.sub;
      if (!userId) {
        console.log('DashboardController - No userId found in dashboard stats request');
        // Return basic stats instead of throwing error
        return {
          totalWorkflows: 0,
          protectedWorkflows: 0,
          recentActivity: [],
          lastUpdated: new Date().toISOString()
        };
      }
      
      console.log('DashboardController - Getting stats for userId:', userId);
      
      // Get real stats from workflow service
      const stats = await this.workflowService.getDashboardStats(userId);
      
      console.log('DashboardController - Returning stats:', stats);
      return stats;
    } catch (error) {
      console.error('DashboardController - Error getting stats:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      // Return basic stats instead of throwing error
      return {
        totalWorkflows: 0,
        protectedWorkflows: 0,
        recentActivity: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }
} 