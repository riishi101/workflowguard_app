import { Controller, Get, Post, Delete, Param, Query, Req, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { HubSpotService } from '../services/hubspot.service';
import { AuthService } from '../auth/auth.service';
import { WorkflowService } from '../workflow/workflow.service';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/public.decorator';

@Controller('hubspot')
export class HubSpotController {
  constructor(
    private readonly hubSpotService: HubSpotService,
    private readonly authService: AuthService,
    private readonly workflowService: WorkflowService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get('auth/url')
  async getAuthUrl() {
    try {
      const clientId = process.env.HUBSPOT_CLIENT_ID;
      const redirectUri = process.env.HUBSPOT_REDIRECT_URI || 'https://api.workflowguard.pro/api/auth/hubspot/callback';
      const scopes = 'automation oauth crm.objects.contacts.read crm.objects.companies.read crm.objects.deals.read';
      
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
        
        // Create trial subscription for new users
        await this.authService.createTrialSubscription(user.id);
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
        // Create minimal user object for token generation
        user = { id: 'temp-user', email: hubSpotUser.email, role: 'user' };
      }

      // Store HubSpot tokens using the service method
      try {
        await this.hubSpotService.storeUserTokens(user.id, tokens);
        console.log('HubSpotController - Stored tokens with portal ID:', tokens.hub_id);
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
      console.log('HubSpotController - Verifying token for workflows request');
      const user = await this.authService.verifyToken(token);
      if (!user) {
        console.log('HubSpotController - Invalid token for workflows request');
        throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
      }

      console.log('HubSpotController - User authenticated:', { id: user.id, email: user.email });

      // Get valid access token
      console.log('HubSpotController - Getting valid access token');
      const accessToken = await this.hubSpotService.getValidAccessToken(user.id);
      console.log('HubSpotController - Access token obtained');
      
      // SIMPLIFIED APPROACH: Try to get workflows without portal ID
      console.log('HubSpotController - Using simplified workflow fetching approach');
      
      try {
        // Try to get workflows directly without portal ID
        const hubspotWorkflows = await this.hubSpotService.getWorkflowsSimplified(accessToken);
        console.log('HubSpotController - Workflows fetched successfully:', hubspotWorkflows.length);
        
        // Get protected workflow IDs for this user
        const protectedWorkflowIds = await this.workflowService.getProtectedWorkflowIds(user.id);
        
        // Transform to match frontend interface
        const workflows = hubspotWorkflows.map(workflow => ({
          id: workflow.id,
          name: workflow.name,
          folder: workflow.description || 'General',
          status: workflow.status as "ACTIVE" | "INACTIVE" | "DRAFT",
          lastModified: workflow.lastUpdated,
          steps: 0,
          contacts: 0,
          isProtected: protectedWorkflowIds.includes(workflow.id),
          isDemo: false,
        }));
        
        console.log('HubSpotController - Returning workflows:', workflows.length);
        return workflows;
        
      } catch (workflowError) {
        console.error('HubSpotController - Simplified approach failed, trying with portal ID');
        
        // Fallback: Try with portal ID if simplified approach fails
        let portalId = user.hubspotPortalId;
        
        // If no portal ID, try to get it from tokens
        if (!portalId) {
          const userWithTokens = await this.prisma.user.findUnique({
            where: { id: user.id },
            select: { hubspotAccessToken: true }
          });
          
          if (userWithTokens?.hubspotAccessToken) {
            try {
              const tokenParts = userWithTokens.hubspotAccessToken.split('.');
              if (tokenParts.length === 3) {
                const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
                portalId = payload.hub_id || payload.portalId || payload.hubId;
                if (portalId) {
                  await this.prisma.user.update({
                    where: { id: user.id },
                    data: { hubspotPortalId: portalId }
                  });
                }
              }
            } catch (tokenError) {
              console.error('HubSpotController - Failed to extract portal ID from token:', tokenError);
            }
          }
        }
        
        if (portalId) {
          const hubspotWorkflows = await this.hubSpotService.getWorkflows(accessToken, portalId);
          const protectedWorkflowIds = await this.workflowService.getProtectedWorkflowIds(user.id);
          
          const workflows = hubspotWorkflows.map(workflow => ({
            id: workflow.id,
            name: workflow.name,
            folder: workflow.description || 'General',
            status: workflow.status as "ACTIVE" | "INACTIVE" | "DRAFT",
            lastModified: workflow.lastUpdated,
            steps: 0,
            contacts: 0,
            isProtected: protectedWorkflowIds.includes(workflow.id),
            isDemo: false,
          }));
          
          return workflows;
        } else {
          // If all else fails, return demo workflows
          console.log('HubSpotController - All approaches failed, returning demo workflows');
          return this.getDemoWorkflows();
        }
      }
    } catch (error) {
      console.error('HubSpotController - Error in getWorkflows:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to get workflows', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private getDemoWorkflows() {
    return [
      {
        id: 'demo-1',
        name: 'Welcome Email Sequence',
        folder: 'Marketing',
        status: 'ACTIVE' as const,
        lastModified: new Date().toISOString(),
        steps: 3,
        contacts: 150,
        isProtected: false,
        isDemo: true,
      },
      {
        id: 'demo-2',
        name: 'Lead Nurturing Campaign',
        folder: 'Sales',
        status: 'ACTIVE' as const,
        lastModified: new Date().toISOString(),
        steps: 5,
        contacts: 75,
        isProtected: false,
        isDemo: true,
      },
      {
        id: 'demo-3',
        name: 'Customer Onboarding',
        folder: 'Customer Success',
        status: 'DRAFT' as const,
        lastModified: new Date().toISOString(),
        steps: 4,
        contacts: 25,
        isProtected: false,
        isDemo: true,
      }
    ];
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

  @Post('portal/update')
  async updatePortalId(@Req() req: Request) {
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

      console.log('HubSpotController - Manually updating portal ID for user:', user.id);
      
      // Get valid access token
      const accessToken = await this.hubSpotService.getValidAccessToken(user.id);
      
      // Get user info to extract portal ID
      const userInfo = await this.hubSpotService.getUserInfo(accessToken);
      console.log('HubSpotController - User info for portal update:', userInfo);
      
      if (userInfo.portalId) {
        // Update user with portal ID
        await this.prisma.user.update({
          where: { id: user.id },
          data: { hubspotPortalId: userInfo.portalId }
        });
        console.log('HubSpotController - Updated user with portal ID:', userInfo.portalId);
        
        return { success: true, portalId: userInfo.portalId };
      } else {
        throw new HttpException('Could not determine portal ID', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.error('HubSpotController - Error updating portal ID:', error);
      throw new HttpException('Failed to update portal ID', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('test-connection')
  async testHubSpotConnection(@Req() req: Request) {
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

      console.log('HubSpotController - Testing connection for user:', user.id);
      
      // Get valid access token
      const accessToken = await this.hubSpotService.getValidAccessToken(user.id);
      
      // Try to get user info
      const userInfo = await this.hubSpotService.getUserInfo(accessToken);
      
      // Try to get workflows
      const workflows = await this.hubSpotService.getWorkflowsSimplified(accessToken);
      
      return {
        success: true,
        userInfo,
        workflowCount: workflows.length,
        message: 'HubSpot connection is working'
      };
    } catch (error) {
      console.error('HubSpotController - Connection test failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'HubSpot connection failed'
      };
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