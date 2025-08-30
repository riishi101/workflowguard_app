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
import { TrialGuard } from '../guards/trial.guard';

@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  create(@Body() createWorkflowDto: CreateWorkflowDto) {
    return this.workflowService.create(createWorkflowDto);
  }

  @Get()
  findAll() {
    return this.workflowService.findAll();
  }

  @Get('by-hubspot-id/:hubspotId')
  @UseGuards(JwtAuthGuard, TrialGuard)
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
  @UseGuards(JwtAuthGuard, TrialGuard)
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
  @UseGuards(JwtAuthGuard, TrialGuard)
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
  @UseGuards(JwtAuthGuard, TrialGuard)
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
  @UseGuards(JwtAuthGuard, TrialGuard)
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
  @UseGuards(JwtAuthGuard, TrialGuard)
  async rollbackWorkflow(@Param('id') workflowId: string, @Req() req: any) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const result = await this.workflowService.rollbackWorkflow(
        workflowId,
        userId,
      );
      return {
        message: 'Workflow rolled back successfully',
        result: result,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to rollback workflow: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
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
  @UseGuards(JwtAuthGuard, TrialGuard)
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
        userId,
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
  @UseGuards(JwtAuthGuard, TrialGuard)
  async startWorkflowProtection(@Body() body: any, @Req() req: any) {
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
      console.error('start-protection error:', error);
      throw new HttpException(
        `Failed to start workflow protection: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
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
