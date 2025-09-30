import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { retry } from '../decorators/retry.decorator';
import { circuitBreaker } from '../decorators/circuit-breaker.decorator';
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

      console.log(
        '🔍 HubSpotService - User found:',
        user
          ? {
              id: user.id,
              email: user.email,
              hasAccessToken: !!user.hubspotAccessToken,
              hasRefreshToken: !!user.hubspotRefreshToken,
              hasPortalId: !!user.hubspotPortalId,
              tokenExpiresAt: user.hubspotTokenExpiresAt,
            }
          : null,
      );

      if (!user) {
        console.log('🔍 HubSpotService - User not found');
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (!user.hubspotAccessToken) {
        console.log(
          '🔍 HubSpotService - No HubSpot access token found for user',
        );
        throw new HttpException(
          'HubSpot not connected. Please connect your HubSpot account first.',
          HttpStatus.BAD_REQUEST,
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
            'HubSpot token expired and no refresh token available. Please reconnect your HubSpot account.',
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
        console.log(
          '🔍 HubSpotService - No valid HubSpot access token after refresh',
        );
        throw new HttpException(
          'No valid HubSpot access token',
          HttpStatus.UNAUTHORIZED,
        );
      }

      console.log(
        '🔍 HubSpotService - Calling HubSpot API with token:',
        currentUser.hubspotAccessToken.substring(0, 20) + '...',
      );

      // Call HubSpot API to get workflows
      const workflows = await this.fetchWorkflowsFromHubSpot(
        currentUser.hubspotAccessToken,
        currentUser.hubspotPortalId || '',
      );

      console.log(
        '🔍 HubSpotService - Fetched workflows from HubSpot:',
        workflows.length,
      );
      return workflows;
    } catch (error: any) {
      console.error('🔍 HubSpotService - Error fetching workflows:', error);

      // Provide more specific error messages
      if (error instanceof HttpException) {
        throw error;
      }

      if (error.message?.includes('HubSpot API error')) {
        throw new HttpException(
          `HubSpot API error: ${error.message}`,
          HttpStatus.BAD_REQUEST,
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

      // Try the correct HubSpot API endpoint for complete workflow data
      const endpoint = `https://api.hubapi.com/automation/v3/workflows/${workflowId}`;
      console.log(`🔍 HubSpotService - Fetching from: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HubSpot API error: ${response.status} ${errorText}`);

        // Return basic info if API fails
        return {
          id: workflowId,
          name: 'Workflow Details Unavailable',
          description: `API Error: ${response.status} - ${errorText}`,
          enabled: false,
          type: 'unknown',
          _metadata: {
            fetchedAt: new Date().toISOString(),
            source: 'hubspot_api',
            apiError: `HTTP ${response.status}: ${errorText}`,
            completeData: false
          }
        };
      }

      const workflowData = (await response.json()) as HubSpotWorkflow;
      console.log(
        `✅ Successfully fetched workflow ${workflowId}`,
        {
          name: workflowData.name,
          hasActions: !!workflowData.actions?.length,
          actionsCount: workflowData.actions?.length || 0,
          hasEnrollmentTriggers: !!workflowData.enrollmentTriggers?.length,
          enrollmentTriggersCount: workflowData.enrollmentTriggers?.length || 0,
          hasGoals: !!workflowData.goals?.length,
          goalsCount: workflowData.goals?.length || 0,
        }
      );

      // Ensure we have the complete workflow structure
      if (!workflowData.actions && !workflowData.enrollmentTriggers) {
        console.warn(`⚠️ Workflow ${workflowId} has no actions or triggers`);
        workflowData._metadata = {
          fetchedAt: new Date().toISOString(),
          source: 'hubspot_api',
          completeData: false,
          warning: 'No actions or triggers found'
        };
      } else {
        workflowData._metadata = {
          fetchedAt: new Date().toISOString(),
          source: 'hubspot_api',
          completeData: true
        };
      }

      return workflowData;
    } catch (error) {
      console.error(
        `❌ Error in getWorkflowById for workflow ${workflowId}:`,
        error,
      );
      throw new HttpException(
        `Failed to fetch workflow ${workflowId} from HubSpot: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get workflow by ID with retry logic for better reliability
   */
  async getWorkflowByIdWithRetry(userId: string, workflowId: string, maxRetries: number = 3): Promise<HubSpotWorkflow | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const workflow = await this.getWorkflowById(userId, workflowId);
        if (workflow && this.validateWorkflowData(workflow)) {
          return workflow;
        }
        console.log(`⚠️ Attempt ${attempt}: Incomplete workflow data for ${workflowId}`);
      } catch (error) {
        console.warn(`⚠️ Attempt ${attempt} failed for workflow ${workflowId}:`, error.message);
      }

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      }
    }
    return null;
  }

  /**
   * Validate workflow data completeness
   */
  private validateWorkflowData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;

    // Must have at least a name and some form of steps/actions
    if (!data.name) return false;

    const hasContent = data.actions?.length > 0 ||
                      data.steps?.length > 0 ||
                      data.enrollmentTriggers?.length > 0;

    return hasContent;
  }

  @circuitBreaker({
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 10000,
  })
  @retry({
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    onRetry: (error, attempt) => {
      console.log(`Attempt ${attempt} failed. Retrying...`, error);
    },
  })
  private async fetchWorkflowsFromHubSpot(
    accessToken: string,
    portalId: string,
  ): Promise<WorkflowResponse[]> {
    console.log('🔍 HubSpotService - fetchWorkflowsFromHubSpot called');
    console.log('🔍 HubSpotService - Using portalId:', portalId);

    try {
      const endpoint = `https://api.hubapi.com/automation/v3/workflows`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HubSpot API error: ${response.status} ${errorText}`,
        );
      }

      const data = (await response.json()) as HubSpotApiResponse;
      const workflowList = data.results || [];

      if (workflowList.length === 0) {
        return [];
      }

      // Fetch detailed data for each workflow
      const workflows: WorkflowResponse[] = [];
      
      for (const workflow of workflowList) {
        try {
          console.log(`🔍 Fetching detailed data for workflow ${workflow.id}`);
          
          // Get complete workflow details including actions and triggers
          const detailedWorkflow = await this.getWorkflowDetailsFromHubSpot(
            accessToken,
            workflow.id
          );
          
          workflows.push({
            id: workflow.id || 'unknown',
            name: workflow.name || 'Unnamed Workflow',
            description: workflow.description || '',
            type: 'workflow',
            status: workflow.enabled ? 'active' : 'inactive',
            hubspotData: detailedWorkflow || workflow, // Use detailed data if available
          });
        } catch (error) {
          console.warn(`⚠️ Failed to fetch details for workflow ${workflow.id}, using basic data:`, error);
          
          // Fallback to basic workflow data
          workflows.push({
            id: workflow.id || 'unknown',
            name: workflow.name || 'Unnamed Workflow',
            description: workflow.description || '',
            type: 'workflow',
            status: workflow.enabled ? 'active' : 'inactive',
            hubspotData: workflow,
          });
        }
      }

      console.log(
        '🔍 HubSpotService - Final transformed workflows:',
        workflows.length,
      );
      return workflows;
    } catch (error: any) {
      console.error('🔍 HubSpotService - Error calling HubSpot API:', error);
      throw new Error(
        `Failed to fetch workflows from HubSpot: ${error.message}`,
      );
    }
  }

  /**
   * Fetch complete workflow details including actions and triggers
   */
  private async getWorkflowDetailsFromHubSpot(
    accessToken: string,
    workflowId: string
  ): Promise<HubSpotWorkflow | null> {
    try {
      const endpoint = `https://api.hubapi.com/automation/v3/workflows/${workflowId}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`⚠️ Failed to fetch detailed workflow ${workflowId}: ${response.status} ${errorText}`);
        return null;
      }

      const workflowData = (await response.json()) as HubSpotWorkflow;
      
      console.log(`✅ Fetched detailed workflow ${workflowId}:`, {
        name: workflowData.name,
        hasActions: !!workflowData.actions?.length,
        actionsCount: workflowData.actions?.length || 0,
        hasEnrollmentTriggers: !!workflowData.enrollmentTriggers?.length,
        triggersCount: workflowData.enrollmentTriggers?.length || 0,
      });

      return workflowData;
    } catch (error) {
      console.error(`❌ Error fetching detailed workflow ${workflowId}:`, error);
      return null;
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

  /**
   * Create a new workflow in HubSpot using the provided workflow data.
   * This is used to restore deleted workflows.
   */
  async createWorkflow(userId: string, workflowData: any): Promise<any> {
    console.log(
      '🔧 HubSpotService - createWorkflow called for userId:',
      userId,
    );

    try {
      // Get user with HubSpot tokens
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          hubspotAccessToken: true,
          hubspotRefreshToken: true,
          hubspotTokenExpiresAt: true,
        },
      });

      if (!user || !user.hubspotAccessToken) {
        throw new HttpException(
          'User not found or HubSpot not connected',
          HttpStatus.NOT_FOUND,
        );
      }
      // Try multiple approaches for workflow creation
      const approaches = [
        // Approach 1: HubSpot v4 API with full workflow structure
        {
          name: 'v4 API Full Workflow',
          endpoint: 'https://api.hubapi.com/automations/v4/flows',
          payload: {
            isEnabled: false,
            flowType: 'WORKFLOW',
            name: workflowData.name || 'Restored Workflow',
            type:
              workflowData.objectTypeId === '0-2'
                ? 'PLATFORM_FLOW'
                : 'CONTACT_FLOW',
            objectTypeId: workflowData.objectTypeId || '0-1',
            actions: workflowData.actions || [],
            enrollmentCriteria:
              workflowData.enrollmentCriteria || workflowData.triggers || {},
            timeWindows: workflowData.timeWindows || [],
            blockedDates: workflowData.blockedDates || [],
            customProperties: workflowData.customProperties || {},
            suppressionListIds: workflowData.suppressionListIds || [],
            canEnrollFromSalesforce:
              workflowData.canEnrollFromSalesforce || false,
          },
        },
        // Approach 2: v3 API with full complex data
        {
          name: 'v3 API Full Complex Data',
          endpoint: 'https://api.hubapi.com/automation/v3/workflows',
          payload: {
            name: workflowData.name || 'Restored Workflow',
            enabled: false,
            description:
              workflowData.description ||
              `Restored by WorkflowGuard on ${new Date().toISOString()}`,
            type: workflowData.type || 'DRIP_DELAY',
            actions: workflowData.actions || [],
            triggers: workflowData.triggers || [],
            goals: workflowData.goals || [],
            settings: workflowData.settings || {},
          },
        },
        // Approach 3: v3 API with actions only
        {
          name: 'v3 API Actions Only',
          endpoint: 'https://api.hubapi.com/automation/v3/workflows',
          payload: {
            name: workflowData.name || 'Restored Workflow',
            enabled: false,
            description:
              workflowData.description ||
              `Restored by WorkflowGuard on ${new Date().toISOString()}`,
            type: workflowData.type || 'DRIP_DELAY',
            actions: workflowData.actions || [],
          },
        },
        // Approach 4: v3 API basic workflow only (fallback)
        {
          name: 'v3 API Basic Only',
          endpoint: 'https://api.hubapi.com/automation/v3/workflows',
          payload: {
            name: workflowData.name || 'Restored Workflow',
            enabled: false,
            description:
              workflowData.description ||
              `Restored by WorkflowGuard on ${new Date().toISOString()}`,
            type: workflowData.type || 'DRIP_DELAY',
          },
        },
      ];

      for (const approach of approaches) {
        try {
          console.log(
            `🔧 HubSpotService - Trying ${approach.name} approach...`,
          );

          const response = await fetch(approach.endpoint, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${user.hubspotAccessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(approach.payload),
          });

          if (response.ok) {
            const createdWorkflow = (await response.json()) as any;
            console.log(
              `🔧 HubSpotService - SUCCESS with ${approach.name} approach:`,
              {
                id: createdWorkflow.id || createdWorkflow.flowId,
                name: createdWorkflow.name,
              },
            );
            return createdWorkflow;
          } else {
            const errorText = await response.text();
            console.log(
              `🔧 HubSpotService - ${approach.name} approach failed:`,
              response.status,
              errorText,
            );
          }
        } catch (error) {
          console.log(
            `🔧 HubSpotService - ${approach.name} approach error:`,
            error,
          );
        }
      }

      throw new Error('All workflow creation approaches failed');
    } catch (error: any) {
      console.error('🔧 HubSpotService - Error creating workflow:', error);
      throw new HttpException(
        `Failed to create workflow: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
