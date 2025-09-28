import { Request } from 'express';
import { WorkflowService } from '../workflow/workflow.service';
export declare class DashboardController {
    private readonly workflowService;
    constructor(workflowService: WorkflowService);
    getDashboardStats(req: Request): Promise<any>;
}
