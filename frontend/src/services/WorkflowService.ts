// WorkflowService.ts

import { DashboardWorkflow, DashboardStats } from "../types";

class WorkflowService {
  static transformWorkflow(workflow: any, index: number): DashboardWorkflow | null {
    if (!workflow || typeof workflow !== "object") {
      console.warn(`WorkflowService - Skipping invalid workflow at index ${index}:`, workflow);
      return null;
    }

    const { id, name, versions, lastModifiedBy, status, protectionStatus, lastModified } = workflow;

    if (!id || !name) {
      console.warn(`WorkflowService - Workflow missing critical fields at index ${index}:`, { id, name });
      return null;
    }

    return {
      id: id || `unknown-${index}`,
      name: name || "Unnamed Workflow",
      versions: versions || 0,
      lastModifiedBy: lastModifiedBy || {
        name: "Unknown",
        initials: "U",
        email: "unknown@example.com",
      },
      status: (status || "active") as "active" | "inactive" | "error",
      protectionStatus: (protectionStatus || "unprotected") as "protected" | "unprotected" | "error",
      lastModified: lastModified || new Date().toISOString(),
    };
  }

  static filterWorkflows(workflow: DashboardWorkflow | null): boolean {
    if (!workflow) return false;

    if (!workflow.id || !workflow.name) {
      console.warn(`WorkflowService - Workflow missing required properties:`, workflow);
      return false;
    }

    return true;
  }

  static processWorkflows(rawWorkflows: any[]): DashboardWorkflow[] {
    return rawWorkflows
      .map((workflow, index) => this.transformWorkflow(workflow, index))
      .filter(this.filterWorkflows);
  }

  static processStats(rawStats: any): DashboardStats {
    return {
      activeWorkflows: rawStats.activeWorkflows || 0,
      protectedWorkflows: rawStats.protectedWorkflows || 0,
      planUsed: rawStats.planUsed || 0,
      planCapacity: rawStats.planCapacity || 100,
      lastSnapshot: rawStats.lastSnapshot || new Date().toISOString(),
      totalWorkflows: rawStats.totalWorkflows || 0, // Added missing property
      totalVersions: rawStats.totalVersions || 0, // Added missing property
      uptime: rawStats.uptime || 0, // Added missing property
    };
  }
}

export default WorkflowService;
