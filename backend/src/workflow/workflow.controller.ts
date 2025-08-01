import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto';

@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  async create(@Body() createWorkflowDto: CreateWorkflowDto) {
    try {
      return await this.workflowService.create(createWorkflowDto);
    } catch (error) {
      throw new HttpException('Failed to create workflow', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll(@Query('ownerId') ownerId?: string) {
    if (ownerId) {
      // Filter by owner if provided
      return await this.workflowService.findAll().then(workflows => 
        workflows.filter(w => w.ownerId === ownerId)
      );
    }
    return await this.workflowService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const workflow = await this.workflowService.findOne(id);
    if (!workflow) {
      throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
    }
    
    // Get version count for this workflow
    const versionCount = await this.workflowService.getWorkflowVersions(id);
    
    return {
      id: workflow.id,
      name: workflow.name,
      status: 'active', // You might want to add a status field to your workflow model
      lastModified: workflow.updatedAt.toISOString(),
      totalVersions: versionCount.length,
      hubspotUrl: workflow.hubspotId ? `https://app.hubspot.com/workflows/${workflow.hubspotId}` : undefined
    };
  }

  @Get('hubspot/:hubspotId')
  async findByHubspotId(@Param('hubspotId') hubspotId: string) {
    const workflow = await this.workflowService.findByHubspotId(hubspotId);
    if (!workflow) {
      throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
    }
    return workflow;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateWorkflowDto: UpdateWorkflowDto) {
    try {
      const workflow = await this.workflowService.update(id, updateWorkflowDto);
      if (!workflow) {
        throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
      }
      return workflow;
    } catch (error) {
      throw new HttpException('Failed to update workflow', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const workflow = await this.workflowService.remove(id);
      if (!workflow) {
        throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Workflow deleted successfully' };
    } catch (error) {
      throw new HttpException('Failed to delete workflow', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // New endpoints for workflow version comparison
  @Get(':id/versions')
  async getWorkflowVersions(@Param('id') id: string) {
    try {
      const versions = await this.workflowService.getWorkflowVersions(id);
      if (!versions) {
        throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
      }
      return versions;
    } catch (error) {
      throw new HttpException('Failed to fetch workflow versions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/history')
  async getWorkflowHistory(@Param('id') id: string) {
    try {
      const versions = await this.workflowService.getWorkflowVersions(id);
      if (!versions) {
        throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
      }
      return versions;
    } catch (error) {
      throw new HttpException('Failed to fetch workflow history', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/version/:versionId')
  async getWorkflowVersion(@Param('id') id: string, @Param('versionId') versionId: string) {
    try {
      const version = await this.workflowService.getWorkflowVersion(id, versionId);
      if (!version) {
        throw new HttpException('Workflow version not found', HttpStatus.NOT_FOUND);
      }
      return version;
    } catch (error) {
      throw new HttpException('Failed to fetch workflow version', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/compare')
  async compareWorkflowVersions(
    @Param('id') id: string,
    @Query('versionA') versionA: string,
    @Query('versionB') versionB: string
  ) {
    try {
      if (!versionA || !versionB) {
        throw new HttpException('Both versionA and versionB are required', HttpStatus.BAD_REQUEST);
      }
      
      const comparison = await this.workflowService.compareWorkflowVersions(id, versionA, versionB);
      if (!comparison) {
        throw new HttpException('Failed to compare workflow versions', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      return comparison;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to compare workflow versions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/restore/:versionId')
  async restoreWorkflowVersion(@Param('id') id: string, @Param('versionId') versionId: string, @Req() req: Request) {
    try {
      const userId = (req.user as any)?.sub;
      if (!userId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      const result = await this.workflowService.restoreWorkflowVersion(id, versionId, userId);
      if (!result) {
        throw new HttpException('Failed to restore workflow version', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      return { message: 'Workflow version restored successfully', data: result };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to restore workflow version', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/version/:versionId/download')
  async downloadWorkflowVersion(@Param('id') id: string, @Param('versionId') versionId: string) {
    try {
      const version = await this.workflowService.getWorkflowVersion(id, versionId);
      if (!version) {
        throw new HttpException('Workflow version not found', HttpStatus.NOT_FOUND);
      }
      
      const workflow = await this.workflowService.findOne(id);
      if (!workflow) {
        throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
      }

      return {
        workflowName: workflow.name,
        versionNumber: version.versionNumber,
        createdAt: version.date,
        data: version.steps,
        metadata: version.metadata
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to download workflow version', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/version/:versionId/create-new')
  async createWorkflowFromVersion(
    @Param('id') id: string, 
    @Param('versionId') versionId: string,
    @Body() body: { name: string }
  ) {
    try {
      const result = await this.workflowService.createWorkflowFromVersion(id, versionId, body.name);
      if (!result) {
        throw new HttpException('Failed to create new workflow from version', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      return { message: 'New workflow created successfully', data: result };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to create new workflow from version', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Start workflow protection
  @Post('start-protection')
  async startWorkflowProtection(@Body() body: { workflowIds: string[] }, @Req() req: Request) {
    try {
      console.log('WorkflowController - startWorkflowProtection called with body:', body);
      console.log('WorkflowController - req.user:', req.user);
      
      const userId = (req.user as any)?.sub;
      console.log('WorkflowController - Extracted userId:', userId);
      
      if (!userId) {
        console.log('WorkflowController - No userId found, throwing unauthorized');
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      
      console.log('WorkflowController - Calling workflowService.startWorkflowProtection with:', { workflowIds: body.workflowIds, userId });
      const result = await this.workflowService.startWorkflowProtection(body.workflowIds, userId);
      console.log('WorkflowController - startWorkflowProtection result:', result);
      
      return { message: 'Workflow protection started successfully', data: result };
    } catch (error) {
      console.error('WorkflowController - startWorkflowProtection error:', error);
      console.error('WorkflowController - Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to start workflow protection', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get protected workflows
  @Get('protected')
  async getProtectedWorkflows(@Req() req: Request) {
    try {
      const userId = (req.user as any)?.sub;
      if (!userId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      
      const workflows = await this.workflowService.getProtectedWorkflows(userId);
      return workflows;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to get protected workflows', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get dashboard stats
  @Get('stats')
  async getDashboardStats(@Req() req: Request) {
    try {
      const userId = (req.user as any)?.sub;
      if (!userId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      
      const stats = await this.workflowService.getDashboardStats(userId);
      return stats;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to get dashboard stats', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Rollback workflow
  @Post(':id/rollback')
  async rollbackWorkflow(@Param('id') id: string, @Req() req: Request) {
    try {
      const userId = (req.user as any)?.sub;
      if (!userId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      
      const result = await this.workflowService.rollbackWorkflow(id, userId);
      return { message: 'Workflow rolled back successfully', data: result };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to rollback workflow', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Export dashboard data
  @Post('export')
  async exportDashboardData(@Req() req: Request) {
    try {
      const userId = (req.user as any)?.sub;
      if (!userId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      
      const exportData = await this.workflowService.exportDashboardData(userId);
      return { message: 'Dashboard data exported successfully', data: exportData };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to export dashboard data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
