import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';
import { StartWorkflowProtectionDto } from './dto/start-workflow-protection.dto';

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

  @Get('hubspot/:hubspotId')
  async findByHubspotId(@Param('hubspotId') hubspotId: string) {
    // Simplified - just return a mock response for now
    return { message: 'HubSpot workflow lookup not implemented in simplified version' };
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  async getProtectedWorkflows(@Req() req: any) {
    console.log('🔍 WorkflowController - getProtectedWorkflows called');
    console.log('🔍 WorkflowController - req.user:', req.user);
    
    // Try to get userId from multiple sources
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    
    // If still no userId, try to get from headers
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    console.log('🔍 WorkflowController - Determined userId:', userId);
    
    if (!userId) {
      console.log('🔍 WorkflowController - No userId found, returning empty array');
      return [];
    }

    try {
      const workflows = await this.workflowService.getProtectedWorkflows(userId);
      console.log('🔍 WorkflowController - Returning workflows:', workflows.length);
      return workflows;
    } catch (error) {
      console.error('🔍 WorkflowController - Error getting protected workflows:', error);
      return [];
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workflowService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkflowDto: UpdateWorkflowDto) {
    return this.workflowService.update(id, updateWorkflowDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workflowService.remove(id);
  }

  @Post('start-protection')
  @Public()
  async startWorkflowProtection(@Body() body: StartWorkflowProtectionDto) {
    console.log('🔍 WorkflowController - startWorkflowProtection called');
    console.log('🔍 WorkflowController - body:', body);

    try {
      // Extract workflow names from the body
      const workflowNames = body.workflows?.map(w => w.name) || [];
      const userId = body.userId;

      console.log('🔍 WorkflowController - workflowNames:', workflowNames);
      console.log('🔍 WorkflowController - userId:', userId);

      const result = await this.workflowService.startWorkflowProtection(workflowNames, userId);
      
      console.log('🔍 WorkflowController - Protection result:', result);
      return result;
    } catch (error) {
      console.error('🔍 WorkflowController - Error in startWorkflowProtection:', error);
      throw new HttpException('Failed to start workflow protection', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getWorkflowStats(@Req() req: any) {
    console.log('🔍 WorkflowController - getWorkflowStats called');
    
    let userId = req.user?.sub || req.user?.id || req.user?.userId;
    
    if (!userId) {
      userId = req.headers['x-user-id'];
    }
    
    console.log('🔍 WorkflowController - userId for stats:', userId);
    
    if (!userId) {
      return {
        totalWorkflows: 0,
        protectedWorkflows: 0,
        recentActivity: 0,
      };
    }

    try {
      const stats = await this.workflowService.getDashboardStats(userId);
      console.log('🔍 WorkflowController - Stats result:', stats);
      return stats;
    } catch (error) {
      console.error('🔍 WorkflowController - Error getting stats:', error);
      return {
        totalWorkflows: 0,
        protectedWorkflows: 0,
        recentActivity: 0,
      };
    }
  }

  // Debug endpoints
  @Get('debug/state')
  @Public()
  async getDebugState() {
    console.log('🔍 WorkflowController - getDebugState called');
    
    try {
      const allWorkflows = await this.workflowService.findAll();
      const allUsers = await this.workflowService['prisma'].user.findMany();
      
      return {
        totalWorkflows: allWorkflows.length,
        totalUsers: allUsers.length,
        workflows: allWorkflows.map(w => ({ id: w.id, name: w.name, ownerId: w.ownerId })),
        users: allUsers.map(u => ({ id: u.id, email: u.email, name: u.name })),
      };
    } catch (error) {
      console.error('🔍 WorkflowController - Error in getDebugState:', error);
      return { error: error.message };
    }
  }

  @Get('debug/user/:userId')
  @Public()
  async getDebugUser(@Param('userId') userId: string) {
    console.log('🔍 WorkflowController - getDebugUser called for:', userId);
    
    try {
      const user = await this.workflowService['prisma'].user.findUnique({
        where: { id: userId },
      });
      
      const workflows = await this.workflowService.getProtectedWorkflows(userId);
      
      return {
        user: user ? { id: user.id, email: user.email, name: user.name } : null,
        workflows: workflows.map(w => ({ id: w.id, name: w.name, ownerId: w.ownerId })),
        workflowCount: workflows.length,
      };
    } catch (error) {
      console.error('🔍 WorkflowController - Error in getDebugUser:', error);
      return { error: error.message };
    }
  }
}
