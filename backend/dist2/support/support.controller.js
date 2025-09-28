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
exports.SupportController = void 0;
const common_1 = require("@nestjs/common");
const support_service_1 = require("./support.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let SupportController = class SupportController {
    constructor(supportService) {
        this.supportService = supportService;
    }
    async diagnoseIssue(body, req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        if (!body.description) {
            throw new common_1.HttpException('Issue description is required', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const diagnosis = await this.supportService.diagnoseIssue(body.description, userId);
            return diagnosis;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to diagnose issue: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async fixRollbackIssue(req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const result = await this.supportService.fixRollbackIssue(userId);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to fix rollback issue: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async fixSyncIssue(req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const result = await this.supportService.fixSyncIssue(userId);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to fix sync issue: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async fixAuthIssue(req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const result = await this.supportService.fixAuthIssue(userId);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to fix auth issue: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async fixDataIssue(req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const result = await this.supportService.fixDataIssue(userId);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to fix data issue: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async optimizePerformance(req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const result = await this.supportService.optimizePerformance(userId);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to optimize performance: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async sendWhatsAppSupport(body, req) {
        let userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            userId = req.headers['x-user-id'];
        }
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        if (!body.message) {
            throw new common_1.HttpException('Message is required', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const result = await this.supportService.sendWhatsAppSupportRequest(userId, body.message, body.phoneNumber);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to send WhatsApp support request: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.SupportController = SupportController;
__decorate([
    (0, common_1.Post)('diagnose'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "diagnoseIssue", null);
__decorate([
    (0, common_1.Post)('fix-rollback'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "fixRollbackIssue", null);
__decorate([
    (0, common_1.Post)('fix-sync'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "fixSyncIssue", null);
__decorate([
    (0, common_1.Post)('fix-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "fixAuthIssue", null);
__decorate([
    (0, common_1.Post)('fix-data'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "fixDataIssue", null);
__decorate([
    (0, common_1.Post)('optimize-performance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "optimizePerformance", null);
__decorate([
    (0, common_1.Post)('whatsapp'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "sendWhatsAppSupport", null);
exports.SupportController = SupportController = __decorate([
    (0, common_1.Controller)('support'),
    __metadata("design:paramtypes", [support_service_1.SupportService])
], SupportController);
//# sourceMappingURL=support.controller.js.map