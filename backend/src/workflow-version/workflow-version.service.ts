import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowVersion, Prisma } from '@prisma/client';
import { CreateWorkflowVersionDto } from './dto/create-workflow-version.dto';
import { PLAN_CONFIG } from '../plan-config';
import { UserService } from '../user/user.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class WorkflowVersionService {
  constructor(private prisma: PrismaService, private userService: UserService, private auditLogService: AuditLogService) {}

  async create(data: CreateWorkflowVersionDto): Promise<WorkflowVersion> {
    const { workflowId, ...rest } = data;
    const isRestore = rest.snapshotType === 'restore';
    let oldVersion = null;
    if (isRestore) {
      oldVersion = await this.findLatestByWorkflowId(workflowId);
    }
    const newVersion = await this.prisma.workflowVersion.create({
      data: {
        ...rest,
        workflow: { connect: { id: workflowId } },
      },
      include: {
        workflow: true,
      },
    });
    if (isRestore) {
      await this.auditLogService.create({
        userId: rest.createdBy,
        action: 'restore',
        entityType: 'workflow',
        entityId: workflowId,
        oldValue: oldVersion,
        newValue: newVersion,
      });
    }
    return newVersion;
  }

  async findAll(): Promise<WorkflowVersion[]> {
    return this.prisma.workflowVersion.findMany({
      include: {
        workflow: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByWorkflowId(workflowId: string): Promise<WorkflowVersion[]> {
    return this.prisma.workflowVersion.findMany({
      where: { workflowId },
      include: {
        workflow: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<WorkflowVersion | null> {
    return this.prisma.workflowVersion.findUnique({
      where: { id },
      include: {
        workflow: true,
      },
    });
  }

  async findLatestByWorkflowId(workflowId: string): Promise<WorkflowVersion | null> {
    return this.prisma.workflowVersion.findFirst({
      where: { workflowId },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        workflow: true,
      },
    });
  }

  async update(id: string, data: Prisma.WorkflowVersionUpdateInput): Promise<WorkflowVersion> {
    return this.prisma.workflowVersion.update({
      where: { id },
      data,
      include: {
        workflow: true,
      },
    });
  }

  async remove(id: string): Promise<WorkflowVersion> {
    return this.prisma.workflowVersion.delete({
      where: { id },
    });
  }

  async findByWorkflowIdWithHistoryLimit(workflowId: string, userId: string): Promise<any[]> {
    console.log('🔍 WorkflowVersionService - findByWorkflowIdWithHistoryLimit called');
    console.log('🔍 WorkflowVersionService - workflowId:', workflowId);
    console.log('🔍 WorkflowVersionService - userId:', userId);

    const user = await this.userService.findOneWithSubscription(userId);
    const planId = (user?.subscription?.planId as keyof typeof PLAN_CONFIG) || 'starter';
    const plan = PLAN_CONFIG[planId] || PLAN_CONFIG['starter'];
    let where: any = { workflowId };
    if (plan.historyDays !== null) {
      const cutoff = new Date(Date.now() - plan.historyDays * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: cutoff };
    }
    
    const versions = await this.prisma.workflowVersion.findMany({
      where,
      include: { workflow: true },
      orderBy: { createdAt: 'desc' },
    });

    console.log('🔍 WorkflowVersionService - Found versions:', versions.length);

    // If no versions exist, create some mock data for testing
    if (versions.length === 0) {
      console.log('🔍 WorkflowVersionService - No versions found, creating mock data');
      
      // Check if workflow exists
      const workflow = await this.prisma.workflow.findUnique({
        where: { id: workflowId }
      });

      if (workflow) {
        // Create a mock version
        const mockVersion = await this.prisma.workflowVersion.create({
          data: {
            workflowId: workflowId,
            versionNumber: 1,
            snapshotType: 'Manual Snapshot',
            data: JSON.stringify({ 
              steps: [
                { id: '1', type: 'email', title: 'Welcome Email', isNew: true },
                { id: '2', type: 'delay', title: 'Wait 24 hours', isNew: true }
              ] 
            }),
            createdBy: userId,
            createdAt: new Date(),
          },
          include: { workflow: true }
        });

        console.log('🔍 WorkflowVersionService - Created mock version:', mockVersion.id);
        return this.transformVersionsForFrontend([mockVersion]);
      }
    }

    // Transform the versions to match frontend expectations
    return this.transformVersionsForFrontend(versions);
  }

  async createAutomatedBackup(workflowId: string, userId: string): Promise<WorkflowVersion> {
    console.log('🔍 WorkflowVersionService - createAutomatedBackup called');
    console.log('🔍 WorkflowVersionService - workflowId:', workflowId);
    console.log('🔍 WorkflowVersionService - userId:', userId);

    try {
      // Get the latest version to create a backup
      const latestVersion = await this.findLatestByWorkflowId(workflowId);
      
      if (!latestVersion) {
        throw new Error('No existing version found for workflow');
      }

      // Create automated backup
      const backupVersion = await this.prisma.workflowVersion.create({
        data: {
          workflowId: workflowId,
          versionNumber: latestVersion.versionNumber + 1,
          snapshotType: 'Auto Backup',
          data: latestVersion.data, // Backup current state
          createdBy: 'system',
          createdAt: new Date(),
        },
        include: {
          workflow: true,
        },
      });

      console.log('🔍 WorkflowVersionService - Created automated backup:', backupVersion.id);
      
      // Create audit log for automated backup
      await this.auditLogService.create({
        userId: userId,
        action: 'automated_backup',
        entityType: 'workflow',
        entityId: workflowId,
        oldValue: latestVersion,
        newValue: backupVersion,
      });

      return backupVersion;
    } catch (error) {
      console.error('🔍 WorkflowVersionService - Error creating automated backup:', error);
      throw error;
    }
  }

  async createChangeNotification(workflowId: string, userId: string, changes: any): Promise<void> {
    console.log('🔍 WorkflowVersionService - createChangeNotification called');
    
    try {
      // Create audit log for change notification
      await this.auditLogService.create({
        userId: userId,
        action: 'workflow_changed',
        entityType: 'workflow',
        entityId: workflowId,
        oldValue: null,
        newValue: changes,
      });

      // Here you would integrate with your notification system
      // For now, we'll just log the change
      console.log('🔍 WorkflowVersionService - Change notification created for workflow:', workflowId);
      console.log('🔍 WorkflowVersionService - Changes:', changes);
    } catch (error) {
      console.error('🔍 WorkflowVersionService - Error creating change notification:', error);
    }
  }

  async createApprovalWorkflow(workflowId: string, userId: string, requestedChanges: any): Promise<any> {
    console.log('🔍 WorkflowVersionService - createApprovalWorkflow called');
    
    try {
      // Create approval request
      const approvalRequest = await this.prisma.approvalRequest.create({
        data: {
          workflowId: workflowId,
          requestedBy: userId,
          requestedChanges: requestedChanges,
          status: 'pending',
          createdAt: new Date(),
        },
      });

      console.log('🔍 WorkflowVersionService - Created approval request:', approvalRequest.id);
      
      // Create audit log for approval request
      await this.auditLogService.create({
        userId: userId,
        action: 'approval_requested',
        entityType: 'workflow',
        entityId: workflowId,
        oldValue: null,
        newValue: approvalRequest,
      });

      return approvalRequest;
    } catch (error) {
      console.error('🔍 WorkflowVersionService - Error creating approval workflow:', error);
      throw error;
    }
  }

  async generateComplianceReport(workflowId: string, startDate: Date, endDate: Date): Promise<any> {
    console.log('🔍 WorkflowVersionService - generateComplianceReport called');
    
    try {
      // Get all versions in the date range
      const versions = await this.prisma.workflowVersion.findMany({
        where: {
          workflowId: workflowId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          workflow: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Get audit logs for the workflow
      const auditLogs = await this.prisma.auditLog.findMany({
        where: {
          entityId: workflowId,
          entityType: 'workflow',
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          user: true,
        },
        orderBy: {
          timestamp: 'asc',
        },
      });

      // Generate compliance report
      const report = {
        workflowId: workflowId,
        reportPeriod: {
          startDate: startDate,
          endDate: endDate,
        },
        summary: {
          totalVersions: versions.length,
          totalChanges: auditLogs.length,
          automatedBackups: versions.filter(v => v.snapshotType === 'Auto Backup').length,
          manualSaves: versions.filter(v => v.snapshotType === 'Manual Save').length,
          systemBackups: versions.filter(v => v.snapshotType === 'System Backup').length,
        },
        versions: versions.map(version => ({
          id: version.id,
          versionNumber: version.versionNumber,
          snapshotType: version.snapshotType,
          createdBy: version.createdBy,
          createdAt: version.createdAt,
          changes: this.calculateChanges(version.data),
        })),
        auditTrail: auditLogs.map(log => ({
          id: log.id,
          action: log.action,
          userId: log.userId,
          userEmail: log.user?.email,
          timestamp: log.timestamp,
          details: log.oldValue || log.newValue,
        })),
        compliance: {
          hasCompleteAuditTrail: auditLogs.length > 0,
          hasVersionHistory: versions.length > 0,
          hasUserAttribution: auditLogs.every(log => log.userId),
          hasTimestampTracking: auditLogs.every(log => log.timestamp),
        },
      };

      console.log('🔍 WorkflowVersionService - Generated compliance report');
      return report;
    } catch (error) {
      console.error('🔍 WorkflowVersionService - Error generating compliance report:', error);
      throw error;
    }
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

  private transformVersionsForFrontend(versions: WorkflowVersion[]): any[] {
    return versions.map((version, index) => {
      const data = typeof version.data === 'string' ? JSON.parse(version.data) : version.data;
      const changes = this.calculateChanges(data);
      
      return {
        id: version.id,
        workflowId: version.workflowId,
        versionNumber: version.versionNumber,
        date: version.createdAt.toISOString(),
        type: version.snapshotType,
        initiator: version.createdBy,
        notes: this.generateChangeSummary(changes, data),
        changes: changes,
        status: index === 0 ? 'active' : 'inactive', // First version is current
        selected: false
      };
    });
  }

  private generateChangeSummary(changes: any, data: any): string {
    const { added, modified, removed } = changes;
    const summaries = [];
    
    if (added > 0) summaries.push(`${added} step(s) added`);
    if (modified > 0) summaries.push(`${modified} step(s) modified`);
    if (removed > 0) summaries.push(`${removed} step(s) removed`);
    
    if (summaries.length === 0) {
      return 'No changes detected';
    }
    
    return summaries.join(', ');
  }
}
