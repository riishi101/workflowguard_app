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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const workflow_service_1 = require("../workflow/workflow.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const trial_guard_1 = require("../guards/trial.guard");
let DashboardController = class DashboardController {
    constructor(workflowService) {
        this.workflowService = workflowService;
    }
    async getDashboardStats(req) {
        try {
            let userId = req.user?.sub ||
                req.user?.id ||
                req.user?.userId;
            if (!userId) {
                userId = req.headers['x-user-id'];
            }
            if (!userId) {
                console.log('DashboardController - No userId found in dashboard stats request');
                return {
                    totalWorkflows: 0,
                    activeWorkflows: 0,
                    protectedWorkflows: 0,
                    totalVersions: 0,
                    uptime: 0,
                    lastSnapshot: new Date().toISOString(),
                    planCapacity: 100,
                    planUsed: 0,
                };
            }
            console.log('DashboardController - Getting stats for userId:', userId);
            const stats = await this.workflowService.getDashboardStats(userId);
            console.log('DashboardController - Returning stats:', stats);
            return stats;
        }
        catch (error) {
            console.error('DashboardController - Error getting stats:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            return {
                totalWorkflows: 0,
                activeWorkflows: 0,
                protectedWorkflows: 0,
                totalVersions: 0,
                uptime: 0,
                lastSnapshot: new Date().toISOString(),
                planCapacity: 100,
                planUsed: 0,
            };
        }
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trial_guard_1.TrialGuard),
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDashboardStats", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [workflow_service_1.WorkflowService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map