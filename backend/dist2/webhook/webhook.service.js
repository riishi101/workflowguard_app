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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = __importDefault(require("axios"));
let WebhookService = class WebhookService {
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
            const webhooks = await this.prisma.webhook.findMany({
                where: {
                    userId: userId,
                },
            });
            const filteredWebhooks = webhooks.filter((webhook) => webhook.events && webhook.events.includes(event));
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
            if (webhook.secret) {
                const signature = this.generateSignature(payload, webhook.secret);
                headers['X-WorkflowGuard-Signature'] = signature;
            }
            await axios_1.default.post(webhook.endpointUrl, payload, {
                headers: headers,
                timeout: 10000,
            });
        }
        catch (error) {
            console.error(`Failed to send webhook to ${webhook.endpointUrl}:`, error.message);
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
exports.WebhookService = WebhookService;
exports.WebhookService = WebhookService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WebhookService);
//# sourceMappingURL=webhook.service.js.map