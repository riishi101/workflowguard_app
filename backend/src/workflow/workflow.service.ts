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

  async compareWorkflowVersions(
    workflowId: string,
    versionA: string,
    versionB: string,
  ): Promise<any> {
    try {
      // First, resolve the workflowId - it might be a HubSpot ID or WorkflowGuard UUID
      let actualWorkflowId = workflowId;
      const isWorkflowIdUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workflowId);
      
      if (!isWorkflowIdUUID) {
        // It's likely a HubSpot ID, find the corresponding WorkflowGuard workflow
        const workflow = await this.prisma.workflow.findFirst({
          where: { hubspotId: workflowId },
        });
        
        if (!workflow) {
          throw new HttpException(
            `Workflow not found for HubSpot ID: ${workflowId}`,
            HttpStatus.NOT_FOUND,
          );
        }
        
        actualWorkflowId = workflow.id;
      }

      // Check if versionA and versionB are UUIDs or version numbers
      const isVersionAUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(versionA);
      const isVersionBUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(versionB);

      const versionAData = await this.prisma.workflowVersion.findFirst({
        where: {
          workflowId: actualWorkflowId,
          ...(isVersionAUUID ? { id: versionA } : { versionNumber: parseInt(versionA) }),
        },
      });

      const versionBData = await this.prisma.workflowVersion.findFirst({
        where: {
          workflowId: actualWorkflowId,
          ...(isVersionBUUID ? { id: versionB } : { versionNumber: parseInt(versionB) }),
        },
      });

      if (!versionAData || !versionBData) {
        throw new HttpException(
          'One or both versions not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Simple comparison logic - compare the workflow data
      const dataA = versionAData.data;
      const dataB = versionBData.data;
      
      const differences = this.findWorkflowDifferences(dataA, dataB);

      // Transform version data for frontend display
      const transformedVersionA = {
        ...versionAData,
        steps: this.transformWorkflowDataToSteps(versionAData.data)
      };

      const transformedVersionB = {
        ...versionBData,
        steps: this.transformWorkflowDataToSteps(versionBData.data)
      };

      return {
        versionA: transformedVersionA,
        versionB: transformedVersionB,
        differences: {
          added: differences.filter(d => d.type === 'added'),
          modified: differences.filter(d => d.type === 'changed'),
          removed: differences.filter(d => d.type === 'removed')
        }
      };
    } catch (error) {
      throw new HttpException(
        `Failed to compare workflow versions: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private findWorkflowDifferences(dataA: any, dataB: any): any[] {
    const differences = [];
    
    try {
      // Compare basic workflow properties
      if (dataA.name !== dataB.name) {
        differences.push({
          field: 'name',
          oldValue: dataA.name,
          newValue: dataB.name,
          type: 'changed'
        });
      }

      if (dataA.enabled !== dataB.enabled) {
        differences.push({
          field: 'enabled',
          oldValue: dataA.enabled,
          newValue: dataB.enabled,
          type: 'changed'
        });
      }

      // Compare actions array
      if (dataA.actions && dataB.actions) {
        if (dataA.actions.length !== dataB.actions.length) {
          differences.push({
            field: 'actions',
            oldValue: `${dataA.actions.length} actions`,
            newValue: `${dataB.actions.length} actions`,
            type: 'changed'
          });
        } else {
          // Compare individual actions
          for (let i = 0; i < dataA.actions.length; i++) {
            const actionA = dataA.actions[i];
            const actionB = dataB.actions[i];
            
            if (JSON.stringify(actionA) !== JSON.stringify(actionB)) {
              differences.push({
                field: `actions[${i}]`,
                oldValue: actionA.type || 'Unknown action',
                newValue: actionB.type || 'Unknown action',
                type: 'changed'
              });
            }
          }
        }
      }

      // Compare enrollment triggers
      if (dataA.enrollmentTriggers && dataB.enrollmentTriggers) {
        if (JSON.stringify(dataA.enrollmentTriggers) !== JSON.stringify(dataB.enrollmentTriggers)) {
          differences.push({
            field: 'enrollmentTriggers',
            oldValue: 'Previous triggers',
            newValue: 'Updated triggers',
            type: 'changed'
          });
        }
      }

    } catch (error) {
      console.error('Error comparing workflow data:', error);
      differences.push({
        field: 'comparison',
        oldValue: 'Error comparing',
        newValue: 'Error comparing',
        type: 'error'
      });
    }

    return differences;
  }

  private transformWorkflowDataToSteps(workflowData: any): any[] {
    const steps = [];
    
    try {
      // If workflow has actions, transform them to steps
      if (workflowData?.actions && Array.isArray(workflowData.actions)) {
        workflowData.actions.forEach((action: any, index: number) => {
          steps.push({
            id: action.id || `action-${index}`,
            title: action.type || action.actionType || `Action ${index + 1}`,
            type: this.getStepType(action),
            description: action.description || action.subject || '',
            isNew: false,
            isModified: false,
            isRemoved: false
          });
        });
      }

      // If no actions but has enrollment triggers, show them
      if (steps.length === 0 && workflowData?.enrollmentTriggers) {
        steps.push({
          id: 'enrollment-trigger',
          title: 'Enrollment Trigger',
          type: 'condition',
          description: 'Workflow enrollment conditions',
          isNew: false,
          isModified: false,
          isRemoved: false
        });
      }

      // If still no steps, create a basic workflow step
      if (steps.length === 0) {
        steps.push({
          id: 'workflow-basic',
          title: workflowData?.name || 'Workflow',
          type: 'email',
          description: `Status: ${workflowData?.enabled ? 'Active' : 'Inactive'}`,
          isNew: false,
          isModified: false,
          isRemoved: false
        });
      }

    } catch (error) {
      console.error('Error transforming workflow data to steps:', error);
      // Return a fallback step
      steps.push({
        id: 'fallback-step',
        title: 'Workflow Step',
        type: 'email',
        description: 'Unable to parse workflow details',
        isNew: false,
        isModified: false,
        isRemoved: false
      });
    }

    return steps;
  }

  private getStepType(action: any): string {
    const actionType = action.type || action.actionType || '';
    
    if (actionType.toLowerCase().includes('email')) return 'email';
    if (actionType.toLowerCase().includes('delay')) return 'delay';
    if (actionType.toLowerCase().includes('meeting')) return 'meeting';
    if (actionType.toLowerCase().includes('condition')) return 'condition';
    
    return 'email'; // default
  }

  async getWorkflowVersions(workflowId: string, userId: string): Promise<any[]> {
    try {
      // First, try to find the workflow by internal ID
      let workflow = await this.prisma.workflow.findFirst({
        where: {
          id: workflowId,
          ownerId: userId,
        },
      });

      // If not found by internal ID, try by HubSpot ID
      if (!workflow) {
        workflow = await this.prisma.workflow.findFirst({
          where: {
            hubspotId: workflowId,
            ownerId: userId,
          },
        });
      }

      if (!workflow) {
        throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
      }

      const versions = await this.prisma.workflowVersion.findMany({
        where: {
          workflowId: workflow.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          workflow: {
            select: {
              name: true,
              hubspotId: true,
            },
          },
        },
      });

      return versions;
    } catch (error) {
      throw new HttpException(
        `Failed to get workflow versions: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createInitialVersionIfMissing(workflowId: string, userId: string): Promise<any> {
    try {
      // First, find the workflow by internal ID or HubSpot ID
      let workflow = await this.prisma.workflow.findFirst({
        where: {
          OR: [
            { id: workflowId, ownerId: userId },
            { hubspotId: workflowId, ownerId: userId },
          ],
        },
      });

      if (!workflow) {
        throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
      }

      // Check if versions already exist
      const existingVersions = await this.prisma.workflowVersion.findMany({
        where: { workflowId: workflow.id },
      });

      if (existingVersions.length > 0) {
        return existingVersions[0]; // Already has versions
      }

      // Try to get workflow data from HubSpot
      let workflowData = null;
      try {
        const hubspotWorkflows = await this.hubspotService.getWorkflows(userId);
        workflowData = hubspotWorkflows.find((w) => String(w.id) === workflow.hubspotId);
      } catch (hubspotError) {
        console.warn('Could not fetch HubSpot data for initial version:', hubspotError.message);
      }

      // Create initial version data
      const initialVersionData = workflowData || {
        hubspotId: workflow.hubspotId,
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
      const initialVersion = await this.prisma.workflowVersion.create({
        data: {
          workflowId: workflow.id,
          versionNumber: 1,
          snapshotType: 'Initial Protection',
          createdBy: userId,
          data: initialVersionData as any,
        },
      });

      // Create audit log
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'initial_version_created',
          entityType: 'workflow',
          entityId: workflow.id,
          newValue: JSON.stringify({
            versionId: initialVersion.id,
            versionNumber: 1,
            protectionType: 'initial',
          }),
        },
      });

      console.log('✅ Created initial version for workflow:', {
        workflowId: workflow.id,
        workflowName: workflow.name,
        hubspotId: workflow.hubspotId,
        versionId: initialVersion.id,
        dataSource: workflowData ? 'hubspot' : 'minimal',
      });

      return initialVersion;
    } catch (error) {
      console.error('Failed to create initial version:', error);
      throw new HttpException(
        `Failed to create initial version: ${error.message}`,
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

    // Fetch HubSpot workflows OUTSIDE the transaction to avoid conflicts
    let hubspotWorkflows: any[] = [];
    try {
      hubspotWorkflows = await this.hubspotService.getWorkflows(userId);
    } catch (hubspotError) {
      console.warn('Could not fetch HubSpot workflows, proceeding with minimal data:', hubspotError.message);
    }

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
            // Use pre-fetched HubSpot data (outside transaction)
            const workflowData = hubspotWorkflows.find((w) => String(w.id) === hubspotId);

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

  private normalizeWorkflowData(data: any): any {
    if (!data) return {};
    
    // Create a copy to avoid mutating original data
    const normalized = JSON.parse(JSON.stringify(data));
    
    // Remove metadata fields that change frequently but don't affect workflow logic
    const fieldsToRemove = [
      'updatedAt',
      'createdAt', 
      'lastModified',
      'lastUpdated',
      'modifiedAt',
      'id', // HubSpot internal ID can change
      'portalId',
      'migrationStatus',
      'insertedAt'
    ];
    
    const removeFields = (obj: any) => {
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          obj.forEach(removeFields);
        } else {
          fieldsToRemove.forEach(field => delete obj[field]);
          Object.values(obj).forEach(removeFields);
        }
      }
    };
    
    removeFields(normalized);
    
    // Sort object keys for consistent comparison
    const sortKeys = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      if (Array.isArray(obj)) return obj.map(sortKeys);
      
      const sorted: any = {};
      Object.keys(obj).sort().forEach(key => {
        sorted[key] = sortKeys(obj[key]);
      });
      return sorted;
    };
    
    return sortKeys(normalized);
  }

  async syncHubSpotWorkflows(userId: string): Promise<any[]> {
    try {
      console.log(`🔄 SYNC STARTED for user: ${userId}`);
      const { HubSpotService } = await import('../services/hubspot.service');
      const hubspotService = new HubSpotService(this.prisma);

      console.log(`📡 Fetching HubSpot workflows for user: ${userId}`);
      const hubspotWorkflows = await hubspotService.getWorkflows(userId);
      console.log(`📊 Found ${hubspotWorkflows.length} HubSpot workflows`);

      const syncedWorkflows = [];
      console.log(`🔄 Starting sync loop for ${hubspotWorkflows.length} workflows`);

      for (const hubspotWorkflow of hubspotWorkflows) {
        console.log(`📝 Checking workflow: ${hubspotWorkflow.id} - ${hubspotWorkflow.name}`);
        const existingWorkflow = await this.prisma.workflow.findFirst({
          where: {
            hubspotId: String(hubspotWorkflow.id),
            ownerId: userId,
          },
        });

        if (existingWorkflow) {
          console.log(`🔍 Processing protected workflow: ${hubspotWorkflow.id} (${hubspotWorkflow.name})`);
          // Get the latest version to compare with current HubSpot data
          const latestVersion = await this.prisma.workflowVersion.findFirst({
            where: { workflowId: existingWorkflow.id },
            orderBy: { createdAt: 'desc' },
          });

          // Fetch current workflow data from HubSpot for comparison
          console.log(`Fetching current data for workflow ${hubspotWorkflow.id}...`);
          const currentWorkflowData = await hubspotService.getWorkflowById(
            userId,
            String(hubspotWorkflow.id),
          );

          let shouldCreateVersion = false;
          
          console.log(`Workflow ${hubspotWorkflow.id} - Latest version exists:`, !!latestVersion);
          console.log(`Workflow ${hubspotWorkflow.id} - Current data exists:`, !!currentWorkflowData);
          
          if (latestVersion && currentWorkflowData) {
            // Compare current HubSpot data with latest version
            console.log(`Comparing data for workflow ${hubspotWorkflow.id}...`);
            const normalizedCurrentData = this.normalizeWorkflowData(currentWorkflowData);
            const normalizedLatestData = this.normalizeWorkflowData(latestVersion.data);
            
            const currentDataString = JSON.stringify(normalizedCurrentData);
            const latestDataString = JSON.stringify(normalizedLatestData);
            
            shouldCreateVersion = currentDataString !== latestDataString;
            
            console.log(`Workflow ${hubspotWorkflow.id} comparison result:`, {
              hasChanges: shouldCreateVersion,
              currentDataLength: currentDataString.length,
              latestDataLength: latestDataString.length,
              latestVersionNumber: latestVersion.versionNumber,
              latestVersionCreated: latestVersion.createdAt
            });
            
            if (shouldCreateVersion) {
              console.log(`CHANGES DETECTED for workflow ${hubspotWorkflow.id} - will create new version`);
            } else {
              console.log(`NO CHANGES detected for workflow ${hubspotWorkflow.id} - skipping version creation`);
            }
          } else if (!latestVersion && currentWorkflowData) {
            // No versions exist, create initial version
            shouldCreateVersion = true;
            console.log(`Creating initial version for workflow ${hubspotWorkflow.id} (no existing versions)`);
          } else if (!currentWorkflowData) {
            console.log(`ERROR: Could not fetch current data for workflow ${hubspotWorkflow.id}`);
          }

          // Update workflow metadata
          const updatedWorkflow = await this.prisma.workflow.update({
            where: { id: existingWorkflow.id },
            data: {
              name: hubspotWorkflow.name,
              updatedAt: new Date(),
            },
            include: {
              owner: true,
              versions: { orderBy: { createdAt: 'desc' } },
            },
          });

          // Create new version if content changed
          if (shouldCreateVersion && currentWorkflowData) {
            const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
            
            await this.prisma.workflowVersion.create({
              data: {
                workflowId: existingWorkflow.id,
                versionNumber: nextVersionNumber,
                data: currentWorkflowData as any,
                snapshotType: 'Manual Sync',
                createdBy: 'System (Sync)',
                createdAt: new Date(),
              },
            });

            console.log(`Created version ${nextVersionNumber} for workflow ${hubspotWorkflow.id}`);
            
            // Refetch workflow with updated versions
            const workflowWithNewVersion = await this.prisma.workflow.findUnique({
              where: { id: existingWorkflow.id },
              include: {
                owner: true,
                versions: { orderBy: { createdAt: 'desc' } },
              },
            });
            syncedWorkflows.push(workflowWithNewVersion);
          } else {
            syncedWorkflows.push(updatedWorkflow);
          }
        } else {
          const newWorkflow = await this.prisma.workflow.create({
            data: {
              hubspotId: String(hubspotWorkflow.id),
              name: hubspotWorkflow.name,
              ownerId: userId,
            },
            include: {
              owner: true,
              versions: true,
            },
          });
          syncedWorkflows.push(newWorkflow);
        }
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
      // Assuming getWorkflowById exists in HubSpotService. If not, this will need to be implemented.
      const hubspotWorkflowData = await this.hubspotService.getWorkflowById(
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
        'webhook',
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
}
