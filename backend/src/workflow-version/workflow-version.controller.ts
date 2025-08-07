import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { WorkflowVersionService } from './workflow-version.service';
import { CreateWorkflowVersionDto } from './dto/create-workflow-version.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('workflow-version')
export class WorkflowVersionController {
  constructor(private readonly workflowVersionService: WorkflowVersionService) {}

  @Post()
  create(@Body() createWorkflowVersionDto: CreateWorkflowVersionDto) {
    return this.workflowVersionService.create(createWorkflowVersionDto);
  }

  @Get()
  findAll() {
    return this.workflowVersionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workflowVersionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkflowVersionDto: any) {
    return this.workflowVersionService.update(id, updateWorkflowVersionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workflowVersionService.remove(id);
  }

  @Get('by-hubspot-id/:hubspotId/history')
  @UseGuards(JwtAuthGuard)
  async getWorkflowHistoryByHubspotId(@Param('hubspotId') hubspotId: string, @Req() req: any) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const history = await this.workflowVersionService.findByHubspotIdWithHistory(hubspotId, userId);
      return {
        success: true,
        data: history,
        message: 'Workflow history retrieved successfully'
      };
    } catch (error) {
      console.error('Failed to get workflow history by HubSpot ID:', error);
      throw new HttpException(
        'Workflow history not found or access denied',
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Get(':workflowId/history')
  @UseGuards(JwtAuthGuard)
  async getWorkflowHistory(@Param('workflowId') workflowId: string, @Req() req: any) {
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    if (!userId) {
      throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const history = await this.workflowVersionService.findByWorkflowIdWithHistoryLimit(workflowId, userId);
      return history;
    } catch (error) {
      throw new HttpException(
        `Failed to get workflow history: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
