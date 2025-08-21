import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('hubspot-billing')
export class BillingController {
  @Get('portal')
  async getBillingPortal(@Query() query: any) {
    // Handle HubSpot billing portal access
    return { success: true, portalUrl: 'https://app.hubspot.com/billing' };
  }

  @Post('webhook')
  async handleBillingWebhook(@Body() body: any) {
    // Handle HubSpot billing webhooks
    return { success: true };
  }
}
