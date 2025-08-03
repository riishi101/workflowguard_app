import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HubSpotService {
  constructor(private prisma: PrismaService) {}

  async getWorkflows(userId: string): Promise<any[]> {
    console.log('🔍 HubSpotService - getWorkflows called for userId:', userId);
    
    try {
      // Get user with HubSpot tokens
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          hubspotPortalId: true,
          hubspotAccessToken: true,
          hubspotRefreshToken: true,
          hubspotTokenExpiresAt: true,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (!user.hubspotAccessToken) {
        throw new HttpException('HubSpot not connected', HttpStatus.BAD_REQUEST);
      }

      // Check if token is expired and refresh if needed
      const now = new Date();
      if (user.hubspotTokenExpiresAt && user.hubspotTokenExpiresAt < now) {
        console.log('🔍 HubSpotService - Token expired, refreshing...');
        if (user.hubspotRefreshToken) {
          await this.refreshAccessToken(userId, user.hubspotRefreshToken);
        } else {
          throw new HttpException('No refresh token available', HttpStatus.UNAUTHORIZED);
        }
      }

      // Get the current access token (might have been refreshed)
      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { hubspotAccessToken: true, hubspotPortalId: true },
      });

      if (!currentUser?.hubspotAccessToken) {
        throw new HttpException('No valid HubSpot access token', HttpStatus.UNAUTHORIZED);
      }

      // Call HubSpot API to get workflows
      const workflows = await this.fetchWorkflowsFromHubSpot(
        currentUser.hubspotAccessToken,
        currentUser.hubspotPortalId || ''
      );

      console.log('🔍 HubSpotService - Fetched workflows from HubSpot:', workflows.length);
      return workflows;

    } catch (error) {
      console.error('🔍 HubSpotService - Error fetching workflows:', error);
      throw new HttpException(
        `Failed to fetch HubSpot workflows: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async fetchWorkflowsFromHubSpot(accessToken: string, portalId: string): Promise<any[]> {
    console.log('🔍 HubSpotService - fetchWorkflowsFromHubSpot called');
    
    try {
      // HubSpot API endpoint for workflows
      const url = `https://api.hubapi.com/automation/v3/workflows`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 HubSpotService - HubSpot API error:', response.status, errorText);
        throw new Error(`HubSpot API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('🔍 HubSpotService - HubSpot API response:', data);

      // Transform HubSpot workflows to our format
      const workflows = data.results?.map((workflow: any) => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description || '',
        type: 'workflow',
        status: workflow.enabled ? 'active' : 'inactive',
        hubspotData: workflow, // Keep original data for reference
      })) || [];

      console.log('🔍 HubSpotService - Transformed workflows:', workflows.length);
      return workflows;

    } catch (error) {
      console.error('🔍 HubSpotService - Error calling HubSpot API:', error);
      throw new Error(`Failed to fetch workflows from HubSpot: ${error.message}`);
    }
  }

  private async refreshAccessToken(userId: string, refreshToken: string): Promise<void> {
    console.log('🔍 HubSpotService - refreshAccessToken called');
    
    try {
      // HubSpot token refresh endpoint
      const url = 'https://api.hubapi.com/oauth/v1/token';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: process.env.HUBSPOT_CLIENT_ID || '',
          client_secret: process.env.HUBSPOT_CLIENT_SECRET || '',
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Update user with new tokens
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          hubspotAccessToken: data.access_token,
          hubspotRefreshToken: data.refresh_token,
          hubspotTokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
        },
      });

      console.log('🔍 HubSpotService - Access token refreshed successfully');

    } catch (error) {
      console.error('🔍 HubSpotService - Error refreshing token:', error);
      throw new Error(`Failed to refresh access token: ${error.message}`);
    }
  }

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.hubapi.com/oauth/v1/access-tokens/' + accessToken);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
} 