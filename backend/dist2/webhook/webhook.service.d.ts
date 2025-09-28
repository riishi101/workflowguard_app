import { PrismaService } from '../prisma/prisma.service';
export declare class WebhookService {
    private prisma;
    constructor(prisma: PrismaService);
    createWebhook(userId: string, webhookData: any): Promise<any>;
    getUserWebhooks(userId: string): Promise<any[]>;
    updateWebhook(webhookId: string, userId: string, webhookData: any): Promise<any>;
    deleteWebhook(webhookId: string, userId: string): Promise<any>;
    sendWebhookNotification(event: string, data: any, userId: string): Promise<void>;
    private sendWebhookToEndpoint;
    private generateWebhookSecret;
    private generateSignature;
    sendWorkflowChangeNotification(workflowId: string, userId: string, changes: any): Promise<void>;
    sendWorkflowRollbackNotification(workflowId: string, userId: string, versionId: string): Promise<void>;
    sendApprovalRequestNotification(approvalRequestId: string, userId: string, workflowId: string): Promise<void>;
    sendComplianceReportNotification(workflowId: string, userId: string, reportData: any): Promise<void>;
}
