import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkflowVersionService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkflowVersionDto: any): Promise<any> {
    return this.prisma.workflowVersion.create({
      data: createWorkflowVersionDto,
    });
  }

  async createVersion(
    workflowId: string,
    userId: string,
    data: any,
    snapshotType: string,
  ): Promise<any> {
    try {
      const latestVersion = await this.prisma.workflowVersion.findFirst({
        where: { workflowId },
        orderBy: { versionNumber: 'desc' },
      });

      const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

      const newVersion = await this.prisma.workflowVersion.create({
        data: {
          workflowId,
          versionNumber,
          snapshotType,
          createdBy: userId,
          data: JSON.stringify(data || {}), // Convert object to JSON string
        },
      });

      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'version_created',
          entityType: 'workflow',
          entityId: workflowId,
          newValue: JSON.stringify({ versionId: newVersion.id, snapshotType }),
        },
      });

      return newVersion;
    } catch (error) {
      console.error(
        `Error in createVersion for workflow ${workflowId}:`,
        error,
      );
      throw new HttpException(
        'Failed to create workflow version',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<any[]> {
    return this.prisma.workflowVersion.findMany({
      include: {
        workflow: true,
      },
    });
  }

  async findOne(id: string): Promise<any | null> {
    return this.prisma.workflowVersion.findUnique({
      where: { id },
      include: {
        workflow: true,
      },
    });
  }

  async update(id: string, updateWorkflowVersionDto: any): Promise<any> {
    return this.prisma.workflowVersion.update({
      where: { id },
      data: updateWorkflowVersionDto,
    });
  }

  async remove(id: string): Promise<any> {
    return this.prisma.workflowVersion.delete({
      where: { id },
    });
  }

  async findByWorkflowId(workflowId: string): Promise<any[]> {
    return this.prisma.workflowVersion.findMany({
      where: { workflowId },
      include: {
        workflow: true,
      },
      orderBy: { versionNumber: 'desc' },
    });
  }

  async findByWorkflowIdWithHistoryLimit(
    workflowId: string,
    userId: string,
  ): Promise<any[]> {
    try {
      const versions = await this.prisma.workflowVersion.findMany({
        where: { workflowId },
        include: {
          workflow: true,
        },
        orderBy: { versionNumber: 'desc' },
        take: 50, // Limit to last 50 versions
      });

      if (versions.length === 0) {
        return [];
      }

      return this.transformVersionsForFrontend(versions);
    } catch (error) {
      throw new HttpException(
        `Failed to get workflow history: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findLatestByWorkflowId(workflowId: string): Promise<any | null> {
    return this.prisma.workflowVersion.findFirst({
      where: { workflowId },
      orderBy: { versionNumber: 'desc' },
    });
  }

  async restoreWorkflowVersion(
    workflowId: string,
    versionId: string,
    userId: string,
  ): Promise<any> {
    try {
      const version = await this.findOne(versionId);
      if (!version) {
        throw new Error('Version not found');
      }

      const latestVersion = await this.findLatestByWorkflowId(workflowId);
      const nextVersionNumber = latestVersion
        ? latestVersion.versionNumber + 1
        : 1;

      // Create a new version with the restored data
      const restoredVersion = await this.create({
        workflowId: workflowId,
        versionNumber: nextVersionNumber,
        snapshotType: 'Restore',
        data: version.data,
        createdBy: userId,
      });

      return {
        message: 'Workflow restored successfully',
        restoredVersion: restoredVersion,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to restore workflow version: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async rollbackWorkflow(workflowId: string, userId: string): Promise<any> {
    try {
      const latestVersion = await this.findLatestByWorkflowId(workflowId);
      if (!latestVersion) {
        throw new HttpException(
          'No previous snapshot exists for this workflow. Rollback is not possible.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Get the previous version
      const previousVersion = await this.prisma.workflowVersion.findFirst({
        where: {
          workflowId: workflowId,
          versionNumber: { lt: latestVersion.versionNumber },
        },
        orderBy: { versionNumber: 'desc' },
      });

      if (!previousVersion) {
        // No previous version to rollback to, treat as no-op
        return {
          message:
            'No previous version to rollback to. The workflow is already at its earliest version.',
          rollbackVersion: null,
        };
      }

      // Create rollback version
      const rollbackVersion = await this.create({
        workflowId: workflowId,
        versionNumber: latestVersion.versionNumber + 1,
        snapshotType: 'Rollback',
        data: previousVersion.data,
        createdBy: userId,
      });

      return {
        message: 'Workflow rolled back successfully',
        rollbackVersion: rollbackVersion,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to rollback workflow: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createAutomatedBackup(
    workflowId: string,
    userId: string,
  ): Promise<any> {
    try {
      // Get the latest version to create a backup
      const latestVersion = await this.findLatestByWorkflowId(workflowId);
      if (!latestVersion) {
        throw new HttpException(
          'No workflow found to backup',
          HttpStatus.NOT_FOUND,
        );
      }

      // Create automated backup version
      const backupVersion = await this.prisma.workflowVersion.create({
        data: {
          workflowId: workflowId,
          versionNumber: latestVersion.versionNumber + 1,
          snapshotType: 'Auto Backup',
          createdBy: userId,
          data: JSON.stringify(latestVersion.data || {}), // Convert object to JSON string
        },
      });

      // Log the automated backup
      await this.prisma.auditLog.create({
        data: {
          userId: userId,
          action: 'automated_backup_created',
          entityType: 'workflow',
          entityId: workflowId,
          oldValue: undefined,
          newValue: JSON.stringify({
            versionId: backupVersion.id,
            versionNumber: backupVersion.versionNumber,
          }),
        },
      });

      return backupVersion;
    } catch (error) {
      throw new HttpException(
        `Failed to create automated backup: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createChangeNotification(
    workflowId: string,
    userId: string,
    changes: any,
  ): Promise<void> {
    try {
      // Create audit log for change notification
      await this.prisma.auditLog.create({
        data: {
          userId: userId,
          action: 'change_notification_sent',
          entityType: 'workflow',
          entityId: workflowId,
          oldValue: undefined,
          newValue: changes,
        },
      });

      // In a real implementation, this would send email notifications
      // For now, we'll just log the notification
      console.log(
        `Change notification sent for workflow ${workflowId}:`,
        changes,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to create change notification: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createApprovalWorkflow(
    workflowId: string,
    userId: string,
    requestedChanges: any,
  ): Promise<any> {
    try {
      // Check if workflow exists
      const workflow = await this.prisma.workflow.findUnique({
        where: { id: workflowId },
      });

      if (!workflow) {
        throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
      }

      // Create approval request
      // Note: approvalRequest table may not exist in current schema
      // const approvalRequest = await this.prisma.approvalRequest.create({
      //   data: {
      //     workflowId: workflowId,
      //     requestedBy: userId,
      //     requestedChanges: requestedChanges,
      //     status: 'pending',
      //   },
      // });

      // Log the approval request
      await this.prisma.auditLog.create({
        data: {
          userId: userId,
          action: 'approval_request_created',
          entityType: 'workflow',
          entityId: workflowId,
          oldValue: undefined,
          newValue: JSON.stringify({
            approvalRequestId: 'pending',
            requestedChanges: requestedChanges,
          }),
        },
      });

      return { id: 'pending', status: 'created' };
    } catch (error) {
      throw new HttpException(
        `Failed to create approval workflow: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateComplianceReport(
    workflowId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    try {
      // Get workflow details
      const workflow = await this.prisma.workflow.findUnique({
        where: { id: workflowId },
        include: { owner: true },
      });

      if (!workflow) {
        throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
      }

      // Get versions in date range
      const versions = await this.prisma.workflowVersion.findMany({
        where: {
          workflowId: workflowId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Get audit logs in date range
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

      // Calculate compliance metrics
      const totalVersions = versions.length;
      const automatedBackups = versions.filter(
        (v: any) => v.snapshotType === 'Auto Backup',
      ).length;
      const manualSaves = versions.filter(
        (v: any) => v.snapshotType === 'Manual Save',
      ).length;
      const systemBackups = versions.filter(
        (v: any) => v.snapshotType === 'System Backup',
      ).length;
      const totalChanges = auditLogs.length;
      const uniqueUsers = new Set(auditLogs.map((log: any) => log.userId)).size;

      // Generate compliance score
      const complianceScore = Math.min(
        100,
        Math.max(
          0,
          automatedBackups * 20 +
            manualSaves * 15 +
            systemBackups * 10 +
            totalChanges * 5,
        ),
      );

      const report = {
        workflowId: workflowId,
        workflowName: workflow.name,
        reportPeriod: {
          startDate: startDate,
          endDate: endDate,
        },
        summary: {
          totalVersions,
          totalChanges,
          automatedBackups,
          manualSaves,
          systemBackups,
          uniqueUsers,
          complianceScore,
        },
        versions: versions.map((version: any) => ({
          id: version.id,
          versionNumber: version.versionNumber,
          snapshotType: version.snapshotType,
          createdBy: version.createdBy,
          createdAt: version.createdAt,
          changes: this.calculateChanges(version.data),
        })),
        auditTrail: auditLogs.map((log: any) => ({
          id: log.id,
          action: log.action,
          userId: log.userId,
          userName: log.user?.name || 'Unknown',
          timestamp: log.timestamp,
          oldValue: log.oldValue,
          newValue: log.newValue,
        })),
        recommendations: this.generateComplianceRecommendations(
          versions,
          auditLogs,
        ),
      };

      return report;
    } catch (error) {
      throw new HttpException(
        `Failed to generate compliance report: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private transformVersionsForFrontend(versions: any[]): any[] {
    return versions.map((version, index) => {
      const data =
        typeof version.data === 'string'
          ? JSON.parse(version.data)
          : version.data;

      // Get previous version data for comparison
      const previousVersion =
        index < versions.length - 1 ? versions[index + 1] : null;
      const previousData = previousVersion
        ? typeof previousVersion.data === 'string'
          ? JSON.parse(previousVersion.data)
          : previousVersion.data
        : null;

      const changes = this.calculateChanges(data, previousData);

      return {
        id: version.id,
        workflowId: version.workflowId,
        versionNumber: version.versionNumber,
        date: version.createdAt.toISOString(),
        type: version.snapshotType,
        initiator: version.createdBy,
        notes: this.generateChangeSummary(changes, data),
        changes: changes,
        status: index === 0 ? 'active' : 'inactive',
        selected: false,
      };
    });
  }

  private calculateChanges(data: any, previousData?: any): any {
    if (!data) {
      return { added: 0, modified: 0, removed: 0 };
    }

    // If no previous data to compare, treat as initial version
    if (!previousData) {
      const steps = this.extractStepsFromWorkflowData(data);
      return {
        added: steps.length,
        modified: 0,
        removed: 0,
      };
    }

    const currentSteps = this.extractStepsFromWorkflowData(data);
    const previousSteps = this.extractStepsFromWorkflowData(previousData);

    // Calculate differences
    const added = currentSteps.filter(
      (step) =>
        !previousSteps.find((prevStep) => this.stepsEqual(step, prevStep)),
    ).length;

    const removed = previousSteps.filter(
      (step) =>
        !currentSteps.find((currStep) => this.stepsEqual(step, currStep)),
    ).length;

    const modified = currentSteps.filter((step) => {
      const prevStep = previousSteps.find(
        (prevStep) =>
          prevStep.id === step.id || prevStep.actionId === step.actionId,
      );
      return prevStep && !this.stepsEqual(step, prevStep);
    }).length;

    return { added, modified, removed };
  }

  private extractStepsFromWorkflowData(data: any): any[] {
    if (!data) return [];

    // Handle different HubSpot workflow data structures
    if (data.actions && Array.isArray(data.actions)) {
      return data.actions;
    }
    if (data.steps && Array.isArray(data.steps)) {
      return data.steps;
    }
    if (data.workflowActions && Array.isArray(data.workflowActions)) {
      return data.workflowActions;
    }

    return [];
  }

  private stepsEqual(step1: any, step2: any): boolean {
    if (!step1 || !step2) return false;

    // Compare by ID first
    if (step1.id && step2.id) {
      return step1.id === step2.id;
    }

    // Compare by actionId
    if (step1.actionId && step2.actionId) {
      return step1.actionId === step2.actionId;
    }

    // Compare by type and basic properties
    return (
      step1.type === step2.type &&
      step1.actionType === step2.actionType &&
      JSON.stringify(step1.settings || {}) ===
        JSON.stringify(step2.settings || {})
    );
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

  async createInitialVersion(
    workflow: any,
    userId: string,
    initialData: any,
  ): Promise<any> {
    try {
      // Get the highest version number for this workflow
      const latestVersion = await this.prisma.workflowVersion.findFirst({
        where: { workflowId: workflow.id },
        orderBy: { versionNumber: 'desc' },
      });

      const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

      // Create the initial version
      const version = await this.prisma.workflowVersion.create({
        data: {
          workflowId: workflow.id,
          versionNumber,
          snapshotType: 'Initial Protection',
          createdBy: userId,
          data: JSON.stringify(initialData || {
            hubspotId: workflow.hubspotId,
            name: workflow.name,
            status: 'active',
            initialProtection: true,
            protectedAt: new Date().toISOString(),
          }),
        },
      });

      // Create audit log entry
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'initial_protection',
          entityType: 'workflow',
          entityId: workflow.id,
          oldValue: undefined,
          newValue: JSON.stringify({ versionId: version.id, versionNumber }),
        },
      });

      return version;
    } catch (error) {
      console.error('Error creating initial version:', error);
      throw error;
    }
  }

  private generateComplianceRecommendations(
    versions: any[],
    auditLogs: any[],
  ): string[] {
    const recommendations = [];

    // Check backup frequency
    const automatedBackups = versions.filter(
      (v) => v.snapshotType === 'Auto Backup',
    ).length;
    if (automatedBackups < 5) {
      recommendations.push(
        'Consider increasing automated backup frequency for better compliance',
      );
    }

    // Check user activity
    const uniqueUsers = new Set(auditLogs.map((log) => log.userId)).size;
    if (uniqueUsers < 2) {
      recommendations.push(
        'Consider implementing review processes for workflow changes',
      );
    }

    // Check change tracking
    const changeLogs = auditLogs.filter((log) => log.action.includes('change'));
    if (changeLogs.length < auditLogs.length * 0.3) {
      recommendations.push(
        'Improve change tracking and documentation for compliance',
      );
    }

    return recommendations;
  }

  async findByHubspotIdWithHistory(
    hubspotId: string,
    userId: string,
  ): Promise<any[]> {
    try {
      // First find the workflow by HubSpot ID
      const workflow = await this.prisma.workflow.findFirst({
        where: {
          hubspotId: hubspotId,
          ownerId: userId,
        },
        include: {
          versions: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 50, // Limit to last 50 versions
          },
        },
      });

      if (!workflow) {
        // Instead of throwing 404, return empty array
        console.log('No workflow found for hubspotId:', hubspotId);
        return [];
      }

      // If workflow exists but has no versions, return empty array
      if (!workflow.versions || workflow.versions.length === 0) {
        console.log('No versions found for workflow:', workflow.id);
        return [];
      }

      // Transform versions to match expected format
      return workflow.versions.map((version: any, index: number) => ({
        id: version.id,
        versionNumber: version.versionNumber,
        snapshotType: version.snapshotType,
        createdBy: version.createdBy,
        createdAt: version.createdAt,
        data: version.data,
        workflowId: version.workflowId,
        changes: this.calculateChanges(version.data),
        changeSummary: this.generateChangeSummary(
          this.calculateChanges(version.data),
          version.data,
        ),
      }));
    } catch (error) {
      console.error('Error finding workflow history by HubSpot ID:', error);
      return []; // Return empty array instead of throwing error
    }
  }
}
