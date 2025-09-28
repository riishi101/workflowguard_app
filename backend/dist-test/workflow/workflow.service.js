"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowService = void 0;
const common_1 = require("@nestjs/common");
let WorkflowService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var WorkflowService = _classThis = class {
        constructor(prisma, hubspotService, subscriptionService, workflowVersionService) {
            this.prisma = prisma;
            this.hubspotService = hubspotService;
            this.subscriptionService = subscriptionService;
            this.workflowVersionService = workflowVersionService;
        }
        async create(createWorkflowDto) {
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
        async getHubSpotWorkflows(userId) {
            try {
                console.log('🔍 WorkflowService - getHubSpotWorkflows called for userId:', userId);
                const workflows = await this.hubspotService.getWorkflows(userId);
                console.log('🔍 WorkflowService - Retrieved workflows from HubSpot:', workflows.length);
                return workflows;
            }
            catch (error) {
                console.error('🔍 WorkflowService - Error getting HubSpot workflows:', error);
                throw new common_1.HttpException(`Failed to get HubSpot workflows: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async compareWorkflowVersions(workflowId, versionA, versionB) {
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
                        throw new common_1.HttpException(`Workflow not found for HubSpot ID: ${workflowId}`, common_1.HttpStatus.NOT_FOUND);
                    }
                    actualWorkflowId = workflow.id;
                }
                // Check if versionA and versionB are UUIDs or version numbers
                const isVersionAUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(versionA);
                const isVersionBUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(versionB);
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
                    throw new common_1.HttpException('One or both versions not found', common_1.HttpStatus.NOT_FOUND);
                }
                // Simple comparison logic - compare the workflow data
                const dataA = versionAData.data;
                const dataB = versionBData.data;
                const differences = this.findWorkflowDifferences(dataA, dataB);
                // Transform version data for frontend display
                const transformedVersionA = {
                    ...versionAData,
                    steps: this.transformWorkflowDataToSteps(versionAData.data),
                };
                const transformedVersionB = {
                    ...versionBData,
                    steps: this.transformWorkflowDataToSteps(versionBData.data),
                };
                return {
                    versionA: transformedVersionA,
                    versionB: transformedVersionB,
                    differences: {
                        added: differences.filter((d) => d.type === 'added'),
                        modified: differences.filter((d) => d.type === 'changed'),
                        removed: differences.filter((d) => d.type === 'removed'),
                    },
                };
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to compare workflow versions: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        findWorkflowDifferences(dataA, dataB) {
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
                    dataA.actions.forEach((action) => {
                        const key = action.id || action.actionId || JSON.stringify(action);
                        actionsMapA.set(key, action);
                    });
                    dataB.actions.forEach((action) => {
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
                            const actionDifferences = this.compareActionProperties(actionA, actionB);
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
                    if (JSON.stringify(dataA.enrollmentTriggers) !==
                        JSON.stringify(dataB.enrollmentTriggers)) {
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
            }
            catch (error) {
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
        compareActionProperties(actionA, actionB) {
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
        transformWorkflowDataToSteps(workflowData) {
            const steps = [];
            try {
                // If workflow has actions, transform them to steps with full details
                if (workflowData?.actions && Array.isArray(workflowData.actions)) {
                    workflowData.actions.forEach((action, index) => {
                        steps.push({
                            id: action.id || action.actionId || `action-${index}`,
                            title: action.type || action.actionType || `Action ${index + 1}`,
                            type: this.getStepType(action),
                            description: action.description || action.subject || '',
                            isNew: false,
                            isModified: false,
                            isRemoved: false,
                            // Add full action details for detailed display
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
                                // Include any other relevant action properties
                                ...action,
                            },
                        });
                    });
                }
                // If workflow has enrollment triggers, include them
                if (workflowData?.enrollmentTriggers &&
                    Array.isArray(workflowData.enrollmentTriggers)) {
                    workflowData.enrollmentTriggers.forEach((trigger, index) => {
                        steps.push({
                            id: trigger.id || `trigger-${index}`,
                            title: 'Enrollment Trigger',
                            type: 'trigger',
                            description: 'Workflow enrollment conditions',
                            isNew: false,
                            isModified: false,
                            isRemoved: false,
                            details: {
                                type: 'enrollmentTrigger',
                                filters: trigger.filters,
                                settings: trigger.settings,
                                ...trigger,
                            },
                        });
                    });
                }
                // If workflow has goals, include them
                if (workflowData?.goals && Array.isArray(workflowData.goals)) {
                    workflowData.goals.forEach((goal, index) => {
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
                                ...goal,
                            },
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
                        isRemoved: false,
                        details: {
                            type: 'enrollmentTrigger',
                            triggers: workflowData.enrollmentTriggers,
                        },
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
                        isRemoved: false,
                        details: {
                            type: 'workflow',
                            name: workflowData?.name,
                            enabled: workflowData?.enabled,
                            description: workflowData?.description,
                        },
                    });
                }
            }
            catch (error) {
                console.error('Error transforming workflow data to steps:', error);
                // Return a fallback step with error details
                steps.push({
                    id: 'fallback-step',
                    title: 'Workflow Step',
                    type: 'email',
                    description: 'Unable to parse workflow details',
                    isNew: false,
                    isModified: false,
                    isRemoved: false,
                    details: {
                        type: 'error',
                        errorMessage: error.message,
                    },
                });
            }
            return steps;
        }
        getStepType(action) {
            const actionType = action.type || action.actionType || '';
            if (actionType.toLowerCase().includes('email'))
                return 'email';
            if (actionType.toLowerCase().includes('delay'))
                return 'delay';
            if (actionType.toLowerCase().includes('meeting'))
                return 'meeting';
            if (actionType.toLowerCase().includes('condition'))
                return 'condition';
            return 'email'; // default
        }
        async getWorkflowVersions(workflowId, userId) {
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
                    throw new common_1.HttpException('Workflow not found', common_1.HttpStatus.NOT_FOUND);
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
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to get workflow versions: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async createInitialVersionIfMissing(workflowId, userId) {
            try {
                // First, find the workflow by internal ID or HubSpot ID
                const workflow = await this.prisma.workflow.findFirst({
                    where: {
                        OR: [
                            { id: workflowId, ownerId: userId },
                            { hubspotId: workflowId, ownerId: userId },
                        ],
                    },
                });
                if (!workflow) {
                    throw new common_1.HttpException('Workflow not found', common_1.HttpStatus.NOT_FOUND);
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
                }
                catch (hubspotError) {
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
                        data: initialVersionData,
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
            }
            catch (error) {
                console.error('Failed to create initial version:', error);
                throw new common_1.HttpException(`Failed to create initial version: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async findOne(id, userId) {
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
                    throw new common_1.HttpException('Workflow not found', common_1.HttpStatus.NOT_FOUND);
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
            }
            catch (error) {
                if (error instanceof common_1.HttpException) {
                    throw error;
                }
                throw new common_1.HttpException(`Failed to find workflow: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async findByHubspotId(hubspotId, userId) {
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
            }
            catch (error) {
                console.error(`Error syncing workflow ${hubspotId}:`, error);
                throw new common_1.HttpException('Failed to sync workflow', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async update(id, updateWorkflowDto) {
            return this.prisma.workflow.update({
                where: { id },
                data: updateWorkflowDto,
            });
        }
        async remove(id) {
            return this.prisma.workflow.delete({
                where: { id },
            });
        }
        async startWorkflowProtection(workflowIds, userId, selectedWorkflowObjects) {
            if (!userId) {
                throw new common_1.HttpException('User ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            // Validate user exists
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            // Check workflow limits before proceeding
            await this.checkWorkflowLimits(userId, workflowIds.length);
            const protectedWorkflows = [];
            const errors = [];
            // Fetch HubSpot workflows OUTSIDE the transaction to avoid conflicts
            let hubspotWorkflows = [];
            try {
                hubspotWorkflows = await this.hubspotService.getWorkflows(userId);
            }
            catch (hubspotError) {
                console.warn('Could not fetch HubSpot workflows, proceeding with minimal data:', hubspotError.message);
            }
            // Use transaction to ensure data consistency
            await this.prisma.$transaction(async (tx) => {
                for (const workflowId of workflowIds) {
                    try {
                        // Find the workflow object from selectedWorkflowObjects
                        const workflowObj = selectedWorkflowObjects?.find((w) => w.id === workflowId);
                        const hubspotId = String(workflowObj?.hubspotId || workflowId);
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
                            // Use pre-fetched HubSpot data (outside transaction)
                            const workflowData = hubspotWorkflows.find((w) => String(w.id) === hubspotId);
                            // Create initial version with available data
                            const initialVersionData = workflowData || {
                                hubspotId,
                                name: workflow.name,
                                status: (workflowData?.status ||
                                    workflowObj?.status ||
                                    'ACTIVE').toLowerCase(),
                                type: 'unknown',
                                enabled: (workflowData?.status || workflowObj?.status || 'ACTIVE') ===
                                    'ACTIVE',
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
                                    data: initialVersionData,
                                },
                            });
                            // Create audit log
                            await tx.auditLog.create({
                                data: {
                                    userId,
                                    action: 'workflow_protection_started',
                                    entityType: 'workflow',
                                    entityId: workflow.id,
                                    oldValue: null,
                                    newValue: JSON.stringify({
                                        versionId: initialVersion.id,
                                        versionNumber: 1,
                                        protectionType: 'initial',
                                    }),
                                },
                            });
                            // Add version to workflow object (for TypeScript compatibility)
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
                    }
                    catch (err) {
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
                throw new common_1.HttpException({
                    message: 'Some workflows could not be protected',
                    errors,
                    successCount: protectedWorkflows.length,
                    totalCount: workflowIds.length,
                }, common_1.HttpStatus.PARTIAL_CONTENT);
            }
            return protectedWorkflows;
        }
        /**
         * Check if user can protect additional workflows based on their subscription plan
         */
        async checkWorkflowLimits(userId, requestedCount) {
            try {
                // Get current protected workflows count
                const currentWorkflows = await this.getProtectedWorkflows(userId);
                const currentCount = currentWorkflows.length;
                // Get user subscription and limits
                const subscription = await this.subscriptionService.getUserSubscription(userId);
                const workflowLimit = subscription.limits.workflows;
                // Check if adding requested workflows would exceed limit
                const totalAfterAddition = currentCount + requestedCount;
                if (totalAfterAddition > workflowLimit) {
                    throw new common_1.HttpException({
                        message: `Workflow limit exceeded. Your ${subscription.planName} allows ${workflowLimit} workflows. You currently have ${currentCount} protected workflows and are trying to add ${requestedCount} more.`,
                        currentCount,
                        requestedCount,
                        limit: workflowLimit,
                        planName: subscription.planName,
                        upgradeRequired: true,
                    }, common_1.HttpStatus.FORBIDDEN);
                }
            }
            catch (error) {
                if (error instanceof common_1.HttpException) {
                    throw error;
                }
                console.error('Error checking workflow limits:', error);
                throw new common_1.HttpException('Failed to verify workflow limits', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async getProtectedWorkflows(userId) {
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
                            select: { versions: true },
                        },
                    },
                    orderBy: { updatedAt: 'desc' },
                });
                // Transform database records to match Dashboard expectations
                return workflows.map((workflow) => {
                    const versionCount = workflow._count.versions;
                    const latestVersion = workflow.versions[0];
                    return {
                        id: workflow.hubspotId || workflow.id,
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
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                : 'U',
                            email: workflow.owner?.email || 'unknown@example.com',
                        },
                    };
                });
            }
            catch (error) {
                console.error('Error fetching protected workflows:', error);
                return [];
            }
        }
        async getProtectedWorkflowIds(userId) {
            const workflows = await this.getProtectedWorkflows(userId);
            return workflows.map((workflow) => workflow.id);
        }
        normalizeWorkflowData(data) {
            if (!data)
                return {};
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
            ];
            const removeFields = (obj) => {
                if (typeof obj === 'object' && obj !== null) {
                    if (Array.isArray(obj)) {
                        obj.forEach(removeFields);
                    }
                    else {
                        fieldsToRemove.forEach((field) => delete obj[field]);
                        Object.values(obj).forEach(removeFields);
                    }
                }
            };
            removeFields(normalized);
            // Sort object keys for consistent comparison
            const sortKeys = (obj) => {
                if (typeof obj !== 'object' || obj === null)
                    return obj;
                if (Array.isArray(obj))
                    return obj.map(sortKeys);
                const sorted = {};
                Object.keys(obj)
                    .sort()
                    .forEach((key) => {
                    sorted[key] = sortKeys(obj[key]);
                });
                return sorted;
            };
            return sortKeys(normalized);
        }
        compareWorkflowStructure(current, previous) {
            // Focus on core workflow elements that matter for functionality
            // These are the fields that represent actual workflow logic changes
            const coreFields = [
                'name',
                'type',
                'enabled',
                'actions',
                'triggers',
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
            const extractCoreData = (data) => {
                if (!data)
                    return {};
                const core = {};
                coreFields.forEach((field) => {
                    if (data.hasOwnProperty(field)) {
                        core[field] = data[field];
                    }
                });
                return core;
            };
            const currentCore = this.normalizeWorkflowData(extractCoreData(current));
            const previousCore = this.normalizeWorkflowData(extractCoreData(previous));
            const currentString = JSON.stringify(currentCore);
            const previousString = JSON.stringify(previousCore);
            const hasChanges = currentString !== previousString;
            console.log(`🔍 Structure comparison for workflow:`, {
                hasChanges,
                currentLength: currentString.length,
                previousLength: previousString.length,
                currentKeys: Object.keys(currentCore),
                previousKeys: Object.keys(previousCore),
            });
            return hasChanges;
        }
        async syncHubSpotWorkflows(userId) {
            try {
                console.log(`🔄 SYNC STARTED for user: ${userId}`);
                const { HubSpotService } = await Promise.resolve().then(() => __importStar(require('../services/hubspot.service')));
                const hubspotService = new HubSpotService(this.prisma);
                console.log(`📡 Fetching HubSpot workflows for user: ${userId}`);
                const hubspotWorkflows = await hubspotService.getWorkflows(userId);
                console.log(`📊 Found ${hubspotWorkflows.length} HubSpot workflows`);
                const syncedWorkflows = [];
                console.log(`🔄 Starting sync loop for ${hubspotWorkflows.length} workflows`);
                // Get all protected workflows for this user to check for deletions
                const allProtectedWorkflows = await this.prisma.workflow.findMany({
                    where: { ownerId: userId },
                    include: { versions: true },
                });
                // Create a set of HubSpot workflow IDs that still exist
                const existingHubSpotIds = new Set(hubspotWorkflows.map((w) => String(w.id)));
                // Mark workflows as deleted if they're no longer in HubSpot
                for (const protectedWorkflow of allProtectedWorkflows) {
                    if (!existingHubSpotIds.has(protectedWorkflow.hubspotId) &&
                        !protectedWorkflow.isDeleted) {
                        console.log(`🗑️ Workflow ${protectedWorkflow.hubspotId} (${protectedWorkflow.name}) no longer exists in HubSpot - marking as deleted`);
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
                        const currentWorkflowData = await hubspotService.getWorkflowById(userId, String(hubspotWorkflow.id));
                        let shouldCreateVersion = false;
                        console.log(`Workflow ${hubspotWorkflow.id} - Latest version exists:`, !!latestVersion);
                        console.log(`Workflow ${hubspotWorkflow.id} - Current data exists:`, !!currentWorkflowData);
                        if (latestVersion && currentWorkflowData) {
                            // Compare current HubSpot data with latest version using structure-based comparison
                            console.log(`Comparing workflow structure for ${hubspotWorkflow.id}...`);
                            // Use the new structure-based comparison that focuses on functional changes
                            shouldCreateVersion = this.compareWorkflowStructure(currentWorkflowData, latestVersion.data);
                            // Fallback to full data comparison if structure comparison indicates no changes
                            // but we want to be extra sure for debugging
                            if (!shouldCreateVersion) {
                                const normalizedCurrentData = this.normalizeWorkflowData(currentWorkflowData);
                                const normalizedLatestData = this.normalizeWorkflowData(latestVersion.data);
                                const currentDataString = JSON.stringify(normalizedCurrentData);
                                const latestDataString = JSON.stringify(normalizedLatestData);
                                const fullDataChanged = currentDataString !== latestDataString;
                                console.log(`🔍 Full data comparison for workflow ${hubspotWorkflow.id}:`, {
                                    structureChanged: shouldCreateVersion,
                                    fullDataChanged,
                                    currentLength: currentDataString.length,
                                    latestLength: latestDataString.length,
                                });
                                if (fullDataChanged) {
                                    console.log(`⚠️ Workflow ${hubspotWorkflow.id}: Structure unchanged but metadata differs - will CREATE version`);
                                    console.log(`Current data length: ${currentDataString.length}, Latest data length: ${latestDataString.length}`);
                                    // Set shouldCreateVersion to true since there are differences
                                    shouldCreateVersion = true;
                                }
                            }
                            console.log(`Workflow ${hubspotWorkflow.id} comparison result:`, {
                                hasChanges: shouldCreateVersion,
                                latestVersionNumber: latestVersion.versionNumber,
                                latestVersionCreated: latestVersion.createdAt,
                                comparisonMethod: 'structure-based',
                            });
                            if (shouldCreateVersion) {
                                console.log(`CHANGES DETECTED for workflow ${hubspotWorkflow.id} - will create new version`);
                            }
                            else {
                                console.log(`NO CHANGES detected for workflow ${hubspotWorkflow.id} - skipping version creation`);
                            }
                        }
                        else if (!latestVersion && currentWorkflowData) {
                            // No versions exist, create initial version
                            shouldCreateVersion = true;
                            console.log(`Creating initial version for workflow ${hubspotWorkflow.id} (no existing versions)`);
                        }
                        else if (!currentWorkflowData) {
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
                            const nextVersionNumber = latestVersion
                                ? latestVersion.versionNumber + 1
                                : 1;
                            await this.prisma.workflowVersion.create({
                                data: {
                                    workflowId: existingWorkflow.id,
                                    versionNumber: nextVersionNumber,
                                    data: currentWorkflowData,
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
                        }
                        else {
                            syncedWorkflows.push(updatedWorkflow);
                        }
                    }
                    else {
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
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to sync HubSpot workflows: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async createAutomatedBackup(workflowId, userId) {
            try {
                const { WorkflowVersionService } = await Promise.resolve().then(() => __importStar(require('../workflow-version/workflow-version.service')));
                const workflowVersionService = new WorkflowVersionService(this.prisma);
                const backup = await workflowVersionService.createAutomatedBackup(workflowId, userId);
                return backup;
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to create automated backup: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async createChangeNotification(workflowId, userId, changes) {
            try {
                const { WorkflowVersionService } = await Promise.resolve().then(() => __importStar(require('../workflow-version/workflow-version.service')));
                const workflowVersionService = new WorkflowVersionService(this.prisma);
                await workflowVersionService.createChangeNotification(workflowId, userId, changes);
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to create change notification: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async createApprovalRequest(workflowId, userId, requestedChanges) {
            try {
                const { WorkflowVersionService } = await Promise.resolve().then(() => __importStar(require('../workflow-version/workflow-version.service')));
                const workflowVersionService = new WorkflowVersionService(this.prisma);
                const approvalRequest = await workflowVersionService.createApprovalWorkflow(workflowId, userId, requestedChanges);
                return approvalRequest;
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to create approval request: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async generateComplianceReport(workflowId, startDate, endDate) {
            try {
                const { WorkflowVersionService } = await Promise.resolve().then(() => __importStar(require('../workflow-version/workflow-version.service')));
                const workflowVersionService = new WorkflowVersionService(this.prisma);
                const report = await workflowVersionService.generateComplianceReport(workflowId, startDate, endDate);
                return report;
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to generate compliance report: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async restoreWorkflowVersion(workflowId, versionId, userId) {
            try {
                const { WorkflowVersionService } = await Promise.resolve().then(() => __importStar(require('../workflow-version/workflow-version.service')));
                const workflowVersionService = new WorkflowVersionService(this.prisma);
                const result = await workflowVersionService.restoreWorkflowVersion(workflowId, versionId, userId);
                return result;
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to restore workflow version: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async rollbackWorkflow(workflowId, userId) {
            try {
                // Handle HubSpot ID conversion if needed
                let actualWorkflowId = workflowId;
                // Check if workflowId is a UUID format
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(workflowId)) {
                    // It's likely a HubSpot ID, convert to WorkflowGuard UUID
                    const workflow = await this.prisma.workflow.findFirst({
                        where: { hubspotId: workflowId },
                    });
                    if (!workflow) {
                        throw new common_1.HttpException('Workflow not found', common_1.HttpStatus.NOT_FOUND);
                    }
                    actualWorkflowId = workflow.id;
                }
                // Use injected WorkflowVersionService instead of manual instantiation
                const result = await this.workflowVersionService.rollbackWorkflow(actualWorkflowId, userId);
                return result;
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to rollback workflow: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async downloadWorkflowVersion(workflowId, versionId) {
            try {
                const { WorkflowVersionService } = await Promise.resolve().then(() => __importStar(require('../workflow-version/workflow-version.service')));
                const workflowVersionService = new WorkflowVersionService(this.prisma);
                const version = await workflowVersionService.findOne(versionId);
                return version;
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to download workflow version: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async getWorkflowStats(userId) {
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
                const stats = workflows.map((workflow) => {
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
                        lastSnapshot: latestVersion?.createdAt.toISOString() ||
                            workflow.createdAt.toISOString(),
                        versions: versions.length,
                        lastModifiedBy: latestVersion?.createdBy || '',
                        status: 'active',
                        protectionStatus: 'protected',
                        lastModified: latestVersion?.createdAt.toISOString() ||
                            workflow.updatedAt.toISOString(),
                        steps: totalSteps,
                        contacts: totalContacts,
                    };
                });
                return stats;
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to get workflow stats: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async getDashboardStats(userId) {
            try {
                // Get user with subscription for plan limits
                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                    include: { subscription: true },
                });
                if (!user) {
                    throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
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
                const activeWorkflows = protectedWorkflows.filter((w) => w.versions.length > 0).length;
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
                const planCapacity = user.subscription?.planId === 'professional'
                    ? 25
                    : user.subscription?.planId === 'enterprise'
                        ? 999999
                        : 5;
                const planUsed = totalWorkflows;
                // Uptime calculation should be implemented if available, else omit or set to null
                const uptime = null;
                // Get last snapshot time
                const lastSnapshot = protectedWorkflows.length > 0
                    ? Math.max(...protectedWorkflows.map((w) => w.versions.length > 0
                        ? new Date(w.versions[0].createdAt).getTime()
                        : 0))
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
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to get dashboard stats: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async exportWorkflow(workflowId) {
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
                    throw new common_1.HttpException('Workflow not found', common_1.HttpStatus.NOT_FOUND);
                }
                // Transform data for export
                const exportData = {
                    id: workflow.id,
                    name: workflow.name,
                    hubspotId: workflow.hubspotId,
                    owner: workflow.owner,
                    versions: workflow.versions.map((version) => ({
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
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to export workflow: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async exportAllWorkflows(userId) {
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
                    workflows: workflows.map((workflow) => ({
                        id: workflow.id,
                        name: workflow.name,
                        hubspotId: workflow.hubspotId,
                        owner: workflow.owner,
                        versions: workflow.versions.map((version) => ({
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
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to export workflows: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        /**
         * Export deleted workflow data for manual recreation
         */
        async exportDeletedWorkflow(workflowId, userId) {
            try {
                console.log(`📤 Exporting deleted workflow ${workflowId} for user ${userId}`);
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
                if (!workflow) {
                    throw new common_1.HttpException('Deleted workflow not found or not accessible', common_1.HttpStatus.NOT_FOUND);
                }
                if (!workflow.versions || workflow.versions.length === 0) {
                    throw new common_1.HttpException('No backup data available for this workflow', common_1.HttpStatus.BAD_REQUEST);
                }
                const latestBackup = workflow.versions[0];
                const workflowData = latestBackup.data;
                // Format data for easy manual recreation
                const exportData = {
                    workflowInfo: {
                        name: workflowData?.name || workflow.name,
                        description: workflowData?.description || 'Restored from WorkflowGuard backup',
                        type: workflowData?.type || 'DRIP_DELAY',
                        enabled: false, // Start disabled for safety
                    },
                    actions: this.formatActionsForExport(workflowData?.actions || []),
                    triggers: this.formatTriggersForExport(workflowData?.triggerSets || []),
                    enrollmentCriteria: workflowData?.segmentCriteria || [],
                    goals: workflowData?.goalCriteria || [],
                    settings: {
                        allowMultipleEnrollments: workflowData?.allowContactToTriggerMultipleTimes || false,
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
            }
            catch (error) {
                console.error('❌ Error exporting deleted workflow:', error);
                throw new common_1.HttpException(`Failed to export workflow: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        formatActionsForExport(actions) {
            return actions.map((action, index) => ({
                step: index + 1,
                type: action.type,
                description: this.getActionDescription(action),
                configuration: this.getActionConfiguration(action),
                stepId: action.stepId,
            }));
        }
        formatTriggersForExport(triggerSets) {
            return triggerSets.map((triggerSet, index) => ({
                triggerSet: index + 1,
                description: 'Contact enrollment criteria',
                filters: triggerSet.filters || [],
                configuration: triggerSet,
            }));
        }
        getActionDescription(action) {
            switch (action.type) {
                case 'SET_CONTACT_PROPERTY':
                    return `Set contact property: ${action.propertyName}`;
                case 'DELAY':
                    return `Delay for ${Math.round(action.delayMillis / 60000)} minutes`;
                case 'TASK':
                    return `Create task: ${action.subject}`;
                case 'EMAIL':
                    return `Send email: ${action.subject}`;
                case 'DEAL':
                    return `Create deal: ${action.dealName}`;
                case 'BRANCH':
                    return `Branch based on conditions`;
                case 'UNSUPPORTED_ACTION':
                    return `Custom action (may need manual configuration)`;
                default:
                    return `${action.type} action`;
            }
        }
        getActionConfiguration(action) {
            const config = { ...action };
            delete config.stepId;
            delete config.actionId;
            return config;
        }
        calculateWorkflowSteps(workflowData) {
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
            }
            catch {
                return 0;
            }
        }
        calculateWorkflowContacts(workflowData) {
            try {
                if (typeof workflowData === 'string') {
                    workflowData = JSON.parse(workflowData);
                }
                // Contact count calculation should be implemented if available, else return 0
                return 0;
            }
            catch {
                return 0;
            }
        }
        /**
         * Handle workflow updates from HubSpot webhooks.
         * This method is called when a workflow is created, changed, or deleted in HubSpot.
         */
        async handleWorkflowUpdate(portalId, hubspotWorkflowId) {
            console.log(`🔄 Handling workflow update for portalId: ${portalId}, workflowId: ${hubspotWorkflowId}`);
            // 1. Find the user associated with the portal
            const user = await this.prisma.user.findFirst({
                where: { hubspotPortalId: portalId },
            });
            if (!user) {
                console.warn(`⚠️ No user found for portalId: ${portalId}. Skipping workflow update.`);
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
                console.log(`ℹ️ Workflow ${hubspotWorkflowId} is not protected for user ${user.id}. Skipping backup.`);
                return;
            }
            try {
                // 3. Fetch the latest workflow data from HubSpot
                // Assuming getWorkflowById exists in HubSpotService. If not, this will need to be implemented.
                const hubspotWorkflowData = await this.hubspotService.getWorkflowById(user.id, hubspotWorkflowId);
                if (!hubspotWorkflowData) {
                    console.warn(`⚠️ Could not fetch workflow data for ${hubspotWorkflowId} from HubSpot.`);
                    return;
                }
                // 4. Create a new version (automated backup)
                const { WorkflowVersionService } = await Promise.resolve().then(() => __importStar(require('../workflow-version/workflow-version.service')));
                const workflowVersionService = new WorkflowVersionService(this.prisma);
                await workflowVersionService.createVersion(workflow.id, user.id, hubspotWorkflowData, 'webhook');
                console.log(`✅ Successfully created automated backup for workflow ${workflow.id} (HubSpot ID: ${hubspotWorkflowId})`);
            }
            catch (error) {
                console.error(`❌ Error handling workflow update for workflowId ${hubspotWorkflowId}:`, error);
                // Do not re-throw error to prevent HubSpot from retrying indefinitely
            }
        }
        /**
         * Handle workflow deletions from HubSpot webhooks.
         * This method creates a final backup before marking the workflow as deleted.
         */
        async handleWorkflowDeletion(portalId, hubspotWorkflowId) {
            console.log(`🗑️ Handling workflow deletion for portalId: ${portalId}, workflowId: ${hubspotWorkflowId}`);
            try {
                // 1. Find the user associated with the portal
                const user = await this.prisma.user.findFirst({
                    where: { hubspotPortalId: portalId },
                });
                if (!user) {
                    console.warn(`⚠️ No user found for portalId: ${portalId}. Skipping workflow deletion handling.`);
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
                    console.log(`ℹ️ Workflow ${hubspotWorkflowId} is not protected for user ${user.id}. Skipping deletion handling.`);
                    return;
                }
                // 3. Create final backup with the last known version data
                if (workflow.versions && workflow.versions.length > 0) {
                    const latestVersion = workflow.versions[0];
                    await this.workflowVersionService.createVersion(workflow.id, user.id, latestVersion.data, 'deletion_backup');
                    console.log(`✅ Created final backup for deleted workflow ${workflow.id} (HubSpot ID: ${hubspotWorkflowId})`);
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
                console.log(`✅ Successfully handled workflow deletion for ${workflow.id} (HubSpot ID: ${hubspotWorkflowId})`);
            }
            catch (error) {
                console.error(`❌ Error handling workflow deletion for workflowId ${hubspotWorkflowId}:`, error);
                // Do not re-throw error to prevent HubSpot from retrying indefinitely
            }
        }
        /**
         * Restore a deleted workflow back to HubSpot using the latest backup data.
         */
        async restoreDeletedWorkflow(workflowId, userId) {
            try {
                console.log(`🔄 Attempting to restore deleted workflow ${workflowId} for user ${userId}`);
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
                    throw new common_1.HttpException('Deleted workflow not found or not accessible', common_1.HttpStatus.NOT_FOUND);
                }
                if (!workflow.versions || workflow.versions.length === 0) {
                    throw new common_1.HttpException('No backup data available for this workflow', common_1.HttpStatus.BAD_REQUEST);
                }
                // 2. Get the latest backup data
                const latestBackup = workflow.versions[0];
                const workflowData = latestBackup.data;
                // 3. Recreate the workflow in HubSpot
                const restoredWorkflow = await this.hubspotService.createWorkflow(userId, {
                    name: workflowData?.name || `${workflow.name} (Restored)`,
                    enabled: false, // Start disabled for safety
                    description: workflowData?.description ||
                        `Restored by WorkflowGuard on ${new Date().toISOString()}`,
                    actions: workflowData?.actions || [],
                    triggers: workflowData?.triggers || [],
                    goals: workflowData?.goals || [],
                    settings: workflowData?.settings || {},
                });
                if (!restoredWorkflow) {
                    throw new common_1.HttpException('Failed to recreate workflow in HubSpot', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
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
                await this.workflowVersionService.createVersion(workflow.id, userId, restoredWorkflow, 'restoration');
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
                console.log(`✅ Successfully restored workflow ${workflow.id} with new HubSpot ID: ${restoredWorkflow.id}`);
                return {
                    success: true,
                    message: 'Workflow successfully restored to HubSpot',
                    workflow: updatedWorkflow,
                    hubspotWorkflow: restoredWorkflow,
                };
            }
            catch (error) {
                console.error(`❌ Error restoring deleted workflow ${workflowId}:`, error);
                throw new common_1.HttpException(`Failed to restore deleted workflow: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    };
    __setFunctionName(_classThis, "WorkflowService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WorkflowService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WorkflowService = _classThis;
})();
exports.WorkflowService = WorkflowService;
