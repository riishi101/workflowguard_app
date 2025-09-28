"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const trial_guard_1 = require("../guards/trial.guard");
const subscription_guard_1 = require("../guards/subscription.guard");
let WorkflowController = (() => {
    let _classDecorators = [(0, common_1.Controller)('workflow')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _findAll_decorators;
    let _findByHubspotId_decorators;
    let _findByHubspotIdLegacy_decorators;
    let _getHubSpotWorkflows_decorators;
    let _getProtectedWorkflows_decorators;
    let _syncHubSpotWorkflows_decorators;
    let _createAutomatedBackup_decorators;
    let _createChangeNotification_decorators;
    let _createApprovalRequest_decorators;
    let _generateComplianceReport_decorators;
    let _findOne_decorators;
    let _update_decorators;
    let _remove_decorators;
    let _restoreWorkflowVersion_decorators;
    let _rollbackWorkflow_decorators;
    let _restoreDeletedWorkflow_decorators;
    let _exportDeletedWorkflow_decorators;
    let _downloadWorkflowVersion_decorators;
    let _compareWorkflowVersions_decorators;
    let _startWorkflowProtection_decorators;
    let _getWorkflowVersionsByHubspotId_decorators;
    let _compareWorkflowVersionsByHubspotId_decorators;
    let _getWorkflowVersions_decorators;
    let _getWorkflowStats_decorators;
    var WorkflowController = _classThis = class {
        constructor(workflowService) {
            this.workflowService = (__runInitializers(this, _instanceExtraInitializers), workflowService);
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
            // Accept 'workflows' array from frontend
            if (!body || !Array.isArray(body.workflows)) {
                throw new common_1.HttpException('Invalid request: workflows array required', common_1.HttpStatus.BAD_REQUEST);
            }
            // Validate each workflow object has id or hubspotId
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
                // First find the internal workflow ID by HubSpot ID
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
                // First find the internal workflow ID by HubSpot ID
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
                // If no versions found, try to create an initial version
                if (versions.length === 0) {
                    await this.workflowService.createInitialVersionIfMissing(workflowId, userId);
                    // Retry getting versions after creating initial version
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
    __setFunctionName(_classThis, "WorkflowController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [(0, common_1.Post)()];
        _findAll_decorators = [(0, common_1.Get)()];
        _findByHubspotId_decorators = [(0, common_1.Get)('by-hubspot-id/:hubspotId'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard, subscription_guard_1.SubscriptionGuard)];
        _findByHubspotIdLegacy_decorators = [(0, common_1.Get)('hubspot/:hubspotId')];
        _getHubSpotWorkflows_decorators = [(0, common_1.Get)('hubspot'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard, subscription_guard_1.SubscriptionGuard)];
        _getProtectedWorkflows_decorators = [(0, common_1.Get)('protected'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard, subscription_guard_1.SubscriptionGuard)];
        _syncHubSpotWorkflows_decorators = [(0, common_1.Post)('sync-hubspot'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard, subscription_guard_1.SubscriptionGuard)];
        _createAutomatedBackup_decorators = [(0, common_1.Post)(':id/automated-backup'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard)];
        _createChangeNotification_decorators = [(0, common_1.Post)(':id/change-notification'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard)];
        _createApprovalRequest_decorators = [(0, common_1.Post)(':id/approval-request'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard)];
        _generateComplianceReport_decorators = [(0, common_1.Get)(':id/compliance-report'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard)];
        _findOne_decorators = [(0, common_1.Get)(':id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard)];
        _update_decorators = [(0, common_1.Patch)(':id')];
        _remove_decorators = [(0, common_1.Delete)(':id')];
        _restoreWorkflowVersion_decorators = [(0, common_1.Post)(':id/rollback/:versionId'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard)];
        _rollbackWorkflow_decorators = [(0, common_1.Post)(':id/rollback'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard)];
        _restoreDeletedWorkflow_decorators = [(0, common_1.Post)(':id/restore-deleted'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard)];
        _exportDeletedWorkflow_decorators = [(0, common_1.Get)(':id/export-deleted'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard)];
        _downloadWorkflowVersion_decorators = [(0, common_1.Get)(':id/version/:versionId/download'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard)];
        _compareWorkflowVersions_decorators = [(0, common_1.Get)(':id/compare/:versionA/:versionB'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard, subscription_guard_1.SubscriptionGuard)];
        _startWorkflowProtection_decorators = [(0, common_1.Post)('start-protection'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard, subscription_guard_1.SubscriptionGuard)];
        _getWorkflowVersionsByHubspotId_decorators = [(0, common_1.Get)('by-hubspot-id/:hubspotId/versions'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard, subscription_guard_1.SubscriptionGuard)];
        _compareWorkflowVersionsByHubspotId_decorators = [(0, common_1.Get)('by-hubspot-id/:hubspotId/compare/:versionA/:versionB'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard, subscription_guard_1.SubscriptionGuard)];
        _getWorkflowVersions_decorators = [(0, common_1.Get)(':id/versions'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard, subscription_guard_1.SubscriptionGuard)];
        _getWorkflowStats_decorators = [(0, common_1.Get)('stats'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard)];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByHubspotId_decorators, { kind: "method", name: "findByHubspotId", static: false, private: false, access: { has: obj => "findByHubspotId" in obj, get: obj => obj.findByHubspotId }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByHubspotIdLegacy_decorators, { kind: "method", name: "findByHubspotIdLegacy", static: false, private: false, access: { has: obj => "findByHubspotIdLegacy" in obj, get: obj => obj.findByHubspotIdLegacy }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getHubSpotWorkflows_decorators, { kind: "method", name: "getHubSpotWorkflows", static: false, private: false, access: { has: obj => "getHubSpotWorkflows" in obj, get: obj => obj.getHubSpotWorkflows }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProtectedWorkflows_decorators, { kind: "method", name: "getProtectedWorkflows", static: false, private: false, access: { has: obj => "getProtectedWorkflows" in obj, get: obj => obj.getProtectedWorkflows }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _syncHubSpotWorkflows_decorators, { kind: "method", name: "syncHubSpotWorkflows", static: false, private: false, access: { has: obj => "syncHubSpotWorkflows" in obj, get: obj => obj.syncHubSpotWorkflows }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createAutomatedBackup_decorators, { kind: "method", name: "createAutomatedBackup", static: false, private: false, access: { has: obj => "createAutomatedBackup" in obj, get: obj => obj.createAutomatedBackup }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createChangeNotification_decorators, { kind: "method", name: "createChangeNotification", static: false, private: false, access: { has: obj => "createChangeNotification" in obj, get: obj => obj.createChangeNotification }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createApprovalRequest_decorators, { kind: "method", name: "createApprovalRequest", static: false, private: false, access: { has: obj => "createApprovalRequest" in obj, get: obj => obj.createApprovalRequest }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _generateComplianceReport_decorators, { kind: "method", name: "generateComplianceReport", static: false, private: false, access: { has: obj => "generateComplianceReport" in obj, get: obj => obj.generateComplianceReport }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _restoreWorkflowVersion_decorators, { kind: "method", name: "restoreWorkflowVersion", static: false, private: false, access: { has: obj => "restoreWorkflowVersion" in obj, get: obj => obj.restoreWorkflowVersion }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _rollbackWorkflow_decorators, { kind: "method", name: "rollbackWorkflow", static: false, private: false, access: { has: obj => "rollbackWorkflow" in obj, get: obj => obj.rollbackWorkflow }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _restoreDeletedWorkflow_decorators, { kind: "method", name: "restoreDeletedWorkflow", static: false, private: false, access: { has: obj => "restoreDeletedWorkflow" in obj, get: obj => obj.restoreDeletedWorkflow }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _exportDeletedWorkflow_decorators, { kind: "method", name: "exportDeletedWorkflow", static: false, private: false, access: { has: obj => "exportDeletedWorkflow" in obj, get: obj => obj.exportDeletedWorkflow }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _downloadWorkflowVersion_decorators, { kind: "method", name: "downloadWorkflowVersion", static: false, private: false, access: { has: obj => "downloadWorkflowVersion" in obj, get: obj => obj.downloadWorkflowVersion }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _compareWorkflowVersions_decorators, { kind: "method", name: "compareWorkflowVersions", static: false, private: false, access: { has: obj => "compareWorkflowVersions" in obj, get: obj => obj.compareWorkflowVersions }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _startWorkflowProtection_decorators, { kind: "method", name: "startWorkflowProtection", static: false, private: false, access: { has: obj => "startWorkflowProtection" in obj, get: obj => obj.startWorkflowProtection }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getWorkflowVersionsByHubspotId_decorators, { kind: "method", name: "getWorkflowVersionsByHubspotId", static: false, private: false, access: { has: obj => "getWorkflowVersionsByHubspotId" in obj, get: obj => obj.getWorkflowVersionsByHubspotId }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _compareWorkflowVersionsByHubspotId_decorators, { kind: "method", name: "compareWorkflowVersionsByHubspotId", static: false, private: false, access: { has: obj => "compareWorkflowVersionsByHubspotId" in obj, get: obj => obj.compareWorkflowVersionsByHubspotId }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getWorkflowVersions_decorators, { kind: "method", name: "getWorkflowVersions", static: false, private: false, access: { has: obj => "getWorkflowVersions" in obj, get: obj => obj.getWorkflowVersions }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getWorkflowStats_decorators, { kind: "method", name: "getWorkflowStats", static: false, private: false, access: { has: obj => "getWorkflowStats" in obj, get: obj => obj.getWorkflowStats }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WorkflowController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WorkflowController = _classThis;
})();
exports.WorkflowController = WorkflowController;
