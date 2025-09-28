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
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let WebhookController = (() => {
    let _classDecorators = [(0, common_1.Controller)('webhooks')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getUserWebhooks_decorators;
    let _createWebhook_decorators;
    let _updateWebhook_decorators;
    let _deleteWebhook_decorators;
    let _handleHubSpotWebhook_decorators;
    var WebhookController = _classThis = class {
        constructor(webhookService, prisma) {
            this.webhookService = (__runInitializers(this, _instanceExtraInitializers), webhookService);
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
                // Verify webhook signature if needed
                const signature = headers['x-hubspot-signature-v3'] || headers['x-hubspot-signature'];
                if (signature && process.env.HUBSPOT_WEBHOOK_SECRET) {
                    // Add signature verification logic here if needed
                }
                // Handle workflow update events
                if (body.subscriptionType === 'automation.workflow.updated') {
                    const { portalId, objectId: workflowId } = body;
                    if (portalId && workflowId) {
                        console.log(`📝 Webhook: Processing workflow update for portal ${portalId}, workflow ${workflowId}`);
                        // Note: Workflow update handling will be processed by the workflow service
                        // This webhook confirms receipt but actual processing happens via the workflow service
                    }
                }
                // Handle workflow deletion events
                if (body.subscriptionType === 'automation.workflow.deleted') {
                    const { portalId, objectId: workflowId } = body;
                    if (portalId && workflowId) {
                        console.log(`🗑️ Webhook: Processing workflow deletion for portal ${portalId}, workflow ${workflowId}`);
                        // Import WorkflowService dynamically to avoid circular dependencies
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
                        // Handle workflow deletion
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
    __setFunctionName(_classThis, "WebhookController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getUserWebhooks_decorators = [(0, common_1.Get)(), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _createWebhook_decorators = [(0, common_1.Post)(), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _updateWebhook_decorators = [(0, common_1.Put)(':id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _deleteWebhook_decorators = [(0, common_1.Delete)(':id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _handleHubSpotWebhook_decorators = [(0, common_1.Post)('hubspot'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        __esDecorate(_classThis, null, _getUserWebhooks_decorators, { kind: "method", name: "getUserWebhooks", static: false, private: false, access: { has: obj => "getUserWebhooks" in obj, get: obj => obj.getUserWebhooks }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createWebhook_decorators, { kind: "method", name: "createWebhook", static: false, private: false, access: { has: obj => "createWebhook" in obj, get: obj => obj.createWebhook }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateWebhook_decorators, { kind: "method", name: "updateWebhook", static: false, private: false, access: { has: obj => "updateWebhook" in obj, get: obj => obj.updateWebhook }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteWebhook_decorators, { kind: "method", name: "deleteWebhook", static: false, private: false, access: { has: obj => "deleteWebhook" in obj, get: obj => obj.deleteWebhook }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleHubSpotWebhook_decorators, { kind: "method", name: "handleHubSpotWebhook", static: false, private: false, access: { has: obj => "handleHubSpotWebhook" in obj, get: obj => obj.handleHubSpotWebhook }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WebhookController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WebhookController = _classThis;
})();
exports.WebhookController = WebhookController;
