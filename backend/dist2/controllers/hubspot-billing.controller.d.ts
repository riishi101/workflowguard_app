export declare class BillingController {
    getBillingPortal(query: any): Promise<{
        success: boolean;
        portalUrl: string;
    }>;
    handleBillingWebhook(body: any): Promise<{
        success: boolean;
    }>;
}
