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
      return workflows;
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
}
