import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';

export interface HubSpotWorkflow {
  id: string;
  name: string;
  description?: string;
  lastUpdated: string;
  status: string;
  type: string;
  portalId: string;
}

export interface HubSpotUser {
  id: string;
  email: string;
  portalId: string;
  firstName?: string;
  lastName?: string;
}

export interface HubSpotToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  hub_id: string;
  user_id: string;
  hub_domain: string;
  scopes: string[];
  user: string;
  hub_plan: string;
  app_id: string;
}

@Injectable()
export class HubSpotService {
  private readonly logger = new Logger(HubSpotService.name);
  private readonly apiClient: AxiosInstance;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.apiClient = axios.create({
      baseURL: 'https://api.hubapi.com',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.apiClient.interceptors.request.use(
      (config) => {
        this.logger.debug(`HubSpot API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('HubSpot API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response: AxiosResponse) => {
        this.logger.debug(`HubSpot API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error) => {
        this.logger.error('HubSpot API Response Error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });

        // Handle rate limiting
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          this.logger.warn(`HubSpot rate limit hit. Retry after: ${retryAfter} seconds`);
          throw new HttpException('Rate limit exceeded. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
        }

        // Handle authentication errors
        if (error.response?.status === 401) {
          this.logger.error('HubSpot authentication failed');
          throw new HttpException('HubSpot authentication failed. Please reconnect your account.', HttpStatus.UNAUTHORIZED);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<HubSpotToken> {
    try {
      const clientId = this.configService.get<string>('HUBSPOT_CLIENT_ID');
      const clientSecret = this.configService.get<string>('HUBSPOT_CLIENT_SECRET');

      if (!clientId || !clientSecret) {
        throw new HttpException('HubSpot configuration missing', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const response = await axios.post('https://api.hubapi.com/oauth/v1/token', null, {
        params: {
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code,
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Error exchanging code for token:', error);
      throw new HttpException('Failed to authenticate with HubSpot', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<HubSpotToken> {
    try {
      const clientId = this.configService.get<string>('HUBSPOT_CLIENT_ID');
      const clientSecret = this.configService.get<string>('HUBSPOT_CLIENT_SECRET');

      const response = await axios.post('https://api.hubapi.com/oauth/v1/token', null, {
        params: {
          grant_type: 'refresh_token',
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Error refreshing token:', error);
      throw new HttpException('Failed to refresh HubSpot token', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Get user information from HubSpot
   */
  async getUserInfo(accessToken: string): Promise<HubSpotUser> {
    try {
      const response = await this.apiClient.get('/integrations/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const userData = response.data;
      return {
        id: userData.user || userData.userId,
        email: userData.user || userData.email || userData.userEmail,
        portalId: userData.portalId,
        firstName: userData.firstName,
        lastName: userData.lastName,
      };
    } catch (error) {
      this.logger.error('Error getting user info:', error);
      throw new HttpException('Failed to get user information from HubSpot', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Get all workflows from HubSpot
   */
  async getWorkflows(accessToken: string, portalId: string): Promise<HubSpotWorkflow[]> {
    try {
      const workflows: HubSpotWorkflow[] = [];
      let after: string | undefined;

      do {
        const response = await this.apiClient.get('/automation/v4/workflows', {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            limit: 100,
            after,
            portalId,
          },
        });

        const workflowData = response.data.results || response.data;
        workflows.push(...workflowData.map((workflow: any) => ({
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          lastUpdated: workflow.updatedAt || workflow.lastUpdated,
          status: workflow.status || 'ACTIVE',
          type: workflow.type || 'WORKFLOW',
          portalId,
        })));

        after = response.data.paging?.next?.after;
      } while (after);

      return workflows;
    } catch (error) {
      this.logger.error('Error getting workflows:', error);
      throw new HttpException('Failed to get workflows from HubSpot', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Get specific workflow by ID
   */
  async getWorkflow(accessToken: string, workflowId: string, portalId: string): Promise<HubSpotWorkflow> {
    try {
      const response = await this.apiClient.get(`/automation/v4/workflows/${workflowId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { portalId },
      });

      const workflow = response.data;
      return {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        lastUpdated: workflow.updatedAt || workflow.lastUpdated,
        status: workflow.status || 'ACTIVE',
        type: workflow.type || 'WORKFLOW',
        portalId,
      };
    } catch (error) {
      this.logger.error('Error getting workflow:', error);
      throw new HttpException('Failed to get workflow from HubSpot', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Store or update HubSpot tokens for a user
   */
  async storeUserTokens(userId: string, tokens: HubSpotToken): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          hubspotPortalId: tokens.hub_id,
          hubspotAccessToken: tokens.access_token,
          hubspotRefreshToken: tokens.refresh_token,
          hubspotTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        },
      });

      this.logger.log(`Stored HubSpot tokens for user ${userId}`);
    } catch (error) {
      this.logger.error('Error storing user tokens:', error);
      throw new HttpException('Failed to store HubSpot tokens', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get valid access token for user (refresh if needed)
   */
  async getValidAccessToken(userId: string): Promise<string> {
    try {
      console.log('HubSpotService - Getting valid access token for user:', userId);
      
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          hubspotAccessToken: true,
          hubspotRefreshToken: true,
          hubspotTokenExpiresAt: true,
        },
      });

      console.log('HubSpotService - User found:', user ? { 
        hasAccessToken: !!user.hubspotAccessToken,
        hasRefreshToken: !!user.hubspotRefreshToken,
        expiresAt: user.hubspotTokenExpiresAt
      } : null);

      if (!user?.hubspotAccessToken) {
        console.log('HubSpotService - No HubSpot tokens found for user');
        throw new HttpException('No HubSpot tokens found for user', HttpStatus.UNAUTHORIZED);
      }

      // Check if token is expired (with 5 minute buffer)
      const expiresAt = user.hubspotTokenExpiresAt;
      const now = new Date();
      const bufferTime = 5 * 60 * 1000; // 5 minutes

      if (expiresAt && expiresAt.getTime() - now.getTime() < bufferTime) {
        this.logger.log(`Refreshing expired token for user ${userId}`);
        if (!user.hubspotRefreshToken) {
          throw new HttpException('No refresh token available', HttpStatus.UNAUTHORIZED);
        }
        const newTokens = await this.refreshToken(user.hubspotRefreshToken);
        await this.storeUserTokens(userId, newTokens);
        return newTokens.access_token;
      }

      console.log('HubSpotService - Returning valid access token');
      return user.hubspotAccessToken;
    } catch (error) {
      this.logger.error('Error getting valid access token:', error);
      throw new HttpException('Failed to get valid HubSpot token', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Validate HubSpot connection for user
   */
  async validateConnection(userId: string): Promise<boolean> {
    try {
      const accessToken = await this.getValidAccessToken(userId);
      await this.getUserInfo(accessToken);
      return true;
    } catch (error) {
      this.logger.error('HubSpot connection validation failed:', error);
      return false;
    }
  }

  /**
   * Revoke HubSpot access for user
   */
  async revokeAccess(userId: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { hubspotRefreshToken: true },
      });

      if (user?.hubspotRefreshToken) {
        // Revoke token with HubSpot
        try {
          await axios.post('https://api.hubapi.com/oauth/v1/revoke', null, {
            params: { token: user.hubspotRefreshToken },
          });
        } catch (error) {
          this.logger.warn('Failed to revoke token with HubSpot:', error);
        }
      }

      // Clear tokens from database
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          hubspotAccessToken: null,
          hubspotRefreshToken: null,
          hubspotTokenExpiresAt: null,
          hubspotPortalId: null,
        },
      });

      this.logger.log(`Revoked HubSpot access for user ${userId}`);
    } catch (error) {
      this.logger.error('Error revoking HubSpot access:', error);
      throw new HttpException('Failed to revoke HubSpot access', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get HubSpot portal information
   */
  async getPortalInfo(accessToken: string, portalId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/integrations/v1/portals/${portalId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Error getting portal info:', error);
      throw new HttpException('Failed to get portal information', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Test HubSpot API connection
   */
  async testConnection(accessToken: string): Promise<boolean> {
    try {
      await this.apiClient.get('/integrations/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return true;
    } catch (error) {
      this.logger.error('HubSpot connection test failed:', error);
      return false;
    }
  }
} 