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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let WebhookService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var WebhookService = _classThis = class {
        constructor(prisma) {
            this.prisma = prisma;
        }
        async createWebhook(userId, webhookData) {
            try {
                const webhook = await this.prisma.webhook.create({
                    data: {
                        userId: userId,
                        name: webhookData.name,
                        endpointUrl: webhookData.endpointUrl,
                        secret: this.generateWebhookSecret(),
                        events: webhookData.events || [
                            'workflow.changed',
                            'workflow.rolled_back',
                        ],
                    },
                });
                return webhook;
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to create webhook: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async getUserWebhooks(userId) {
            try {
                const webhooks = await this.prisma.webhook.findMany({
                    where: { userId: userId },
                    orderBy: { createdAt: 'desc' },
                });
                return webhooks.map((webhook) => ({
                    ...webhook,
                    secret: webhook.secret ? `${webhook.secret.substring(0, 8)}...` : null,
                }));
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to get webhooks: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async updateWebhook(webhookId, userId, webhookData) {
            try {
                const webhook = await this.prisma.webhook.update({
                    where: {
                        id: webhookId,
                        userId: userId,
                    },
                    data: {
                        name: webhookData.name,
                        endpointUrl: webhookData.endpointUrl,
                        events: webhookData.events,
                    },
                });
                return webhook;
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to update webhook: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async deleteWebhook(webhookId, userId) {
            try {
                await this.prisma.webhook.delete({
                    where: {
                        id: webhookId,
                        userId: userId,
                    },
                });
                return { success: true };
            }
            catch (error) {
                throw new common_1.HttpException(`Failed to delete webhook: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        async sendWebhookNotification(event, data, userId) {
            try {
                // Get user's webhooks for this event
                const webhooks = await this.prisma.webhook.findMany({
                    where: {
                        userId: userId,
                    },
                });
                // Filter webhooks that have the required event
                const filteredWebhooks = webhooks.filter((webhook) => webhook.events && webhook.events.includes(event));
                // Send webhook notifications
                const webhookPromises = filteredWebhooks.map((webhook) => this.sendWebhookToEndpoint(webhook, event, data));
                await Promise.allSettled(webhookPromises);
            }
            catch (error) {
                console.error('Failed to send webhook notifications:', error);
            }
        }
        async sendWebhookToEndpoint(webhook, event, data) {
            try {
                const payload = {
                    event: event,
                    timestamp: new Date().toISOString(),
                    data: data,
                };
                const headers = {
                    'Content-Type': 'application/json',
                    'User-Agent': 'WorkflowGuard-Webhook/1.0',
                };
                // Add signature if secret is configured
                if (webhook.secret) {
                    const signature = this.generateSignature(payload, webhook.secret);
                    headers['X-WorkflowGuard-Signature'] = signature;
                }
                await axios_1.default.post(webhook.endpointUrl, payload, {
                    headers: headers,
                    timeout: 10000, // 10 second timeout
                });
                // Note: lastUsed field doesn't exist in the schema, so we skip updating it
            }
            catch (error) {
                console.error(`Failed to send webhook to ${webhook.endpointUrl}:`, error.message);
                // Log webhook failure
                await this.prisma.auditLog.create({
                    data: {
                        userId: webhook.userId,
                        action: 'webhook_delivery_failed',
                        entityType: 'webhook',
                        entityId: webhook.id,
                        oldValue: undefined,
                        newValue: JSON.stringify({
                            endpointUrl: webhook.endpointUrl,
                            error: error.message,
                        }),
                    },
                });
            }
        }
        generateWebhookSecret() {
            return `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        }
        generateSignature(payload, secret) {
            const crypto = require('crypto');
            const payloadString = JSON.stringify(payload);
            return crypto
                .createHmac('sha256', secret)
                .update(payloadString)
                .digest('hex');
        }
        // Enterprise features
        async sendWorkflowChangeNotification(workflowId, userId, changes) {
            await this.sendWebhookNotification('workflow.changed', {
                workflowId: workflowId,
                changes: changes,
                timestamp: new Date().toISOString(),
            }, userId);
        }
        async sendWorkflowRollbackNotification(workflowId, userId, versionId) {
            await this.sendWebhookNotification('workflow.rolled_back', {
                workflowId: workflowId,
                versionId: versionId,
                timestamp: new Date().toISOString(),
            }, userId);
        }
        async sendApprovalRequestNotification(approvalRequestId, userId, workflowId) {
            await this.sendWebhookNotification('approval.requested', {
                approvalRequestId: approvalRequestId,
                workflowId: workflowId,
                timestamp: new Date().toISOString(),
            }, userId);
        }
        async sendComplianceReportNotification(workflowId, userId, reportData) {
            await this.sendWebhookNotification('compliance.report_generated', {
                workflowId: workflowId,
                reportData: reportData,
                timestamp: new Date().toISOString(),
            }, userId);
        }
    };
    __setFunctionName(_classThis, "WebhookService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WebhookService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WebhookService = _classThis;
})();
exports.WebhookService = WebhookService;
