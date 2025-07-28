import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ApiService, { Workflow, CreateWorkflowDto } from '@/services/api';

// Query keys
export const workflowKeys = {
  all: ['workflows'] as const,
  lists: () => [...workflowKeys.all, 'list'] as const,
  list: (filters: string) => [...workflowKeys.lists(), { filters }] as const,
  details: () => [...workflowKeys.all, 'detail'] as const,
  detail: (id: string) => [...workflowKeys.details(), id] as const,
};

// Hook for fetching workflows
export const useWorkflows = (ownerId?: string) => {
  return useQuery({
    queryKey: workflowKeys.list(ownerId || 'all'),
    queryFn: () => ApiService.getWorkflows(ownerId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching a single workflow
export const useWorkflow = (id: string) => {
  return useQuery({
    queryKey: workflowKeys.detail(id),
    queryFn: () => ApiService.getWorkflowById(id),
    enabled: !!id,
  });
};

// Hook for creating a workflow
export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (workflow: CreateWorkflowDto) => ApiService.createWorkflow(workflow),
    onSuccess: () => {
      // Invalidate and refetch workflows
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
    },
  });
};

// Hook for updating a workflow
export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Workflow> }) =>
      ApiService.updateWorkflow(id, updates),
    onSuccess: (data) => {
      // Update the specific workflow in cache
      queryClient.setQueryData(workflowKeys.detail(data.id), data);
      // Invalidate workflows list
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
    },
  });
};

// Hook for deleting a workflow
export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => ApiService.deleteWorkflow(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: workflowKeys.detail(id) });
      // Invalidate workflows list
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
    },
  });
};

// Hook for rolling back a workflow
export const useRollbackWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workflowId, versionId }: { workflowId: string; versionId: string }) =>
      ApiService.rollbackWorkflow(workflowId, versionId),
    onSuccess: (data, { workflowId }) => {
      // Invalidate workflow and its versions
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(workflowId) });
      queryClient.invalidateQueries({ queryKey: ['workflow-versions', workflowId] });
    },
  });
}; 