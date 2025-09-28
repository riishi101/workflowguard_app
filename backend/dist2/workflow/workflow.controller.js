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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowController = void 0;
const common_1 = require("@nestjs/common");
const workflow_service_1 = require("./workflow.service");
const create_workflow_dto_1 = require("./dto/create-workflow.dto");
const update_workflow_dto_1 = require("./dto/update-workflow.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const trial_guard_1 = require("../guards/trial.guard");
const subscription_guard_1 = require("../guards/subscription.guard");
let WorkflowController = class WorkflowController {
    constructor(workflowService) {
        this.workflowService = workflowService;
    }
    create(createWorkflowDto) {
        return this.workflowService.create(createWorkflowDto);
    }
    findAll() {
        return this.workflowService.findAll();
    }
    async findByHubspotId(hubspotId, req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const workflow = await this.workflowService.findByHubspotId(hubspotId, userId);
            return {
                success: true,
                data: workflow,
                message: 'Workflow found successfully',
            };
        }
        catch (error) {
            console.error('Failed to find workflow by HubSpot ID:', error);
            throw new common_1.HttpException('Workflow not found or access denied', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async findByHubspotIdLegacy(hubspotId) {
        return {
            message: 'HubSpot workflow lookup not implemented in simplified version',
        };
    }
    async getHubSpotWorkflows(req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const workflows = await this.workflowService.getHubSpotWorkflows(userId);
            return {
                success: true,
                data: workflows,
                message: `Successfully fetched ${workflows.length} workflows from HubSpot`,
            };
        }
        catch (error) {
            console.error('Failed to fetch HubSpot workflows:', error);
            throw new common_1.HttpException(`Failed to fetch HubSpot workflows: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getProtectedWorkflows(req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            return [];
        }
        try {
            const workflows = await this.workflowService.getProtectedWorkflows(userId);
            return {
                success: true,
                data: workflows,
                message: `Successfully fetched ${workflows.length} protected workflows`,
            };
        }
        catch (error) {
            console.error('Failed to fetch protected workflows:', error);
            throw new common_1.HttpException(`Failed to fetch protected workflows: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async syncHubSpotWorkflows(req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const workflows = await this.workflowService.syncHubSpotWorkflows(userId);
            return {
                success: true,
                data: workflows,
                message: `Successfully synced ${workflows.length} workflows from HubSpot`,
            };
        }
        catch (error) {
            console.error('Failed to sync HubSpot workflows:', error);
            throw new common_1.HttpException(`Failed to sync HubSpot workflows: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createAutomatedBackup(workflowId, req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const backup = await this.workflowService.createAutomatedBackup(workflowId, userId);
            return {
                message: 'Automated backup created successfully',
                backup: backup,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to create automated backup: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createChangeNotification(workflowId, changes, req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            await this.workflowService.createChangeNotification(workflowId, userId, changes);
            return {
                message: 'Change notification created successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to create change notification: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createApprovalRequest(workflowId, requestedChanges, req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const approvalRequest = await this.workflowService.createApprovalRequest(workflowId, userId, requestedChanges);
            return {
                message: 'Approval request created successfully',
                approvalRequest: approvalRequest,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to create approval request: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateComplianceReport(workflowId, startDate, endDate, req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const report = await this.workflowService.generateComplianceReport(workflowId, start, end);
            return report;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to generate compliance report: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id, req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const workflow = await this.workflowService.findOne(id, userId);
            return {
                success: true,
                data: workflow,
                message: 'Workflow found successfully',
            };
        }
        catch (error) {
            console.error('Failed to find workflow:', error);
            throw new common_1.HttpException('Workflow not found or access denied', common_1.HttpStatus.NOT_FOUND);
        }
    }
    update(id, updateWorkflowDto) {
        return this.workflowService.update(id, updateWorkflowDto);
    }
    remove(id) {
        return this.workflowService.remove(id);
    }
    async restoreWorkflowVersion(workflowId, versionId, req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const result = await this.workflowService.restoreWorkflowVersion(workflowId, versionId, userId);
            return {
                message: 'Workflow restored successfully',
                result: result,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to restore workflow: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async rollbackWorkflow(id, req) {
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const result = await this.workflowService.rollbackWorkflow(id, userId);
            return {
                success: true,
                data: result,
                message: 'Workflow rolled back successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to rollback workflow: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async restoreDeletedWorkflow(id, req) {
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const result = await this.workflowService.restoreDeletedWorkflow(id, userId);
            return {
                success: true,
                data: result,
                message: 'Workflow restored successfully',
            };
        }
        catch (error) {
            console.error('❌ Error restoring deleted workflow:', error);
            throw new common_1.HttpException(error.message || 'Failed to restore workflow', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async exportDeletedWorkflow(id, req) {
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const exportData = await this.workflowService.exportDeletedWorkflow(id, userId);
            return {
                success: true,
                data: exportData,
                message: 'Workflow data exported successfully',
            };
        }
        catch (error) {
            console.error('❌ Error exporting deleted workflow:', error);
            throw new common_1.HttpException(error.message || 'Failed to export workflow data', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async downloadWorkflowVersion(workflowId, versionId) {
        try {
            const versionData = await this.workflowService.downloadWorkflowVersion(workflowId, versionId);
            return versionData;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to download workflow version: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async compareWorkflowVersions(workflowId, versionA, versionB, req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const comparison = await this.workflowService.compareWorkflowVersions(workflowId, versionA, versionB);
            return {
                success: true,
                data: comparison,
                message: 'Workflow versions compared successfully',
            };
        }
        catch (error) {
            console.error('Failed to compare workflow versions:', error);
            throw new common_1.HttpException(`Failed to compare workflow versions: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async startWorkflowProtection(body, req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        if (!body || !Array.isArray(body.workflows)) {
            throw new common_1.HttpException('Invalid request: workflows array required', common_1.HttpStatus.BAD_REQUEST);
        }
        const invalidWorkflows = body.workflows.filter((w) => !w.id && !w.hubspotId);
        if (invalidWorkflows.length > 0) {
            console.error('Invalid workflow objects received:', invalidWorkflows);
            throw new common_1.HttpException('Each workflow must have an id or hubspotId', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const workflowIds = body.workflows.map((w) => w.id || w.hubspotId || w.workflowId);
            console.log('start-protection: workflowIds:', workflowIds);
            console.log('start-protection: workflows:', body.workflows);
            const result = await this.workflowService.startWorkflowProtection(workflowIds, userId, body.workflows);
            return {
                success: true,
                message: 'Workflow protection started successfully',
                data: result,
            };
        }
        catch (error) {
            console.error('start-protection error:', error);
            throw new common_1.HttpException(`Failed to start workflow protection: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getWorkflowVersionsByHubspotId(hubspotId, req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const workflow = await this.workflowService.findByHubspotId(hubspotId, userId);
            if (!workflow) {
                throw new common_1.HttpException('Workflow not found', common_1.HttpStatus.NOT_FOUND);
            }
            const versions = await this.workflowService.getWorkflowVersions(workflow.id, userId);
            return {
                success: true,
                data: versions,
                message: `Successfully fetched ${versions.length} versions for workflow ${hubspotId}`,
            };
        }
        catch (error) {
            console.error('Failed to fetch workflow versions by HubSpot ID:', error);
            throw new common_1.HttpException(`Failed to fetch workflow versions: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async compareWorkflowVersionsByHubspotId(hubspotId, versionA, versionB, req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const workflow = await this.workflowService.findByHubspotId(hubspotId, userId);
            if (!workflow) {
                throw new common_1.HttpException('Workflow not found', common_1.HttpStatus.NOT_FOUND);
            }
            const comparison = await this.workflowService.compareWorkflowVersions(workflow.id, versionA, versionB);
            return {
                success: true,
                data: comparison,
                message: 'Workflow versions compared successfully',
            };
        }
        catch (error) {
            console.error('Failed to compare workflow versions by HubSpot ID:', error);
            throw new common_1.HttpException(`Failed to compare workflow versions: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getWorkflowVersions(workflowId, req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const versions = await this.workflowService.getWorkflowVersions(workflowId, userId);
            if (versions.length === 0) {
                await this.workflowService.createInitialVersionIfMissing(workflowId, userId);
                const newVersions = await this.workflowService.getWorkflowVersions(workflowId, userId);
                return {
                    success: true,
                    data: newVersions,
                    message: 'Initial version created and retrieved successfully',
                };
            }
            return {
                success: true,
                data: versions,
                message: 'Workflow versions retrieved successfully',
            };
        }
        catch (error) {
            console.error('Failed to get workflow versions:', error);
            throw new common_1.HttpException('Workflow versions not found or access denied', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async getWorkflowStats(req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const stats = await this.workflowService.getWorkflowStats(userId);
            return stats;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get workflow stats: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.WorkflowController = WorkflowController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_workflow_dto_1.CreateWorkflowDto]),
    __metadata("design:returntype", void 0)
], WorkflowController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorkflowController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-hubspot-id/:hubspotId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard, subscription_guard_1.SubscriptionGuard),
    __param(0, (0, common_1.Param)('hubspotId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "findByHubspotId", null);
__decorate([
    (0, common_1.Get)('hubspot/:hubspotId'),
    __param(0, (0, common_1.Param)('hubspotId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "findByHubspotIdLegacy", null);
__decorate([
    (0, common_1.Get)('hubspot'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard, subscription_guard_1.SubscriptionGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getHubSpotWorkflows", null);
__decorate([
    (0, common_1.Get)('protected'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard, subscription_guard_1.SubscriptionGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getProtectedWorkflows", null);
__decorate([
    (0, common_1.Post)('sync-hubspot'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard, subscription_guard_1.SubscriptionGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "syncHubSpotWorkflows", null);
__decorate([
    (0, common_1.Post)(':id/automated-backup'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "createAutomatedBackup", null);
__decorate([
    (0, common_1.Post)(':id/change-notification'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "createChangeNotification", null);
__decorate([
    (0, common_1.Post)(':id/approval-request'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "createApprovalRequest", null);
__decorate([
    (0, common_1.Get)(':id/compliance-report'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "generateComplianceReport", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_workflow_dto_1.UpdateWorkflowDto]),
    __metadata("design:returntype", void 0)
], WorkflowController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkflowController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/rollback/:versionId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('versionId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "restoreWorkflowVersion", null);
__decorate([
    (0, common_1.Post)(':id/rollback'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "rollbackWorkflow", null);
__decorate([
    (0, common_1.Post)(':id/restore-deleted'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "restoreDeletedWorkflow", null);
__decorate([
    (0, common_1.Get)(':id/export-deleted'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "exportDeletedWorkflow", null);
__decorate([
    (0, common_1.Get)(':id/version/:versionId/download'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('versionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "downloadWorkflowVersion", null);
__decorate([
    (0, common_1.Get)(':id/compare/:versionA/:versionB'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard, subscription_guard_1.SubscriptionGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('versionA')),
    __param(2, (0, common_1.Param)('versionB')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "compareWorkflowVersions", null);
__decorate([
    (0, common_1.Post)('start-protection'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard, subscription_guard_1.SubscriptionGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "startWorkflowProtection", null);
__decorate([
    (0, common_1.Get)('by-hubspot-id/:hubspotId/versions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard, subscription_guard_1.SubscriptionGuard),
    __param(0, (0, common_1.Param)('hubspotId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getWorkflowVersionsByHubspotId", null);
__decorate([
    (0, common_1.Get)('by-hubspot-id/:hubspotId/compare/:versionA/:versionB'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard, subscription_guard_1.SubscriptionGuard),
    __param(0, (0, common_1.Param)('hubspotId')),
    __param(1, (0, common_1.Param)('versionA')),
    __param(2, (0, common_1.Param)('versionB')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "compareWorkflowVersionsByHubspotId", null);
__decorate([
    (0, common_1.Get)(':id/versions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard, subscription_guard_1.SubscriptionGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getWorkflowVersions", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getWorkflowStats", null);
exports.WorkflowController = WorkflowController = __decorate([
    (0, common_1.Controller)('workflow'),
    __metadata("design:paramtypes", [workflow_service_1.WorkflowService])
], WorkflowController);
//# sourceMappingURL=workflow.controller.js.map