// Shared types for the application

export interface DashboardWorkflow {
  id: string;
  name: string;
  versions: number;
  lastModifiedBy: {
    name: string;
    initials: string;
    email: string;
  };
  status: "active" | "inactive" | "error";
  protectionStatus: "protected" | "unprotected" | "error";
  lastModified: string;
}

export interface DashboardStats {
  totalWorkflows: number;
  activeWorkflows: number;
  protectedWorkflows: number;
  totalVersions: number;
  uptime: number;
  lastSnapshot: string;
  planCapacity: number;
  planUsed: number;
}
