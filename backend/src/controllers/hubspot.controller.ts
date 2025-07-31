import { Controller, Get, Post, Delete, Param, Query, Req, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { HubSpotService } from '../services/hubspot.service';
import { AuthService } from '../auth/auth.service';
import { WorkflowService } from '../workflow/workflow.service';
import { Public } from '../auth/public.decorator';

@Controller('hubspot')
export class HubSpotController {
  constructor(
    private readonly hubSpotService: HubSpotService,
    private readonly authService: AuthService,
    private readonly workflowService: WorkflowService,
  ) {}

  @Public()
  @Get('auth/url')
  async getAuthUrl() {
    try {
      const clientId = process.env.HUBSPOT_CLIENT_ID;
      const redirectUri = process.env.HUBSPOT_REDIRECT_URI || 'https://api.workflowguard.pro/api/auth/hubspot/callback';
      const scopes = 'crm.schemas.deals.read automation oauth crm.objects.companies.read crm.objects.deals.read crm.schemas.contacts.read crm.objects.contacts.read crm.schemas.companies.read';
      
      if (!clientId) {
        throw new HttpException('HubSpot configuration missing', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
      const authUrl = `https://app-na2.hubspot.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
      
      return { url: authUrl };
    } catch (error) {
      throw new HttpException('Failed to generate HubSpot OAuth URL', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Get('auth/callback')
  async handleAuthCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    try {
      if (!code) {
        const frontendUrl = process.env.FRONTEND_URL || 'https://www.workflowguard.pro';
        return res.redirect(`${frontendUrl}?error=no_code`);
      }

      const redirectUri = process.env.HUBSPOT_REDIRECT_URI || 'https://api.workflowguard.pro/api/auth/hubspot/callback';
      
      // Exchange code for tokens
      const tokens = await this.hubSpotService.exchangeCodeForToken(code, redirectUri);
      
      // Get user info from HubSpot
      const hubSpotUser = await this.hubSpotService.getUserInfo(tokens.access_token);
      
      // Create or find user in database
      let user;
      try {
        user = await this.authService.findOrCreateUser(hubSpotUser.email);
        await this.authService.updateUserHubspotPortalId(user.id, tokens.hub_id);
        
        // Create trial subscription for new users
        await this.authService.createTrialSubscription(user.id);
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
        // Create minimal user object for token generation
        user = { id: 'temp-user', email: hubSpotUser.email, role: 'user' };
      }

      // Store HubSpot tokens
      try {
        await this.hubSpotService.storeUserTokens(user.id, tokens);
      } catch (tokenError) {
        console.error('Failed to store tokens:', tokenError);
        // Continue with OAuth flow even if token storage fails
      }

      // Generate JWT token
      const jwtToken = this.authService.generateToken(user);

      // Redirect to frontend with success
      const frontendUrl = process.env.FRONTEND_URL || 'https://www.workflowguard.pro';
      const redirectUrl = `${frontendUrl}?success=true&token=${encodeURIComponent(jwtToken)}`;
      return res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'https://www.workflowguard.pro';
      return res.redirect(`${frontendUrl}?error=oauth_failed`);
    }
  }

  @Get('workflows')
  async getWorkflows(@Req() req: Request) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HttpException('No authorization token provided', HttpStatus.UNAUTHORIZED);
      }

      const token = authHeader.substring(7);
      const user = await this.authService.verifyToken(token);
      if (!user) {
        throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
      }

      // Get valid access token
      const accessToken = await this.hubSpotService.getValidAccessToken(user.id);
      
      // Get workflows from HubSpot
      const hubspotWorkflows = await this.hubSpotService.getWorkflows(accessToken, user.hubspotPortalId);
      
      // Get protected workflow IDs for this user
      const protectedWorkflowIds = await this.workflowService.getProtectedWorkflowIds(user.id);
      
      // Transform to match frontend interface
      const workflows = hubspotWorkflows.map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        folder: workflow.description || 'General', // Use description as folder or default
        status: workflow.status as "ACTIVE" | "INACTIVE" | "DRAFT",
        lastModified: workflow.lastUpdated,
        steps: Math.floor(Math.random() * 20) + 1, // Mock step count
        contacts: Math.floor(Math.random() * 5000) + 100, // Mock contact count
        isProtected: protectedWorkflowIds.includes(workflow.id),
        isDemo: false,
      }));
      
      return workflows;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to get workflows', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('workflows/:workflowId')
  async getWorkflow(@Param('workflowId') workflowId: string, @Req() req: Request) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HttpException('No authorization token provided', HttpStatus.UNAUTHORIZED);
      }

      const token = authHeader.substring(7);
      const user = await this.authService.verifyToken(token);
      if (!user) {
        throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
      }

      // Get valid access token
      const accessToken = await this.hubSpotService.getValidAccessToken(user.id);
      
      // Get specific workflow from HubSpot
      const workflow = await this.hubSpotService.getWorkflow(accessToken, workflowId, user.hubspotPortalId);
      
      return { workflow };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to get workflow', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('connection/status')
  async getConnectionStatus(@Req() req: Request) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HttpException('No authorization token provided', HttpStatus.UNAUTHORIZED);
      }

      const token = authHeader.substring(7);
      const user = await this.authService.verifyToken(token);
      if (!user) {
        throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
      }

      // Validate HubSpot connection
      const isValid = await this.hubSpotService.validateConnection(user.id);
      
      return { 
        connected: isValid,
        portalId: user.hubspotPortalId,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to check connection status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('connection')
  async disconnectHubSpot(@Req() req: Request) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HttpException('No authorization token provided', HttpStatus.UNAUTHORIZED);
      }

      const token = authHeader.substring(7);
      const user = await this.authService.verifyToken(token);
      if (!user) {
        throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
      }

      // Revoke HubSpot access
      await this.hubSpotService.revokeAccess(user.id);
      
      return { message: 'HubSpot connection revoked successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to disconnect HubSpot', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('portal/info')
  async getPortalInfo(@Req() req: Request) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HttpException('No authorization token provided', HttpStatus.UNAUTHORIZED);
      }

      const token = authHeader.substring(7);
      const user = await this.authService.verifyToken(token);
      if (!user) {
        throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
      }

      if (!user.hubspotPortalId) {
        throw new HttpException('No HubSpot portal connected', HttpStatus.BAD_REQUEST);
      }

      // Get valid access token
      const accessToken = await this.hubSpotService.getValidAccessToken(user.id);
      
      // Get portal information
      const portalInfo = await this.hubSpotService.getPortalInfo(accessToken, user.hubspotPortalId);
      
      return { portalInfo };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to get portal information', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('test-connection')
  async testConnection(@Req() req: Request) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HttpException('No authorization token provided', HttpStatus.UNAUTHORIZED);
      }

      const token = authHeader.substring(7);
      const user = await this.authService.verifyToken(token);
      if (!user) {
        throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
      }

      // Get valid access token
      const accessToken = await this.hubSpotService.getValidAccessToken(user.id);
      
      // Test connection
      const isConnected = await this.hubSpotService.testConnection(accessToken);
      
      return { connected: isConnected };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to test connection', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 