import { PrismaService } from '../prisma/prisma.service';
import { HubSpotWorkflow, WorkflowResponse } from '../types/hubspot.types';
export declare class HubSpotService {
    private prisma;
    constructor(prisma: PrismaService);
    getWorkflows(userId: string): Promise<WorkflowResponse[]>;
    getWorkflowById(userId: string, workflowId: string): Promise<HubSpotWorkflow | null>;
    private fetchWorkflowsFromHubSpot;
    private refreshAccessToken;
    validateToken(accessToken: string): Promise<boolean>;
    createWorkflow(userId: string, workflowData: any): Promise<any>;
}
