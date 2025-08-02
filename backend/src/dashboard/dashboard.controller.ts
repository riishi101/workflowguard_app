import { Controller, Get, Req, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { WorkflowService } from '../workflow/workflow.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get('stats')
  async getDashboardStats(@Req() req: Request) {
    try {
      const userId = (req.user as any)?.sub;
      if (!userId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      
      console.log('DashboardController - Getting stats for userId:', userId);
      
      // For now, return basic stats
      const stats = {
        totalWorkflows: 0,
        protectedWorkflows: 0,
        recentActivity: [],
        lastUpdated: new Date().toISOString()
      };
      
      console.log('DashboardController - Returning stats:', stats);
      return stats;
    } catch (error) {
      console.error('DashboardController - Error getting stats:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to get dashboard stats', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 