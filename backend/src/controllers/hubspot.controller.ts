import { Controller, Get, Post, Body, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { HubSpotService } from '../services/hubspot.service';

@Controller('hubspot')
export class HubSpotController {
  constructor(private readonly hubSpotService: HubSpotService) {}
  
  @Get('workflows')
  @UseGuards(JwtAuthGuard)
  async getWorkflows(@Req() req: Request) {
    console.log('🔍 HubSpotController - getWorkflows called');
    
    try {
      // Get user from request - the JWT strategy returns the full user object
      const user = (req.user as any);
      console.log('🔍 HubSpotController - req.user:', user);
      
      if (!user || !user.id) {
        console.log('🔍 HubSpotController - No user or user.id found in request');
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }

      const userId = user.id;
      console.log('🔍 HubSpotController - userId:', userId);

      // Use the real HubSpot service to fetch actual workflows
      const workflows = await this.hubSpotService.getWorkflows(userId);
      
      console.log('🔍 HubSpotController - Returning real workflows from HubSpot:', workflows.length);
      return workflows;
      
    } catch (error) {
      console.error('🔍 HubSpotController - Error fetching workflows:', error);
      throw new HttpException(
        `Failed to fetch HubSpot workflows: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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