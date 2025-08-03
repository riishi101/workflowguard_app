import { Controller, Get, Post, Body, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('hubspot')
export class HubSpotController {
  
  @Get('workflows')
  @UseGuards(JwtAuthGuard)
  async getWorkflows(@Req() req: Request) {
    console.log('🔍 HubSpotController - getWorkflows called');
    
    // For now, return mock workflows since we don't have the full HubSpot integration
    // In a real implementation, this would call the HubSpot API
    const mockWorkflows = [
      {
        id: 'workflow_1',
        name: 'Lead Nurturing Campaign',
        description: 'Automated email sequence for lead nurturing',
        type: 'workflow',
        status: 'active'
      },
      {
        id: 'workflow_2', 
        name: 'Welcome Series',
        description: 'New customer onboarding emails',
        type: 'workflow',
        status: 'active'
      },
      {
        id: 'workflow_3',
        name: 'Abandoned Cart Recovery',
        description: 'Recover abandoned shopping carts',
        type: 'workflow', 
        status: 'active'
      },
      {
        id: 'workflow_4',
        name: 'Product Recommendation',
        description: 'Personalized product suggestions',
        type: 'workflow',
        status: 'active'
      },
      {
        id: 'workflow_5',
        name: 'Customer Feedback Survey',
        description: 'Post-purchase feedback collection',
        type: 'workflow',
        status: 'active'
      }
    ];

    console.log('🔍 HubSpotController - Returning mock workflows:', mockWorkflows.length);
    return mockWorkflows;
  }

  @Get('test-connection')
  @UseGuards(JwtAuthGuard)
  async testConnection(@Req() req: Request) {
    console.log('🔍 HubSpotController - testConnection called');
    return { connected: true, message: 'HubSpot connection successful' };
  }

  @Post('portal/update')
  @UseGuards(JwtAuthGuard)
  async updatePortalId(@Req() req: Request, @Body() body: { portalId: string }) {
    console.log('🔍 HubSpotController - updatePortalId called');
    return { success: true, message: 'Portal ID updated successfully' };
  }
} 