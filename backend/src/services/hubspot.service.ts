import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  HubSpotWorkflow,
  HubSpotApiResponse,
  WorkflowResponse,
  HubSpotTokenResponse,
} from '../types/hubspot.types';

@Injectable()
export class HubSpotService {
  constructor(private prisma: PrismaService) {}

  async getWorkflows(userId: string): Promise<WorkflowResponse[]> {
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
        console.log('🔍 HubSpotService - User not found');
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (!user.hubspotAccessToken) {
        console.log('🔍 HubSpotService - No HubSpot access token found for user');
        throw new HttpException(
          'HubSpot not connected. Please connect your HubSpot account first.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Check if token is expired
      const now = new Date();
      if (user.hubspotTokenExpiresAt && user.hubspotTokenExpiresAt < now) {
        console.log('🔍 HubSpotService - Token expired, refreshing...');
        if (user.hubspotRefreshToken) {
          await this.refreshAccessToken(userId, user.hubspotRefreshToken);
        } else {
          console.log('🔍 HubSpotService - No refresh token available');
          throw new HttpException(
            'Your HubSpot session has expired and cannot be refreshed. Please reconnect your HubSpot account.',
            HttpStatus.UNAUTHORIZED,
          );
        }
      }

      // Get the current access token (might have been refreshed)
      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { hubspotAccessToken: true, hubspotPortalId: true },
      });

      if (!currentUser?.hubspotAccessToken) {
        console.log('🔍 HubSpotService - No valid HubSpot access token after refresh');
        throw new HttpException(
          'No valid HubSpot access token. Please reconnect your HubSpot account.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Call HubSpot API to get workflows
      const workflows = await this.fetchWorkflowsFromHubSpot(
        currentUser.hubspotAccessToken,
        currentUser.hubspotPortalId || '',
      );

      return workflows;
    } catch (error: any) {
      console.error('🔍 HubSpotService - Error fetching workflows:', error);
      // Provide more specific error messages
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.message?.includes('HubSpot token expired') || error.message?.includes('No valid HubSpot access token')) {
        throw new HttpException(
          'Your HubSpot session is invalid or expired. Please reconnect your HubSpot account.',
          HttpStatus.UNAUTHORIZED,
        );
      }
      if (error.message?.includes('Insufficient permissions')) {
        throw new HttpException(
          'Insufficient permissions to access HubSpot workflows. Please check your HubSpot app permissions.',
          HttpStatus.FORBIDDEN,
        );
      }
      if (error.message?.includes('rate limit')) {
        throw new HttpException(
          'HubSpot API rate limit exceeded. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      if (error.message?.includes('fetch') || error.message?.includes('connect')) {
        throw new HttpException(
          'Failed to connect to HubSpot API. Please check your internet connection.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw new HttpException(
        `Failed to fetch HubSpot workflows: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getWorkflowById(
    userId: string,
    workflowId: string,
  ): Promise<HubSpotWorkflow | null> {
    console.log(
      `🔍 HubSpotService - getWorkflowById called for userId: ${userId}, workflowId: ${workflowId}`,
    );

    try {
      // This logic is similar to getWorkflows, ensuring the token is valid.
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          hubspotAccessToken: true,
          hubspotRefreshToken: true,
          hubspotTokenExpiresAt: true,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      let accessToken = user.hubspotAccessToken;
      if (!accessToken) {
        throw new HttpException(
          'HubSpot not connected.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const now = new Date();
      if (user.hubspotTokenExpiresAt && user.hubspotTokenExpiresAt < now) {
        if (user.hubspotRefreshToken) {
          await this.refreshAccessToken(userId, user.hubspotRefreshToken);
          const updatedUser = await this.prisma.user.findUnique({
            where: { id: userId },
          });
          accessToken = updatedUser?.hubspotAccessToken || null;
        } else {
          throw new HttpException(
            'HubSpot token expired.',
            HttpStatus.UNAUTHORIZED,
          );
        }
      }

      const endpoint = `https://api.hubapi.com/automation/v4/workflows/${workflowId}`;
      console.log(`🔍 HubSpotService - Calling endpoint: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        console.warn(`⚠️ Workflow with ID ${workflowId} not found in HubSpot.`);
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `❌ HubSpot API error fetching workflow ${workflowId}: ${response.status} ${errorText}`,
        );
        throw new Error(`HubSpot API error: ${response.status}`);
      }

      const workflowData = (await response.json()) as HubSpotWorkflow;
      console.log(
        `✅ Successfully fetched workflow ${workflowId} from HubSpot.`,
      );
      return workflowData;
    } catch (error) {
      console.error(
        `❌ Error in getWorkflowById for workflow ${workflowId}:`,
        error,
      );
      // Return null to prevent webhook retries for processing errors
      return null;
    }
  }

  private async fetchWorkflowsFromHubSpot(
    accessToken: string,
    portalId: string,
  ): Promise<WorkflowResponse[]> {
    console.log('🔍 HubSpotService - fetchWorkflowsFromHubSpot called');
    console.log('🔍 HubSpotService - Using portalId:', portalId);

    try {
      // Use the correct HubSpot API v3 endpoint for workflows
      const endpoint = `https://api.hubapi.com/automation/v3/workflows?limit=100`;

      console.log('🔍 HubSpotService - Calling endpoint:', endpoint);
      console.log('🔍 HubSpotService - Using access token (first 10 chars):', accessToken?.substring(0, 10));

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      console.log('🔍 HubSpotService - Response status:', response.status);
      console.log('🔍 HubSpotService - Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          '🔍 HubSpotService - API request failed:',
          response.status,
          errorText,
        );
        
        if (response.status === 401) {
          throw new HttpException(
            'HubSpot token expired or invalid. Please reconnect your HubSpot account.',
            HttpStatus.UNAUTHORIZED,
          );
        } else if (response.status === 403) {
          throw new HttpException(
            'Insufficient permissions to access HubSpot workflows.',
            HttpStatus.FORBIDDEN,
          );
        } else if (response.status === 429) {
          throw new HttpException(
            'HubSpot API rate limit exceeded. Please try again later.',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        
        throw new HttpException(
          `HubSpot API error: ${response.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = (await response.json()) as any;
      console.log(
        '🔍 HubSpotService - Raw API response:',
        JSON.stringify(data, null, 2),
      );

      // Extract workflows from response - v3 API uses 'workflows' property
      const workflowList: HubSpotWorkflow[] = data.workflows || [];
      console.log(
        '🔍 HubSpotService - Extracted workflow list:',
        workflowList.length,
      );

      // Transform HubSpot workflows to our format
      const workflows = workflowList.map(
        (workflow: HubSpotWorkflow): WorkflowResponse => ({
          id: workflow.id || 'unknown',
          name: workflow.name || 'Unnamed Workflow',
          description: workflow.description || '',
          type: 'workflow',
          status: workflow.enabled ? 'active' : 'inactive',
          hubspotData: workflow, // Keep original data for reference
        }),
      );

      console.log(
        '🔍 HubSpotService - Final transformed workflows:',
        workflows.length,
      );
      return workflows;
    } catch (error: any) {
      console.error('🔍 HubSpotService - Error calling HubSpot API:', error);
      console.error('🔍 HubSpotService - Error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        cause: error.cause,
        stack: error.stack?.substring(0, 500)
      });
      
      // Provide more specific error messages based on error type
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new HttpException(
          'Failed to connect to HubSpot API. Please check your internet connection.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new HttpException(
          'Unable to reach HubSpot servers. Please try again later.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else if (error.message.includes('timeout')) {
        throw new HttpException(
          'HubSpot API request timed out. Please try again.',
          HttpStatus.REQUEST_TIMEOUT,
        );
      } else {
        throw new HttpException(
          `Failed to fetch workflows from HubSpot: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  private async refreshAccessToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
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

      const data = (await response.json()) as HubSpotTokenResponse;

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
    } catch (error: any) {
      console.error('🔍 HubSpotService - Error refreshing token:', error);
      throw new Error(`Failed to refresh access token: ${error.message}`);
    }
  }

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        'https://api.hubapi.com/oauth/v1/access-tokens/' + accessToken,
      );
      return response.ok;
    } catch {
      return false;
    }
  }
}
