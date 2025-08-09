import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { io } from 'socket.io-client';
import { API_URL } from '@/lib/config';

interface UseWorkflowsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useWorkflows(options: UseWorkflowsOptions = {}) {
  const { autoRefresh = true, refreshInterval = 30000 } = options;
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchWorkflows = useCallback(async (showToast = false) => {
    try {
      const response = await ApiService.getProtectedWorkflows();
      
      if (response.success && response.data) {
        setWorkflows(response.data);
        if (showToast) {
          toast({
            title: "Workflows Updated",
            description: "Your workflow list has been refreshed.",
          });
        }
      }
    } catch (err) {
      setError(err.message);
      toast({
        title: "Update Failed",
        description: "Failed to refresh workflows. Will retry automatically.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Set up WebSocket connection
  useEffect(() => {
    let socket: any;
    try {
      socket = io(API_URL, {
        path: '/socket.io',
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on('connect_error', (error: any) => {
        console.error('Socket connection error:', error);
        // Don't show error toast for connection issues - gracefully degrade to polling
      });

      socket.on('workflow:update', (updatedWorkflow: any) => {
        setWorkflows(current => 
          current.map(w => w.id === updatedWorkflow.id ? { ...w, ...updatedWorkflow } : w)
        );
      });

      socket.on('workflow:version', ({ workflowId, version }: any) => {
        setWorkflows(current => 
          current.map(w => w.id === workflowId ? { ...w, versions: [...(w.versions || []), version] } : w)
        );
      });
    } catch (err) {
      console.error('Failed to initialize WebSocket:', err);
      // Don't show error toast - gracefully degrade to polling
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Set up auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchWorkflows(false);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchWorkflows]);

  // Initial fetch
  useEffect(() => {
    fetchWorkflows(false);
  }, [fetchWorkflows]);

  return {
    workflows,
    loading,
    error,
    refetch: fetchWorkflows,
  };
}
