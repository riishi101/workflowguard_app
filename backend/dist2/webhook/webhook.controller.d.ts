import { WebhookService } from './webhook.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class WebhookController {
    private readonly webhookService;
    private readonly prisma;
    constructor(webhookService: WebhookService, prisma: PrismaService);
    getUserWebhooks(req: any): Promise<{
        success: boolean;
        data: any[];
        message: string;
    }>;
    createWebhook(webhookData: any, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    updateWebhook(webhookId: string, webhookData: any, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    deleteWebhook(webhookId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    handleHubSpotWebhook(body: any, headers: any): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
}
