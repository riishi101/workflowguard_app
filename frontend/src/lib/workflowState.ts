import { DashboardWorkflow } from "../types";

// Utility to manage workflow selection state
export const WorkflowState = {
  // Check if user has selected workflows
  hasSelectedWorkflows(): boolean {
    return (
      localStorage.getItem("workflowGuard_hasSelectedWorkflows") === "true"
    );
  },

  // Set workflow selection state
  setWorkflowSelection(hasSelected: boolean): void {
    localStorage.setItem(
      "workflowGuard_hasSelectedWorkflows",
      hasSelected.toString(),
    );
  },

  // Get number of selected workflows
  getSelectedCount(): number {
    const count = localStorage.getItem("workflowGuard_selectedCount");
    return count ? parseInt(count, 10) : 0;
  },

  // Set number of selected workflows
  setSelectedCount(count: number): void {
    localStorage.setItem("workflowGuard_selectedCount", count.toString());
  },

  // Get selected workflows
  getSelectedWorkflows(): DashboardWorkflow[] {
    const workflows = localStorage.getItem("workflowGuard_selectedWorkflows");
    if (!workflows) return [];

    try {
      const parsedWorkflows = JSON.parse(workflows);
      if (Array.isArray(parsedWorkflows)) {
        return parsedWorkflows.filter(workflow => workflow && workflow.id && workflow.name);
      }
    } catch (error) {
      console.error('WorkflowState - Failed to parse selected workflows:', error);
    }

    return [];
  },

  // Set selected workflows
  setSelectedWorkflows(workflows: DashboardWorkflow[]): void {
    localStorage.setItem("workflowGuard_selectedWorkflows", JSON.stringify(workflows));
  },

  // Clear workflow state after successful navigation
  clearAfterNavigation(): void {
    // Only clear if we have workflows (indicating successful setup)
    if (this.hasSelectedWorkflows() && this.getSelectedCount() > 0) {
      console.log('WorkflowState - Clearing state after successful navigation');
      this.reset();
    }
  },

  // Reset all workflow state
  reset(): void {
    localStorage.removeItem("workflowGuard_hasSelectedWorkflows");
    localStorage.removeItem("workflowGuard_selectedCount");
  },
};
