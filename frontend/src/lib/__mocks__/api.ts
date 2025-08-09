import { vi } from 'vitest';

export const ApiService = {
  getWorkflowDetails: vi.fn(),
  getWorkflowHistory: vi.fn(),
  restoreWorkflowVersion: vi.fn(),
  downloadWorkflowVersion: vi.fn(),
  compareWorkflowVersions: vi.fn()
};

export interface WorkflowVersion {
  id: string;
  versionNumber: string;
  dateTime: string;
  modifiedBy: {
    name: string;
    initials: string;
  };
  changeSummary: string;
  type: string;
  status: string;
}
