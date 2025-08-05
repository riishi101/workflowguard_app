import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { HubSpotService } from '../services/hubspot.service';

@Injectable()
export class WorkflowService {
  constructor(
    private prisma: PrismaService,
    private hubspotService: HubSpotService
  ) {}

  async create(createWorkflowDto: any) {
    return this.prisma.workflow.create({
      data: createWorkflowDto,
    });
  }

  async findAll() {
    return this.prisma.workflow.findMany({
      include: {
        owner: true,
        versions: true,
      },
    });
  }

  async getHubSpotWorkflows(userId: string): Promise<any[]> {
    try {
      console.log('🔍 WorkflowService - getHubSpotWorkflows called for userId:', userId);
      const workflows = await this.hubspotService.getWorkflows(userId);
      console.log('🔍 WorkflowService - Retrieved workflows from HubSpot:', workflows.length);
      return workflows;
    } catch (error) {
      console.error('🔍 WorkflowService - Error getting HubSpot workflows:', error);
      throw new HttpException(
        `Failed to get HubSpot workflows: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: string) {
    return this.prisma.workflow.findUnique({
      where: { id },
      include: {
        owner: true,
        versions: true,
      },
    });
  }

  async update(id: string, updateWorkflowDto: any) {
    return this.prisma.workflow.update({
      where: { id },
      data: updateWorkflowDto,
    });
  }

  async remove(id: string) {
    return this.prisma.workflow.delete({
      where: { id },
    });
  }

  async startWorkflowProtection(workflowIds: string[], userId: string, selectedWorkflowObjects: any[]): Promise<any[]> {
    let finalUserId = userId;
    if (!finalUserId) {
      finalUserId = 'default-user-id';
    }

    // Check if user exists, create if not
    let user = await this.prisma.user.findUnique({
      where: { id: finalUserId },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          id: finalUserId,
          email: 'default@example.com',
          name: 'Default User',
          role: 'user',
        },
      });
    }

    const protectedWorkflows = [];

    for (const workflowId of workflowIds) {
      // Try to find the workflow by ID
      const existingWorkflow = await this.prisma.workflow.findFirst({
        where: {
          id: workflowId,
          ownerId: finalUserId
        }
      });

      if (existingWorkflow) {
        const updatedWorkflow = await this.prisma.workflow.update({
          where: { id: existingWorkflow.id },
          data: {
            updatedAt: new Date(),
          },
          include: {
            owner: true,
            versions: true,
          }
        });
        protectedWorkflows.push(updatedWorkflow);
      } else {
        // Try to find the workflow object from selectedWorkflowObjects
        const workflowObj = selectedWorkflowObjects?.find((w: any) => w.id === workflowId);
        const newWorkflow = await this.prisma.workflow.create({
          data: {
            id: workflowId,
            hubspotId: workflowObj?.hubspotId || workflowId,
            name: workflowObj?.name || 'Unnamed Workflow',
            ownerId: finalUserId,
          },
          include: {
            owner: true,
            versions: true,
          }
        });
        protectedWorkflows.push(newWorkflow);
      }
    }

    return protectedWorkflows;
  }

  async getProtectedWorkflows(userId: string): Promise<any[]> {
    if (!userId) {
      return [];
    }

    try {
      const workflows = await this.prisma.workflow.findMany({
        where: { ownerId: userId },
        include: {
          owner: true,
          versions: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      return workflows;
    } catch (error) {
      return [];
    }
  }

  async getProtectedWorkflowIds(userId: string): Promise<string[]> {
    const workflows = await this.getProtectedWorkflows(userId);
    return workflows.map(workflow => workflow.id);
  }

  async syncHubSpotWorkflows(userId: string): Promise<any[]> {
    try {
      const { HubSpotService } = await import('../services/hubspot.service');
      const hubspotService = new HubSpotService(this.prisma);
      
      const hubspotWorkflows = await hubspotService.getWorkflows(userId);

      const syncedWorkflows = [];
      
      for (const hubspotWorkflow of hubspotWorkflows) {
        const existingWorkflow = await this.prisma.workflow.findFirst({
          where: { 
            hubspotId: hubspotWorkflow.id,
            ownerId: userId 
          }
        });

        if (existingWorkflow) {
          const updatedWorkflow = await this.prisma.workflow.update({
            where: { id: existingWorkflow.id },
            data: {
              name: hubspotWorkflow.name,
              updatedAt: new Date(),
            },
            include: {
              owner: true,
              versions: true,
            }
          });
          syncedWorkflows.push(updatedWorkflow);
        } else {
          const newWorkflow = await this.prisma.workflow.create({
            data: {
              hubspotId: hubspotWorkflow.id,
              name: hubspotWorkflow.name,
              ownerId: userId,
            },
            include: {
              owner: true,
              versions: true,
            }
          });
          syncedWorkflows.push(newWorkflow);
        }
      }

      return syncedWorkflows;

    } catch (error) {
      throw new HttpException(
        `Failed to sync HubSpot workflows: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createAutomatedBackup(workflowId: string, userId: string): Promise<any> {
    try {
      const { WorkflowVersionService } = await import('../workflow-version/workflow-version.service');
      const workflowVersionService = new WorkflowVersionService(this.prisma);
      
      const backup = await workflowVersionService.createAutomatedBackup(workflowId, userId);
      return backup;
    } catch (error) {
      throw new HttpException(
        `Failed to create automated backup: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createChangeNotification(workflowId: string, userId: string, changes: any): Promise<void> {
    try {
      const { WorkflowVersionService } = await import('../workflow-version/workflow-version.service');
      const workflowVersionService = new WorkflowVersionService(this.prisma);
      
      await workflowVersionService.createChangeNotification(workflowId, userId, changes);
    } catch (error) {
      throw new HttpException(
        `Failed to create change notification: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createApprovalRequest(workflowId: string, userId: string, requestedChanges: any): Promise<any> {
    try {
      const { WorkflowVersionService } = await import('../workflow-version/workflow-version.service');
      const workflowVersionService = new WorkflowVersionService(this.prisma);
      
      const approvalRequest = await workflowVersionService.createApprovalWorkflow(workflowId, userId, requestedChanges);
      return approvalRequest;
    } catch (error) {
      throw new HttpException(
        `Failed to create approval request: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async generateComplianceReport(workflowId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      const { WorkflowVersionService } = await import('../workflow-version/workflow-version.service');
      const workflowVersionService = new WorkflowVersionService(this.prisma);
      
      const report = await workflowVersionService.generateComplianceReport(workflowId, startDate, endDate);
      return report;
    } catch (error) {
      throw new HttpException(
        `Failed to generate compliance report: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async restoreWorkflowVersion(workflowId: string, versionId: string, userId: string): Promise<any> {
    try {
      const { WorkflowVersionService } = await import('../workflow-version/workflow-version.service');
      const workflowVersionService = new WorkflowVersionService(this.prisma);
      
      const result = await workflowVersionService.restoreWorkflowVersion(workflowId, versionId, userId);
      return result;
    } catch (error) {
      throw new HttpException(
        `Failed to restore workflow version: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async rollbackWorkflow(workflowId: string, userId: string): Promise<any> {
    try {
      const { WorkflowVersionService } = await import('../workflow-version/workflow-version.service');
      const workflowVersionService = new WorkflowVersionService(this.prisma);
      
      const result = await workflowVersionService.rollbackWorkflow(workflowId, userId);
      return result;
    } catch (error) {
      throw new HttpException(
        `Failed to rollback workflow: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async downloadWorkflowVersion(workflowId: string, versionId: string): Promise<any> {
    try {
      const { WorkflowVersionService } = await import('../workflow-version/workflow-version.service');
      const workflowVersionService = new WorkflowVersionService(this.prisma);
      
      const version = await workflowVersionService.findOne(versionId);
      return version;
    } catch (error) {
      throw new HttpException(
        `Failed to download workflow version: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getWorkflowStats(userId: string): Promise<any> {
    try {
      // Get workflows with version counts
      const workflows = await this.prisma.workflow.findMany({
        where: { ownerId: userId },
        include: {
          versions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      // Calculate detailed stats
      const stats = workflows.map(workflow => {
        const versions = workflow.versions;
        const latestVersion = versions[0];
        const totalSteps = latestVersion ? this.calculateWorkflowSteps(latestVersion.data) : 0;
        const totalContacts = latestVersion ? this.calculateWorkflowContacts(latestVersion.data) : 0;

        return {
          id: workflow.id,
          name: workflow.name,
          lastSnapshot: latestVersion?.createdAt.toISOString() || workflow.createdAt.toISOString(),
          versions: versions.length,
          lastModifiedBy: {
            name: 'System', // Would be real user in production
            initials: 'S',
            email: 'system@workflowguard.com',
          },
          status: 'active',
          protectionStatus: 'protected',
          lastModified: latestVersion?.createdAt.toISOString() || workflow.updatedAt.toISOString(),
          steps: totalSteps,
          contacts: totalContacts,
        };
      });

      return stats;
    } catch (error) {
      throw new HttpException(
        `Failed to get workflow stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getDashboardStats(userId: string): Promise<any> {
    try {
      // Get user with subscription for plan limits
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Get protected workflows with optimized query
      const protectedWorkflows = await this.prisma.workflow.findMany({
        where: { ownerId: userId },
        include: {
          versions: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Only get latest version for count
          },
        },
      });

      // Calculate stats efficiently
      const totalWorkflows = protectedWorkflows.length;
      const activeWorkflows = protectedWorkflows.filter(w => w.versions.length > 0).length;
      const totalVersions = protectedWorkflows.reduce((sum, w) => sum + w.versions.length, 0);

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentActivity = await this.prisma.auditLog.count({
        where: {
          userId: userId,
          timestamp: { gte: sevenDaysAgo },
        },
      });

      // Calculate plan usage
      const planCapacity = user.subscription?.planId === 'professional' ? 25 : 
                          user.subscription?.planId === 'enterprise' ? 999999 : 5;
      const planUsed = totalWorkflows;

      // Calculate uptime (mock for now, would be real in production)
      const uptime = 99.9; // Mock uptime percentage

      // Get last snapshot time
      const lastSnapshot = protectedWorkflows.length > 0 ? 
        Math.max(...protectedWorkflows.map(w => 
          w.versions.length > 0 ? new Date(w.versions[0].createdAt).getTime() : 0
        )) : Date.now();

      return {
        totalWorkflows,
        activeWorkflows,
        protectedWorkflows: totalWorkflows,
        totalVersions,
        uptime,
        lastSnapshot: new Date(lastSnapshot).toISOString(),
        planCapacity,
        planUsed,
        recentActivity,
        planId: user.subscription?.planId || 'starter',
        planStatus: user.subscription?.status || 'active',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get dashboard stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private calculateWorkflowSteps(workflowData: any): number {
    try {
      if (typeof workflowData === 'string') {
        workflowData = JSON.parse(workflowData);
      }
      
      // Count steps in workflow data
      if (workflowData.steps && Array.isArray(workflowData.steps)) {
        return workflowData.steps.length;
      }
      
      // Alternative counting method
      if (workflowData.actions && Array.isArray(workflowData.actions)) {
        return workflowData.actions.length;
      }
      
      return 0;
    } catch (error) {
      return 0;
    }
  }

  private calculateWorkflowContacts(workflowData: any): number {
    try {
      if (typeof workflowData === 'string') {
        workflowData = JSON.parse(workflowData);
      }
      
      // Mock contact count based on workflow complexity
      const steps = this.calculateWorkflowSteps(workflowData);
      return Math.floor(steps * 10); // Mock calculation
    } catch (error) {
      return 0;
    }
  }
}
