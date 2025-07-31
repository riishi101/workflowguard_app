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

  // Reset all workflow state
  reset(): void {
    localStorage.removeItem("workflowGuard_hasSelectedWorkflows");
    localStorage.removeItem("workflowGuard_selectedCount");
  },
};
