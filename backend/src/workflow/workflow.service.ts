import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) {}

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

  async startWorkflowProtection(workflowNames: string[], userId: string, selectedWorkflowObjects: any[]): Promise<any[]> {
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

    for (const workflowName of workflowNames) {
      const existingWorkflow = await this.prisma.workflow.findFirst({
        where: { 
          name: workflowName,
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
        const newWorkflow = await this.prisma.workflow.create({
          data: {
            hubspotId: `mock-${Date.now()}`,
            name: workflowName,
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
      const workflows = await this.getProtectedWorkflows(userId);
      const totalVersions = workflows.reduce((sum, workflow) => sum + workflow.versions.length, 0);
      
      return {
        totalWorkflows: workflows.length,
        activeWorkflows: workflows.filter(w => w.status === 'active').length,
        protectedWorkflows: workflows.length,
        totalVersions: totalVersions,
        uptime: 99.9,
        lastSnapshot: new Date().toISOString(),
        planCapacity: 100,
        planUsed: workflows.length
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get workflow stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getDashboardStats(userId: string): Promise<any> {
    try {
      const workflows = await this.getProtectedWorkflows(userId);
      const totalVersions = workflows.reduce((sum, workflow) => sum + workflow.versions.length, 0);
      
      return {
        totalWorkflows: workflows.length,
        activeWorkflows: workflows.filter(w => w.status === 'active').length,
        protectedWorkflows: workflows.length,
        totalVersions: totalVersions,
        uptime: 99.9,
        lastSnapshot: new Date().toISOString(),
        planCapacity: 100,
        planUsed: workflows.length
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get dashboard stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
