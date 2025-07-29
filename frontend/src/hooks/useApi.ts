import { useState, useCallback } from 'react';
import { ApiService, ApiResponse } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useApi<T>(
  apiCall: (...args: any[]) => Promise<ApiResponse<T>>,
  immediate: boolean = false
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const response = await apiCall(...args);
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        setState({
          data: null,
          loading: false,
          error: error.response?.data?.message || error.message || 'An error occurred',
        });
      }
    },
    [apiCall]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Specific hooks for common API operations
export function useWorkflows() {
  return useApi(ApiService.getWorkflows);
}

export function useWorkflow(id: string) {
  return useApi(() => ApiService.getWorkflow(id));
}

export function useCurrentUser() {
  return useApi(ApiService.getCurrentUser);
}

export function useAuditLogs() {
  return useApi(ApiService.getAuditLogs);
}

export function useAnalytics() {
  return useApi(() => ApiService.getAnalytics());
}

export function useWebhooks() {
  return useApi(ApiService.getWebhooks);
}

export function useSubscription() {
  return useApi(ApiService.getSubscription);
} 