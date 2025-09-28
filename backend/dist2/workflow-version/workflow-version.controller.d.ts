import { WorkflowVersionService } from './workflow-version.service';
import { CreateWorkflowVersionDto } from './dto/create-workflow-version.dto';
export declare class WorkflowVersionController {
    private readonly workflowVersionService;
    constructor(workflowVersionService: WorkflowVersionService);
    create(createWorkflowVersionDto: CreateWorkflowVersionDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateWorkflowVersionDto: any): Promise<any>;
    remove(id: string): Promise<any>;
    getWorkflowHistoryByHubspotId(hubspotId: string, req: any): Promise<{
        success: boolean;
        data: any[];
        message: string;
    }>;
    getWorkflowHistory(workflowId: string, req: any): Promise<any[]>;
}
