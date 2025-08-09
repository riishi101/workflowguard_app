import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ApiService } from '@/lib/api';

export function useWorkflowActions() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const setLoading = (workflowId: string, loading: boolean) => {
    setLoadingStates(current => ({
      ...current,
      [workflowId]: loading
    }));
  };

  const handleRollback = useCallback(async (workflowId: string) => {
    setLoading(workflowId, true);
    try {
      const response = await ApiService.rollbackWorkflow(workflowId);
      
      toast({
        title: "Rollback Successful",
        description: response.data?.message || "Workflow has been rolled back successfully.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Rollback Failed",
        description: error.message || "Failed to rollback workflow. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(workflowId, false);
    }
  }, [toast]);

  const handleExport = useCallback(async (workflowId: string) => {
    setLoading(workflowId, true);
    try {
      const response = await ApiService.exportWorkflow(workflowId);
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow-${workflowId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: "Workflow data has been exported successfully.",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export workflow. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(workflowId, false);
    }
  }, [toast]);

  return {
    loadingStates,
    handleRollback,
    handleExport,
    isLoading: (workflowId: string) => loadingStates[workflowId] || false
  };
}
