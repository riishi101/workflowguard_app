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
exports.WorkflowVersionController = void 0;
const common_1 = require("@nestjs/common");
const workflow_version_service_1 = require("./workflow-version.service");
const create_workflow_version_dto_1 = require("./dto/create-workflow-version.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let WorkflowVersionController = class WorkflowVersionController {
    constructor(workflowVersionService) {
        this.workflowVersionService = workflowVersionService;
    }
    create(createWorkflowVersionDto) {
        return this.workflowVersionService.create(createWorkflowVersionDto);
    }
    findAll() {
        return this.workflowVersionService.findAll();
    }
    findOne(id) {
        return this.workflowVersionService.findOne(id);
    }
    update(id, updateWorkflowVersionDto) {
        return this.workflowVersionService.update(id, updateWorkflowVersionDto);
    }
    remove(id) {
        return this.workflowVersionService.remove(id);
    }
    async getWorkflowHistoryByHubspotId(hubspotId, req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const history = await this.workflowVersionService.findByHubspotIdWithHistory(hubspotId, userId);
            return {
                success: true,
                data: history,
                message: 'Workflow history retrieved successfully',
            };
        }
        catch (error) {
            console.error('Failed to get workflow history by HubSpot ID:', error);
            throw new common_1.HttpException('Workflow history not found or access denied', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async getWorkflowHistory(workflowId, req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const history = await this.workflowVersionService.findByWorkflowIdWithHistoryLimit(workflowId, userId);
            return history;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get workflow history: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.WorkflowVersionController = WorkflowVersionController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_workflow_version_dto_1.CreateWorkflowVersionDto]),
    __metadata("design:returntype", void 0)
], WorkflowVersionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorkflowVersionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkflowVersionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkflowVersionController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkflowVersionController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('by-hubspot-id/:hubspotId/history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('hubspotId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowVersionController.prototype, "getWorkflowHistoryByHubspotId", null);
__decorate([
    (0, common_1.Get)(':workflowId/history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('workflowId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowVersionController.prototype, "getWorkflowHistory", null);
exports.WorkflowVersionController = WorkflowVersionController = __decorate([
    (0, common_1.Controller)('workflow-version'),
    __metadata("design:paramtypes", [workflow_version_service_1.WorkflowVersionService])
], WorkflowVersionController);
//# sourceMappingURL=workflow-version.controller.js.map