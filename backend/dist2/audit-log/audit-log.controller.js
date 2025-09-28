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
exports.AuditLogController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const audit_log_service_1 = require("./audit-log.service");
const get_user_decorator_1 = require("../auth/get-user.decorator");
let AuditLogController = class AuditLogController {
    constructor(auditLogService) {
        this.auditLogService = auditLogService;
    }
    async getAuditLogs(user, page, pageSize, dateRange, action, entityType) {
        const filters = {};
        if (action)
            filters.action = action;
        if (entityType)
            filters.entityType = entityType;
        const pageNum = parseInt(page || '1') || 1;
        const pageSizeNum = parseInt(pageSize || '20') || 20;
        const skip = (pageNum - 1) * pageSizeNum;
        const auditLogs = await this.auditLogService.getAuditLogs(user.id, filters, skip, pageSizeNum);
        return {
            success: true,
            data: auditLogs,
            pagination: {
                page: pageNum,
                pageSize: pageSizeNum,
                total: auditLogs.length,
            },
        };
    }
};
exports.AuditLogController = AuditLogController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Query)('dateRange')),
    __param(4, (0, common_1.Query)('action')),
    __param(5, (0, common_1.Query)('entityType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "getAuditLogs", null);
exports.AuditLogController = AuditLogController = __decorate([
    (0, common_1.Controller)('audit-logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [audit_log_service_1.AuditLogService])
], AuditLogController);
//# sourceMappingURL=audit-log.controller.js.map