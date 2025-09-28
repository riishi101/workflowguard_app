import { SupportService } from './support.service';
export declare class SupportController {
    private readonly supportService;
    constructor(supportService: SupportService);
    diagnoseIssue(body: {
        description: string;
    }, req: any): Promise<any>;
    fixRollbackIssue(req: any): Promise<any>;
    fixSyncIssue(req: any): Promise<any>;
    fixAuthIssue(req: any): Promise<any>;
    fixDataIssue(req: any): Promise<any>;
    optimizePerformance(req: any): Promise<any>;
    sendWhatsAppSupport(body: {
        message: string;
        phoneNumber?: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
