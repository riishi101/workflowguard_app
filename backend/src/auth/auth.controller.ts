import { Controller, Get, Post, Body, Param, HttpException, HttpStatus, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import axios from 'axios';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('hubspot/url')
  async getHubSpotAuthUrl() {
    try {
      const clientId = process.env.HUBSPOT_CLIENT_ID;
      const redirectUri = process.env.HUBSPOT_REDIRECT_URI || 'https://api.workflowguard.pro/api/auth/hubspot/callback';
      const scopes = 'crm.schemas.deals.read automation oauth crm.objects.companies.read crm.objects.deals.read crm.schemas.contacts.read crm.objects.contacts.read crm.schemas.companies.read';
      
      // Debug logging
      console.log('HUBSPOT_CLIENT_ID:', clientId);
      console.log('HUBSPOT_REDIRECT_URI:', redirectUri);
      
      let authUrl;
      
      if (!clientId) {
        // Fallback to known working URL for testing
        console.log('Using fallback OAuth URL');
        authUrl = 'https://app-na2.hubspot.com/oauth/authorize?client_id=6be1632d-8007-45e4-aecb-6ec93e6ff528&redirect_uri=https://api.workflowguard.pro/api/auth/hubspot/callback&scope=crm.schemas.deals.read%20automation%20oauth%20crm.objects.companies.read%20crm.objects.deals.read%20crm.schemas.contacts.read%20crm.objects.contacts.read%20crm.schemas.companies.read';
      } else {
        authUrl = `https://app-na2.hubspot.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
      }
      
      console.log('Generated OAuth URL:', authUrl);
      
      return { url: authUrl };
    } catch (error) {
      console.error('Error generating HubSpot OAuth URL:', error);
      throw new HttpException('Failed to generate HubSpot OAuth URL', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('hubspot')
  async initiateHubSpotOAuth(@Res() res: Response) {
    // This would redirect to HubSpot's OAuth consent page
    const clientId = process.env.HUBSPOT_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.HUBSPOT_REDIRECT_URI || 'http://localhost:3000/auth/hubspot/callback');
    const scopes = encodeURIComponent('contacts workflows');
    
    const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;
    
    res.redirect(authUrl);
  }

  @Public()
  @Get('hubspot/callback')
  async handleHubSpotCallback(@Query('code') code: string, @Query('state') state: string) {
    try {
      console.log('HubSpot callback received with code:', code);
      
      if (!code) {
        console.error('No authorization code provided');
        throw new HttpException('Authorization code not provided', HttpStatus.BAD_REQUEST);
      }

      // Check if required environment variables are set
      const clientId = process.env.HUBSPOT_CLIENT_ID || '6be1632d-8007-45e4-aecb-6ec93e6ff528';
      const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
      const redirectUri = process.env.HUBSPOT_REDIRECT_URI || 'https://api.workflowguard.pro/api/auth/hubspot/callback';
      
      console.log('Using clientId:', clientId);
      console.log('Using redirectUri:', redirectUri);
      console.log('Client secret available:', !!clientSecret);

      if (!clientSecret) {
        console.error('HUBSPOT_CLIENT_SECRET is not set');
        throw new HttpException('HubSpot client secret not configured', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // 1. Exchange code for tokens
      console.log('Exchanging code for tokens...');
      const tokenRes = await axios.post('https://api.hubapi.com/oauth/v1/token', null, {
        params: {
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code,
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      console.log('Token response received:', !!tokenRes.data);
      const { access_token, refresh_token, hub_id } = tokenRes.data;
      console.log('Token exchange successful, hub_id:', hub_id);

      if (!access_token) {
        console.error('No access token received from HubSpot');
        throw new HttpException('Failed to get access token from HubSpot', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // 2. Fetch user email from HubSpot
      console.log('Fetching user info from HubSpot...');
      const userRes = await axios.get('https://api.hubapi.com/integrations/v1/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      
      console.log('User response received:', !!userRes.data);
      const email = userRes.data.user || userRes.data.email;
      console.log('User email from HubSpot:', email);

      if (!email) {
        console.error('No email found in HubSpot user response');
        throw new HttpException('Failed to get user email from HubSpot', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // 3. Create or update user in your DB with hubspotPortalId
      console.log('Creating/updating user in database...');
      const user = await this.authService.findOrCreateUser(email);
      console.log('User found/created:', user.id);
      
      await this.authService.updateUserHubspotPortalId(user.id, hub_id);
      console.log('User hubspotPortalId updated');

      // 4. Redirect to frontend with success
      console.log('OAuth callback completed successfully');
      return {
        message: 'OAuth callback received',
        hub_id,
        email,
        user_id: user.id,
        success: true
      };
    } catch (error) {
      console.error('OAuth callback error:', error);
      
      // Log more details about the error
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      
      if (error.request) {
        console.error('Error request:', error.request);
      }
      
      console.error('Error message:', error.message);
      
      throw new HttpException('OAuth callback failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('validate')
  async validateUser(@Body() body: { email: string }) {
    try {
      const user = await this.authService.validateUser(body.email);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new HttpException('User validation failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      return await this.authService.login(body.email, body.password);
    } catch (error) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('register')
  async registerUser(@Body() body: { email: string; name?: string; role?: string; password?: string }) {
    try {
      return await this.authService.createUser(body.email, body.name, body.role, body.password);
    } catch (error) {
      throw new HttpException('User registration failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('user/:email')
  async findOrCreateUser(@Param('email') email: string) {
    try {
      return await this.authService.findOrCreateUser(email);
    } catch (error) {
      throw new HttpException('Failed to find or create user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
