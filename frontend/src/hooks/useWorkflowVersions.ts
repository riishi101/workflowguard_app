import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ApiService, { WorkflowVersion, CreateWorkflowVersionDto } from '@/services/api';

// Query keys for workflow versions
export const workflowVersionKeys = {
  all: ['workflow-versions'] as const,
  lists: () => [...workflowVersionKeys.all, 'list'] as const,
  list: (workflowId: string) => [...workflowVersionKeys.lists(), workflowId] as const,
  details: () => [...workflowVersionKeys.all, 'detail'] as const,
  detail: (id: string) => [...workflowVersionKeys.details(), id] as const,
  history: (workflowId: string) => [...workflowVersionKeys.all, 'history', workflowId] as const,
  latest: (workflowId: string) => [...workflowVersionKeys.all, 'latest', workflowId] as const,
};

// Hook for fetching workflow versions
export const useWorkflowVersions = (workflowId?: string) => {
  return useQuery({
    queryKey: workflowVersionKeys.list(workflowId || 'all'),
    queryFn: () => ApiService.getWorkflowVersions(workflowId),
    enabled: !!workflowId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for fetching workflow history
export const useWorkflowHistory = (workflowId: string) => {
  return useQuery({
    queryKey: workflowVersionKeys.history(workflowId),
    queryFn: () => ApiService.getWorkflowHistory(workflowId),
    enabled: !!workflowId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for fetching latest workflow version
export const useLatestWorkflowVersion = (workflowId: string) => {
  return useQuery({
    queryKey: workflowVersionKeys.latest(workflowId),
    queryFn: () => ApiService.getLatestWorkflowVersion(workflowId),
    enabled: !!workflowId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Hook for fetching a single workflow version
export const useWorkflowVersion = (id: string) => {
  return useQuery({
    queryKey: workflowVersionKeys.detail(id),
    queryFn: () => ApiService.getWorkflowVersionById(id),
    enabled: !!id,
  });
};

// Hook for creating a workflow version
export const useCreateWorkflowVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (version: CreateWorkflowVersionDto) => ApiService.createWorkflowVersion(version),
    onSuccess: (data) => {
      // Invalidate versions for this workflow
      queryClient.invalidateQueries({ queryKey: workflowVersionKeys.list(data.workflowId) });
      queryClient.invalidateQueries({ queryKey: workflowVersionKeys.history(data.workflowId) });
      queryClient.invalidateQueries({ queryKey: workflowVersionKeys.latest(data.workflowId) });
    },
  });
};

// Hook for deleting a workflow version
export const useDeleteWorkflowVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => ApiService.deleteWorkflowVersion(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: workflowVersionKeys.detail(id) });
      // Invalidate versions list (we'll need to get the workflowId from the deleted version)
      queryClient.invalidateQueries({ queryKey: workflowVersionKeys.lists() });
    },
  });
};

// Hook for comparing versions
export const useCompareVersions = (version1Id: string, version2Id: string) => {
  return useQuery({
    queryKey: ['compare-versions', version1Id, version2Id],
    queryFn: () => ApiService.compareVersions(version1Id, version2Id),
    enabled: !!version1Id && !!version2Id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 