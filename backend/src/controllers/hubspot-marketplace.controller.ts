import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('hubspot-marketplace')
export class HubSpotMarketplaceController {
  @Get('install')
  async handleInstall(@Query() query: any) {
    // Handle HubSpot app installation
    return { success: true, message: 'App installation initiated' };
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    // Handle HubSpot marketplace webhooks
    return { success: true };
  }
}
