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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const webhook_service_1 = require("./webhook.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
let WebhookController = class WebhookController {
    constructor(webhookService, prisma) {
        this.webhookService = webhookService;
        this.prisma = prisma;
    }
    async getUserWebhooks(req) {
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const webhooks = await this.webhookService.getUserWebhooks(userId);
            return {
                success: true,
                data: webhooks,
                message: 'Webhooks retrieved successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get webhooks: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createWebhook(webhookData, req) {
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const webhook = await this.webhookService.createWebhook(userId, webhookData);
            return {
                success: true,
                data: webhook,
                message: 'Webhook created successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to create webhook: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateWebhook(webhookId, webhookData, req) {
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            const webhook = await this.webhookService.updateWebhook(webhookId, userId, webhookData);
            return {
                success: true,
                data: webhook,
                message: 'Webhook updated successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to update webhook: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteWebhook(webhookId, req) {
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            throw new common_1.HttpException('User ID not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            await this.webhookService.deleteWebhook(webhookId, userId);
            return {
                success: true,
                message: 'Webhook deleted successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to delete webhook: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async handleHubSpotWebhook(body, headers) {
        try {
            console.log('🔔 Received HubSpot webhook:', JSON.stringify(body, null, 2));
            const signature = headers['x-hubspot-signature-v3'] || headers['x-hubspot-signature'];
            if (signature && process.env.HUBSPOT_WEBHOOK_SECRET) {
            }
            if (body.subscriptionType === 'automation.workflow.updated') {
                const { portalId, objectId: workflowId } = body;
                if (portalId && workflowId) {
                    console.log(`📝 Webhook: Processing workflow update for portal ${portalId}, workflow ${workflowId}`);
                }
            }
            if (body.subscriptionType === 'automation.workflow.deleted') {
                const { portalId, objectId: workflowId } = body;
                if (portalId && workflowId) {
                    console.log(`🗑️ Webhook: Processing workflow deletion for portal ${portalId}, workflow ${workflowId}`);
                    const { WorkflowService } = await Promise.resolve().then(() => __importStar(require('../workflow/workflow.service')));
                    const { PrismaService } = await Promise.resolve().then(() => __importStar(require('../prisma/prisma.service')));
                    const { HubSpotService } = await Promise.resolve().then(() => __importStar(require('../services/hubspot.service')));
                    const { SubscriptionService } = await Promise.resolve().then(() => __importStar(require('../subscription/subscription.service')));
                    const { WorkflowVersionService } = await Promise.resolve().then(() => __importStar(require('../workflow-version/workflow-version.service')));
                    const prismaService = new PrismaService();
                    const hubspotService = new HubSpotService(prismaService);
                    const subscriptionService = new SubscriptionService(prismaService);
                    const workflowVersionService = new WorkflowVersionService(prismaService);
                    const workflowService = new WorkflowService(prismaService, hubspotService, subscriptionService, workflowVersionService);
                    await workflowService.handleWorkflowDeletion(portalId, workflowId);
                }
            }
            return { success: true };
        }
        catch (error) {
            console.error('❌ Error handling HubSpot webhook:', error);
            return { success: false, error: error.message };
        }
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "getUserWebhooks", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "createWebhook", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "updateWebhook", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "deleteWebhook", null);
__decorate([
    (0, common_1.Post)('hubspot'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "handleHubSpotWebhook", null);
exports.WebhookController = WebhookController = __decorate([
    (0, common_1.Controller)('webhooks'),
    __metadata("design:paramtypes", [webhook_service_1.WebhookService,
        prisma_service_1.PrismaService])
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map