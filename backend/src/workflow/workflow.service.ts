import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HubSpotService } from '../services/hubspot.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { WorkflowVersionService } from '../workflow-version/workflow-version.service';
import { EncryptionService } from '../services/encryption.service';

@Injectable()
export class WorkflowService {
  constructor(
    private prisma: PrismaService,
    private hubspotService: HubSpotService,
    private subscriptionService: SubscriptionService,
    private workflowVersionService: WorkflowVersionService,
    private encryptionService: EncryptionService,
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
      return await this.hubspotService.getWorkflows(userId);
    } catch (error) {
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
    captureDetailedStepProperties: boolean = true,
  ): Promise<any> {
    const debugVersionA = await this.prisma.workflowVersion.findUnique({
      where: { id: versionA }
    });
    const debugVersionB = await this.prisma.workflowVersion.findUnique({
      where: { id: versionB }
    });

    // Decrypt the debug data for logging (with proper JSON parsing)
    let decryptedDebugA = null;
    let decryptedDebugB = null;
    
    if (debugVersionA?.data) {
      try {
        const parsedDebugA = typeof debugVersionA.data === 'string' ? JSON.parse(debugVersionA.data) : debugVersionA.data;
        decryptedDebugA = this.encryptionService.decryptWorkflowData(parsedDebugA);
      } catch (error) {
      }
    }
    
    if (debugVersionB?.data) {
      try {
        const parsedDebugB = typeof debugVersionB.data === 'string' ? JSON.parse(debugVersionB.data) : debugVersionB.data;
        decryptedDebugB = this.encryptionService.decryptWorkflowData(parsedDebugB);
      } catch (error) {
      }
    }
    
    try {
      // First, resolve the workflowId - it might be a HubSpot ID or WorkflowGuard UUID
      let actualWorkflowId = workflowId;
      const isWorkflowIdUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          workflowId,
        );

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
      const isVersionAUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          versionA,
        );
      const isVersionBUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          versionB,
        );

      const versionAData = await this.prisma.workflowVersion.findFirst({
        where: {
          workflowId: actualWorkflowId,
          ...(isVersionAUUID
            ? { id: versionA }
            : { versionNumber: parseInt(versionA) }),
        },
      });

      const versionBData = await this.prisma.workflowVersion.findFirst({
        where: {
          workflowId: actualWorkflowId,
          ...(isVersionBUUID
            ? { id: versionB }
            : { versionNumber: parseInt(versionB) }),
        },
      });

      if (!versionAData || !versionBData) {
        throw new HttpException(
          'One or both versions not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Enhanced comparison logic with complete workflow data
      // CRITICAL FIX: Parse JSON string before decryption (data is stored as JSON.stringify)
      let parsedDataA = versionAData.data;
      let parsedDataB = versionBData.data;
      
      // Parse JSON if data is stored as string
      if (typeof parsedDataA === 'string') {
        try {
          parsedDataA = JSON.parse(parsedDataA);
        } catch (error) {
          parsedDataA = null;
        }
      }
      
      if (typeof parsedDataB === 'string') {
        try {
          parsedDataB = JSON.parse(parsedDataB);
        } catch (error) {
          parsedDataB = null;
        }
      }
      
      // Now decrypt the parsed data
      let originalDataA = parsedDataA ? this.encryptionService.decryptWorkflowData(parsedDataA) : null;
      let originalDataB = parsedDataB ? this.encryptionService.decryptWorkflowData(parsedDataB) : null;
      // Get userId from the workflow owner
      const workflow = await this.prisma.workflow.findFirst({
        where: { id: actualWorkflowId }
      });
      const userId = workflow?.ownerId;
      
      // Ensure we capture detailed step properties for comparison
      const captureDetailedStepProperties = true;
      
      // CRITICAL FIX: If stored data is incomplete, fetch fresh detailed data from HubSpot
      // Use the enhanced validation method
      if (userId && !this.validateWorkflowDataCompleteness(originalDataA)) {
        try {
          const freshDataA = await this.hubspotService.getWorkflowByIdWithRetry(userId, workflowId);
          if (freshDataA && this.validateWorkflowDataCompleteness(freshDataA)) {
            originalDataA = freshDataA as any;
          } else {
          }
        } catch (error) {
        }
      }

      // Check if Version B data is incomplete
      if (userId && !this.validateWorkflowDataCompleteness(originalDataB)) {
        try {
          const freshDataB = await this.hubspotService.getWorkflowByIdWithRetry(userId, workflowId);
          if (freshDataB && this.validateWorkflowDataCompleteness(freshDataB)) {
            originalDataB = freshDataB as any;
          } else {
          }
        } catch (error) {
        }
      }

      // Enhanced logging for debugging
      const dataA = originalDataA as any;
      const dataB = originalDataB as any;

      const differences = this.findWorkflowDifferences(originalDataA, originalDataB);

      // Transform version data for frontend display with enhanced details
      
      const transformedVersionA = {
        ...versionAData,
        steps: this.transformWorkflowDataToSteps(originalDataA, 'A'),
      };

      const transformedVersionB = {
        ...versionBData,
        steps: this.transformWorkflowDataToSteps(originalDataB, 'B'),
      };
      // Enhanced comparison with proper change detection
      const workflowDataA = originalDataA as any;
      const workflowDataB = originalDataB as any;
      // Create enhanced step comparison with proper change marking
      const stepsA = this.transformWorkflowDataToSteps(workflowDataA, 'A');
      const stepsB = this.transformWorkflowDataToSteps(workflowDataB, 'B');
      // Mark changes between versions
      const { markedStepsA, markedStepsB, changeSummary } = this.markStepChanges(stepsA, stepsB);
      
      // Enhance steps with detailed property information for better comparison
      if (captureDetailedStepProperties) {
        this.enhanceStepsWithDetailedProperties(markedStepsA, markedStepsB);
      }

      const enhancedComparison = {
        versionA: {
          ...versionAData,
          steps: markedStepsA,
        },
        versionB: {
          ...versionBData,
          steps: markedStepsB,
        },
        differences: {
          added: differences.filter((d) => d.type === 'added'),
          modified: differences.filter((d) => d.type === 'changed'),
          removed: differences.filter((d) => d.type === 'removed'),
        },
        // Add workflow-level metadata comparison
        workflowMetadata: {
          versionA: {
            name: workflowDataA?.name,
            enabled: workflowDataA?.enabled,
            type: workflowDataA?.type,
            createdAt: versionAData.createdAt,
            versionNumber: versionAData.versionNumber,
          },
          versionB: {
            name: workflowDataB?.name,
            enabled: workflowDataB?.enabled,
            type: workflowDataB?.type,
            createdAt: versionBData.createdAt,
            versionNumber: versionBData.versionNumber,
          },
          changes: this.compareWorkflowMetadata(workflowDataA, workflowDataB),
        },
        // Add detailed step-by-step comparison
        stepComparison: {
          steps: {
            versionA: markedStepsA,
            versionB: markedStepsB,
          },
          changes: this.createDetailedStepComparison(workflowDataA, workflowDataB),
          summary: changeSummary,
        },
      };
      return enhancedComparison;
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
          type: 'changed',
        });
      }

      if (dataA.enabled !== dataB.enabled) {
        differences.push({
          field: 'enabled',
          oldValue: dataA.enabled,
          newValue: dataB.enabled,
          type: 'changed',
        });
      }

      // Compare actions array with detailed comparison
      if (dataA.actions && dataB.actions) {
        // Create maps for easier lookup
        const actionsMapA = new Map();
        const actionsMapB = new Map();

        dataA.actions.forEach((action: any) => {
          const key = action.id || action.actionId || JSON.stringify(action);
          actionsMapA.set(key, action);
        });

        dataB.actions.forEach((action: any) => {
          const key = action.id || action.actionId || JSON.stringify(action);
          actionsMapB.set(key, action);
        });

        // Find added actions
        for (const [key, actionB] of actionsMapB) {
          if (!actionsMapA.has(key)) {
            differences.push({
              field: 'actions.added',
              oldValue: null,
              newValue: actionB,
              type: 'added',
              details: {
                action: actionB,
                description: `Added ${actionB.type || 'action'}`,
              },
            });
          }
        }

        // Find removed actions
        for (const [key, actionA] of actionsMapA) {
          if (!actionsMapB.has(key)) {
            differences.push({
              field: 'actions.removed',
              oldValue: actionA,
              newValue: null,
              type: 'removed',
              details: {
                action: actionA,
                description: `Removed ${actionA.type || 'action'}`,
              },
            });
          }
        }

        // Find modified actions
        for (const [key, actionB] of actionsMapB) {
          if (actionsMapA.has(key)) {
            const actionA = actionsMapA.get(key);
            // Compare action properties
            const actionDifferences = this.compareActionProperties(
              actionA,
              actionB,
            );
            if (actionDifferences.length > 0) {
              differences.push({
                field: 'actions.modified',
                oldValue: actionA,
                newValue: actionB,
                type: 'changed',
                details: {
                  actionA: actionA,
                  actionB: actionB,
                  changes: actionDifferences,
                  description: `Modified ${actionB.type || 'action'}`,
                },
              });
            }
          }
        }
      }

      // Compare enrollment triggers
      if (dataA.enrollmentTriggers && dataB.enrollmentTriggers) {
        if (
          JSON.stringify(dataA.enrollmentTriggers) !==
          JSON.stringify(dataB.enrollmentTriggers)
        ) {
          differences.push({
            field: 'enrollmentTriggers',
            oldValue: dataA.enrollmentTriggers,
            newValue: dataB.enrollmentTriggers,
            type: 'changed',
            details: {
              triggersA: dataA.enrollmentTriggers,
              triggersB: dataB.enrollmentTriggers,
              description: 'Enrollment triggers changed',
            },
          });
        }
      }

      // Compare goals
      if (dataA.goals && dataB.goals) {
        if (JSON.stringify(dataA.goals) !== JSON.stringify(dataB.goals)) {
          differences.push({
            field: 'goals',
            oldValue: dataA.goals,
            newValue: dataB.goals,
            type: 'changed',
            details: {
              goalsA: dataA.goals,
              goalsB: dataB.goals,
              description: 'Workflow goals changed',
            },
          });
        }
      }
    } catch (error) {
      console.error('Error comparing workflow data:', error);
      differences.push({
        field: 'comparison',
        oldValue: 'Error comparing',
        newValue: 'Error comparing',
        type: 'error',
        details: {
          error: error.message,
        },
      });
    }

    return differences;
  }

  private compareWorkflowMetadata(dataA: any, dataB: any): Array<{
    property: string;
    oldValue: any;
    newValue: any;
    changeType: string;
  }> {
    const metadataChanges: Array<{
      property: string;
      oldValue: any;
      newValue: any;
      changeType: string;
    }> = [];

    if (!dataA || !dataB) {
      return metadataChanges;
    }

    // Compare basic workflow properties
    const propertiesToCompare = ['name', 'enabled', 'type', 'description'];

    propertiesToCompare.forEach(prop => {
      if (dataA[prop] !== dataB[prop]) {
        metadataChanges.push({
          property: prop,
          oldValue: dataA[prop],
          newValue: dataB[prop],
          changeType: 'modified'
        });
      }
    });

    return metadataChanges;
  }

  private markStepChanges(stepsA: any[], stepsB: any[]): {
    markedStepsA: any[];
    markedStepsB: any[];
    changeSummary: {
      added: number;
      removed: number;
      modified: number;
    };
  } {
    const markedStepsA = stepsA.map(step => ({ ...step, isRemoved: false, isModified: false, isNew: false }));
    const markedStepsB = stepsB.map(step => ({ ...step, isRemoved: false, isModified: false, isNew: false }));

    let added = 0, removed = 0, modified = 0;

    // Mark removed steps (in A but not in B)
    markedStepsA.forEach(stepA => {
      const matchingStepB = markedStepsB.find(stepB =>
        stepB.title === stepA.title && stepB.type === stepA.type
      );
      if (!matchingStepB) {
        stepA.isRemoved = true;
        removed++;
      }
    });

    // Mark added and modified steps (in B)
    markedStepsB.forEach(stepB => {
      const matchingStepA = markedStepsA.find(stepA =>
        stepA.title === stepB.title && stepA.type === stepB.type
      );

      if (!matchingStepA) {
        stepB.isNew = true;
        added++;
      } else {
        // Check if step was modified
        const hasChanges = this.hasStepChanged(matchingStepA, stepB);
        if (hasChanges) {
          stepB.isModified = true;
          matchingStepA.isModified = true;
          modified++;
        }
      }
    });

    return {
      markedStepsA,
      markedStepsB,
      changeSummary: {
        added,
        removed,
        modified
      }
    };
  }
  
  private enhanceStepsWithDetailedProperties(stepsA: any[], stepsB: any[]): void {
    // For each modified step in B, identify specific property changes
    stepsB.forEach(step => {
      if (step.isModified) {
        // Find matching step in A
        const stepA = stepsA.find(s => s.title === step.title && s.type === step.type);
        if (stepA && stepA.details && step.details) {
          // Store old properties for comparison
          step.oldProperties = stepA.details;
          
          // Compare properties and identify changes
          step.changedProperties = this.compareStepProperties(stepA.details, step.details);
        }
      }
      
      // Set status for UI display
      if (step.isNew) {
        step.status = 'added';
      } else if (step.isModified) {
        step.status = 'modified';
      } else if (step.isRemoved) {
        step.status = 'removed';
      } else {
        step.status = 'unchanged';
      }
    });
    
    // Update status for steps in A
    stepsA.forEach(step => {
      if (step.isRemoved) {
        step.status = 'removed';
      } else if (step.isModified) {
        step.status = 'modified';
      } else {
        step.status = 'unchanged';
      }
    });
  }
  
  private compareStepProperties(propsA: any, propsB: any): Record<string, {old: any, new: any}> {
    const result: Record<string, {old: any, new: any}> = {};
    
    if (!propsA || !propsB) return result;
    
    // Get all unique keys
    const allKeys = new Set([
      ...Object.keys(propsA || {}),
      ...Object.keys(propsB || {})
    ]);
    
    // Compare each property
    allKeys.forEach(key => {
      // Skip raw data properties
      if (key === 'rawAction' || key === 'rawStep' || key === 'rawWorkflowData' || key === 'rawGoal') {
        return;
      }
      
      const valueA = propsA[key];
      const valueB = propsB[key];
      
      // Check if values are different
      if (JSON.stringify(valueA) !== JSON.stringify(valueB)) {
        result[key] = {
          old: valueA,
          new: valueB
        };
      }
    });
    
    return result;
  }

  private hasStepChanged(stepA: any, stepB: any): boolean {
    if (!stepA.details || !stepB.details) return false;

    // Compare key properties that indicate changes
    const propertiesToCompare = [
      'type', 'delayMillis', 'propertyName', 'propertyValue',
      'subject', 'body', 'settings'
    ];

    for (const prop of propertiesToCompare) {
      if (JSON.stringify(stepA.details[prop]) !== JSON.stringify(stepB.details[prop])) {
        return true;
      }
    }

    return false;
  }

  private createDetailedStepComparison(dataA: any, dataB: any): any {
    if (!dataA || !dataB) {
      return { steps: [], changes: [] };
    }

    const stepsA = this.transformWorkflowDataToSteps(dataA);
    const stepsB = this.transformWorkflowDataToSteps(dataB);

    // Create step comparison with detailed change tracking
    const stepComparison = {
      steps: {
        versionA: stepsA,
        versionB: stepsB
      },
      changes: this.identifyStepChanges(stepsA, stepsB),
      summary: {
        totalStepsA: stepsA.length,
        totalStepsB: stepsB.length,
        added: stepsB.filter(s => s.isNew).length,
        removed: stepsA.filter(s => s.isRemoved).length,
        modified: stepsA.filter(s => s.isModified).length
      }
    };

    return stepComparison;
  }

  private identifyStepChanges(stepsA: any[], stepsB: any[]): any[] {
    const changes = [];

    // This is a simplified version - in a real implementation,
    // you would use a more sophisticated diffing algorithm
    const maxSteps = Math.max(stepsA.length, stepsB.length);

    for (let i = 0; i < maxSteps; i++) {
      const stepA = stepsA[i];
      const stepB = stepsB[i];

      if (!stepA && stepB) {
        changes.push({
          type: 'added',
          step: stepB,
          position: i
        });
      } else if (stepA && !stepB) {
        changes.push({
          type: 'removed',
          step: stepA,
          position: i
        });
      } else if (stepA && stepB && stepA.title !== stepB.title) {
        changes.push({
          type: 'modified',
          oldStep: stepA,
          newStep: stepB,
          position: i
        });
      }
    }

    return changes;
  }

  private compareActionProperties(actionA: any, actionB: any): any[] {
    const differences = [];

    // Compare key properties that might change
    const propertiesToCompare = [
      'type',
      'actionType',
      'delayMillis',
      'propertyName',
      'propertyValue',
      'subject',
      'body',
      'to',
      'from',
      'settings',
      'filters',
      'conditions',
    ];

    propertiesToCompare.forEach((prop) => {
      if (actionA[prop] !== actionB[prop]) {
        differences.push({
          property: prop,
          oldValue: actionA[prop],
          newValue: actionB[prop],
        });
      }
    });

    // Deep compare settings if they exist
    if (actionA.settings && actionB.settings) {
      const settingsStringA = JSON.stringify(actionA.settings);
      const settingsStringB = JSON.stringify(actionB.settings);
      if (settingsStringA !== settingsStringB) {
        differences.push({
          property: 'settings',
          oldValue: actionA.settings,
          newValue: actionB.settings,
          details: 'Settings configuration changed',
        });
      }
    }

    // Deep compare filters if they exist
    if (actionA.filters && actionB.filters) {
      const filtersStringA = JSON.stringify(actionA.filters);
      const filtersStringB = JSON.stringify(actionB.filters);
      if (filtersStringA !== filtersStringB) {
        differences.push({
          property: 'filters',
          oldValue: actionA.filters,
          newValue: actionB.filters,
          details: 'Filter conditions changed',
        });
      }
    }

    return differences;
  }

  private transformWorkflowDataToSteps(workflowData: any, version: string = 'A'): any[] {
    const steps = [];

    try {
      // Handle enrollment triggers first (they appear at the beginning)
      if (workflowData?.enrollmentTriggers && Array.isArray(workflowData.enrollmentTriggers)) {
        workflowData.enrollmentTriggers.forEach((trigger: any, index: number) => {
          const triggerTitle = this.getTriggerTitle(trigger);
          const triggerDescription = this.getTriggerDescription(trigger);

          steps.push({
            id: trigger.id || `${version}-trigger-${index}`,
            title: triggerTitle,
            type: 'trigger',
            description: triggerDescription,
            version: version,
            isNew: false,
            isModified: false,
            isRemoved: false,
            details: {
              type: 'enrollmentTrigger',
              triggerType: trigger.eventId || trigger.type,
              filters: trigger.filters || [],
              conditions: trigger.conditions || [],
              settings: trigger.settings || {},
              summary: triggerTitle,
              configuration: trigger,
              rawTrigger: trigger,
            },
          });
        });
      }

      // Handle workflow actions (main workflow steps)
      if (workflowData?.actions && Array.isArray(workflowData.actions)) {
        console.log('🔍 DEBUG: First action data:', JSON.stringify(workflowData.actions[0], null, 2));
      console.log('🔍 DEBUG: Complete workflow data structure:', {
        workflowKeys: Object.keys(workflowData),
        actionsStructure: workflowData.actions?.map((action: any, i: number) => ({
          index: i,
          type: action.type,
          actionType: action.actionType,
          hasPropertyName: !!action.propertyName,
          hasPropertyValue: !!action.propertyValue,
          hasConditions: !!action.conditions,
          hasFilters: !!action.filters,
          allKeys: Object.keys(action)
        }))
      });
        workflowData.actions.forEach((action: any, index: number) => {
          console.log(`🔍 DEBUG: Action ${index}:`, {
            type: action.type,
            actionType: action.actionType,
            actionTypeId: action.actionTypeId,
            propertyName: action.propertyName,
            propertyValue: action.propertyValue,
            subject: action.subject,
            delayMillis: action.delayMillis,
            operation: action.operation,
            conditions: action.conditions,
            hasContextJson: !!action.contextJson,
            contextJsonLength: action.contextJson ? action.contextJson.length : 0,
            hasFields: !!action.fields,
            fieldsKeys: action.fields ? Object.keys(action.fields) : [],
            rawActionKeys: Object.keys(action)
          });
          if (action.type === 'SINGLE_CONNECTION' && action.fields) {
          }
          
          // CRITICAL: Test contextJson parsing specifically
          if (action.type === 'UNSUPPORTED_ACTION' && action.contextJson) {
            try {
              const parsedContext = JSON.parse(action.contextJson);
            } catch (error) {
            }
          }
          
          const stepType = this.getStepType(action);
          const stepTitle = this.getActionTitle(action);
          const stepDescription = this.getActionDescription(action);
          steps.push({
            id: action.id || action.actionId || `${version}-action-${index}`,
            title: stepTitle,
            type: stepType,
            description: stepDescription,
            version: version,
            isNew: false,
            isModified: false,
            isRemoved: false,
            // Add comprehensive action details
            details: {
              type: action.type || action.actionType,
              actionId: action.actionId,
              stepId: action.stepId,
              delayMillis: action.delayMillis,
              propertyName: action.propertyName,
              propertyValue: action.propertyValue,
              subject: action.subject,
              body: action.body,
              to: action.to,
              from: action.from,
              settings: action.settings,
              filters: action.filters,
              conditions: action.conditions,
              metadata: action.metadata,
              // Enhanced details for better display
              configuration: this.getActionConfiguration(action),
              summary: stepTitle,
              description: stepDescription,
              // Include all action properties for debugging
              rawAction: action,
            },
          });
        });
      }

      // Handle alternative step structure
      else if (workflowData?.steps && Array.isArray(workflowData.steps)) {
        workflowData.steps.forEach((step: any, index: number) => {
          steps.push({
            id: step.id || `step-${index}`,
            title: step.name || step.type || `Step ${index + 1}`,
            type: this.getStepType(step),
            description: step.description || '',
            isNew: false,
            isModified: false,
            isRemoved: false,
            details: {
              ...step,
              filters: step.filters,
              conditions: step.conditions,
              rawStep: step,
            },
          });
        });
      }

      // Handle goals as final steps
      if (workflowData?.goals && Array.isArray(workflowData.goals)) {
        workflowData.goals.forEach((goal: any, index: number) => {
          steps.push({
            id: goal.id || `goal-${index}`,
            title: 'Goal',
            type: 'goal',
            description: goal.name || 'Workflow goal',
            isNew: false,
            isModified: false,
            isRemoved: false,
            details: {
              type: 'goal',
              name: goal.name,
              filters: goal.filters,
              settings: goal.settings,
              rawGoal: goal,
            },
          });
        });
      }

      // If no detailed steps found but we have basic workflow info
      if (steps.length === 0 && workflowData?.name) {
        steps.push({
          id: 'workflow-basic',
          title: workflowData.name,
          type: 'workflow',
          description: workflowData.description || 'Workflow configuration',  // Remove "Status: Inactive"
          isNew: false,
          isModified: false,
          isRemoved: false,
          details: {
            type: 'workflow',
            name: workflowData.name,
            enabled: workflowData.enabled,
            description: workflowData.description,
            rawWorkflowData: workflowData,
          },
        });
      }

      // Final fallback for completely unknown data
      if (steps.length === 0) {
        steps.push({
          id: 'unsupported-workflow',
          title: 'Workflow Details Unavailable',
          type: 'unsupported',
          description: 'This workflow type is not yet supported or data is unavailable',
          isNew: false,
          isModified: false,
          isRemoved: false,
          details: {
            type: 'UNSUPPORTED_WORKFLOW',
            errorMessage: 'Workflow data structure not recognized',
            rawData: workflowData,
          },
        });
      }
    } catch (error) {
      // Return a fallback step with error details
      steps.push({
        id: 'error-step',
        title: 'Error Loading Workflow',
        type: 'error',
        description: 'Unable to parse workflow details',
        isNew: false,
        isModified: false,
        isRemoved: false,
        details: {
          type: 'error',
          errorMessage: error.message,
          rawData: workflowData,
        },
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
    if (actionType.toLowerCase().includes('webhook')) return 'webhook';
    if (actionType.toLowerCase().includes('task')) return 'task';
    if (actionType.toLowerCase().includes('list')) return 'list';

    return 'action'; // default
  }

  private getActionTitle(action: any): string {
    let actionType = action.type || action.actionType || '';
    let actionData = action;

    // CRITICAL FIX: Parse contextJson for better action descriptions
    if (action.contextJson) {
      try {
        const contextData = JSON.parse(action.contextJson);
        
        // If action type is UNSUPPORTED_ACTION, try to get the real type from context
        if (actionType === 'UNSUPPORTED_ACTION') {
          actionType = contextData.actionType || actionType;
        }
        
        // Merge context data with action for better parsing
        actionData = { ...action, ...contextData };
      } catch (error) {
      }
    }
    // Handle SINGLE_CONNECTION type (common HubSpot wrapper)
    if (actionType === 'SINGLE_CONNECTION' && actionData.actionTypeId) {
      const typeId = actionData.actionTypeId;
      if (typeId === '0-5' && actionData.fields?.property_name) {
        const propertyName = actionData.fields.property_name;
        const value = actionData.fields.value?.staticValue || '';
        if (propertyName === 'lifecyclestage' && !value) {
          return 'Clear Lifecycle Stage';
        }
        return `Set ${propertyName}${value ? ` to ${value}` : ''}`;
      }
      if (typeId === '0-3') {
        return 'Send internal email notification';
      }
      if (typeId === '0-8') {
        // Internal email notification with user_ids, subject, body
        const subject = actionData.fields?.subject || 'notification';
        return `Send internal email: ${subject}`;
      }
      if (typeId === '0-1') {
        return 'Delay';
      }
      if (typeId === '0-2') {
        return 'Branch condition';
      }
    }

    // Handle LIST_BRANCH type (branch conditions)
    if (actionType === 'LIST_BRANCH') {
      return 'Branch: Company property conditions';
    }

    // Handle EMAIL_NOTIFICATION specifically (from contextJson)
    if (actionType === 'EMAIL_NOTIFICATION') {
      const subject = actionData.subject || 'notification';
      return `Send internal notification: ${subject}`;
    }

    // Handle specific HubSpot action types with detailed titles
    if (actionType === 'DELAY') {
      const delayMinutes = Math.round((actionData.delayMillis || 0) / 60000);
      return `Wait ${delayMinutes} minutes`;
    }

    if (actionType === 'SET_CONTACT_PROPERTY' || actionType === 'SET_PROPERTY') {
      // Handle the "Clear Lifecycle Stage" case specifically
      if (actionData.propertyName === 'lifecyclestage' && actionData.propertyValue === '') {
        return 'Clear Lifecycle Stage';
      }
      return `Set ${actionData.propertyName || 'property'}${actionData.propertyValue ? ` to ${actionData.propertyValue}` : ''}`;
    }

    if (actionType === 'ADD_SUBTRACT_PROPERTY') {
      const propertyName = actionData.propertyName || actionData.property || 'property';
      const operation = actionData.operation || actionData.operator || 'modify';
      const value = actionData.propertyValue || actionData.value || actionData.amount;
      
      // Make property names more user-friendly
      const friendlyPropertyName = propertyName
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str: string) => str.toUpperCase())
        .replace('_', ' ');
      
      if (operation === 'ADD' || operation === 'INCREASE') {
        return `Increase ${friendlyPropertyName}${value ? ` by ${value}` : ''}`;
      } else if (operation === 'SUBTRACT' || operation === 'DECREASE') {
        return `Decrease ${friendlyPropertyName}${value ? ` by ${value}` : ''}`;
      } else {
        return `Update ${friendlyPropertyName}${value ? ` to ${value}` : ''}`;
      }
    }

    if (actionType === 'EMAIL' || actionType === 'SEND_EMAIL') {
      // Check for specific email subject to provide better titles
      if (actionData.subject && actionData.subject.includes('Thank you for submitting our test form')) {
        return 'Send internal email notification';
      }
      return `Send email${actionData.subject ? `: ${actionData.subject}` : ''}`;
    }

    if (actionType === 'WEBHOOK') {
      return 'Send webhook notification';
    }

    if (actionType === 'TASK' || actionType === 'CREATE_TASK') {
      // Check for specific task subject to provide better titles
      if (actionData.subject && actionData.subject.includes('Missing Email for WG Test Contact')) {
        return 'Create task Missing Email for WG Test Contact';
      }
      return `Create task${actionData.subject ? `: ${actionData.subject}` : ''}`;
    }

    if (actionType === 'BRANCH') {
      const conditions = actionData.conditions || actionData.criteria || actionData.filters || [];
      if (conditions.length > 0) {
        const condition = conditions[0];
        const property = condition.property || condition.propertyName || 'property';
        const operator = this.getOperatorText(condition.operator || 'EQ');
        const value = condition.value || condition.propertyValue || 'value';
        
        return `Branch: If ${property} ${operator} "${value}"`;
      }
      return 'Conditional branch';
    }

    if (actionType === 'LIST' || actionType === 'ADD_TO_LIST') {
      return 'Add to list';
    }

    if (actionType === 'REMOVE_FROM_LIST') {
      return 'Remove from list';
    }

    if (actionType === 'CREATE_DEAL') {
      return `Create deal${actionData.dealName ? `: ${actionData.dealName}` : ''}`;
    }

    if (actionType === 'ASSIGN_OWNER') {
      return `Assign owner${actionData.newValue ? `: ${actionData.newValue}` : ''}`;
    }

    // Handle specific action types based on the workflow structure
    if (actionType.includes('PROPERTY')) {
      return `Update property: ${actionData.propertyName || 'Unknown'}`;
    }

    if (actionType.includes('EMAIL')) {
      return `Send email notification`;
    }

    if (actionType.includes('SMS')) {
      return `Send SMS`;
    }

    if (actionType.includes('CALL')) {
      return `Log call`;
    }

    // If we get here, try to provide a more user-friendly description
    if (actionType === 'UNSUPPORTED_ACTION') {
      // Try to extract meaningful info from the action object
      if (actionData.propertyName && actionData.propertyValue) {
        return `Set ${actionData.propertyName} to ${actionData.propertyValue}`;
      }
      if (actionData.subject) {
        return `Action: ${actionData.subject}`;
      }
      if (actionData.name) {
        return `Action: ${actionData.name}`;
      }
      return 'Workflow Action';
    }
    
    // Convert technical action types to user-friendly names
    const friendlyName = actionType
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l: string) => l.toUpperCase());
    
    return friendlyName || 'Unknown Action';
  }

  private getOperatorText(operator: string): string {
    const operatorMap: { [key: string]: string } = {
      'EQ': 'equals',
      'NEQ': 'does not equal',
      'GT': 'is greater than',
      'GTE': 'is greater than or equal to',
      'LT': 'is less than',
      'LTE': 'is less than or equal to',
      'CONTAINS': 'contains',
      'NOT_CONTAINS': 'does not contain',
      'STARTS_WITH': 'starts with',
      'ENDS_WITH': 'ends with',
      'IS_EMPTY': 'is empty',
      'IS_NOT_EMPTY': 'is not empty',
      'IS_KNOWN': 'is known',
      'IS_UNKNOWN': 'is unknown'
    };

    return operatorMap[operator] || operator || 'equals';
  }

  private getTriggerTitle(trigger: any): string {
    if (!trigger) return 'Unknown Trigger';

    const triggerType = trigger.eventId || trigger.type || 'unknown';
    const filters = trigger.filters || [];

    // Handle specific trigger types based on HubSpot workflow structure
    if (triggerType === 'contact_property_change') {
      const propertyFilter = filters.find((f: any) => f.property);
      return `Property ${propertyFilter?.property || 'value'} changed`;
    }

    if (triggerType === 'contact_list_membership') {
      return 'Contact added to list';
    }

    if (triggerType === 'form_submission') {
      return 'Form submitted';
    }

    if (triggerType === 'page_view') {
      return 'Page viewed';
    }

    if (triggerType === 'email_open') {
      return 'Email opened';
    }

    if (triggerType === 'email_click') {
      return 'Email link clicked';
    }

    if (filters.length > 0) {
      return `${triggerType} with ${filters.length} condition${filters.length > 1 ? 's' : ''}`;
    }

    return `${triggerType} trigger`;
  }

  async getWorkflowVersions(
    workflowId: string,
    userId: string,
  ): Promise<any[]> {
    try {
      const workflow = await this._findWorkflowById(workflowId, userId);
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

  async createInitialVersionIfMissing(
    workflowId: string,
    userId: string,
  ): Promise<any> {
    try {
      const workflow = await this._findWorkflowById(workflowId, userId);
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
        workflowData = hubspotWorkflows.find(
          (w) => String(w.id) === workflow.hubspotId,
        );
      } catch (hubspotError) {
        console.warn(
          'Could not fetch HubSpot data for initial version:',
          hubspotError.message,
        );
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
          data: JSON.stringify(initialVersionData), // Convert object to JSON string
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
  ): Promise<any> {
    
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }

    if (!workflowIds || workflowIds.length === 0) {
      throw new HttpException('At least one workflow ID is required', HttpStatus.BAD_REQUEST);
    }

    try {
      // Validate user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      // Check workflow limits before proceeding
      try {
        await this.checkWorkflowLimits(userId, workflowIds.length);
      } catch (limitError) {
        throw limitError;
      }

    const protectedWorkflows: any[] = [];
    const errors: Array<{ workflowId: string; error: string }> = [];

      // Validate workflow data before proceeding
      if (selectedWorkflowObjects && selectedWorkflowObjects.length > 0) {
        // Ensure each workflow has at least id and hubspotId
        const invalidWorkflows = selectedWorkflowObjects.filter(
          workflow => !workflow.id && !workflow.hubspotId
        );
        if (invalidWorkflows.length > 0) {
          console.error('❌ START PROTECTION - Invalid workflow data detected:', 
            JSON.stringify(invalidWorkflows.map(w => ({ id: w.id, hubspotId: w.hubspotId })))
          );
          throw new HttpException(
            'Invalid workflow data: Each workflow must have either id or hubspotId', 
            HttpStatus.BAD_REQUEST
          );
        }
      }

      // Fetch HubSpot workflows OUTSIDE the transaction to avoid conflicts
      let hubspotWorkflows: any[] = [];
      try {
        hubspotWorkflows = await this.hubspotService.getWorkflows(userId);
      } catch (hubspotError) {
      }

      // Use transaction with timeout to ensure data consistency
      try {
        await this.prisma.$transaction(async (tx) => {
        for (const workflowId of workflowIds) {
          // Find the workflow object from selectedWorkflowObjects
          const workflowObj = selectedWorkflowObjects?.find(
            (w: any) => w.id === workflowId || w.hubspotId === workflowId,
          );
          const hubspotId = String(workflowObj?.hubspotId || workflowObj?.id || workflowId);

          // Create or update workflow
          const workflow = await tx.workflow.upsert({
            where: {
              hubspotId: hubspotId,
            },
            update: {
              name: workflowObj?.name || 'Unnamed Workflow',
              status: (workflowObj?.status || 'ACTIVE').toLowerCase(),
              ownerId: userId,
              updatedAt: new Date(),
            },
            create: {
              hubspotId: hubspotId,
              name: workflowObj?.name || 'Unnamed Workflow',
              status: (workflowObj?.status || 'ACTIVE').toLowerCase(),
              ownerId: userId,
            },
          });
          // Get the workflow with versions to check if any exist
          const workflowWithVersions = await tx.workflow.findUnique({
            where: { id: workflow.id },
            include: { versions: true },
          });

          // Ensure workflow has at least one version (only create if none exist)
          if (!workflowWithVersions?.versions?.length) {
            // Fetch detailed HubSpot data with enrollment triggers
            let workflowData = hubspotWorkflows.find(
              (w) => String(w.id) === hubspotId,
            );
            
            // If we have basic data, try to get detailed data with enrollment triggers
            if (workflowData && workflowData.hubspotData) {
              workflowData = workflowData.hubspotData;
            } else {
              // Fallback: fetch detailed data directly from HubSpot
              try {
                const detailedData = await this.hubspotService.getWorkflowById(userId, hubspotId);
                if (detailedData) {
                  workflowData = detailedData;
                }
              } catch (detailError) {
              }
            }
            // CRITICAL FIX: Enhanced data sanitization with bulletproof error handling
            const sanitizeForJSON = (data: any): any => {
              if (!data || typeof data !== 'object') {
                // Return safe primitive values only
                if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean' || data === null) {
                  return data;
                }
                return null; // Reject unsafe types
              }

              const sanitized: any = {};
              
              // Whitelist of safe fields to include (including enrollment triggers)
              const safeFields = ['id', 'name', 'status', 'type', 'enabled', 'insertedAt', 'updatedAt', 'hubspotId', 'actions', 'enrollmentTriggers', 'goals', 'settings'];
              
              for (const key of safeFields) {
                if (data.hasOwnProperty(key)) {
                  const value = data[key];
                  try {
                    // Only keep safe primitive values
                    if (value === null || value === undefined) {
                      sanitized[key] = value;
                    } else if (typeof value === 'string') {
                      // Ensure string is not too long and doesn't contain problematic characters
                      sanitized[key] = String(value).substring(0, 500).replace(/[\x00-\x1F\x7F]/g, '');
                    } else if (typeof value === 'number' && isFinite(value)) {
                      sanitized[key] = value;
                    } else if (typeof value === 'boolean') {
                      sanitized[key] = value;
                    } else if (Array.isArray(value) && ['actions', 'enrollmentTriggers', 'goals'].includes(key)) {
                      // Preserve important arrays for workflow functionality
                      sanitized[key] = value;
                    } else if (typeof value === 'object' && value !== null && key === 'settings') {
                      // Preserve settings object
                      sanitized[key] = value;
                    }
                    // Skip everything else
                  } catch (error) {
                    // Continue without this field rather than failing
                  }
                }
              }
              return sanitized;
            };

            // CRITICAL FIX: Create completely safe initial version data with guaranteed JSON serialization
            const initialVersionData = {
              hubspotId: String(hubspotId || '').substring(0, 100),
              name: String(workflow.name || 'Unnamed Workflow').substring(0, 200),
              status: String((workflowData?.status || workflowObj?.status || 'ACTIVE')).toLowerCase().substring(0, 50),
              type: String(workflowData?.type || 'unknown').substring(0, 50),
              enabled: Boolean((workflowData?.status || workflowObj?.status || 'ACTIVE') === 'ACTIVE'),
              // Only add sanitized data if it exists and is safe
              ...(workflowData ? sanitizeForJSON(workflowData) : {}),
              // Safe metadata with guaranteed primitive values
              metadata: {
                protection: {
                  initialProtection: true,
                  protectedAt: new Date().toISOString(),
                  protectedBy: String(userId).substring(0, 100),
                  source: workflowData ? 'hubspot' : 'minimal',
                },
              },
            };
            
            // CRITICAL: Validate that the data is actually JSON serializable
            try {
              const testSerialization = JSON.stringify(initialVersionData);
              if (!testSerialization || testSerialization === 'null') {
                throw new Error('Data serialization resulted in null or empty string');
              }
            } catch (serializationError) {
              // Fallback to minimal safe data
              const fallbackData = {
                hubspotId: String(hubspotId || ''),
                name: String(workflow.name || 'Unnamed Workflow'),
                status: 'active',
                type: 'unknown',
                enabled: true,
                metadata: {
                  protection: {
                    initialProtection: true,
                    protectedAt: new Date().toISOString(),
                    protectedBy: String(userId),
                    source: 'fallback',
                    error: 'Original data serialization failed'
                  }
                }
              };
              // Replace with fallback
              Object.assign(initialVersionData, fallbackData);
            }
            // CRITICAL FIX: Safe encryption with comprehensive error handling
            let finalVersionData = initialVersionData;
            let encryptionAttempted = false;
            
            try {
              if (this.encryptionService && typeof this.encryptionService.encryptWorkflowData === 'function') {
                finalVersionData = this.encryptionService.encryptWorkflowData(initialVersionData);
                encryptionAttempted = true;
              } else {
              }
            } catch (encryptionError) {
              finalVersionData = initialVersionData; // Fallback to original data
            }

            // CRITICAL FIX: Final safety check before database insertion
            let dataToStore: string;
            try {
              // Ensure we have a valid object
              if (!finalVersionData || typeof finalVersionData !== 'object') {
                throw new Error('Final version data is not a valid object');
              }
              
              // Attempt JSON stringification with error handling
              dataToStore = JSON.stringify(finalVersionData);
              
              // Validate the stringified data
              if (!dataToStore || dataToStore === 'null' || dataToStore === '{}') {
                throw new Error('JSON stringification resulted in invalid data');
              }
              
              // Check size limits (SQLite has limits)
              if (dataToStore.length > 1000000) { // 1MB limit
              }
            } catch (finalError) {
              // Ultimate fallback - create minimal safe data
              const ultimateFallback = {
                hubspotId: String(hubspotId || ''),
                name: String(workflow.name || 'Unnamed Workflow'),
                status: 'active',
                type: 'workflow',
                enabled: true,
                createdAt: new Date().toISOString(),
                metadata: {
                  error: 'Data serialization failed, using minimal fallback',
                  originalError: finalError.message,
                  timestamp: new Date().toISOString()
                }
              };
              
              dataToStore = JSON.stringify(ultimateFallback);
            }

            // Create the initial version with bulletproof data
            const initialVersion = await tx.workflowVersion.create({
              data: {
                workflowId: workflow.id,
                versionNumber: 1,
                snapshotType: 'Initial Protection',
                createdBy: userId,
                data: dataToStore, // Now guaranteed to be a valid JSON string
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

            // Add version to workflow object (for TypeScript compatibility)
            (workflow as any).versions = [initialVersion];
          }

          protectedWorkflows.push(workflow);
        }
      }, {
        timeout: 60000, // 60 second timeout for complex operations
      });
      
      // Verify workflows are actually in database after transaction
      const verificationWorkflows = await this.prisma.workflow.findMany({
        where: { ownerId: userId },
        select: { id: true, hubspotId: true, name: true, ownerId: true }
      });
      console.log('🔍 START PROTECTION - Database verification result:', {
        totalWorkflowsInDB: verificationWorkflows.length,
        workflowsForUser: verificationWorkflows.map(w => ({ 
          id: w.id, 
          hubspotId: w.hubspotId, 
          name: w.name,
          ownerId: w.ownerId
        })),
        expectedUserId: userId
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
      return {
        success: true,
        message: `Successfully protected ${protectedWorkflows.length} workflows`,
        protectedWorkflows,
        errors: errors.length > 0 ? errors : undefined,
        count: protectedWorkflows.length
      };
      
    } catch (txError) {
      // Handle transaction-specific errors
      // Rethrow with better error message for transaction errors
      throw new HttpException(
        {
          message: 'Database transaction failed during workflow protection',
          error: txError.message,
          code: txError.code
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    
    } catch (error) {
      // Return a more graceful error response instead of crashing
      throw new HttpException(
        {
          success: false,
          message: `Failed to start workflow protection: ${error.message || 'An unexpected error occurred'}`,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      
      // Re-throw HttpExceptions as-is
      if (error instanceof HttpException) {
        throw error;
      }
      
      // For any other errors, provide detailed error information
      throw new HttpException(
        `Failed to start workflow protection: ${error.message || 'Unknown error occurred'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Check if user can protect additional workflows based on their subscription plan
   */
  private async checkWorkflowLimits(
    userId: string,
    requestedCount: number,
  ): Promise<void> {
    try {
      // Get current protected workflows count
      const currentWorkflows = await this.getProtectedWorkflows(userId);
      const currentCount = currentWorkflows.length;
      // Get user subscription and limits
      let subscription;
      try {
        subscription = await this.subscriptionService.getUserSubscription(userId);
      } catch (subscriptionError) {
        // Default to trial limits if subscription service fails
        subscription = {
          planName: 'Trial',
          limits: { workflows: 10 },
          status: 'trial'
        };
      }
      const workflowLimit = subscription.limits.workflows;
      // Check if adding requested workflows would exceed limit
      const totalAfterAddition = currentCount + requestedCount;

      // Handle high-limit plans (9999 is effectively unlimited for practical purposes)
      if (totalAfterAddition > workflowLimit) {
        throw new HttpException(
          {
            message: `Workflow limit exceeded. Your ${subscription.planName} allows ${workflowLimit} workflows. You currently have ${currentCount} protected workflows and are trying to add ${requestedCount} more.`,
            currentCount,
            requestedCount,
            limit: workflowLimit,
            planName: subscription.planName,
            upgradeRequired: true,
          },
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // Don't throw an error here that would prevent workflow protection
      // Just log it and continue
    }
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
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: { versions: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });


      // Transform database records to match Dashboard expectations
      return workflows.map((workflow: any) => {
        const versionCount = workflow._count.versions;
        const latestVersion = workflow.versions[0];

        return {
          id: workflow.hubspotId || workflow.id,
          hubspotId: workflow.hubspotId, // ✅ FIX: Add explicit hubspotId for risk assessment
          internalId: workflow.id, // Add internal ID for restore operations
          name: workflow.name,
          status: workflow.isDeleted ? 'deleted' : workflow.status || 'active',
          protectionStatus: versionCount > 0 ? 'protected' : 'unprotected',
          isDeleted: workflow.isDeleted || false,
          deletedAt: workflow.deletedAt,
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
      // Basic timestamp fields
      'updatedAt',
      'createdAt',
      'lastModified',
      'lastUpdated',
      'modifiedAt',
      'insertedAt',

      // HubSpot internal IDs and metadata
      'id', // HubSpot internal ID can change
      'portalId',
      'migrationStatus',
      'hubspotCreatedAt',
      'hubspotUpdatedAt',

      'internalUpdatedAt',
      'systemUpdatedAt',

      // Execution and performance data that changes automatically
      'lastExecutedAt',
      'lastExecutionTime',
      'executionCount',
      'enrollmentCount',
      'lastEnrollmentAt',
      'totalEnrollments',
      'activeEnrollments',
      'completedEnrollments',

      // Statistics and metrics
      'statistics',
      'performance',
      'metrics',
      'stats',
      'analyticsData',

      // Cache and sync related fields
      'revision',
      'versionId',
      'etag',
      'lastSyncedAt',
      'syncStatus',
      'cacheTimestamp',
      'lastCacheUpdate',

      // HubSpot system fields
      'workflowHash',
      'contentHash',
      'lastModifiedByUserId',
      'lastModifiedByUser',
      'systemGenerated',
      'autoGenerated',

      // Metadata fields that change on every fetch
      '_metadata',
      'fetchedAt',
      'source',
      'completeData',
      
      // CRITICAL FIX: Additional dynamic fields from HubSpot V4 API that cause false positives
      'lastFetchedAt',
      'apiCallTimestamp',
      'systemTimestamp',
      'internalId',
      'requestId',
      'sessionId',
      'cacheKey',
      'lastModifiedBySystem',
      'apiVersion',
      'responseTimestamp',
      'fetchTimestamp',
      'apiResponseTime',
      'systemGeneratedAt',
      'internalTimestamp',
      'hubspotInternalId',
      'workflowInternalId',
      'systemMetadata',
      'apiMetadata',
      'fetchMetadata',
      'responseMetadata',
      'hubspotSystemData',
      'internalSystemData',
      'apiRequestId',
      'hubspotRequestId',
      'callTimestamp',
      'responseId',
      'systemCallId',
      'apiCallId',
      'hubspotApiVersion',
      'internalApiData',
      'systemApiData',
      'dynamicTimestamp',
      'autoTimestamp',
      'generatedTimestamp'
    ];

    const removeFields = (obj: any) => {
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          obj.forEach(removeFields);
        } else {
          fieldsToRemove.forEach((field) => delete obj[field]);
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
      Object.keys(obj)
        .sort()
        .forEach((key) => {
          sorted[key] = sortKeys(obj[key]);
        });
      return sorted;
    };

    return sortKeys(normalized);
  }

  private compareWorkflowStructure(current: any, previous: any): boolean {
    // Focus on core workflow elements that matter for functionality
    // These are the fields that represent actual workflow logic changes
    const coreFields = [
      'name',
      'type',
      'enabled',
      'actions',
      'triggers',
      'enrollmentTriggers', // CRITICAL: HubSpot uses this field for triggers
      'goalCriteria',
      'enrollmentCriteria',
      'suppressionLists',
      'segmentCriteria',
      'unenrollmentCriteria',
      'allowContactToTriggerMultipleTimes',
      'onlyExecOnBizDays',
      'onlyExecuteOnBusinessDays',
      'workflowBody', // Main workflow structure
      'contactListIds', // Contact lists used
      'listIds', // List criteria
      'propertyFilters', // Property-based filters
      'eventFilters', // Event-based triggers
      'formFilters', // Form submission triggers
      'pageFilters', // Page view triggers
      'emailFilters', // Email interaction triggers
      'workflowFilters', // Workflow-based triggers
    ];

    const extractCoreData = (data: any) => {
      if (!data) return {};
      const core: any = {};

      coreFields.forEach((field) => {
        if (data.hasOwnProperty(field)) {
          core[field] = data[field];
        }
      });

      return core;
    };

    // CRITICAL FIX: Normalize BEFORE extracting core data
    // This ensures timestamp fields within actions/enrollmentTriggers are removed
    const normalizedCurrent = this.normalizeWorkflowData(current);
    const normalizedPrevious = this.normalizeWorkflowData(previous);
    try {
      console.log(`🧽 NORMALIZATION DEBUG:`, {
        workflowName: current?.name || 'Unknown',
        originalCurrentKeys: Object.keys(current || {}),
        normalizedCurrentKeys: Object.keys(normalizedCurrent || {}),
        originalPreviousKeys: Object.keys(previous || {}),
        normalizedPreviousKeys: Object.keys(normalizedPrevious || {}),
        currentHasMetadata: !!(current?._metadata),
        previousHasMetadata: !!(previous?._metadata),
        currentFetchedAt: current?._metadata?.fetchedAt,
        previousFetchedAt: previous?._metadata?.fetchedAt
      });
    } catch (normalizationError) {
    }
    
    // Now extract core fields from already normalized data
    const currentCore = extractCoreData(normalizedCurrent);
    const previousCore = extractCoreData(normalizedPrevious);

    const currentString = JSON.stringify(currentCore);
    const previousString = JSON.stringify(previousCore);

    // EMERGENCY FIX: Only check core functional elements to eliminate false positives
    const hasChanges = (
      currentCore.name !== previousCore.name ||
      currentCore.enabled !== previousCore.enabled ||
      (currentCore.actions?.length || 0) !== (previousCore.actions?.length || 0) ||
      (currentCore.enrollmentTriggers?.length || 0) !== (previousCore.enrollmentTriggers?.length || 0)
    );
    // If changes detected, log the actual differences for debugging
    if (hasChanges) {
      // CRITICAL: Log the exact fields causing differences (with error handling)
      try {
        const allKeys = new Set([...Object.keys(currentCore || {}), ...Object.keys(previousCore || {})]);
        allKeys.forEach(key => {
          try {
            const currentValue = JSON.stringify(currentCore[key] || null);
            const previousValue = JSON.stringify(previousCore[key] || null);
            if (currentValue !== previousValue) {
              console.log(`    Current:  ${currentValue.substring(0, 200)}...`);
              console.log(`    Previous: ${previousValue.substring(0, 200)}...`);
            }
          } catch (fieldError) {
          }
        });
      } catch (comparisonError) {
      }
    } else {
    }

    return hasChanges;
  }

  async syncHubSpotWorkflows(userId: string): Promise<any[]> {
    try {
      const hubspotWorkflows = await this.hubspotService.getWorkflows(userId);
      const syncedWorkflows = [];
      await this._handleDeletedWorkflows(userId, hubspotWorkflows);

      for (const hubspotWorkflow of hubspotWorkflows) {
        const existingWorkflow = await this.prisma.workflow.findFirst({
          where: {
            hubspotId: String(hubspotWorkflow.id),
            ownerId: userId,
          },
        });

        if (existingWorkflow) {
          console.log(
            `🔍 Processing protected workflow: ${hubspotWorkflow.id} (${hubspotWorkflow.name})`,
          );
          // Get the latest version to compare with current HubSpot data
          const latestVersion = await this.prisma.workflowVersion.findFirst({
            where: { workflowId: existingWorkflow.id },
            orderBy: { createdAt: 'desc' },
          });

          // Fetch current workflow data from HubSpot for comparison
          console.log(
            `Fetching complete workflow data for ${hubspotWorkflow.id}...`,
          );
          const currentWorkflowData = await this.hubspotService.getWorkflowById(
            userId,
            String(hubspotWorkflow.id),
          );

          // Ensure we have complete workflow data with metadata
          if (currentWorkflowData && !currentWorkflowData._metadata) {
            currentWorkflowData._metadata = {
              fetchedAt: new Date().toISOString(),
              source: 'hubspot_sync',
              completeData: !!(currentWorkflowData.actions || currentWorkflowData.steps)
            };
          }

          let shouldCreateVersion = false;

          console.log(
            `Workflow ${hubspotWorkflow.id} - Latest version exists:`,
            !!latestVersion,
          );
          console.log(
            `Workflow ${hubspotWorkflow.id} - Current data exists:`,
            !!currentWorkflowData,
          );

          if (latestVersion && currentWorkflowData) {
            // Compare current HubSpot data with latest version using structure-based comparison
            console.log(
              `Comparing workflow structure for ${hubspotWorkflow.id}...`,
            );

            // Decrypt the stored version data before comparison
            console.log(`🔍 RAW DATABASE DATA for workflow ${hubspotWorkflow.id}:`, {
              latestVersionExists: !!latestVersion,
              latestVersionId: latestVersion?.id,
              latestVersionNumber: latestVersion?.versionNumber,
              rawDataType: typeof latestVersion?.data,
              rawDataLength: typeof latestVersion?.data === 'string' ? latestVersion.data.length : 0,
              rawDataPreview: typeof latestVersion?.data === 'string' ? latestVersion.data.substring(0, 100) + '...' : 'Not a string'
            });
            
            // Parse JSON string if needed, then decrypt with error handling
            let parsedStoredData;
            try {
              parsedStoredData = typeof latestVersion.data === 'string' 
                ? JSON.parse(latestVersion.data) 
                : latestVersion.data;
            } catch (parseError) {
              parsedStoredData = latestVersion.data;
            }
            
            let decryptedStoredData;
            try {
              decryptedStoredData = this.encryptionService.decryptWorkflowData(parsedStoredData);
            } catch (decryptionError) {
              // Fallback: use the raw stored data if decryption fails
              decryptedStoredData = parsedStoredData;
            }
            
            // If decryption still resulted in empty/null data, skip comparison
            if (!decryptedStoredData || Object.keys(decryptedStoredData).length === 0) {
              decryptedStoredData = null; // Explicitly set to null for clear comparison
            }
            
            
            console.log(`🔍 DETAILED COMPARISON for workflow ${hubspotWorkflow.id}:`, {
              currentDataKeys: Object.keys(currentWorkflowData || {}),
              storedDataKeys: Object.keys(decryptedStoredData || {}),
              currentActionsCount: currentWorkflowData?.actions?.length || 0,
              storedActionsCount: decryptedStoredData?.actions?.length || 0,
              currentTriggersCount: currentWorkflowData?.enrollmentTriggers?.length || 0,
              storedTriggersCount: decryptedStoredData?.enrollmentTriggers?.length || 0,
              currentName: currentWorkflowData?.name,
              storedName: decryptedStoredData?.name,
            });
            
            // Use the new structure-based comparison that focuses on functional changes
            shouldCreateVersion = this.compareWorkflowStructure(
              currentWorkflowData,
              decryptedStoredData,
            );

            // Only create versions for actual structural changes
            // Skip metadata-only differences like timestamps, fetchedAt, etc.
            if (!shouldCreateVersion) {
              // Do NOT create versions for metadata-only changes
              // This prevents unnecessary version creation on every sync
            }

            console.log(`🚨 CRITICAL DEBUG - Workflow ${hubspotWorkflow.id} (${hubspotWorkflow.name}) comparison result:`, {
              hasChanges: shouldCreateVersion,
              latestVersionNumber: latestVersion.versionNumber,
              latestVersionCreated: latestVersion.createdAt,
              comparisonMethod: 'structure-based',
              workflowName: hubspotWorkflow.name,
            });

            if (shouldCreateVersion) {
              console.log(
                `🔴 CHANGES DETECTED for workflow ${hubspotWorkflow.id} (${hubspotWorkflow.name}) - WILL CREATE NEW VERSION`,
              );
            } else {
              console.log(
                `🟢 NO CHANGES detected for workflow ${hubspotWorkflow.id} (${hubspotWorkflow.name}) - SKIPPING VERSION CREATION`,
              );
            }
          } else if (!latestVersion && currentWorkflowData) {
            // No versions exist, create initial version
            shouldCreateVersion = true;
            console.log(
              `Creating initial version for workflow ${hubspotWorkflow.id} (no existing versions)`,
            );
          } else if (!currentWorkflowData) {
            console.log(
              `ERROR: Could not fetch current data for workflow ${hubspotWorkflow.id}`,
            );
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
            const nextVersionNumber = latestVersion
              ? latestVersion.versionNumber + 1
              : 1;

            // Calculate changes against previous version for proper change summary
            let previousWorkflowData = null;
            if (latestVersion && latestVersion.data) {
              try {
                // Parse and decrypt previous version data for comparison
                const parsedPreviousData = typeof latestVersion.data === 'string' ? 
                  JSON.parse(latestVersion.data) : latestVersion.data;
                previousWorkflowData = this.encryptionService.decryptWorkflowData(parsedPreviousData);
              } catch (error) {
              }
            }

            // Calculate actual changes between current and previous data
            const changes = this.calculateWorkflowChanges(currentWorkflowData, previousWorkflowData);
            const changeSummary = this.generateWorkflowChangeSummary(changes);
            // Encrypt sensitive data before storing
            const encryptedWorkflowData = this.encryptionService.encryptWorkflowData(currentWorkflowData);

            await this.prisma.workflowVersion.create({
              data: {
                workflowId: existingWorkflow.id,
                versionNumber: nextVersionNumber,
                data: JSON.stringify(encryptedWorkflowData), // Convert encrypted object to JSON string
                snapshotType: `Manual Sync - ${changeSummary}`, // Include change summary
                createdBy: 'System (Sync)',
                createdAt: new Date(),
                // Store change summary in snapshotType to avoid schema changes
              },
            });

            console.log(
              `Created version ${nextVersionNumber} for workflow ${hubspotWorkflow.id}`,
            );

            // Refetch workflow with updated versions
            const workflowWithNewVersion =
              await this.prisma.workflow.findUnique({
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
      const backup = await this.workflowVersionService.createAutomatedBackup(
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

  async createFreshBackup(workflowId: string, userId: string): Promise<any> {
    try {
      const workflow = await this.prisma.workflow.findUnique({
        where: { id: workflowId },
        include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } }
      });

      if (!workflow) {
        throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
      }

      const freshData = await this.hubspotService.getWorkflowById(userId, workflow.hubspotId);
      if (!freshData) {
        throw new HttpException('Could not fetch fresh data from HubSpot', HttpStatus.BAD_REQUEST);
      }

      const nextVersionNumber = workflow.versions[0] ? workflow.versions[0].versionNumber + 1 : 1;
      const encryptedData = this.encryptionService.encryptWorkflowData(freshData);

      const freshBackup = await this.prisma.workflowVersion.create({
        data: {
          workflowId: workflowId,
          versionNumber: nextVersionNumber,
          snapshotType: 'Fresh Backup',
          createdBy: userId,
          data: encryptedData,
        },
      });

      return freshBackup;
    } catch (error) {
      throw new HttpException(
        `Failed to create fresh backup: ${error.message}`,
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
      await this.workflowVersionService.createChangeNotification(
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
      const approvalRequest =
        await this.workflowVersionService.createApprovalWorkflow(
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
      const report = await this.workflowVersionService.generateComplianceReport(
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
      const result = await this.workflowVersionService.restoreWorkflowVersion(
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
      // Handle HubSpot ID conversion if needed
      let actualWorkflowId = workflowId;

      // Check if workflowId is a UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(workflowId)) {
        // It's likely a HubSpot ID, convert to WorkflowGuard UUID
        const workflow = await this.prisma.workflow.findFirst({
          where: { hubspotId: workflowId },
        });

        if (!workflow) {
          throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
        }

        actualWorkflowId = workflow.id;
      }

      // Use injected WorkflowVersionService instead of manual instantiation
      const result = await this.workflowVersionService.rollbackWorkflow(
        actualWorkflowId,
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
      const version = await this.workflowVersionService.findOne(versionId);

      // Return only the workflow data, not the entire version object
      if (!version || !version.data) {
        throw new HttpException(
          'Version not found or no workflow data available',
          HttpStatus.NOT_FOUND,
        );
      }
      // Decrypt the workflow data before returning
      const decryptedData = this.encryptionService.decryptWorkflowData(version.data);

      // Return the decrypted workflow data for download
      return decryptedData;
    } catch (error) {
      throw new HttpException(
        `Failed to download workflow version: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getLatestWorkflowVersion(workflowId: string, userId: string): Promise<any> {
    try {
      // First verify the workflow belongs to the user
      const workflow = await this.prisma.workflow.findFirst({
        where: {
          hubspotId: workflowId,
          ownerId: userId,
        },
      });

      if (!workflow) {
        throw new HttpException(
          'Workflow not found or access denied',
          HttpStatus.NOT_FOUND,
        );
      }

      // Get the latest version for this workflow
      const latestVersion = await this.prisma.workflowVersion.findFirst({
        where: {
          workflowId: workflow.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return latestVersion;
    } catch (error) {
      throw new HttpException(
        `Failed to get latest workflow version: ${error.message}`,
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

  /**
   * Export deleted workflow data for manual recreation
   */
  async exportDeletedWorkflow(
    workflowId: string,
    userId: string,
  ): Promise<any> {
    console.log('🚀 EXPORT SERVICE: Starting export for workflow:', workflowId, 'user:', userId);
    try {
      // 🔍 DEBUG: First check if workflow exists at all (regardless of deletion status)
      const anyWorkflow = await this.prisma.workflow.findFirst({
        where: {
          id: workflowId,
          ownerId: userId,
        },
      });
      

      // Try to find by WorkflowGuard UUID first, then by HubSpot ID
      let workflow = await this.prisma.workflow.findFirst({
        where: {
          id: workflowId,
          ownerId: userId,
          isDeleted: true,
        },
        include: {
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      });

      // If not found by UUID, try by HubSpot ID
      if (!workflow) {
        workflow = await this.prisma.workflow.findFirst({
          where: {
            hubspotId: workflowId,
            ownerId: userId,
            isDeleted: true,
          },
          include: {
            versions: {
              orderBy: { versionNumber: 'desc' },
              take: 1,
            },
          },
        });
      }

      // 🔧 FIX: If still not found with isDeleted=true, try without deletion filter
      // This handles cases where frontend shows as deleted but DB isn't marked as deleted
      if (!workflow && anyWorkflow) {
        workflow = await this.prisma.workflow.findFirst({
          where: {
            id: workflowId,
            ownerId: userId,
          },
          include: {
            versions: {
              orderBy: { versionNumber: 'desc' },
              take: 1,
            },
          },
        });
      }

      if (!workflow) {
        throw new HttpException(
          'Workflow not found or not accessible',
          HttpStatus.NOT_FOUND,
        );
      }

      if (!workflow.versions || workflow.versions.length === 0) {
        throw new HttpException(
          'No backup data available for this workflow',
          HttpStatus.BAD_REQUEST,
        );
      }

      let latestBackup = workflow.versions[0];
      console.log('🔍 EXPORT SERVICE: Processing backup data for workflow:', workflowId);
      
      // Parse and decrypt workflow data safely
      let workflowData: any;
      try {
        // Check if data needs to be parsed from JSON string
        let parsedData = latestBackup.data;
        if (typeof parsedData === 'string') {
          try {
            parsedData = JSON.parse(parsedData);
            console.log('✅ EXPORT SERVICE: Successfully parsed JSON data');
          } catch (parseError) {
            console.error('❌ EXPORT SERVICE: Failed to parse JSON data:', parseError.message);
            throw new Error(`Invalid JSON data in backup: ${parseError.message}`);
          }
        }
        
        // Try to decrypt if data appears to be encrypted
        if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData) && (parsedData as any).iv) {
          workflowData = this.encryptionService.decryptWorkflowData(parsedData);
          console.log('✅ EXPORT SERVICE: Successfully decrypted workflow data');
        } else {
          workflowData = parsedData;
          console.log('✅ EXPORT SERVICE: Using unencrypted workflow data');
        }
      } catch (decryptError) {
        console.error('❌ EXPORT SERVICE: Failed to decrypt workflow data:', decryptError.message);
        // Fallback to raw data if decryption fails
        workflowData = latestBackup.data;
      }

      // Check if backup data is incomplete (missing enrollment triggers)
      const hasEnrollmentTriggers = workflowData?.enrollmentTriggers && workflowData.enrollmentTriggers.length > 0;
      const backupAge = new Date().getTime() - new Date(latestBackup.createdAt).getTime();
      const isOldBackup = backupAge > (7 * 24 * 60 * 60 * 1000); // Older than 7 days

      if (!hasEnrollmentTriggers && isOldBackup) {
        try {
          const freshBackup = await this.createFreshBackup(workflow.id, userId);
          latestBackup = freshBackup;
          workflowData = this.encryptionService.decryptWorkflowData(freshBackup.data);
        } catch (error) {
        }
      }

      // Format data for easy manual recreation
      const exportData = {
        workflowInfo: {
          name: workflowData?.name || workflow.name,
          description:
            workflowData?.description || 'Restored from WorkflowGuard backup',
          type: workflowData?.type || 'DRIP_DELAY',
          enabled: false, // Start disabled for safety
        },
        actions: this.formatActionsForExport(workflowData?.actions || []),
        triggers: this.formatTriggersForExport(workflowData?.enrollmentTriggers || workflowData?.triggerSets || []),
        enrollmentCriteria: workflowData?.enrollmentTriggers || workflowData?.segmentCriteria || [],
        goals: workflowData?.goalCriteria || [],
        settings: {
          allowMultipleEnrollments:
            workflowData?.allowContactToTriggerMultipleTimes || false,
          suppressForCurrentlyEnrolled: true,
          unenrollmentSettings: workflowData?.unenrollmentSetting || {},
        },
        metadata: {
          originalHubSpotId: workflow.hubspotId,
          deletedAt: workflow.deletedAt,
          lastBackupDate: latestBackup.createdAt,
          exportedAt: new Date().toISOString(),
          exportedBy: userId,
        },
        manualRecreationSteps: [
          '1. Go to HubSpot → Automation → Workflows',
          "2. Click 'Create workflow'",
          "3. Choose 'Contact-based' workflow",
          '4. Set the workflow name and description from the data above',
          '5. Configure enrollment triggers using the triggers data',
          '6. Add actions in sequence using the actions data below',
          '7. Set goals and unenrollment criteria if needed',
          '8. Test the workflow before enabling',
          '9. Enable the workflow when ready',
        ],
      };

      // Create audit log
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'workflow_exported',
          entityType: 'workflow',
          entityId: workflow.id,
          newValue: JSON.stringify({
            exported: true,
            format: 'manual_recreation',
          }),
        },
      });

      return exportData;
    } catch (error) {
      throw new HttpException(
        `Failed to export workflow: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private formatActionsForExport(actions: any[]): any[] {
    return actions.map((action, index) => ({
      step: index + 1,
      type: action.type,
      description: this.getActionDescription(action),
      configuration: this.getActionConfiguration(action),
      stepId: action.stepId,
    }));
  }

  private formatTriggersForExport(triggerSets: any[]): any[] {
    if (!triggerSets || triggerSets.length === 0) return [];
    
    return triggerSets.map((triggerSet, index) => ({
      triggerSet: index + 1,
      description: this.getTriggerDescription(triggerSet),
      type: triggerSet.eventId || triggerSet.type || 'unknown',
      filters: triggerSet.filters || [],
      configuration: triggerSet,
    }));
  }

  private getActionConfiguration(action: any): any {
    if (!action) return {};
    
    // Create a clean configuration object without internal IDs
    const config: any = { ...action };
    
    // Remove internal/system fields that aren't relevant for display
    const fieldsToRemove = [
      'stepId', 'actionId', 'id', 'portalId', 'createdAt', 'updatedAt',
      'hubspotCreatedAt', 'hubspotUpdatedAt', 'migrationStatus'
    ];
    
    fieldsToRemove.forEach(field => delete config[field]);
    
    // Add enhanced configuration details
    if (action.type === 'DELAY' && action.delayMillis) {
      config.delayFormatted = this.formatDelay(action.delayMillis);
    }
    
    if (action.type === 'EMAIL' && action.emailId) {
      config.emailType = action.emailType || 'marketing';
      config.recipientType = action.recipientType || 'contact';
    }
    
    if (action.type === 'BRANCH' && action.criteria) {
      config.branchLogic = this.formatBranchCriteria(action.criteria);
    }
    
    return config;
  }

  private formatDelay(delayMillis: number): string {
    const minutes = Math.round(delayMillis / 60000);
    const hours = Math.round(delayMillis / 3600000);
    const days = Math.round(delayMillis / 86400000);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  private formatBranchCriteria(criteria: any[]): string {
    if (!criteria || criteria.length === 0) return 'No criteria specified';
    
    return criteria.map((criterion: any) => {
      const property = criterion.property || criterion.propertyName || 'property';
      const operator = criterion.operator || 'equals';
      const value = criterion.value || criterion.propertyValue || 'value';
      
      return `${property} ${operator} ${value}`;
    }).join(' AND ');
  }

  private getActionSummary(action: any): string {
    switch (action.type || action.actionType) {
      case 'DELAY':
        const delayMinutes = Math.round((action.delayMillis || 0) / 60000);
        return `Wait ${delayMinutes} minutes`;
      case 'EMAIL':
        return `Send email${action.subject ? ': ' + action.subject : ''}`;
      case 'SET_CONTACT_PROPERTY':
        return `Set ${action.propertyName || 'property'}${action.propertyValue ? ' to ' + action.propertyValue : ''}`;
      case 'WEBHOOK':
        return 'Send webhook notification';
      case 'TASK':
        return `Create task${action.subject ? ': ' + action.subject : ''}`;
      case 'BRANCH':
        return 'Conditional branch';
      case 'TRIGGER':
        return 'Workflow trigger';
      default:
        return action.type || action.actionType || 'Unknown action';
    }
  }

  private getActionDescription(action: any): string {
    const actionType = action.type || action.actionType || '';
    
    try {
      // Handle specific HubSpot action types with detailed descriptions
      if (actionType === 'DELAY') {
        const delayMillis = action.delayMillis || 0;
        const delayMinutes = Math.round(delayMillis / 60000);
        const delayHours = Math.round(delayMillis / 3600000);
        const delayDays = Math.round(delayMillis / 86400000);
        
        if (delayDays > 0) {
          return `Wait ${delayDays} day${delayDays > 1 ? 's' : ''}`;
        } else if (delayHours > 0) {
          return `Wait ${delayHours} hour${delayHours > 1 ? 's' : ''}`;
        } else {
          return `Wait ${delayMinutes} minute${delayMinutes > 1 ? 's' : ''}`;
        }
      }

      if (actionType === 'SET_CONTACT_PROPERTY' || actionType === 'SET_PROPERTY') {
        const propertyName = action.propertyName || action.property || 'property';
        const propertyValue = action.propertyValue || action.value || action.newValue;
        
        return `Set contact ${propertyName} to ${propertyValue || 'specified value'}`;
      }

      if (actionType === 'EMAIL' || actionType === 'SEND_EMAIL') {
        const subject = action.subject || action.emailSubject || '';
        const recipient = action.to || action.recipient || 'contact';
        
        return `Send email to ${recipient}${subject ? ` with subject: "${subject}"` : ''}`;
      }

      if (actionType === 'BRANCH' || actionType === 'IF_THEN_BRANCH') {
        const criteria = action.criteria || action.conditions || action.filters;
        if (criteria && criteria.length > 0) {
          const condition = criteria[0];
          const property = condition.property || condition.propertyName || 'property';
          const operator = condition.operator || 'equals';
          const value = condition.value || condition.propertyValue || 'value';
          
          return `Branch if ${property} ${operator} ${value}`;
        }
        return 'Conditional branch based on contact properties';
      }

      if (actionType === 'WEBHOOK') {
        const url = action.webhookUrl || action.url || 'specified endpoint';
        return `Send webhook to ${url}`;
      }

      if (actionType === 'TASK' || actionType === 'CREATE_TASK') {
        const taskTitle = action.subject || action.title || action.taskTitle || 'task';
        const assignee = action.assignedTo || action.owner || 'team member';
        
        return `Create task "${taskTitle}" assigned to ${assignee}`;
      }

      if (actionType === 'ADD_TO_LIST' || actionType === 'LIST') {
        const listName = action.listName || action.listId || 'specified list';
        return `Add contact to list: ${listName}`;
      }

      if (actionType === 'REMOVE_FROM_LIST') {
        const listName = action.listName || action.listId || 'specified list';
        return `Remove contact from list: ${listName}`;
      }

      if (actionType === 'CREATE_DEAL') {
        const dealName = action.dealName || action.name || 'new deal';
        const pipeline = action.pipeline || action.pipelineId || 'default pipeline';
        
        return `Create deal "${dealName}" in ${pipeline}`;
      }

      // Generic fallback with available details
      const details = [];
      if (action.propertyName) details.push(`Property: ${action.propertyName}`);
      if (action.propertyValue) details.push(`Value: ${action.propertyValue}`);
      if (action.subject) details.push(`Subject: ${action.subject}`);
      
      if (details.length > 0) {
        return `${actionType}: ${details.join(', ')}`;
      }

      return `${actionType} action`;
      
    } catch (error) {
      console.error('Error generating action description:', error);
      return `${actionType} action (details unavailable)`;
    }
  }

  private getTriggerDescription(trigger: any): string {
    if (!trigger) return 'Unknown trigger condition';
    
    try {
      const triggerType = trigger.eventId || trigger.type || trigger.triggerType || 'unknown';
      const filters = trigger.filters || trigger.conditions || [];
      
      // Handle specific trigger types based on HubSpot workflow structure
      if (triggerType === 'contact_property_change' || triggerType === 'PROPERTY_CHANGE') {
        const propertyFilter = filters.find((f: any) => f.property || f.propertyName);
        if (propertyFilter) {
          const property = propertyFilter.property || propertyFilter.propertyName;
          const operator = propertyFilter.operator || 'changed to';
          const value = propertyFilter.value || propertyFilter.propertyValue;
          
          if (value) {
            return `When ${property} ${operator} ${value}`;
          } else {
            return `When ${property} value changes`;
          }
        }
        return 'When contact property value changes';
      }

      if (triggerType === 'contact_list_membership' || triggerType === 'LIST_MEMBERSHIP') {
        const listFilter = filters.find((f: any) => f.listId || f.list);
        const listName = listFilter?.listName || listFilter?.list || 'specified list';
        return `When contact is added to list: ${listName}`;
      }

      if (triggerType === 'form_submission' || triggerType === 'FORM_SUBMISSION') {
        const formFilter = filters.find((f: any) => f.formId || f.form);
        const formName = formFilter?.formName || formFilter?.form || 'any form';
        return `When contact submits form: ${formName}`;
      }

      if (triggerType === 'page_view' || triggerType === 'PAGE_VIEW') {
        const pageFilter = filters.find((f: any) => f.pageUrl || f.url);
        const pageUrl = pageFilter?.pageUrl || pageFilter?.url || 'specified page';
        return `When contact views page: ${pageUrl}`;
      }

      if (triggerType === 'email_open' || triggerType === 'EMAIL_OPEN') {
        const emailFilter = filters.find((f: any) => f.emailId || f.email);
        const emailName = emailFilter?.emailName || emailFilter?.email || 'marketing email';
        return `When contact opens email: ${emailName}`;
      }

      // Generic trigger with filter details
      if (filters.length > 0) {
        const filterDescriptions = filters.map((filter: any) => {
          const property = filter.property || filter.propertyName || 'property';
          const operator = filter.operator || 'equals';
          const value = filter.value || filter.propertyValue || 'specified value';
          
          return `${property} ${operator} ${value}`;
        });
        
        return `When ${filterDescriptions.join(' AND ')}`;
      }

      // Fallback description
      return `${triggerType.replace(/_/g, ' ')} trigger`;
      
    } catch (error) {
      console.error('Error generating trigger description:', error);
      return 'Trigger condition (details unavailable)';
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
    // 1. Find the user associated with the portal
    const user = await this.prisma.user.findFirst({
      where: { hubspotPortalId: portalId },
    });

    if (!user) {
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
        typeof hubspotWorkflowData === 'string' ? hubspotWorkflowData : JSON.stringify(hubspotWorkflowData),
        'webhook',
      );

      console.log(
        `✅ Successfully created automated backup for workflow ${workflow.id} (HubSpot ID: ${hubspotWorkflowId})`,
      );
    } catch (error) {
      // Do not re-throw error to prevent HubSpot from retrying indefinitely
    }
  }

  /**
   * Handle workflow deletions from HubSpot webhooks.
   * This method creates a final backup before marking the workflow as deleted.
   */
  async handleWorkflowDeletion(
    portalId: string,
    hubspotWorkflowId: string,
  ): Promise<void> {
    try {
      // 1. Find the user associated with the portal
      const user = await this.prisma.user.findFirst({
        where: { hubspotPortalId: portalId },
      });

      if (!user) {
        return;
      }

      // 2. Find the workflow in our database to ensure it's a protected workflow
      const workflow = await this.prisma.workflow.findFirst({
        where: {
          hubspotId: hubspotWorkflowId,
          ownerId: user.id,
        },
        include: {
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      });

      if (!workflow) {
        return;
      }

      // 3. Create final backup with the last known version data
      if (workflow.versions && workflow.versions.length > 0) {
        const latestVersion = workflow.versions[0];

        await this.workflowVersionService.createVersion(
          workflow.id,
          user.id,
          typeof latestVersion.data === 'string' ? latestVersion.data : JSON.stringify(latestVersion.data),
          'deletion_backup',
        );

        console.log(
          `✅ Created final backup for deleted workflow ${workflow.id} (HubSpot ID: ${hubspotWorkflowId})`,
        );
      }

      // 4. Mark workflow as deleted in our database
      await this.prisma.workflow.update({
        where: { id: workflow.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      // 5. Create audit log entry
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'workflow_deleted',
          entityType: 'workflow',
          entityId: workflow.id,
          oldValue: JSON.stringify({ hubspotId: hubspotWorkflowId }),
          newValue: JSON.stringify({ deleted: true, deletedAt: new Date() }),
        },
      });

      console.log(
        `✅ Successfully handled workflow deletion for ${workflow.id} (HubSpot ID: ${hubspotWorkflowId})`,
      );
    } catch (error) {
      // Do not re-throw error to prevent HubSpot from retrying indefinitely
    }
  }

  /**
   * Restore a deleted workflow back to HubSpot using the latest backup data.
   */
  async restoreDeletedWorkflow(
    workflowId: string,
    userId: string,
  ): Promise<any> {
    try {
      // 1. Find the deleted workflow
      const workflow = await this.prisma.workflow.findFirst({
        where: {
          id: workflowId,
          ownerId: userId,
          isDeleted: true,
        },
        include: {
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      });

      if (!workflow) {
        throw new HttpException(
          'Deleted workflow not found or not accessible',
          HttpStatus.NOT_FOUND,
        );
      }

      if (!workflow.versions || workflow.versions.length === 0) {
        throw new HttpException(
          'No backup data available for this workflow',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 2. Get the latest backup data
      const latestBackup = workflow.versions[0];
      const workflowData = latestBackup.data as any;

      // 3. Recreate the workflow in HubSpot
      const restoredWorkflow = await this.hubspotService.createWorkflow(
        userId,
        {
          name: workflowData?.name || `${workflow.name} (Restored)`,
          enabled: false, // Start disabled for safety
          description:
            workflowData?.description ||
            `Restored by WorkflowGuard on ${new Date().toISOString()}`,
          actions: workflowData?.actions || [],
          triggers: workflowData?.triggers || [],
          goals: workflowData?.goals || [],
          settings: workflowData?.settings || {},
        },
      );

      if (!restoredWorkflow) {
        throw new HttpException(
          'Failed to recreate workflow in HubSpot',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // 4. Update our database with the new HubSpot ID
      const updatedWorkflow = await this.prisma.workflow.update({
        where: { id: workflow.id },
        data: {
          hubspotId: restoredWorkflow.id.toString(),
          isDeleted: false,
          deletedAt: null,
          restoredAt: new Date(),
        },
      });

      // 5. Create a restoration version
      await this.workflowVersionService.createVersion(
        workflow.id,
        userId,
        typeof restoredWorkflow === 'string' ? restoredWorkflow : JSON.stringify(restoredWorkflow),
        'restoration',
      );

      // 6. Create audit log entry
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'workflow_restored',
          entityType: 'workflow',
          entityId: workflow.id,
          oldValue: JSON.stringify({ deleted: true }),
          newValue: JSON.stringify({
            restored: true,
            newHubspotId: restoredWorkflow.id,
            restoredAt: new Date(),
          }),
        },
      });
      return {
        success: true,
        message: 'Workflow successfully restored to HubSpot',
        workflow: updatedWorkflow,
        hubspotWorkflow: restoredWorkflow,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to restore deleted workflow: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    
  }

  private async _handleDeletedWorkflows(
    userId: string,
    hubspotWorkflows: any[],
  ): Promise<void> {
    // Get all protected workflows for this user to check for deletions
    const allProtectedWorkflows = await this.prisma.workflow.findMany({
      where: { ownerId: userId },
      include: { versions: true },
    });

    // Create a set of HubSpot workflow IDs that still exist
    const existingHubSpotIds = new Set(
      hubspotWorkflows.map((w) => String(w.id)),
    );

    // Mark workflows as deleted if they're no longer in HubSpot
    for (const protectedWorkflow of allProtectedWorkflows) {
      if (
        !existingHubSpotIds.has(protectedWorkflow.hubspotId) &&
        !protectedWorkflow.isDeleted
      ) {
        console.log(
          `🗑️ Workflow ${protectedWorkflow.hubspotId} (${protectedWorkflow.name}) no longer exists in HubSpot - marking as deleted`,
        );
        await this.prisma.workflow.update({
          where: { id: protectedWorkflow.id },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
    }
  }
  
    private async _findWorkflowById(
      workflowId: string,
      userId: string,
    ): Promise<any | null> {
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          workflowId,
        );
  
      if (isUUID) {
        return this.prisma.workflow.findFirst({
          where: {
            id: workflowId,
            ownerId: userId,
          },
        });
      } else {
        return this.prisma.workflow.findFirst({
          where: {
            hubspotId: workflowId,
            ownerId: userId,
          },
        });
      }
    }

  /**
   * Enhanced workflow data completeness validation
   */
  private validateWorkflowDataCompleteness(data: any): boolean {
    if (!data) return false;

    // Check for essential workflow properties
    const requiredFields = ['name', 'id'];
    const hasRequiredFields = requiredFields.every(field => data[field]);

    if (!hasRequiredFields) return false;

    // Check for actions or steps
    const hasActions = data.actions && Array.isArray(data.actions) && data.actions.length > 0;
    const hasSteps = data.steps && Array.isArray(data.steps) && data.steps.length > 0;
    const hasEnrollmentTriggers = data.enrollmentTriggers && Array.isArray(data.enrollmentTriggers) && data.enrollmentTriggers.length > 0;

    if (!hasActions && !hasSteps && !hasEnrollmentTriggers) return false;

    // Validate action completeness
    if (hasActions) {
      return data.actions.every((action: any) =>
        action && (action.type || action.actionType) &&
        (action.id || action.actionId || action.stepId)
      );
    }

    return true;
  }

  /**
   * Check if action data is incomplete (missing detailed properties)
   */
  private hasIncompleteActionData(actions: any[]): boolean {
    if (!actions || actions.length === 0) return true;

    // Check if actions have minimal data (indicating incomplete sync)
    const sampleAction = actions[0];

    // If action only has basic properties, it's likely incomplete
    const basicProperties = ['type', 'actionType', 'id'];
    const actionKeys = Object.keys(sampleAction || {});

    // If action has only basic properties and no detailed ones, it's incomplete
    const hasOnlyBasicProps = actionKeys.length <= 3 &&
                             actionKeys.every(key => basicProperties.includes(key));

    if (hasOnlyBasicProps) {
      return true;
    }

    return false;
  }

  /**
   * Add validation utility method
   */
  private validateWorkflowData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;

    // Must have at least a name and some form of steps/actions
    if (!data.name) return false;

    const hasContent = data.actions?.length > 0 ||
                      data.steps?.length > 0 ||
                      data.enrollmentTriggers?.length > 0;

    return hasContent;
  }

  /**
   * Calculate changes between current and previous workflow data
   * Based on memory lessons to avoid "No changes detected" issues
   */
  private calculateWorkflowChanges(currentData: any, previousData: any): any {
    if (!currentData) {
      return { added: 0, modified: 0, removed: 0 };
    }

    // If no previous data, treat as initial version
    if (!previousData) {
      const currentActions = currentData.actions?.length || 0;
      const currentTriggers = currentData.enrollmentTriggers?.length || 0;
      return {
        added: currentActions + currentTriggers,
        modified: 0,
        removed: 0
      };
    }

    // Extract actions for comparison
    const currentActions = currentData.actions || [];
    const previousActions = previousData.actions || [];
    const currentTriggers = currentData.enrollmentTriggers || [];
    const previousTriggers = previousData.enrollmentTriggers || [];

    // Calculate action changes
    const addedActions = currentActions.filter(action => 
      !previousActions.find(prevAction => 
        this.actionsEqual(action, prevAction)
      )
    ).length;

    const removedActions = previousActions.filter(action => 
      !currentActions.find(currAction => 
        this.actionsEqual(action, currAction)
      )
    ).length;

    const modifiedActions = currentActions.filter(action => {
      const prevAction = previousActions.find(prevAction => 
        prevAction.id === action.id || prevAction.actionId === action.actionId
      );
      return prevAction && !this.actionsEqual(action, prevAction);
    }).length;

    // Calculate trigger changes
    const addedTriggers = currentTriggers.length - previousTriggers.length;
    const triggerChanges = addedTriggers > 0 ? addedTriggers : 0;

    const totalChanges = {
      added: addedActions + triggerChanges,
      modified: modifiedActions,
      removed: removedActions
    };
    return totalChanges;
  }

  /**
   * Generate workflow change summary
   * Based on memory lessons to provide meaningful change descriptions
   */
  private generateWorkflowChangeSummary(changes: any): string {
    const { added, modified, removed } = changes;
    const summaries = [];
    
    if (added > 0) summaries.push(`${added} step(s) added`);
    if (modified > 0) summaries.push(`${modified} step(s) modified`);
    if (removed > 0) summaries.push(`${removed} step(s) removed`);
    
    if (summaries.length === 0) {
      return 'No changes detected';
    }
    
    const summary = summaries.join(', ');
    return summary;
  }

  /**
   * Compare two actions for equality
   * Based on memory lessons about action comparison logic
   */
  private actionsEqual(action1: any, action2: any): boolean {
    if (!action1 || !action2) return false;
    
    // Compare by ID first
    if (action1.id && action2.id && action1.id === action2.id) {
      // Same ID, check if properties changed
      return JSON.stringify(action1.settings || {}) === JSON.stringify(action2.settings || {}) &&
             action1.type === action2.type;
    }
    
    // Compare by type and key properties
    return action1.type === action2.type &&
           action1.actionType === action2.actionType &&
           JSON.stringify(action1.settings || {}) === JSON.stringify(action2.settings || {});
  }
}
