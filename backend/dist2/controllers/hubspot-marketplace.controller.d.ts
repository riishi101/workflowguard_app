export declare class HubSpotMarketplaceController {
    handleInstall(query: any): Promise<{
        success: boolean;
        message: string;
    }>;
    handleWebhook(body: any): Promise<{
        success: boolean;
    }>;
}
