import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkflowDto: CreateWorkflowDto) {
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

  async update(id: string, updateWorkflowDto: UpdateWorkflowDto) {
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

  async startWorkflowProtection(workflowNames: string[], userId?: string) {
    console.log('🔍 WorkflowService - startWorkflowProtection called');
    console.log('🔍 WorkflowService - workflowNames:', workflowNames);
    console.log('🔍 WorkflowService - userId:', userId);

    // Determine the user ID to use
    let finalUserId = userId;
    if (!finalUserId) {
      // Try to find a default user or create one
      const defaultUser = await this.prisma.user.findFirst();
      if (defaultUser) {
        finalUserId = defaultUser.id;
        console.log('🔍 WorkflowService - Using default user:', finalUserId);
      } else {
        // Create a default user
        const newUser = await this.prisma.user.create({
          data: {
            email: 'default@workflowguard.pro',
            name: 'Default User',
            role: 'admin',
          },
        });
        finalUserId = newUser.id;
        console.log('🔍 WorkflowService - Created default user:', finalUserId);
      }
    }

    const protectedWorkflows: any[] = [];

    // Use a transaction to ensure data consistency
    await this.prisma.$transaction(async (tx) => {
      for (const workflowName of workflowNames) {
        console.log('🔍 WorkflowService - Processing workflow:', workflowName);

        // Check if workflow already exists
        const existingWorkflow = await tx.workflow.findFirst({
          where: { name: workflowName },
        });

        if (existingWorkflow) {
          // Update existing workflow's owner
          await tx.workflow.update({
            where: { id: existingWorkflow.id },
            data: { ownerId: finalUserId },
          });
          protectedWorkflows.push(existingWorkflow);
          console.log('🔍 WorkflowService - Updated existing workflow:', existingWorkflow.id);
        } else {
          // Create new workflow
          const newWorkflow = await tx.workflow.create({
            data: {
              hubspotId: `hubspot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: workflowName,
              ownerId: finalUserId,
            },
          });
          protectedWorkflows.push(newWorkflow);
          console.log('🔍 WorkflowService - Created new workflow:', newWorkflow.id);
        }
      }
    });

    console.log('🔍 WorkflowService - Protected workflows:', protectedWorkflows.length);
    return { protectedWorkflows };
  }

  async getProtectedWorkflows(userId?: string) {
    console.log('🔍 WorkflowService - getProtectedWorkflows called');
    console.log('🔍 WorkflowService - userId:', userId);

    if (!userId) {
      console.log('🔍 WorkflowService - No userId provided, returning empty array');
      return [];
    }

    const workflows = await this.prisma.workflow.findMany({
      where: { ownerId: userId },
      include: {
        owner: true,
        versions: true,
      },
    });

    console.log('🔍 WorkflowService - Found workflows:', workflows.length);
    return workflows;
  }

  async getProtectedWorkflowIds(userId?: string) {
    console.log('🔍 WorkflowService - getProtectedWorkflowIds called');
    console.log('🔍 WorkflowService - userId:', userId);

    if (!userId) {
      console.log('🔍 WorkflowService - No userId provided, returning empty array');
      return [];
    }

    const workflows = await this.prisma.workflow.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });

    const workflowIds = workflows.map(w => w.id);
    console.log('🔍 WorkflowService - Found workflow IDs:', workflowIds);
    return workflowIds;
  }

  async getDashboardStats(userId?: string) {
    console.log('🔍 WorkflowService - getDashboardStats called');
    console.log('🔍 WorkflowService - userId:', userId);

    if (!userId) {
      console.log('🔍 WorkflowService - No userId provided, returning default stats');
      return {
        totalWorkflows: 0,
        protectedWorkflows: 0,
        recentActivity: 0,
      };
    }

    const [totalWorkflows, protectedWorkflows, recentActivity] = await Promise.all([
      this.prisma.workflow.count({ where: { ownerId: userId } }),
      this.prisma.workflow.count({ where: { ownerId: userId } }),
      this.prisma.auditLog.count({ where: { userId } }),
    ]);

    const stats = {
      totalWorkflows,
      protectedWorkflows,
      recentActivity,
    };

    console.log('🔍 WorkflowService - Dashboard stats:', stats);
    return stats;
  }

  // Temporarily commented out overage-related code
  /*
  async trackWorkflowUsage(userId: string) {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    try {
      // Try to update existing overage record
      await this.prisma.overage.upsert({
        where: {
          userId_month: {
            userId,
            month: currentMonth,
          },
        },
        update: {
          workflowCount: { increment: 1 },
        },
        create: {
          userId,
          month: currentMonth,
          workflowCount: 1,
          limit: 10, // Default limit
          overage: 0,
          type: 'workflow',
        },
      });
    } catch (error) {
      console.error('Error tracking workflow usage:', error);
    }
  }
  */

  async createWorkflowVersion(workflowId: string, data: any, createdBy: string) {
    console.log('🔍 WorkflowService - createWorkflowVersion called');
    console.log('🔍 WorkflowService - workflowId:', workflowId);
    console.log('🔍 WorkflowService - createdBy:', createdBy);

    // Get the latest version number
    const latestVersion = await this.prisma.workflowVersion.findFirst({
      where: { workflowId },
      orderBy: { versionNumber: 'desc' },
    });

    const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // Convert data to string for SQLite
    const dataString = JSON.stringify(data);

    const version = await this.prisma.workflowVersion.create({
      data: {
        workflowId,
        versionNumber,
        snapshotType: 'manual',
        createdBy,
        data: dataString,
      },
    });

    console.log('🔍 WorkflowService - Created version:', version.id);
    return version;
  }

  async getWorkflowVersion(workflowId: string, versionId: string) {
    console.log('🔍 WorkflowService - getWorkflowVersion called');
    console.log('🔍 WorkflowService - workflowId:', workflowId);
    console.log('🔍 WorkflowService - versionId:', versionId);

    const version = await this.prisma.workflowVersion.findFirst({
      where: {
        id: versionId,
        workflowId: workflowId,
      },
    });

    console.log('🔍 WorkflowService - Found version:', version ? version.id : null);
    return version;
  }
}
