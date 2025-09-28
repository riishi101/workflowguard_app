"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowVersionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkflowVersionService = class WorkflowVersionService {
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
                take: 50,
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
            const previousVersion = await this.prisma.workflowVersion.findFirst({
                where: {
                    workflowId: workflowId,
                    versionNumber: { lt: latestVersion.versionNumber },
                },
                orderBy: { versionNumber: 'desc' },
            });
            if (!previousVersion) {
                return {
                    message: 'No previous version to rollback to. The workflow is already at its earliest version.',
                    rollbackVersion: null,
                };
            }
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
            const latestVersion = await this.findLatestByWorkflowId(workflowId);
            if (!latestVersion) {
                throw new common_1.HttpException('No workflow found to backup', common_1.HttpStatus.NOT_FOUND);
            }
            const backupVersion = await this.prisma.workflowVersion.create({
                data: {
                    workflowId: workflowId,
                    versionNumber: latestVersion.versionNumber + 1,
                    snapshotType: 'Auto Backup',
                    createdBy: userId,
                    data: latestVersion.data || {},
                },
            });
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
            console.log(`Change notification sent for workflow ${workflowId}:`, changes);
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to create change notification: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createApprovalWorkflow(workflowId, userId, requestedChanges) {
        try {
            const workflow = await this.prisma.workflow.findUnique({
                where: { id: workflowId },
            });
            if (!workflow) {
                throw new common_1.HttpException('Workflow not found', common_1.HttpStatus.NOT_FOUND);
            }
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
            const workflow = await this.prisma.workflow.findUnique({
                where: { id: workflowId },
                include: { owner: true },
            });
            if (!workflow) {
                throw new common_1.HttpException('Workflow not found', common_1.HttpStatus.NOT_FOUND);
            }
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
            const totalVersions = versions.length;
            const automatedBackups = versions.filter((v) => v.snapshotType === 'Auto Backup').length;
            const manualSaves = versions.filter((v) => v.snapshotType === 'Manual Save').length;
            const systemBackups = versions.filter((v) => v.snapshotType === 'System Backup').length;
            const totalChanges = auditLogs.length;
            const uniqueUsers = new Set(auditLogs.map((log) => log.userId)).size;
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
        if (step1.id && step2.id) {
            return step1.id === step2.id;
        }
        if (step1.actionId && step2.actionId) {
            return step1.actionId === step2.actionId;
        }
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
            const latestVersion = await this.prisma.workflowVersion.findFirst({
                where: { workflowId: workflow.id },
                orderBy: { versionNumber: 'desc' },
            });
            const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
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
        const automatedBackups = versions.filter((v) => v.snapshotType === 'Auto Backup').length;
        if (automatedBackups < 5) {
            recommendations.push('Consider increasing automated backup frequency for better compliance');
        }
        const uniqueUsers = new Set(auditLogs.map((log) => log.userId)).size;
        if (uniqueUsers < 2) {
            recommendations.push('Consider implementing review processes for workflow changes');
        }
        const changeLogs = auditLogs.filter((log) => log.action.includes('change'));
        if (changeLogs.length < auditLogs.length * 0.3) {
            recommendations.push('Improve change tracking and documentation for compliance');
        }
        return recommendations;
    }
    async findByHubspotIdWithHistory(hubspotId, userId) {
        try {
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
                        take: 50,
                    },
                },
            });
            if (!workflow) {
                console.log('No workflow found for hubspotId:', hubspotId);
                return [];
            }
            if (!workflow.versions || workflow.versions.length === 0) {
                console.log('No versions found for workflow:', workflow.id);
                return [];
            }
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
            return [];
        }
    }
};
exports.WorkflowVersionService = WorkflowVersionService;
exports.WorkflowVersionService = WorkflowVersionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkflowVersionService);
//# sourceMappingURL=workflow-version.service.js.map