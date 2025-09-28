import { PrismaService } from '../prisma/prisma.service';
export declare class WorkflowVersionService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createWorkflowVersionDto: any): Promise<any>;
    createVersion(workflowId: string, userId: string, data: any, snapshotType: string): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any | null>;
    update(id: string, updateWorkflowVersionDto: any): Promise<any>;
    remove(id: string): Promise<any>;
    findByWorkflowId(workflowId: string): Promise<any[]>;
    findByWorkflowIdWithHistoryLimit(workflowId: string, userId: string): Promise<any[]>;
    findLatestByWorkflowId(workflowId: string): Promise<any | null>;
    restoreWorkflowVersion(workflowId: string, versionId: string, userId: string): Promise<any>;
    rollbackWorkflow(workflowId: string, userId: string): Promise<any>;
    createAutomatedBackup(workflowId: string, userId: string): Promise<any>;
    createChangeNotification(workflowId: string, userId: string, changes: any): Promise<void>;
    createApprovalWorkflow(workflowId: string, userId: string, requestedChanges: any): Promise<any>;
    generateComplianceReport(workflowId: string, startDate: Date, endDate: Date): Promise<any>;
    private transformVersionsForFrontend;
    private calculateChanges;
    private extractStepsFromWorkflowData;
    private stepsEqual;
    private generateChangeSummary;
    createInitialVersion(workflow: any, userId: string, initialData: any): Promise<any>;
    private generateComplianceRecommendations;
    findByHubspotIdWithHistory(hubspotId: string, userId: string): Promise<any[]>;
}
