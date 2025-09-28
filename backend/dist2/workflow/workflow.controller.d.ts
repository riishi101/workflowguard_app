import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
export declare class WorkflowController {
    private readonly workflowService;
    constructor(workflowService: WorkflowService);
    create(createWorkflowDto: CreateWorkflowDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string | null;
        ownerId: string;
        hubspotId: string;
        deletedAt: Date | null;
        isDeleted: boolean;
        restoredAt: Date | null;
    }>;
    findAll(): Promise<({
        owner: {
            email: string;
            name: string | null;
            password: string | null;
            jobTitle: string | null;
            timezone: string | null;
            language: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            hubspotPortalId: string | null;
            hubspotAccessToken: string | null;
            hubspotRefreshToken: string | null;
            hubspotTokenExpiresAt: Date | null;
        };
        versions: {
            id: string;
            createdAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            workflowId: string;
            versionNumber: number;
            snapshotType: string;
            createdBy: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string | null;
        ownerId: string;
        hubspotId: string;
        deletedAt: Date | null;
        isDeleted: boolean;
        restoredAt: Date | null;
    })[]>;
    findByHubspotId(hubspotId: string, req: any): Promise<{
        success: boolean;
        data: {
            lastModified: Date;
            totalVersions: number;
            owner: {
                email: string;
                name: string | null;
                password: string | null;
                jobTitle: string | null;
                timezone: string | null;
                language: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                hubspotPortalId: string | null;
                hubspotAccessToken: string | null;
                hubspotRefreshToken: string | null;
                hubspotTokenExpiresAt: Date | null;
            };
            versions: {
                id: string;
                createdAt: Date;
                data: import("@prisma/client/runtime/library").JsonValue;
                workflowId: string;
                versionNumber: number;
                snapshotType: string;
                createdBy: string;
            }[];
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string | null;
            ownerId: string;
            hubspotId: string;
            deletedAt: Date | null;
            isDeleted: boolean;
            restoredAt: Date | null;
        } | {
            id: string;
            hubspotId: string;
            name: string;
            ownerId: string;
            createdAt: Date;
            updatedAt: Date;
            versions: never[];
            totalVersions: number;
            lastModified: Date;
        };
        message: string;
    }>;
    findByHubspotIdLegacy(hubspotId: string): Promise<{
        message: string;
    }>;
    getHubSpotWorkflows(req: any): Promise<{
        success: boolean;
        data: any[];
        message: string;
    }>;
    getProtectedWorkflows(req: any): Promise<never[] | {
        success: boolean;
        data: any[];
        message: string;
    }>;
    syncHubSpotWorkflows(req: any): Promise<{
        success: boolean;
        data: any[];
        message: string;
    }>;
    createAutomatedBackup(workflowId: string, req: any): Promise<{
        message: string;
        backup: any;
    }>;
    createChangeNotification(workflowId: string, changes: any, req: any): Promise<{
        message: string;
    }>;
    createApprovalRequest(workflowId: string, requestedChanges: any, req: any): Promise<{
        message: string;
        approvalRequest: any;
    }>;
    generateComplianceReport(workflowId: string, startDate: string, endDate: string, req: any): Promise<any>;
    findOne(id: string, req: any): Promise<{
        success: boolean;
        data: {
            lastModified: Date;
            totalVersions: number;
            hubspotUrl: string | null;
            owner: {
                email: string;
                name: string | null;
                password: string | null;
                jobTitle: string | null;
                timezone: string | null;
                language: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                hubspotPortalId: string | null;
                hubspotAccessToken: string | null;
                hubspotRefreshToken: string | null;
                hubspotTokenExpiresAt: Date | null;
            };
            versions: {
                id: string;
                createdAt: Date;
                data: import("@prisma/client/runtime/library").JsonValue;
                workflowId: string;
                versionNumber: number;
                snapshotType: string;
                createdBy: string;
            }[];
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string | null;
            ownerId: string;
            hubspotId: string;
            deletedAt: Date | null;
            isDeleted: boolean;
            restoredAt: Date | null;
        };
        message: string;
    }>;
    update(id: string, updateWorkflowDto: UpdateWorkflowDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string | null;
        ownerId: string;
        hubspotId: string;
        deletedAt: Date | null;
        isDeleted: boolean;
        restoredAt: Date | null;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string | null;
        ownerId: string;
        hubspotId: string;
        deletedAt: Date | null;
        isDeleted: boolean;
        restoredAt: Date | null;
    }>;
    restoreWorkflowVersion(workflowId: string, versionId: string, req: any): Promise<{
        message: string;
        result: any;
    }>;
    rollbackWorkflow(id: string, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    restoreDeletedWorkflow(id: string, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    exportDeletedWorkflow(id: string, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    downloadWorkflowVersion(workflowId: string, versionId: string): Promise<any>;
    compareWorkflowVersions(workflowId: string, versionA: string, versionB: string, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    startWorkflowProtection(body: any, req: any): Promise<{
        success: boolean;
        message: string;
        data: any[];
    }>;
    getWorkflowVersionsByHubspotId(hubspotId: string, req: any): Promise<{
        success: boolean;
        data: any[];
        message: string;
    }>;
    compareWorkflowVersionsByHubspotId(hubspotId: string, versionA: string, versionB: string, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getWorkflowVersions(workflowId: string, req: any): Promise<{
        success: boolean;
        data: any[];
        message: string;
    }>;
    getWorkflowStats(req: any): Promise<any>;
}
