import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Param,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { TrialAccountHandlerService } from './trial-account-handler.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrialGuard } from '../guards/trial.guard';
import { SubscriptionGuard } from '../guards/subscription.guard';

@Controller('workflow')
export class WorkflowController {
  private readonly logger = new Logger(WorkflowController.name);

  constructor(
    private readonly workflowService: WorkflowService,
    private readonly trialAccountHandler: TrialAccountHandlerService,
  ) {}

  @Get('hubspot')
  @UseGuards(JwtAuthGuard)
  async getHubSpotWorkflows(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      // Use trial account handler for better user experience
      const result = await this.trialAccountHandler.getWorkflowsWithTrialSupport(userId);
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch HubSpot workflows:', error);
      throw new InternalServerErrorException('Failed to fetch workflows from HubSpot');
    }
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard, TrialGuard, SubscriptionGuard)
  async getProtectedWorkflows(@Req() req: any) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;

    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException(
        'User ID not found in request',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const workflows = await this.workflowService.getProtectedWorkflows(userId);
      return {
        success: true,
        data: workflows,
        count: workflows.length
      };
    } catch (error) {
      this.logger.error(`Error fetching protected workflows for user ${userId}:`, error);
      throw new HttpException(
        'Failed to fetch protected workflows',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('start-protection')
  @UseGuards(JwtAuthGuard, TrialGuard, SubscriptionGuard)
  async startWorkflowProtection(@Body() body: any, @Req() req: any) {
    const workflows = body.workflows;
    let userId = req.user?.sub || req.user?.id || req.user?.userId;

    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException(
        'User ID not found in request',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!workflows || !Array.isArray(workflows) || workflows.length === 0) {
      throw new HttpException(
        'Workflows array is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const workflowIds = workflows.map(w => w.hubspotId || w.id);
      
      console.log('🔍 CONTROLLER - Starting protection for workflows:', {
        workflowIds,
        userId,
        workflowsCount: workflows.length
      });
      
      const result = await this.workflowService.startWorkflowProtection(
        workflowIds,
        userId,
        workflows,
      );
      
      // Immediately check if workflows were actually saved
      console.log('🔍 CONTROLLER - Verifying workflows were saved...');
      const savedWorkflows = await this.workflowService.getProtectedWorkflows(userId);
      console.log('🔍 CONTROLLER - Verification result:', {
        expectedCount: workflowIds.length,
        actualCount: savedWorkflows.length,
        savedWorkflowIds: savedWorkflows.map(w => w.id),
        userId: userId
      });
      
      return result;
    } catch (error) {
      console.error('❌ CONTROLLER - Error starting workflow protection:', {
        error: error.message,
        stack: error.stack,
        userId,
        workflows: workflows?.length || 0,
        workflowIds: workflows?.map(w => w.hubspotId || w.id) || []
      });
      
      // Re-throw HttpExceptions as-is to preserve status codes and messages
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: `Failed to start workflow protection: ${error.message || 'Unknown error'}`,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('versions/:workflowId')
  @UseGuards(JwtAuthGuard, TrialGuard, SubscriptionGuard)
  async getWorkflowVersions(
    @Param('workflowId') workflowId: string,
    @Req() req: any,
  ) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;

    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException(
        'User ID not found in request',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const versions = await this.workflowService.getWorkflowVersions(
        workflowId,
        userId,
      );
      return { success: true, data: versions };
    } catch (error) {
      this.logger.error(`Error fetching workflow versions:`, error);
      throw new HttpException(
        'Failed to fetch workflow versions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('compare/:workflowId/:versionA/:versionB')
  @UseGuards(JwtAuthGuard, TrialGuard, SubscriptionGuard)
  async compareWorkflowVersions(
    @Param('workflowId') workflowId: string,
    @Param('versionA') versionA: string,
    @Param('versionB') versionB: string,
    @Req() req: any,
  ) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;

    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException(
        'User ID not found in request',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const comparison = await this.workflowService.compareWorkflowVersions(
        workflowId,
        versionA,
        versionB,
        true,
      );
      return comparison;
    } catch (error) {
      this.logger.error(`Error comparing workflow versions:`, error);
      throw new HttpException(
        'Failed to compare workflow versions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':workflowId/export-deleted')
  @UseGuards(JwtAuthGuard)
  async exportDeletedWorkflow(
    @Param('workflowId') workflowId: string,
    @Req() req: any,
  ) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;

    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException(
        'User ID not found in request',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const exportData = await this.workflowService.exportDeletedWorkflow(
        userId,
        workflowId,
      );
      return exportData;
    } catch (error) {
      this.logger.error(`Error exporting deleted workflow:`, error);
      throw new HttpException(
        'Failed to export deleted workflow',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('by-hubspot-id/:hubspotId')
  @UseGuards(JwtAuthGuard, TrialGuard, SubscriptionGuard)
  async getWorkflowByHubspotId(
    @Param('hubspotId') hubspotId: string,
    @Req() req: any,
  ) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;

    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException(
        'User ID not found in request',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const workflow = await this.workflowService.findByHubspotId(hubspotId, userId);
      return {
        success: true,
        data: workflow
      };
    } catch (error) {
      this.logger.error(`Error fetching workflow by HubSpot ID ${hubspotId}:`, error);
      throw new HttpException(
        'Failed to fetch workflow',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('by-hubspot-id/:hubspotId/versions')
  @UseGuards(JwtAuthGuard, TrialGuard, SubscriptionGuard)
  async getWorkflowVersionsByHubspotId(
    @Param('hubspotId') hubspotId: string,
    @Req() req: any,
  ) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;

    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException(
        'User ID not found in request',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const versions = await this.workflowService.getWorkflowVersions(hubspotId, userId);
      return {
        success: true,
        data: versions
      };
    } catch (error) {
      this.logger.error(`Error fetching workflow versions by HubSpot ID ${hubspotId}:`, error);
      throw new HttpException(
        'Failed to fetch workflow versions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('by-hubspot-id/:hubspotId/compare/:versionA/:versionB')
  @UseGuards(JwtAuthGuard, TrialGuard, SubscriptionGuard)
  async compareWorkflowVersionsByHubspotId(
    @Param('hubspotId') hubspotId: string,
    @Param('versionA') versionA: string,
    @Param('versionB') versionB: string,
    @Req() req: any,
  ) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;

    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException(
        'User ID not found in request',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const comparison = await this.workflowService.compareWorkflowVersions(
        hubspotId,
        versionA,
        versionB,
        true,
      );
      return comparison;
    } catch (error) {
      this.logger.error(`Error comparing workflow versions by HubSpot ID ${hubspotId}:`, error);
      throw new HttpException(
        'Failed to compare workflow versions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('sync-hubspot')
  @UseGuards(JwtAuthGuard, TrialGuard, SubscriptionGuard)
  async syncHubSpotWorkflows(@Req() req: any) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;

    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException(
        'User ID not found in request',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      console.log('🔄 SYNC - Starting HubSpot workflow sync for user:', userId);
      const hubspotWorkflows = await this.workflowService.getHubSpotWorkflows(userId);
      
      return {
        success: true,
        message: `Successfully synced ${hubspotWorkflows.length} workflows from HubSpot`,
        data: {
          syncedCount: hubspotWorkflows.length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      this.logger.error(`Error syncing HubSpot workflows for user ${userId}:`, error);
      throw new HttpException(
        'Failed to sync HubSpot workflows',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':workflowId/rollback')
  @UseGuards(JwtAuthGuard, TrialGuard, SubscriptionGuard)
  async rollbackWorkflow(
    @Param('workflowId') workflowId: string,
    @Req() req: any,
  ) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;

    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException(
        'User ID not found in request',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const result = await this.workflowService.rollbackWorkflow(workflowId, userId);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      this.logger.error(`Error rolling back workflow ${workflowId}:`, error);
      throw new HttpException(
        'Failed to rollback workflow',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':workflowId/rollback/:versionId')
  @UseGuards(JwtAuthGuard, TrialGuard, SubscriptionGuard)
  async rollbackWorkflowToVersion(
    @Param('workflowId') workflowId: string,
    @Param('versionId') versionId: string,
    @Req() req: any,
  ) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;

    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException(
        'User ID not found in request',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const result = await this.workflowService.rollbackWorkflow(workflowId, userId);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      this.logger.error(`Error rolling back workflow ${workflowId} to version ${versionId}:`, error);
      throw new HttpException(
        'Failed to rollback workflow to specific version',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':workflowId/version/:versionId/download')
  @UseGuards(JwtAuthGuard, TrialGuard, SubscriptionGuard)
  async downloadWorkflowVersion(
    @Param('workflowId') workflowId: string,
    @Param('versionId') versionId: string,
    @Req() req: any,
  ) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;

    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException(
        'User ID not found in request',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      console.log('🔽 DOWNLOAD - Downloading workflow version:', {
        workflowId,
        versionId,
        userId
      });

      const versionData = await this.workflowService.downloadWorkflowVersion(
        workflowId,
        versionId,
      );

      // Parse the data if it's a string to ensure proper JSON format
      // This fixes the double-stringification issue where encrypted data
      // is returned as a JSON string but gets stringified again in response
      let parsedData = versionData;
      if (typeof versionData === 'string') {
        try {
          parsedData = JSON.parse(versionData);
          console.log('✅ DOWNLOAD - Successfully parsed stringified JSON data');
        } catch (parseError) {
          console.warn('⚠️ DOWNLOAD - Data is not valid JSON string, returning as-is:', parseError.message);
        }
      }

      return {
        success: true,
        data: parsedData,
        message: 'Workflow version downloaded successfully'
      };
    } catch (error) {
      this.logger.error(`Error downloading workflow version ${versionId} for workflow ${workflowId}:`, error);
      throw new HttpException(
        'Failed to download workflow version',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
