import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Response, Request } from 'express';
import axios from 'axios';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    // Return the authenticated user's profile
    return req.user;
  }

  @Public()
  @Get('hubspot/url')
  async getHubSpotAuthUrl(@Query('marketplace') marketplace?: string) {
    try {
      const clientId = process.env.HUBSPOT_CLIENT_ID;
      const redirectUri =
        process.env.HUBSPOT_REDIRECT_URI ||
        'https://api.workflowguard.pro/api/auth/hubspot/callback';

      // Use only automation scope for workflows API (as per HubSpot docs)
      const scopes = 'automation oauth';

      // Debug logging
      console.log('HUBSPOT_CLIENT_ID:', clientId);
      console.log('HUBSPOT_REDIRECT_URI:', redirectUri);
      console.log('Marketplace installation:', marketplace);

      if (!clientId) {
        console.error('HUBSPOT_CLIENT_ID is not set');
        throw new HttpException(
          'HubSpot is not configured',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;

      console.log('Generated OAuth URL:', authUrl);

      return { url: authUrl };
    } catch (error) {
      console.error('Error generating HubSpot OAuth URL:', error);
      throw new HttpException(
        'Failed to generate HubSpot OAuth URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('hubspot')
  async initiateHubSpotOAuth(@Res() res: Response) {
    // This would redirect to HubSpot's OAuth consent page
    const clientId = process.env.HUBSPOT_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      process.env.HUBSPOT_REDIRECT_URI ||
        'http://localhost:3000/auth/hubspot/callback',
    );
    // Use only automation scope for workflows API (as per HubSpot docs)
    const scopes = encodeURIComponent('automation oauth');

    const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;

    res.redirect(authUrl);
  }

  @Public()
  @Get('hubspot/callback')
  async handleHubSpotCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    // CORS headers handled by nginx
    try {
      console.log('HubSpot callback received with code:', code);

      if (!code) {
        console.error('No authorization code provided');
        return res.redirect(`${process.env.FRONTEND_URL || 'https://www.workflowguard.pro'}?error=no_code`);
      }

      // Parse state to check if this is a marketplace installation
      let isMarketplaceInstall = false;

      if (state) {
        try {
          const stateData = JSON.parse(decodeURIComponent(state));
          isMarketplaceInstall = stateData.marketplaceInstall || false;
        } catch {
          console.log('Could not parse state, treating as regular OAuth');
        }
      }

      // Full OAuth flow with proper environment variables
      const clientId = process.env.HUBSPOT_CLIENT_ID;
      const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
      const redirectUri =
        process.env.HUBSPOT_REDIRECT_URI ||
        'https://api.workflowguard.pro/api/auth/hubspot/callback';

      console.log('Using clientId:', clientId);
      console.log('Using redirectUri:', redirectUri);
      console.log('Client secret available:', !!clientSecret);
      console.log('Marketplace installation:', isMarketplaceInstall);

      if (!clientId || !clientSecret) {
        console.error('HUBSPOT_CLIENT_SECRET is not set');
        return res.redirect(`${process.env.FRONTEND_URL || 'https://www.workflowguard.pro'}?error=config_error`);
      }

      // 1. Exchange code for tokens
      console.log('Exchanging code for tokens...');
      const tokenRes = await axios.post(
        'https://api.hubapi.com/oauth/v1/token',
        null,
        {
          params: {
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            code,
          },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      console.log('Token response received:', !!tokenRes.data);
      const { access_token, refresh_token, hub_id } = tokenRes.data;
      console.log('Token exchange successful, hub_id:', hub_id);

      if (!access_token) {
        console.error('No access token received from HubSpot');
        return res.redirect(`${process.env.FRONTEND_URL || 'https://www.workflowguard.pro'}?error=token_error`);
      }

      // 2. Fetch user email from HubSpot
      console.log('Fetching user info from HubSpot...');
      const userRes = await axios.get(
        'https://api.hubapi.com/integrations/v1/me',
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      );

      console.log('User response received:', !!userRes.data);
      console.log('User response data:', JSON.stringify(userRes.data, null, 2));

      // Try different possible email fields
      let email =
        userRes.data.user || userRes.data.email || userRes.data.userEmail;

      // If no email found, use portalId as email (convert to string)
      if (!email && userRes.data.portalId) {
        email = `portal-${userRes.data.portalId}@hubspot.test`;
      }

      console.log('User email from HubSpot:', email);

      if (!email) {
        console.error('No email found in HubSpot user response');
        console.error('Available fields:', Object.keys(userRes.data));
        return res.redirect(`${process.env.FRONTEND_URL || 'https://www.workflowguard.pro'}?error=user_error`);
      }

      // 3. Create or update user in your DB with hubspotPortalId and tokens
      console.log('Creating/updating user in database...');
      let user;
      try {
        // First try to find existing user
        user = await this.prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          // Update existing user
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              hubspotPortalId: String(hub_id),
              hubspotAccessToken: access_token,
              hubspotRefreshToken: refresh_token,
              hubspotTokenExpiresAt: new Date(Date.now() + tokenRes.data.expires_in * 1000),
            },
          });
          console.log('User updated successfully:', user.id);
        } else {
          // Create new user
          user = await this.prisma.user.create({
            data: {
              email,
              name: email.split('@')[0],
              hubspotPortalId: String(hub_id),
              hubspotAccessToken: access_token,
              hubspotRefreshToken: refresh_token,
              hubspotTokenExpiresAt: new Date(Date.now() + tokenRes.data.expires_in * 1000),
            },
          });
          console.log('User created successfully:', user.id);

          // Try to create trial subscription, but don't fail if it doesn't work
          try {
            await this.prisma.subscription.create({
              data: {
                userId: user.id,
                planId: 'professional',
                status: 'trial',
                trialEndDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days
              },
            });
            console.log('Trial subscription created for user:', user.id);
          } catch (subscriptionError) {
            console.warn('Failed to create trial subscription, but continuing:', subscriptionError.message);
          }
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
        console.error('Database error details:', {
          message: dbError.message,
          code: dbError.code,
          meta: dbError.meta,
        });
        return res.redirect(
          `${process.env.FRONTEND_URL || 'https://www.workflowguard.pro'}?error=user_creation_failed`,
        );
      }

      // 4. Generate JWT token for the user
      const token = this.authService.generateToken(user);
      console.log('JWT token generated for user:', user.id);
      console.log(
        'Generated token (first 50 chars):',
        token.substring(0, 50) + '...',
      );

      // 5. Redirect based on installation type
      if (isMarketplaceInstall) {
        // For marketplace installations, redirect to dashboard with success
        console.log('Marketplace installation completed successfully');
        const redirectUrl = `${process.env.FRONTEND_URL || 'https://www.workflowguard.pro'}?success=true&token=${encodeURIComponent(token)}&marketplace=true`;
        console.log('Redirecting to marketplace success:', redirectUrl);
        return res.redirect(redirectUrl);
      } else {
        // For regular OAuth, redirect to frontend root with success and token
        console.log('OAuth callback completed successfully');
        const redirectUrl = `${process.env.FRONTEND_URL || 'https://www.workflowguard.pro'}?success=true&token=${encodeURIComponent(token)}`;
        console.log('Redirecting to:', redirectUrl);
        return res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      console.error('Error stack:', error.stack);

      // Log more details about the error
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        console.error('Error response headers:', error.response.headers);
      }

      if (error.request) {
        console.error('Error request:', error.request);
      }

      console.error('Error message:', error.message);
      console.error('Error name:', error.name);

      return res.redirect(`${process.env.FRONTEND_URL || 'https://www.workflowguard.pro'}?error=oauth_failed`);
    }
  }

  @Post('validate')
  async validateUser(@Body() body: { email: string; password: string }) {
    try {
      const user = await this.authService.validateUser(
        body.email,
        body.password,
      );
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch {
      throw new HttpException(
        'User validation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      const user = await this.authService.validateUser(
        body.email,
        body.password,
      );
      if (!user) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }
      return await this.authService.login(user);
    } catch {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('register')
  async register(@Body() createUserDto: any) {
    try {
      const user = await this.authService.register(createUserDto);
      return await this.authService.login(user);
    } catch {
      throw new HttpException(
        'Registration failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req: Request) {
    try {
      // Debug headers
      console.log('🔍 /api/auth/me - Headers received:', {
        authorization: req.headers.authorization,
        'content-type': req.headers['content-type'],
        origin: req.headers.origin,
        'user-agent': req.headers['user-agent']?.substring(0, 50) + '...'
      });
      
      const userId = (req.user as any)?.sub || (req.user as any)?.id;
      console.log('🔍 /api/auth/me - User from JWT:', { userId, user: req.user });
      
      if (!userId) {
        console.log('❌ /api/auth/me - No userId found in JWT payload');
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,

          hubspotPortalId: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: user,
      };
    } catch {
      throw new HttpException(
        'Failed to get current user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
