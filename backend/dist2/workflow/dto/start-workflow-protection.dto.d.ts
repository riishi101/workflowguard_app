export declare class WorkflowDto {
    id: string;
    name: string;
}
export declare class StartWorkflowProtectionDto {
    workflows: WorkflowDto[];
    userId?: string;
}
