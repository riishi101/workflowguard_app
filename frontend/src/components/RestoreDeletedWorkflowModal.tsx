import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { ApiService } from '../lib/api';
import { toast } from 'sonner';

interface RestoreDeletedWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: {
    id: string;
    name: string;
    hubspotId: string;
  };
  onSuccess?: () => void;
}

export const RestoreDeletedWorkflowModal: React.FC<RestoreDeletedWorkflowModalProps> = ({
  isOpen,
  onClose,
  workflow,
  onSuccess,
}) => {
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const response = await ApiService.restoreDeletedWorkflow(workflow.id);
      
      if (response.success) {
        toast.success('Workflow restored successfully!', {
          description: `${workflow.name} has been recreated in your HubSpot account.`,
        });
        onSuccess?.();
        onClose();
      } else {
        throw new Error(response.message || 'Failed to restore workflow');
      }
    } catch (error: any) {
      console.error('Error restoring deleted workflow:', error);
      toast.error('Failed to restore workflow', {
        description: error.message || 'An unexpected error occurred while restoring the workflow.',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            Restore Deleted Workflow
          </DialogTitle>
          <DialogDescription>
            This workflow was deleted from HubSpot but WorkflowGuard has preserved its backup data.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">Important Information</p>
                <ul className="text-amber-700 space-y-1">
                  <li>• This will recreate the workflow in your HubSpot account</li>
                  <li>• The workflow will be restored with its latest backup data</li>
                  <li>• It will start in a disabled state for safety</li>
                  <li>• You can enable it manually after reviewing the configuration</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Workflow Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{workflow.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Original HubSpot ID:</span>
                <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                  {workflow.hubspotId}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isRestoring}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRestore}
            disabled={isRestoring}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRestoring ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Restoring...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Restore Workflow
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
