import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RateLimitGuard, RateLimit } from '../auth/rate-limit.guard';
import { TrialGuard } from '../guards/trial.guard';
import { SubscriptionGuard } from '../guards/subscription.guard';
import { SecurityMonitoringService } from '../services/security-monitoring.service';

@Controller('workflow')
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly securityMonitoringService: SecurityMonitoringService,
  ) {}

  @Post()
  create(@Body() createWorkflowDto: CreateWorkflowDto) {
    return this.workflowService.create(createWorkflowDto);
  }

  @Get()
  findAll() {
    return this.workflowService.findAll();
  }

  @Get('by-hubspot-id/:hubspotId')
  @UseGuards(JwtAuthGuard, TrialGuard, SubscriptionGuard)
  async findByHubspotId(
    @Param('hubspotId') hubspotId: string,
    @Req() req: any,
  ) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;

    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const workflow = await this.workflowService.findByHubspotId(
        hubspotId,
        userId,
      );
      return {
        success: true,
        data: workflow,
        message: 'Workflow found successfully',
      };
    } catch (error) {
      console.error('Failed to find workflow by HubSpot ID:', error);

      // Record failed access attempt for security monitoring
      this.securityMonitoringService.recordFailedAccess({
        ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
        endpoint: req.url,
        method: req.method,
        error: error.message,
        userAgent: req.get('User-Agent'),
        timestamp: new Date(),
      });

      throw new HttpException(
        'Workflow not found or access denied',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('hubspot/:hubspotId')
  async findByHubspotIdLegacy(@Param('hubspotId') hubspotId: string) {
    return {
      message: 'HubSpot workflow lookup not implemented in simplified version',
    };
  }

  @Get('hubspot')
  @UseGuards(JwtAuthGuard, TrialGuard, SubscriptionGuard)
  async getHubSpotWorkflows(@Req() req: any) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;

    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const workflows = await this.workflowService.getHubSpotWorkflows(userId);
      return {
        success: true,
        data: workflows,
        message: `Successfully fetched ${workflows.length} workflows from HubSpot`,
      };
    } catch (error) {
      console.error('Failed to fetch HubSpot workflows:', error);
      throw new HttpException(
        `Failed to fetch HubSpot workflows: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      return [];
    }

    try {
      const workflows =
        await this.workflowService.getProtectedWorkflows(userId);
      return {
        success: true,
        data: workflows,
        message: `Successfully fetched ${workflows.length} protected workflows`,
      };
    } catch (error) {
      console.error('Failed to fetch protected workflows:', error);
      throw new HttpException(
        `Failed to fetch protected workflows: ${error.message}`,
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
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const workflows = await this.workflowService.syncHubSpotWorkflows(userId);
      return {
        success: true,
        data: workflows,
        message: `Successfully synced ${workflows.length} workflows from HubSpot`,
      };
    } catch (error) {
      console.error('Failed to sync HubSpot workflows:', error);
      throw new HttpException(
        `Failed to sync HubSpot workflows: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/automated-backup')
  @UseGuards(JwtAuthGuard, TrialGuard)
  async createAutomatedBackup(
    @Param('id') workflowId: string,
    @Req() req: any,
  ) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const backup = await this.workflowService.createAutomatedBackup(
        workflowId,
        userId,
      );
      return {
        message: 'Automated backup created successfully',
        backup: backup,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to create automated backup: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/change-notification')
  @UseGuards(JwtAuthGuard, TrialGuard)
  async createChangeNotification(
    @Param('id') workflowId: string,
    @Body() changes: any,
    @Req() req: any,
  ) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      await this.workflowService.createChangeNotification(
        workflowId,
        userId,
        changes,
      );
      return {
        message: 'Change notification created successfully',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to create change notification: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/approval-request')
  @UseGuards(JwtAuthGuard, TrialGuard)
  async createApprovalRequest(
    @Param('id') workflowId: string,
    @Body() requestedChanges: any,
    @Req() req: any,
  ) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const approvalRequest = await this.workflowService.createApprovalRequest(
        workflowId,
        userId,
        requestedChanges,
      );
      return {
        message: 'Approval request created successfully',
        approvalRequest: approvalRequest,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to create approval request: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/compliance-report')
  @UseGuards(JwtAuthGuard, TrialGuard)
  async generateComplianceReport(
    @Param('id') workflowId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: any,
  ) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const report = await this.workflowService.generateComplianceReport(
        workflowId,
        start,
        end,
      );
      return report;
    } catch (error) {
      throw new HttpException(
        `Failed to generate compliance report: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, TrialGuard)
  async findOne(@Param('id') id: string, @Req() req: any) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;

    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const workflow = await this.workflowService.findOne(id, userId);
      return {
        success: true,
        data: workflow,
        message: 'Workflow found successfully',
      };
    } catch (error) {
      console.error('Failed to find workflow:', error);
      throw new HttpException(
        'Workflow not found or access denied',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
  ) {
    return this.workflowService.update(id, updateWorkflowDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workflowService.remove(id);
  }

  @Post(':id/rollback/:versionId')
  @UseGuards(JwtAuthGuard, TrialGuard, RateLimitGuard)
  @RateLimit({ windowMs: 60 * 1000, maxRequests: 10 }) // 10 rollback requests per minute
  async restoreWorkflowVersion(
    @Param('id') workflowId: string,
    @Param('versionId') versionId: string,
    @Req() req: any,
  ) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const result = await this.workflowService.restoreWorkflowVersion(
        workflowId,
        versionId,
        userId,
      );
      return {
        message: 'Workflow restored successfully',
        result: result,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to restore workflow: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/rollback')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async rollbackWorkflow(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const result = await this.workflowService.rollbackWorkflow(id, userId);
      return {
        success: true,
        data: result,
        message: 'Workflow rolled back successfully',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to rollback workflow: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/restore-deleted')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async restoreDeletedWorkflow(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const result = await this.workflowService.restoreDeletedWorkflow(
        id,
        userId,
      );
      return {
        success: true,
        data: result,
        message: 'Workflow restored successfully',
      };
    } catch (error) {
      console.error('❌ Error restoring deleted workflow:', error);
      throw new HttpException(
        error.message || 'Failed to restore workflow',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/export-deleted')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async exportDeletedWorkflow(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const exportData = await this.workflowService.exportDeletedWorkflow(
        id,
        userId,
      );
      return {
        success: true,
        data: exportData,
        message: 'Workflow data exported successfully',
      };
    } catch (error) {
      console.error('❌ Error exporting deleted workflow:', error);
      throw new HttpException(
        error.message || 'Failed to export workflow data',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/version/:versionId/download')
  @UseGuards(JwtAuthGuard, TrialGuard)
  async downloadWorkflowVersion(
    @Param('id') workflowId: string,
    @Param('versionId') versionId: string,
  ) {
    try {
      const versionData = await this.workflowService.downloadWorkflowVersion(
        workflowId,
        versionId,
      );
      return versionData;
    } catch (error) {
      throw new HttpException(
        `Failed to download workflow version: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/compare/:versionA/:versionB')
  @UseGuards(JwtAuthGuard, TrialGuard, SubscriptionGuard)
  async compareWorkflowVersions(
    @Param('id') workflowId: string,
    @Param('versionA') versionA: string,
    @Param('versionB') versionB: string,
    @Req() req: any,
  ) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const comparison = await this.workflowService.compareWorkflowVersions(
        workflowId,
        versionA,
        versionB,
        true, // Enable detailed property comparison
      );
      return {
        success: true,
        data: comparison,
        message: 'Workflow versions compared successfully',
      };
    } catch (error) {
      console.error('Failed to compare workflow versions:', error);
      throw new HttpException(
        `Failed to compare workflow versions: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('start-protection')
  @UseGuards(JwtAuthGuard, TrialGuard, SubscriptionGuard, RateLimitGuard)
  @RateLimit({ windowMs: 60 * 1000, maxRequests: 5 }) // 5 requests per minute for protection start
  async startWorkflowProtection(@Body() body: any, @Req() req: any) {
    console.log('🚨 CONTROLLER - start-protection called with body:', JSON.stringify(body));
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    // Accept 'workflows' array from frontend
    if (!body || !Array.isArray(body.workflows)) {
      throw new HttpException(
        'Invalid request: workflows array required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate each workflow object has id or hubspotId
    const invalidWorkflows = body.workflows.filter(
      (w: any) => !w.id && !w.hubspotId,
    );
    if (invalidWorkflows.length > 0) {
      console.error('Invalid workflow objects received:', invalidWorkflows);
      throw new HttpException(
        'Each workflow must have an id or hubspotId',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const workflowIds = body.workflows.map(
        (w: any) => w.id || w.hubspotId || w.workflowId,
      );
      console.log('start-protection: workflowIds:', workflowIds);
      console.log('start-protection: workflows:', body.workflows);
      const result = await this.workflowService.startWorkflowProtection(
        workflowIds,
        userId,
        body.workflows,
      );
      return {
        success: true,
        message: 'Workflow protection started successfully',
        data: result,
      };
    } catch (error) {
      console.error('❌ CONTROLLER - start-protection error:', {
        error: error.message,
        stack: error.stack,
        userId,
        workflowCount: body.workflows?.length,
        errorType: error.constructor.name,
      });
      
      // Handle specific error types
      if (error instanceof HttpException) {
        throw error;
      }
      
      // For any other errors, provide a more user-friendly message
      throw new HttpException(
        `Failed to start workflow protection: ${error.message || 'An unexpected error occurred'}`,
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
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      // First find the internal workflow ID by HubSpot ID
      const workflow = await this.workflowService.findByHubspotId(
        hubspotId,
        userId,
      );
      if (!workflow) {
        throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
      }

      const versions = await this.workflowService.getWorkflowVersions(
        workflow.id,
        userId,
      );

      return {
        success: true,
        data: versions,
        message: `Successfully fetched ${versions.length} versions for workflow ${hubspotId}`,
      };
    } catch (error) {
      console.error('Failed to fetch workflow versions by HubSpot ID:', error);
      throw new HttpException(
        `Failed to fetch workflow versions: ${error.message}`,
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
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      // First find the internal workflow ID by HubSpot ID
      const workflow = await this.workflowService.findByHubspotId(
        hubspotId,
        userId,
      );
      if (!workflow) {
        throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
      }

      const comparison = await this.workflowService.compareWorkflowVersions(
        workflow.id,
        versionA,
        versionB,
      );
      return {
        success: true,
        data: comparison,
        message: 'Workflow versions compared successfully',
      };
    } catch (error) {
      console.error(
        'Failed to compare workflow versions by HubSpot ID:',
        error,
      );
      throw new HttpException(
        `Failed to compare workflow versions: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/versions')
  @UseGuards(JwtAuthGuard, TrialGuard, SubscriptionGuard)
  async getWorkflowVersions(@Param('id') workflowId: string, @Req() req: any) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const versions = await this.workflowService.getWorkflowVersions(
        workflowId,
        userId,
      );

      // If no versions found, try to create an initial version
      if (versions.length === 0) {
        await this.workflowService.createInitialVersionIfMissing(
          workflowId,
          userId,
        );
        // Retry getting versions after creating initial version
        const newVersions = await this.workflowService.getWorkflowVersions(
          workflowId,
          userId,
        );
        return {
          success: true,
          data: newVersions,
          message: 'Initial version created and retrieved successfully',
        };
      }

      return {
        success: true,
        data: versions,
        message: 'Workflow versions retrieved successfully',
      };
    } catch (error) {
      console.error('Failed to get workflow versions:', error);
      throw new HttpException(
        'Workflow versions not found or access denied',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, TrialGuard)
  async getWorkflowStats(@Req() req: any) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const stats = await this.workflowService.getWorkflowStats(userId);
      return stats;
    } catch (error) {
      throw new HttpException(
        `Failed to get workflow stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
