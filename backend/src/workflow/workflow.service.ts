import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Workflow, Prisma, WorkflowVersion } from '@prisma/client';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService, private userService: UserService) {}

  async create(data: CreateWorkflowDto): Promise<Workflow> {
    const { ownerId, ...rest } = data;
    // Fetch user with subscription
    const user = await this.userService.findOneWithSubscription(ownerId);
    if (!user) throw new ForbiddenException('User not found');
    const planId = user.subscription?.planId || 'starter';
    const plan = await this.userService.getPlanById(planId) || await this.userService.getPlanById('starter');
    let count = await this.prisma.workflow.count({ where: { ownerId } });
    let isOverage = false;
    if (plan?.maxWorkflows !== null && plan?.maxWorkflows !== undefined) {
      if (count >= plan.maxWorkflows) {
        isOverage = true;
      }
    }
    const workflow = await this.prisma.workflow.create({
      data: {
        ...rest,
        owner: { connect: { id: ownerId } },
      },
      include: {
        owner: true,
        versions: true,
      },
    });
    if (isOverage) {
      // Record overage for this billing period
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const month = `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}`;
      await this.prisma.overage.upsert({
        where: {
          userId_month: {
            userId: ownerId,
            month,
          },
        },
        update: { 
          workflowCount: { increment: 1 },
          overage: { increment: 1 },
        },
        create: {
          userId: ownerId,
          workflowCount: 1,
          limit: 100, // Default limit
          overage: 1,
          month,
        },
      });
    }
    return workflow;
  }

  async findAll(): Promise<Workflow[]> {
    return this.prisma.workflow.findMany({
      include: {
        owner: true,
        versions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });
  }

  async findOne(id: string): Promise<Workflow | null> {
    return this.prisma.workflow.findUnique({
      where: { id },
      include: {
        owner: true,
        versions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async findByHubspotId(hubspotId: string): Promise<Workflow | null> {
    return this.prisma.workflow.findFirst({
      where: { hubspotId },
      include: {
        owner: true,
        versions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.WorkflowUpdateInput): Promise<Workflow> {
    return this.prisma.workflow.update({
      where: { id },
      data,
      include: {
        owner: true,
        versions: true,
      },
    });
  }

  async remove(id: string): Promise<Workflow> {
    return this.prisma.workflow.delete({
      where: { id },
    });
  }

  // New methods for workflow version comparison
  async getWorkflowVersions(workflowId: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        versions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return workflow.versions.map(version => ({
      id: version.id,
      versionNumber: version.versionNumber.toString(),
      dateTime: version.createdAt.toISOString(),
      modifiedBy: {
        name: version.createdBy,
        initials: version.createdBy.split(' ').map(n => n[0]).join('').toUpperCase(),
        avatar: undefined
      },
      changeSummary: `Version ${version.versionNumber} - ${version.snapshotType}`,
      type: version.snapshotType,
      steps: Array.isArray((version.data as any)?.steps) ? (version.data as any).steps.length : 0,
      status: 'active'
    }));
  }

  async getWorkflowVersion(workflowId: string, versionId: string) {
    const version = await this.prisma.workflowVersion.findFirst({
      where: {
        id: versionId,
        workflowId: workflowId,
      },
    });

    if (!version) {
      throw new NotFoundException('Workflow version not found');
    }

    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    return {
      id: version.id,
      versionNumber: version.versionNumber,
      date: version.createdAt.toISOString(),
      creator: version.createdBy,
      type: version.snapshotType,
      steps: this.parseWorkflowSteps(version.data),
      metadata: {
        totalSteps: Array.isArray((version.data as any)?.steps) ? (version.data as any).steps.length : 0,
        activeSteps: Array.isArray((version.data as any)?.steps) ? (version.data as any).steps.filter((step: any) => !step.isRemoved).length : 0,
        lastModified: version.createdAt.toISOString(),
      },
    };
  }

  async compareWorkflowVersions(workflowId: string, versionAId: string, versionBId: string) {
    const versionA = await this.getWorkflowVersion(workflowId, versionAId);
    const versionB = await this.getWorkflowVersion(workflowId, versionBId);

    if (!versionA || !versionB) {
      throw new NotFoundException('One or both workflow versions not found');
    }

    const differences = this.calculateDifferences(versionA.steps, versionB.steps);

    return {
      versionA,
      versionB,
      differences,
    };
  }

  async restoreWorkflowVersion(workflowId: string, versionId: string, userId?: string) {
    const version = await this.prisma.workflowVersion.findFirst({
      where: {
        id: versionId,
        workflowId: workflowId,
      },
    });

    if (!version) {
      throw new NotFoundException('Workflow version not found');
    }

    // Create a new version with the restored data
    const latestVersion = await this.prisma.workflowVersion.findFirst({
      where: { workflowId },
      orderBy: { versionNumber: 'desc' },
    });

    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    const restoredVersion = await this.prisma.workflowVersion.create({
      data: {
        workflowId,
        versionNumber: newVersionNumber,
        snapshotType: 'Restored Version',
        createdBy: userId || 'system', // Use the provided user ID or fallback to system
        data: version.data as any,
      },
    });

    // Update the workflow's updatedAt timestamp
    await this.prisma.workflow.update({
      where: { id: workflowId },
      data: { updatedAt: new Date() },
    });

    return restoredVersion;
  }

  async createWorkflowFromVersion(workflowId: string, versionId: string, newName: string) {
    const version = await this.prisma.workflowVersion.findFirst({
      where: {
        id: versionId,
        workflowId: workflowId,
      },
    });

    if (!version) {
      throw new NotFoundException('Workflow version not found');
    }

    const originalWorkflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!originalWorkflow) {
      throw new NotFoundException('Original workflow not found');
    }

    // Create a new workflow based on the version
    const newWorkflow = await this.prisma.workflow.create({
      data: {
        hubspotId: `${originalWorkflow.hubspotId}_copy_${Date.now()}`,
        name: newName,
        ownerId: originalWorkflow.ownerId,
      },
    });

    // Create the first version for the new workflow
    await this.prisma.workflowVersion.create({
      data: {
        workflowId: newWorkflow.id,
        versionNumber: 1,
        snapshotType: 'Initial Version (from copy)',
        createdBy: 'system',
        data: version.data as any,
      },
    });

    return newWorkflow;
  }

  private calculateChanges(data: any) {
    if (!data || !Array.isArray((data as any).steps)) {
      return { added: 0, modified: 0, removed: 0 };
    }

    const steps = (data as any).steps;
    return {
      added: steps.filter((step: any) => step.isNew).length,
      modified: steps.filter((step: any) => step.isModified).length,
      removed: steps.filter((step: any) => step.isRemoved).length,
    };
  }

  private parseWorkflowSteps(data: any) {
    if (!data || !Array.isArray(data.steps)) {
      return [];
    }

    return data.steps.map((step: any) => ({
      id: step.id || `step-${Math.random().toString(36).substr(2, 9)}`,
      type: step.type || 'other',
      title: step.title || 'Untitled Step',
      description: step.description,
      config: step.config,
      isNew: step.isNew || false,
      isModified: step.isModified || false,
      isRemoved: step.isRemoved || false,
    }));
  }

  private calculateDifferences(stepsA: any[], stepsB: any[]) {
    const added = stepsB.filter(stepB => !stepsA.find(stepA => stepA.id === stepB.id));
    const removed = stepsA.filter(stepA => !stepsB.find(stepB => stepB.id === stepA.id));
    const modified = stepsB.filter(stepB => {
      const stepA = stepsA.find(stepA => stepA.id === stepB.id);
      return stepA && JSON.stringify(stepA) !== JSON.stringify(stepB);
    });

    return { added, modified, removed };
  }

  async startWorkflowProtection(workflowIds: string[], userId: string) {
    try {
      console.log('WorkflowService - startWorkflowProtection called with:', { workflowIds, userId });
      
      // Use a transaction to ensure all workflows are created atomically
      const result = await this.prisma.$transaction(async (tx) => {
        const protectedWorkflows: any[] = [];
        
        for (const hubspotWorkflowId of workflowIds) {
          console.log('WorkflowService - Processing workflow:', hubspotWorkflowId);
          
          // Check if workflow already exists
          let workflow = await tx.workflow.findFirst({
            where: { hubspotId: hubspotWorkflowId }
          });

          console.log('WorkflowService - Existing workflow found:', !!workflow);

          if (!workflow) {
            console.log('WorkflowService - Creating new workflow for:', hubspotWorkflowId);
            // Create new workflow record
            workflow = await tx.workflow.create({
              data: {
                hubspotId: hubspotWorkflowId,
                name: `Workflow ${hubspotWorkflowId}`, // This would be fetched from HubSpot in real implementation
                ownerId: userId,
              },
            });
            console.log('WorkflowService - Created workflow:', workflow.id);
          }

          // Check if workflow already has versions (already protected)
          const existingVersions = await tx.workflowVersion.findMany({
            where: { workflowId: workflow.id }
          });

          console.log('WorkflowService - Existing versions count:', existingVersions.length);

          if (existingVersions.length === 0) {
            console.log('WorkflowService - Creating initial version for workflow:', workflow.id);
            // Create initial version for the workflow
            await tx.workflowVersion.create({
              data: {
                workflowId: workflow.id,
                versionNumber: 1,
                snapshotType: 'Initial Protection',
                createdBy: userId,
                data: {
                  steps: [],
                  metadata: {
                    hubspotWorkflowId,
                    protectedAt: new Date().toISOString(),
                  }
                },
              },
            });
            console.log('WorkflowService - Created initial version');
          }

          protectedWorkflows.push(workflow);
        }
        
        return protectedWorkflows;
      });

      console.log('WorkflowService - Successfully protected workflows:', result.length);
      return {
        message: `Successfully started protection for ${result.length} workflows`,
        protectedWorkflows: result.map(w => ({
          id: w.id,
          hubspotId: w.hubspotId,
          name: w.name,
        }))
      };
    } catch (error) {
      console.error('WorkflowService - startWorkflowProtection error:', error);
      console.error('WorkflowService - Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new Error('Failed to start workflow protection');
    }
  }

  async getProtectedWorkflowIds(userId: string): Promise<string[]> {
    try {
      const protectedWorkflows = await this.prisma.workflow.findMany({
        where: { ownerId: userId },
        select: { hubspotId: true }
      });
      
      return protectedWorkflows.map(w => w.hubspotId).filter(Boolean);
    } catch (error) {
      throw new Error('Failed to get protected workflow IDs');
    }
  }

  async getProtectedWorkflows(userId: string) {
    try {
      const workflows = await this.prisma.workflow.findMany({
        where: { ownerId: userId },
        include: {
          versions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      return workflows.map(workflow => {
        const latestVersion = workflow.versions[0];
        const status = this.determineWorkflowStatus(workflow);
        
        return {
          id: workflow.id,
          name: workflow.name,
          lastSnapshot: latestVersion?.createdAt.toISOString() || workflow.updatedAt.toISOString(),
          versions: workflow.versions.length,
          lastModifiedBy: {
            name: latestVersion?.createdBy || 'Unknown',
            initials: (latestVersion?.createdBy || 'Unknown').split(' ').map(n => n[0]).join('').toUpperCase(),
            email: 'user@example.com', // Would be fetched from user service
          },
          status,
          protectionStatus: 'protected',
          lastModified: workflow.updatedAt.toISOString(),
          steps: 0, // Will be populated from HubSpot API
          contacts: 0, // Will be populated from HubSpot API
        };
      });
    } catch (error) {
      throw new Error('Failed to get protected workflows');
    }
  }

  private determineWorkflowStatus(workflow: any): 'active' | 'inactive' | 'error' {
    // In a real implementation, this would check HubSpot API for actual status
    // For now, we'll use a simple heuristic based on last activity
    const lastActivity = workflow.updatedAt;
    const daysSinceLastActivity = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastActivity > 30) {
      return 'inactive';
    } else if (daysSinceLastActivity > 7) {
      return 'error';
    } else {
      return 'active';
    }
  }

  async getDashboardStats(userId: string) {
    try {
      const workflows = await this.prisma.workflow.findMany({
        where: { ownerId: userId },
        include: {
          versions: true,
        },
      });

      const totalVersions = workflows.reduce((sum, workflow) => sum + workflow.versions.length, 0);
      const activeWorkflows = workflows.length;
      const protectedWorkflows = workflows.length; // All workflows in our system are protected

      return {
        totalWorkflows: activeWorkflows,
        activeWorkflows,
        protectedWorkflows,
        totalVersions,
        uptime: null, // Will be calculated from real data
        lastSnapshot: new Date().toISOString(),
        planCapacity: null, // Will be populated from subscription data
        planUsed: activeWorkflows,
      };
    } catch (error) {
      throw new Error('Failed to get dashboard stats');
    }
  }

  async rollbackWorkflow(workflowId: string, userId: string) {
    try {
      // Get the latest version of the workflow
      const latestVersion = await this.prisma.workflowVersion.findFirst({
        where: { workflowId },
        orderBy: { createdAt: 'desc' },
      });

      if (!latestVersion) {
        throw new Error('No versions found for this workflow');
      }

      // Create a new version with the rollback data
      const newVersion = await this.prisma.workflowVersion.create({
        data: {
          workflowId,
          versionNumber: latestVersion.versionNumber + 1,
          snapshotType: 'Rollback',
          createdBy: userId,
          data: latestVersion.data as any,
        },
      });

      // Update workflow's updatedAt timestamp
      await this.prisma.workflow.update({
        where: { id: workflowId },
        data: { updatedAt: new Date() },
      });

      return {
        message: 'Workflow rolled back successfully',
        newVersion,
      };
    } catch (error) {
      throw new Error('Failed to rollback workflow');
    }
  }

  async exportDashboardData(userId: string) {
    try {
      const workflows = await this.prisma.workflow.findMany({
        where: { ownerId: userId },
        include: {
          versions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      const exportData = {
        exportDate: new Date().toISOString(),
        totalWorkflows: workflows.length,
        workflows: workflows.map(workflow => ({
          id: workflow.id,
          name: workflow.name,
          hubspotId: workflow.hubspotId,
          versionCount: workflow.versions.length,
          lastModified: workflow.updatedAt.toISOString(),
          versions: workflow.versions.map(version => ({
            id: version.id,
            versionNumber: version.versionNumber,
            snapshotType: version.snapshotType,
            createdAt: version.createdAt.toISOString(),
            createdBy: version.createdBy,
          })),
        })),
      };

      return exportData;
    } catch (error) {
      throw new Error('Failed to export dashboard data');
    }
  }
}
