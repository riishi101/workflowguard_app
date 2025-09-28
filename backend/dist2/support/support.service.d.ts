import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
export declare class SupportService {
    private prisma;
    private whatsappService;
    constructor(prisma: PrismaService, whatsappService: WhatsAppService);
    diagnoseIssue(description: string, userId: string): Promise<any>;
    fixRollbackIssue(userId: string): Promise<any>;
    fixSyncIssue(userId: string): Promise<any>;
    fixAuthIssue(userId: string): Promise<any>;
    fixDataIssue(userId: string): Promise<any>;
    optimizePerformance(userId: string): Promise<any>;
    private classifyIssue;
    private determineSeverity;
    private canAutoFix;
    private getIssueDescription;
    private getSolution;
    private getConfidence;
    private validateRollbackIntegrity;
    private repairRollbackData;
    private optimizeRollbackPerformance;
    private refreshHubSpotTokens;
    private retryFailedSyncs;
    private validateSyncIntegrity;
    private validateUserSession;
    private refreshAuthTokens;
    private resetUserPermissions;
    private validateDataIntegrity;
    private repairCorruptedData;
    private optimizeDatabasePerformance;
    private optimizeDatabaseQueries;
    private clearCache;
    private optimizeAPIResponses;
    sendWhatsAppSupportRequest(userId: string, message: string, phoneNumber?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private logDiagnosis;
}
