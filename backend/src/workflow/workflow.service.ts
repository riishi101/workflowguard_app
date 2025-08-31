import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HubSpotService } from '../services/hubspot.service';

@Injectable()
export class WorkflowService {
  constructor(
    private prisma: PrismaService,
    private hubspotService: HubSpotService,
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
      console.log(
        '🔍 WorkflowService - getHubSpotWorkflows called for userId:',
        userId,
      );
      const workflows = await this.hubspotService.getWorkflows(userId);
      console.log(
        '🔍 WorkflowService - Retrieved workflows from HubSpot:',
        workflows.length,
      );
      return workflows;
    } catch (error) {
      console.error(
        '🔍 WorkflowService - Error getting HubSpot workflows:',
        error,
      );
      throw new HttpException(
        `Failed to get HubSpot workflows: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string, userId: string) {
    try {
      const workflow = await this.prisma.workflow.findFirst({
        where: {
          id,
          ownerId: userId,
        },
        include: {
          owner: true,
          versions: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1, // Get latest version for lastModified
          },
        },
      });

      if (!workflow) {
        throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
      }

      // Add computed fields
      const lastVersion = workflow.versions[0];
      return {
        ...workflow,
        lastModified: lastVersion?.createdAt || workflow.updatedAt,
        totalVersions: workflow.versions.length,
        hubspotUrl: workflow.hubspotId
          ? `https://app.hubspot.com/workflows/${workflow.hubspotId}`
          : null,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to find workflow: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByHubspotId(hubspotId: string, userId: string) {
    try {
      // First try to find in database
      const workflow = await this.prisma.workflow.findFirst({
        where: {
          hubspotId: hubspotId,
          ownerId: userId,
        },
        include: {
          owner: true,
          versions: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (workflow) {
        return {
          ...workflow,
          lastModified: workflow.updatedAt,
          totalVersions: workflow.versions.length || 0,
        };
      }

      // If not found in database, try to get from HubSpot and create/sync
      const hubspotWorkflows = await this.hubspotService.getWorkflows(userId);
      const hubspotWorkflow = hubspotWorkflows.find((w) => w.id === hubspotId);

      if (!hubspotWorkflow) {
        // Return a default structure instead of throwing 404
        return {
          id: hubspotId,
          hubspotId: hubspotId,
          name: 'Unknown Workflow',
          ownerId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          versions: [],
          totalVersions: 0,
          lastModified: new Date(),
        };
      }

      // Create workflow in database if it doesn't exist
      const newWorkflow = await this.prisma.workflow.create({
        data: {
          hubspotId: hubspotId,
          name: hubspotWorkflow.name || `Workflow ${hubspotId}`,
          ownerId: userId,
        },
        include: {
          owner: true,
          versions: true,
        },
      });

      return {
        ...newWorkflow,
        lastModified: newWorkflow.updatedAt,
        totalVersions: 0,
      };
    } catch (error) {
      console.error(`Error syncing workflow ${hubspotId}:`, error);
      throw new HttpException(
        'Failed to sync workflow',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

  async startWorkflowProtection(
    workflowIds: string[],
    userId: string,
    selectedWorkflowObjects: any[],
  ): Promise<any[]> {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }

    // Validate user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const protectedWorkflows: any[] = [];
    const errors: Array<{ workflowId: string; error: string }> = [];

    // Use transaction to ensure data consistency
    await this.prisma.$transaction(async (tx) => {
      for (const workflowId of workflowIds) {
        try {
          // Find the workflow object from selectedWorkflowObjects
          const workflowObj = selectedWorkflowObjects?.find(
            (w: any) => w.id === workflowId,
          );
          const hubspotId = String(workflowObj?.hubspotId || workflowId);

          // Create or update workflow
          const workflow = await tx.workflow.upsert({
            where: {
              hubspotId: hubspotId,
            },
            update: {
              name: workflowObj?.name || 'Unnamed Workflow',
              ownerId: userId,
              updatedAt: new Date(),
            },
            create: {
              hubspotId: hubspotId,
              name: workflowObj?.name || 'Unnamed Workflow',
              ownerId: userId,
            },
            include: {
              owner: true,
              versions: {
                orderBy: { versionNumber: 'desc' },
                take: 1,
              },
            },
          });

          // ALWAYS ensure workflow has at least one version
          if (!workflow?.versions?.length) {
            let workflowData = null;
            
            // Try to get workflow data from HubSpot
            try {
              const hubspotWorkflows = await this.hubspotService.getWorkflows(userId);
              workflowData = hubspotWorkflows.find((w) => String(w.id) === hubspotId);
            } catch (hubspotError) {
              console.warn('Could not fetch HubSpot data, using minimal data:', hubspotError.message);
            }

            // Create initial version with available data
            const initialVersionData = workflowData || {
              hubspotId,
              name: workflow.name,
              status: 'active',
              type: 'unknown',
              enabled: true,
              metadata: {
                protection: {
                  initialProtection: true,
                  protectedAt: new Date().toISOString(),
                  protectedBy: userId,
                  source: workflowData ? 'hubspot' : 'minimal',
                },
              },
            };

            // Create the initial version
            const initialVersion = await tx.workflowVersion.create({
              data: {
                workflowId: workflow.id,
                versionNumber: 1,
                snapshotType: 'Initial Protection',
                createdBy: userId,
                data: initialVersionData as any,
              },
            });

            // Create audit log
            await tx.auditLog.create({
              data: {
                userId,
                action: 'workflow_protection_started',
                entityType: 'workflow',
                entityId: workflow.id,
                oldValue: null as any,
                newValue: JSON.stringify({
                  versionId: initialVersion.id,
                  versionNumber: 1,
                  protectionType: 'initial',
                }),
              },
            });

            // Add version to workflow object
            workflow.versions = [initialVersion];

            console.log('✅ Created initial version for workflow:', {
              workflowId: workflow.id,
              workflowName: workflow.name,
              versionId: initialVersion.id,
              versionNumber: initialVersion.versionNumber,
              dataSource: workflowData ? 'hubspot' : 'minimal',
            });
          }

          protectedWorkflows.push(workflow);
        } catch (err) {
          const errorMessage = `Failed to protect workflow ${workflowId}: ${err?.message || err}`;
          console.error('❌ Error protecting workflow:', {
            workflowId,
            error: err,
            userId,
          });
          errors.push({ workflowId, error: errorMessage });
          // Don't throw here, collect all errors
        }
      }
    });

    // If there were errors, throw with details
    if (errors.length > 0) {
      throw new HttpException(
        {
          message: 'Some workflows could not be protected',
          errors,
          successCount: protectedWorkflows.length,
          totalCount: workflowIds.length,
        },
        HttpStatus.PARTIAL_CONTENT,
      );
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
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1, // Only get latest version for performance
          },
          _count: {
            select: { versions: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
      });

      // Transform database records to match Dashboard expectations
      return workflows.map((workflow: any) => {
        const versionCount = workflow._count.versions;
        const latestVersion = workflow.versions[0];
        
        return {
          id: workflow.hubspotId || workflow.id,
          name: workflow.name,
          status: versionCount > 0 ? 'active' : 'inactive',
          protectionStatus: versionCount > 0 ? 'protected' : 'unprotected',
          lastModified: latestVersion?.createdAt 
            ? new Date(latestVersion.createdAt).toLocaleDateString()
            : workflow.updatedAt
            ? new Date(workflow.updatedAt).toLocaleDateString()
            : 'Unknown',
          versions: versionCount, // Use actual count from database
          lastModifiedBy: {
            name: workflow.owner?.name || 'Unknown User',
            initials: workflow.owner?.name
              ? workflow.owner.name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()
              : 'U',
            email: workflow.owner?.email || 'unknown@example.com',
          },
        };
      });
    } catch (error) {
      console.error('Error fetching protected workflows:', error);
      return [];
    }
  }

  async getProtectedWorkflowIds(userId: string): Promise<string[]> {
    const workflows = await this.getProtectedWorkflows(userId);
    return workflows.map((workflow) => workflow.id);
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
            hubspotId: String(hubspotWorkflow.id),
            ownerId: userId,
          },
        });

        if (existingWorkflow) {
          // Only sync existing protected workflows
          const updatedWorkflow = await this.prisma.workflow.update({
            where: { id: existingWorkflow.id },
            data: {
              name: hubspotWorkflow.name,
              updatedAt: new Date(),
            },
            include: {
              owner: true,
              versions: true,
            },
          });
          
          // Normalize workflow data for accurate comparison
          const normalizeWorkflowData = (data: any) => {
            if (!data) return {};
            
            // Remove metadata fields that change frequently but don't affect workflow logic
            const { 
              updatedAt, 
              createdAt, 
              lastModifiedAt,
              modifiedAt,
              lastUpdated,
              ...workflowContent 
            } = data;
            
            // Sort keys to ensure consistent comparison
            return JSON.stringify(workflowContent, Object.keys(workflowContent).sort());
          };
          
          // Create new version only if workflow data has actually changed
          const latestVersion = await this.prisma.workflowVersion.findFirst({
            where: { workflowId: existingWorkflow.id },
            orderBy: { versionNumber: 'desc' },
          });
          
          // Compare normalized workflow content
          const hasChanged = !latestVersion || 
            normalizeWorkflowData(latestVersion.data) !== normalizeWorkflowData(hubspotWorkflow);
          
          if (hasChanged) {
            const { WorkflowVersionService } = await import('../workflow-version/workflow-version.service');
            const workflowVersionService = new WorkflowVersionService(this.prisma);
            
            try {
              await workflowVersionService.createVersion(
                existingWorkflow.id,
                userId,
                hubspotWorkflow,
                'Sync Update'
              );
              console.log(`Version created for changed workflow: ${existingWorkflow.name}`);
            } catch (error) {
              console.log(`Version creation failed for workflow ${existingWorkflow.id}: ${error.message}`);
            }
          } else {
            console.log(`No changes detected for workflow: ${existingWorkflow.name}`);
          }
          
          syncedWorkflows.push(updatedWorkflow);
        }
        // Skip creating new workflows - only sync existing protected ones
      }

      return syncedWorkflows;
    } catch (error) {
      throw new HttpException(
        `Failed to sync HubSpot workflows: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createAutomatedBackup(
    workflowId: string,
    userId: string,
  ): Promise<any> {
    try {
      const { WorkflowVersionService } = await import(
        '../workflow-version/workflow-version.service'
      );
      const workflowVersionService = new WorkflowVersionService(this.prisma);

      const backup = await workflowVersionService.createAutomatedBackup(
        workflowId,
        userId,
      );
      return backup;
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
      const { WorkflowVersionService } = await import(
        '../workflow-version/workflow-version.service'
      );
      const workflowVersionService = new WorkflowVersionService(this.prisma);

      await workflowVersionService.createChangeNotification(
        workflowId,
        userId,
        changes,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to create change notification: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createApprovalRequest(
    workflowId: string,
    userId: string,
    requestedChanges: any,
  ): Promise<any> {
    try {
      const { WorkflowVersionService } = await import(
        '../workflow-version/workflow-version.service'
      );
      const workflowVersionService = new WorkflowVersionService(this.prisma);

      const approvalRequest =
        await workflowVersionService.createApprovalWorkflow(
          workflowId,
          userId,
          requestedChanges,
        );
      return approvalRequest;
    } catch (error) {
      throw new HttpException(
        `Failed to create approval request: ${error.message}`,
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
      const { WorkflowVersionService } = await import(
        '../workflow-version/workflow-version.service'
      );
      const workflowVersionService = new WorkflowVersionService(this.prisma);

      const report = await workflowVersionService.generateComplianceReport(
        workflowId,
        startDate,
        endDate,
      );
      return report;
    } catch (error) {
      throw new HttpException(
        `Failed to generate compliance report: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async restoreWorkflowVersion(
    workflowId: string,
    versionId: string,
    userId: string,
  ): Promise<any> {
    try {
      const { WorkflowVersionService } = await import(
        '../workflow-version/workflow-version.service'
      );
      const workflowVersionService = new WorkflowVersionService(this.prisma);

      const result = await workflowVersionService.restoreWorkflowVersion(
        workflowId,
        versionId,
        userId,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        `Failed to restore workflow version: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getWorkflowVersions(workflowId: string, userId: string): Promise<any[]> {
    try {
      // Verify workflow belongs to user
      const workflow = await this.prisma.workflow.findFirst({
        where: {
          id: workflowId,
          ownerId: userId,
        },
      });

      if (!workflow) {
        throw new HttpException(
          'Workflow not found or access denied',
          HttpStatus.NOT_FOUND,
        );
      }

      // Get versions for comparison
      const versions = await this.prisma.workflowVersion.findMany({
        where: { workflowId },
        orderBy: { versionNumber: 'desc' },
        take: 50,
      });

      // Transform for frontend
      return versions.map((version, index) => ({
        id: version.id,
        workflowId: version.workflowId,
        versionNumber: version.versionNumber,
        date: version.createdAt.toISOString(),
        type: version.snapshotType,
        initiator: version.createdBy,
        notes: this.generateChangeSummary(
          this.calculateChanges(version.data),
          version.data,
        ),
        changes: this.calculateChanges(version.data),
        status: index === 0 ? 'current' : 'archived',
      }));
    } catch (error) {
      throw new HttpException(
        `Failed to get workflow versions: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async rollbackWorkflow(workflowId: string, userId: string): Promise<any> {
    try {
      const { WorkflowVersionService } = await import(
        '../workflow-version/workflow-version.service'
      );
      const workflowVersionService = new WorkflowVersionService(this.prisma);

      const result = await workflowVersionService.rollbackWorkflow(
        workflowId,
        userId,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        `Failed to rollback workflow: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async downloadWorkflowVersion(
    workflowId: string,
    versionId: string,
  ): Promise<any> {
    try {
      const { WorkflowVersionService } = await import(
        '../workflow-version/workflow-version.service'
      );
      const workflowVersionService = new WorkflowVersionService(this.prisma);

      const version = await workflowVersionService.findOne(versionId);
      return version;
    } catch (error) {
      throw new HttpException(
        `Failed to download workflow version: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
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
      const stats = workflows.map((workflow: any) => {
        const versions = workflow.versions;
        const latestVersion = versions[0];
        const totalSteps = latestVersion
          ? this.calculateWorkflowSteps(latestVersion.data)
          : 0;
        const totalContacts = latestVersion
          ? this.calculateWorkflowContacts(latestVersion.data)
          : 0;

        return {
          id: workflow.id,
          name: workflow.name,
          lastSnapshot:
            latestVersion?.createdAt.toISOString() ||
            workflow.createdAt.toISOString(),
          versions: versions.length,
          lastModifiedBy: latestVersion?.createdBy || '',
          status: 'active',
          protectionStatus: 'protected',
          lastModified:
            latestVersion?.createdAt.toISOString() ||
            workflow.updatedAt.toISOString(),
          steps: totalSteps,
          contacts: totalContacts,
        };
      });

      return stats;
    } catch (error) {
      throw new HttpException(
        `Failed to get workflow stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
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
      const activeWorkflows = protectedWorkflows.filter(
        (w: any) => w.versions.length > 0,
      ).length;
      const totalVersions = protectedWorkflows.reduce(
        (sum: number, w: any) => sum + w.versions.length,
        0,
      );

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentActivity = await this.prisma.auditLog.count({
        where: {
          userId: userId,
          timestamp: { gte: sevenDaysAgo },
        },
      });

      // Calculate plan usage
      const planCapacity =
        user.subscription?.planId === 'professional'
          ? 25
          : user.subscription?.planId === 'enterprise'
            ? 999999
            : 5;
      const planUsed = totalWorkflows;

      // Uptime calculation should be implemented if available, else omit or set to null
      const uptime = null;

      // Get last snapshot time
      const lastSnapshot =
        protectedWorkflows.length > 0
          ? Math.max(
              ...protectedWorkflows.map((w: any) =>
                w.versions.length > 0
                  ? new Date(w.versions[0].createdAt).getTime()
                  : 0,
              ),
            )
          : Date.now();

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
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async exportWorkflow(workflowId: string): Promise<any> {
    try {
      const workflow = await this.prisma.workflow.findFirst({
        where: { id: workflowId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          versions: {
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              versionNumber: true,
              createdAt: true,
              data: true,
            },
          },
        },
      });

      if (!workflow) {
        throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
      }

      // Transform data for export
      const exportData = {
        id: workflow.id,
        name: workflow.name,
        hubspotId: workflow.hubspotId,
        owner: workflow.owner,
        versions: workflow.versions.map((version: any) => ({
          id: version.id,
          versionNumber: version.versionNumber,
          createdAt: version.createdAt,
          data: version.data,
        })),
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
        exportedAt: new Date().toISOString(),
      };

      return exportData;
    } catch (error) {
      throw new HttpException(
        `Failed to export workflow: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async exportAllWorkflows(userId: string): Promise<any> {
    try {
      const workflows = await this.prisma.workflow.findMany({
        where: { ownerId: userId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          versions: {
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              versionNumber: true,
              createdAt: true,
              data: true,
            },
          },
        },
      });

      const exportData = {
        exportInfo: {
          userId,
          exportedAt: new Date().toISOString(),
          totalWorkflows: workflows.length,
        },
        workflows: workflows.map((workflow: any) => ({
          id: workflow.id,
          name: workflow.name,
          hubspotId: workflow.hubspotId,
          owner: workflow.owner,
          versions: workflow.versions.map((version: any) => ({
            id: version.id,
            versionNumber: version.versionNumber,
            createdAt: version.createdAt,
            data: version.data,
          })),
          createdAt: workflow.createdAt,
          updatedAt: workflow.updatedAt,
        })),
      };

      return exportData;

      return exportData;
    } catch (error) {
      throw new HttpException(
        `Failed to export workflows: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
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
    } catch {
      return 0;
    }
  }

  private calculateWorkflowContacts(workflowData: any): number {
    try {
      if (typeof workflowData === 'string') {
        workflowData = JSON.parse(workflowData);
      }

      // Contact count calculation should be implemented if available, else return 0
      return 0;
    } catch {
      return 0;
    }
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
    const added = currentSteps.filter(step => 
      !previousSteps.find(prevStep => this.stepsEqual(step, prevStep))
    ).length;
    
    const removed = previousSteps.filter(step => 
      !currentSteps.find(currStep => this.stepsEqual(step, currStep))
    ).length;
    
    const modified = currentSteps.filter(step => {
      const prevStep = previousSteps.find(prevStep => 
        prevStep.id === step.id || prevStep.actionId === step.actionId
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
    
    // Compare by actionId and other properties
    return step1.actionId === step2.actionId &&
           step1.type === step2.type &&
           step1.actionType === step2.actionType &&
           JSON.stringify(step1.settings || {}) === JSON.stringify(step2.settings || {});
  }

  private areStepsEqual(step1: any, step2: any): boolean {
    return step1.id === step2.id &&
           step1.actionId === step2.actionId &&
           step1.type === step2.type &&
           step1.actionType === step2.actionType &&
           JSON.stringify(step1.settings || {}) === JSON.stringify(step2.settings || {});
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

  /**
   * Handle workflow updates from HubSpot webhooks.
   * This method is called when a workflow is created, changed, or deleted in HubSpot.
   */
  async handleWorkflowUpdate(
    portalId: string,
    hubspotWorkflowId: string,
  ): Promise<void> {
    console.log(
      `🔄 Handling workflow update for portalId: ${portalId}, workflowId: ${hubspotWorkflowId}`,
    );

    // 1. Find the user associated with the portal
    const user = await this.prisma.user.findFirst({
      where: { hubspotPortalId: portalId },
    });

    if (!user) {
      console.warn(
        `⚠️ No user found for portalId: ${portalId}. Skipping workflow update.`,
      );
      return;
    }

    // 2. Find the workflow in our database to ensure it's a protected workflow
    const workflow = await this.prisma.workflow.findFirst({
      where: {
        hubspotId: hubspotWorkflowId,
        ownerId: user.id,
      },
    });

    if (!workflow) {
      console.log(
        `ℹ️ Workflow ${hubspotWorkflowId} is not protected for user ${user.id}. Skipping backup.`,
      );
      return;
    }

    try {
      // 3. Fetch the latest workflow data from HubSpot
      const { HubSpotService } = await import('../services/hubspot.service');
      const hubspotService = new HubSpotService(this.prisma);
      const hubspotWorkflowData = await hubspotService.getWorkflowById(
        user.id,
        hubspotWorkflowId,
      );

      if (!hubspotWorkflowData) {
        console.warn(
          `⚠️ Could not fetch workflow data for ${hubspotWorkflowId} from HubSpot.`,
        );
        return;
      }

      // 4. Create a new version (automated backup)
      const { WorkflowVersionService } = await import(
        '../workflow-version/workflow-version.service'
      );
      const workflowVersionService = new WorkflowVersionService(this.prisma);

      await workflowVersionService.createVersion(
        workflow.id,
        user.id,
        hubspotWorkflowData,
        'Automated',
      );

      console.log(
        `✅ Successfully created automated backup for workflow ${workflow.id} (HubSpot ID: ${hubspotWorkflowId})`,
      );
    } catch (error) {
      console.error(
        `❌ Error handling workflow update for workflowId ${hubspotWorkflowId}:`,
        error,
      );
      // Do not re-throw error to prevent HubSpot from retrying indefinitely
    }
  }

  async compareWorkflowVersions(
    workflowId: string,
    versionAId: string,
    versionBId: string,
    userId: string,
  ): Promise<any> {
    try {
      // Verify workflow belongs to user
      const workflow = await this.prisma.workflow.findFirst({
        where: {
          id: workflowId,
          ownerId: userId,
        },
      });

      if (!workflow) {
        throw new HttpException(
          'Workflow not found or access denied',
          HttpStatus.NOT_FOUND,
        );
      }

      // Fetch both versions
      const [versionA, versionB] = await Promise.all([
        this.prisma.workflowVersion.findFirst({
          where: {
            id: versionAId,
            workflowId: workflowId,
          },
        }),
        this.prisma.workflowVersion.findFirst({
          where: {
            id: versionBId,
            workflowId: workflowId,
          },
        }),
      ]);

      if (!versionA || !versionB) {
        throw new HttpException(
          'One or both versions not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Extract and compare workflow steps
      const stepsA = this.extractStepsFromWorkflowData(versionA.data);
      const stepsB = this.extractStepsFromWorkflowData(versionB.data);
      
      // Calculate differences
      const differences = this.calculateWorkflowDifferences(stepsA, stepsB);
      
      // Transform steps for frontend display
      const transformedStepsA = this.transformStepsForComparison(stepsA, stepsB, 'A');
      const transformedStepsB = this.transformStepsForComparison(stepsB, stepsA, 'B');

      // Return comparison data in expected format
      return {
        workflow: {
          id: workflow.id,
          name: workflow.name,
          hubspotId: workflow.hubspotId,
        },
        versionA: {
          id: versionA.id,
          versionNumber: versionA.versionNumber,
          snapshotType: versionA.snapshotType,
          createdAt: versionA.createdAt,
          createdBy: versionA.createdBy,
          data: versionA.data,
          steps: transformedStepsA,
        },
        versionB: {
          id: versionB.id,
          versionNumber: versionB.versionNumber,
          snapshotType: versionB.snapshotType,
          createdAt: versionB.createdAt,
          createdBy: versionB.createdBy,
          data: versionB.data,
          steps: transformedStepsB,
        },
        differences: differences,
      };
    } catch (error) {
      console.error('Error comparing workflow versions:', error);
      throw new HttpException(
        `Failed to compare workflow versions: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private calculateWorkflowDifferences(stepsA: any[], stepsB: any[]): any {
    const added = [];
    const modified = [];
    const removed = [];
    
    // Find added steps (in B but not in A)
    for (const stepB of stepsB) {
      const matchingStepA = stepsA.find(stepA => 
        this.stepsEqual(stepA, stepB) || stepA.id === stepB.id || stepA.actionId === stepB.actionId
      );
      if (!matchingStepA) {
        added.push({
          step: stepB,
          type: 'added',
          field: 'workflow_step',
          oldValue: null,
          newValue: stepB,
        });
      }
    }
    
    // Find removed steps (in A but not in B)
    for (const stepA of stepsA) {
      const matchingStepB = stepsB.find(stepB => 
        this.stepsEqual(stepA, stepB) || stepA.id === stepB.id || stepA.actionId === stepB.actionId
      );
      if (!matchingStepB) {
        removed.push({
          step: stepA,
          type: 'removed',
          field: 'workflow_step',
          oldValue: stepA,
          newValue: null,
        });
      }
    }
    
    // Find modified steps
    for (const stepA of stepsA) {
      const stepB = stepsB.find(stepB => 
        (stepA.id && stepA.id === stepB.id) || 
        (stepA.actionId && stepA.actionId === stepB.actionId)
      );
      if (stepB && !this.stepsEqual(stepA, stepB)) {
        modified.push({
          step: stepB,
          type: 'modified',
          field: 'workflow_step',
          oldValue: stepA,
          newValue: stepB,
        });
      }
    }
    
    return { added, modified, removed };
  }
  
  private transformStepsForComparison(steps: any[], otherSteps: any[], version: 'A' | 'B'): any[] {
    return steps.map(step => {
      const otherStep = otherSteps.find(other => 
        (step.id && step.id === other.id) || 
        (step.actionId && step.actionId === other.actionId)
      );
      
      let changeType = null;
      if (!otherStep) {
        changeType = version === 'A' ? 'removed' : 'added';
      } else if (!this.stepsEqual(step, otherStep)) {
        changeType = 'modified';
      }
      
      return {
        id: step.id || step.actionId || `step-${Math.random()}`,
        title: step.name || step.title || step.actionType || 'Unnamed Step',
        type: step.type || step.actionType || 'action',
        settings: step.settings || step.config || {},
        isNew: changeType === 'added',
        isModified: changeType === 'modified',
        isRemoved: changeType === 'removed',
      };
    });
  }
}
