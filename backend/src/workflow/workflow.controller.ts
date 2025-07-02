import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Query } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto';

@Controller('workflows')
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
    return workflow;
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
}
