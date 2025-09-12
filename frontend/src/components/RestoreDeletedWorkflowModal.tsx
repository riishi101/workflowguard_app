import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

interface RestoreDeletedWorkflowModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  workflow: {
    id: string;
    name: string;
    deletedAt?: string;
  } | null;
  loading: boolean;
}

export const RestoreDeletedWorkflowModal: React.FC<RestoreDeletedWorkflowModalProps> = ({
  open,
  onClose,
  onConfirm,
  workflow,
  loading,
}) => {
  if (!workflow) return null;


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-green-600" />
            Restore Deleted Workflow
          </DialogTitle>
          <DialogDescription>
            This workflow was deleted from your HubSpot account. You can restore it using the latest backup.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">Important Notes:</p>
                <ul className="text-yellow-700 space-y-1 list-disc list-inside">
                  <li>The restored workflow will be created as a new workflow in HubSpot</li>
                  <li>It will start in a disabled state for safety</li>
                  <li>You may need to reconfigure any integrations or dependencies</li>
                  <li>The workflow will use the latest backup data available</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Workflow Name:</label>
              <p className="text-sm text-gray-900 mt-1">{workflow.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <p className="text-sm text-red-600 mt-1">Deleted from HubSpot</p>
            </div>
            {workflow.deletedAt && (
              <div>
                <label className="text-sm font-medium text-gray-700">Deleted At:</label>
                <p className="text-sm text-gray-900 mt-1">{new Date(workflow.deletedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Restoring...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Restore Workflow
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
