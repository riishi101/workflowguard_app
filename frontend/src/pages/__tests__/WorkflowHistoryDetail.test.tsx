/// <reference types="vitest/globals" />
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { ApiService } from '@/lib/api';
import WorkflowHistoryDetail from '../WorkflowHistoryDetail';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
vi.mock('@/lib/api');
vi.mock('@/hooks/use-toast');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ workflowId: 'test-workflow-id' }),
    useNavigate: () => vi.fn(),
  };
});

const mockWorkflowDetails = {
  id: 'test-workflow-id',
  name: 'Test Workflow',
  status: 'active',
  lastModified: '2025-08-09T10:00:00Z',
  totalVersions: 3,
  hubspotUrl: 'https://app.hubspot.com/workflows/test'
};

const mockVersions = [
  {
    id: 'v1',
    versionNumber: 1,
    dateTime: '2025-08-09T10:00:00Z',
    modifiedBy: {
      name: 'John Doe',
      initials: 'JD'
    },
    changeSummary: 'Initial version',
    type: 'Manual Save',
    status: 'current'
  },
  {
    id: 'v2',
    versionNumber: 2,
    dateTime: '2025-08-09T09:00:00Z',
    modifiedBy: {
      name: 'Jane Smith',
      initials: 'JS'
    },
    changeSummary: 'Updated workflow',
    type: 'Auto Backup',
    status: 'archived'
  }
];

describe('WorkflowHistoryDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock API responses
    vi.mocked(ApiService.getWorkflowDetails).mockResolvedValue({ 
      success: true,
      data: mockWorkflowDetails 
    });
    
    vi.mocked(ApiService.getWorkflowHistory).mockResolvedValue({ 
      success: true,
      data: mockVersions.map(v => ({
        ...v,
        workflowId: 'test-workflow-id',
        date: v.dateTime,
        initiator: v.modifiedBy.name,
        notes: v.changeSummary,
        changes: {
          added: 0,
          modified: 1,
          removed: 0
        }
      }))
    });

    // Mock useToast
    vi.mocked(useToast).mockReturnValue({
      toast: vi.fn().mockReturnValue({ 
        id: 'test-toast-id',
        dismiss: vi.fn(),
        update: vi.fn()
      }),
      dismiss: vi.fn(),
      toasts: []
    });
  });

  it('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <WorkflowHistoryDetail />
      </BrowserRouter>
    );

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('fetches and displays workflow details and versions', async () => {
    render(
      <BrowserRouter>
        <WorkflowHistoryDetail />
      </BrowserRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Workflow')).toBeInTheDocument();
    });

    // Check workflow details
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('3 versions')).toBeInTheDocument();

    // Check versions list
    expect(screen.getByText('Version 1.0')).toBeInTheDocument();
    expect(screen.getByText('Version 2.0')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    render(
      <BrowserRouter>
        <WorkflowHistoryDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Workflow')).toBeInTheDocument();
    });

    // Search for specific version
    const searchInput = screen.getByPlaceholderText(/search versions/i);
    fireEvent.change(searchInput, { target: { value: 'Initial version' } });

    // Should only show matching version
    expect(screen.getByText('Initial version')).toBeInTheDocument();
    expect(screen.queryByText('Updated workflow')).not.toBeInTheDocument();
  });

  it('handles version download', async () => {
    vi.mocked(ApiService.downloadWorkflowVersion).mockResolvedValue({
      success: true,
      data: { content: 'test-content' }
    });

    render(
      <BrowserRouter>
        <WorkflowHistoryDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Workflow')).toBeInTheDocument();
    });

    // Click download button
    const downloadButtons = screen.getAllByText('Download');
    fireEvent.click(downloadButtons[0]);

    // Should call download API
    expect(ApiService.downloadWorkflowVersion).toHaveBeenCalledWith('test-workflow-id', 'v1');
  });

  it('handles version rollback', async () => {
    vi.mocked(ApiService.restoreWorkflowVersion).mockResolvedValue({
      success: true,
      data: { message: 'Restored successfully' }
    });

    render(
      <BrowserRouter>
        <WorkflowHistoryDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Workflow')).toBeInTheDocument();
    });

    // Click rollback button
    const rollbackButtons = screen.getAllByText('Rollback');
    fireEvent.click(rollbackButtons[0]);

    // Confirm rollback
    const confirmButton = screen.getByText('Confirm Rollback');
    fireEvent.click(confirmButton);

    // Should call rollback API
    expect(ApiService.restoreWorkflowVersion).toHaveBeenCalledWith('test-workflow-id', 'v1');
  });

  it('handles compare mode', async () => {
    render(
      <BrowserRouter>
        <WorkflowHistoryDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Workflow')).toBeInTheDocument();
    });

    // Enter compare mode
    const compareButton = screen.getByText('Compare Mode');
    fireEvent.click(compareButton);

    // Select versions
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    // Compare button should appear
    const compareSelectedButton = screen.getByText('Compare Selected');
    expect(compareSelectedButton).toBeInTheDocument();
  });

  it('handles errors gracefully', async () => {
    // Mock API error
    vi.mocked(ApiService.getWorkflowDetails).mockRejectedValue(new Error('Failed to load'));

    render(
      <BrowserRouter>
        <WorkflowHistoryDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });
  });

  it('handles empty state', async () => {
    // Mock empty response
    vi.mocked(ApiService.getWorkflowHistory).mockResolvedValue({
      success: true,
      data: []
    });

    render(
      <BrowserRouter>
        <WorkflowHistoryDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No Versions Found')).toBeInTheDocument();
    });
  });

  it('handles view details modal', async () => {
    render(
      <BrowserRouter>
        <WorkflowHistoryDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Workflow')).toBeInTheDocument();
    });

    // Click view details button
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);

    // Modal should show version details
    expect(screen.getByText('Version Details')).toBeInTheDocument();
    expect(screen.getByText('Initial version')).toBeInTheDocument();
  });
});
