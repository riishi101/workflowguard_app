"use strict";
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowVersionService = void 0;
const common_1 = require("@nestjs/common");
let WorkflowVersionService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var WorkflowVersionService = _classThis = class {
        constructor(prisma) {
            this.prisma = prisma;
        }
        async create(createWorkflowVersionDto) {
            return this.prisma.workflowVersion.create({
                data: createWorkflowVersionDto,
            });
        }
        async createVersion(workflowId, userId, data, snapshotType) {
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
                        data: data || {},
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
            }
            catch (error) {
                console.error(`Error in createVersion for workflow ${workflowId}:`, error);
                throw new common_1.HttpException('Failed to create workflow version', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async findAll() {
            return this.prisma.workflowVersion.findMany({
                include: {
                    workflow: true,
                },
            });
        }
        async findOne(id) {
            return this.prisma.workflowVersion.findUnique({
                where: { id },
                include: {
                    workflow: true,
                },
            });
        }
        async update(id, updateWorkflowVersionDto) {
            return this.prisma.workflowVersion.update({
                where: { id },
                data: updateWorkflowVersionDto,
            });
        }
        async remove(id) {
            return this.prisma.workflowVersion.delete({
                where: { id },
            });
        }
        async findByWorkflowId(workflowId) {
            return this.prisma.workflowVersion.findMany({
                where: { workflowId },
                include: {
                    workflow: true,
                },
                orderBy: { versionNumber: 'desc' },
            });
        }
        async findByWorkflowIdWithHistoryLimit(workflowId, userId) {
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
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to get workflow history: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async findLatestByWorkflowId(workflowId) {
            return this.prisma.workflowVersion.findFirst({
                where: { workflowId },
                orderBy: { versionNumber: 'desc' },
            });
        }
        async restoreWorkflowVersion(workflowId, versionId, userId) {
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
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to restore workflow version: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async rollbackWorkflow(workflowId, userId) {
            try {
                const latestVersion = await this.findLatestByWorkflowId(workflowId);
                if (!latestVersion) {
                    throw new common_1.HttpException('No previous snapshot exists for this workflow. Rollback is not possible.', common_1.HttpStatus.BAD_REQUEST);
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
                        message: 'No previous version to rollback to. The workflow is already at its earliest version.',
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
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to rollback workflow: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async createAutomatedBackup(workflowId, userId) {
            try {
                // Get the latest version to create a backup
                const latestVersion = await this.findLatestByWorkflowId(workflowId);
                if (!latestVersion) {
                    throw new common_1.HttpException('No workflow found to backup', common_1.HttpStatus.NOT_FOUND);
                }
                // Create automated backup version
                const backupVersion = await this.prisma.workflowVersion.create({
                    data: {
                        workflowId: workflowId,
                        versionNumber: latestVersion.versionNumber + 1,
                        snapshotType: 'Auto Backup',
                        createdBy: userId,
                        data: latestVersion.data || {},
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
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to create automated backup: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async createChangeNotification(workflowId, userId, changes) {
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
                console.log(`Change notification sent for workflow ${workflowId}:`, changes);
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to create change notification: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async createApprovalWorkflow(workflowId, userId, requestedChanges) {
            try {
                // Check if workflow exists
                const workflow = await this.prisma.workflow.findUnique({
                    where: { id: workflowId },
                });
                if (!workflow) {
                    throw new common_1.HttpException('Workflow not found', common_1.HttpStatus.NOT_FOUND);
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
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to create approval workflow: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async generateComplianceReport(workflowId, startDate, endDate) {
            try {
                // Get workflow details
                const workflow = await this.prisma.workflow.findUnique({
                    where: { id: workflowId },
                    include: { owner: true },
                });
                if (!workflow) {
                    throw new common_1.HttpException('Workflow not found', common_1.HttpStatus.NOT_FOUND);
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
                const automatedBackups = versions.filter((v) => v.snapshotType === 'Auto Backup').length;
                const manualSaves = versions.filter((v) => v.snapshotType === 'Manual Save').length;
                const systemBackups = versions.filter((v) => v.snapshotType === 'System Backup').length;
                const totalChanges = auditLogs.length;
                const uniqueUsers = new Set(auditLogs.map((log) => log.userId)).size;
                // Generate compliance score
                const complianceScore = Math.min(100, Math.max(0, automatedBackups * 20 +
                    manualSaves * 15 +
                    systemBackups * 10 +
                    totalChanges * 5));
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
                    versions: versions.map((version) => ({
                        id: version.id,
                        versionNumber: version.versionNumber,
                        snapshotType: version.snapshotType,
                        createdBy: version.createdBy,
                        createdAt: version.createdAt,
                        changes: this.calculateChanges(version.data),
                    })),
                    auditTrail: auditLogs.map((log) => ({
                        id: log.id,
                        action: log.action,
                        userId: log.userId,
                        userName: log.user?.name || 'Unknown',
                        timestamp: log.timestamp,
                        oldValue: log.oldValue,
                        newValue: log.newValue,
                    })),
                    recommendations: this.generateComplianceRecommendations(versions, auditLogs),
                };
                return report;
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to generate compliance report: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        transformVersionsForFrontend(versions) {
            return versions.map((version, index) => {
                const data = typeof version.data === 'string'
                    ? JSON.parse(version.data)
                    : version.data;
                // Get previous version data for comparison
                const previousVersion = index < versions.length - 1 ? versions[index + 1] : null;
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
        calculateChanges(data, previousData) {
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
            const added = currentSteps.filter((step) => !previousSteps.find((prevStep) => this.stepsEqual(step, prevStep))).length;
            const removed = previousSteps.filter((step) => !currentSteps.find((currStep) => this.stepsEqual(step, currStep))).length;
            const modified = currentSteps.filter((step) => {
                const prevStep = previousSteps.find((prevStep) => prevStep.id === step.id || prevStep.actionId === step.actionId);
                return prevStep && !this.stepsEqual(step, prevStep);
            }).length;
            return { added, modified, removed };
        }
        extractStepsFromWorkflowData(data) {
            if (!data)
                return [];
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
        stepsEqual(step1, step2) {
            if (!step1 || !step2)
                return false;
            // Compare by ID first
            if (step1.id && step2.id) {
                return step1.id === step2.id;
            }
            // Compare by actionId
            if (step1.actionId && step2.actionId) {
                return step1.actionId === step2.actionId;
            }
            // Compare by type and basic properties
            return (step1.type === step2.type &&
                step1.actionType === step2.actionType &&
                JSON.stringify(step1.settings || {}) ===
                    JSON.stringify(step2.settings || {}));
        }
        generateChangeSummary(changes, data) {
            const { added, modified, removed } = changes;
            const summaries = [];
            if (added > 0)
                summaries.push(`${added} step(s) added`);
            if (modified > 0)
                summaries.push(`${modified} step(s) modified`);
            if (removed > 0)
                summaries.push(`${removed} step(s) removed`);
            if (summaries.length === 0) {
                return 'No changes detected';
            }
            return summaries.join(', ');
        }
        async createInitialVersion(workflow, userId, initialData) {
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
                        data: initialData || {
                            hubspotId: workflow.hubspotId,
                            name: workflow.name,
                            status: 'active',
                            initialProtection: true,
                            protectedAt: new Date().toISOString(),
                        },
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
            }
            catch (error) {
                console.error('Error creating initial version:', error);
                throw error;
            }
        }
        generateComplianceRecommendations(versions, auditLogs) {
            const recommendations = [];
            // Check backup frequency
            const automatedBackups = versions.filter((v) => v.snapshotType === 'Auto Backup').length;
            if (automatedBackups < 5) {
                recommendations.push('Consider increasing automated backup frequency for better compliance');
            }
            // Check user activity
            const uniqueUsers = new Set(auditLogs.map((log) => log.userId)).size;
            if (uniqueUsers < 2) {
                recommendations.push('Consider implementing review processes for workflow changes');
            }
            // Check change tracking
            const changeLogs = auditLogs.filter((log) => log.action.includes('change'));
            if (changeLogs.length < auditLogs.length * 0.3) {
                recommendations.push('Improve change tracking and documentation for compliance');
            }
            return recommendations;
        }
        async findByHubspotIdWithHistory(hubspotId, userId) {
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
                return workflow.versions.map((version, index) => ({
                    id: version.id,
                    versionNumber: version.versionNumber,
                    snapshotType: version.snapshotType,
                    createdBy: version.createdBy,
                    createdAt: version.createdAt,
                    data: version.data,
                    workflowId: version.workflowId,
                    changes: this.calculateChanges(version.data),
                    changeSummary: this.generateChangeSummary(this.calculateChanges(version.data), version.data),
                }));
            }
            catch (error) {
                console.error('Error finding workflow history by HubSpot ID:', error);
                return []; // Return empty array instead of throwing error
            }
        }
    };
    __setFunctionName(_classThis, "WorkflowVersionService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WorkflowVersionService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WorkflowVersionService = _classThis;
})();
exports.WorkflowVersionService = WorkflowVersionService;
