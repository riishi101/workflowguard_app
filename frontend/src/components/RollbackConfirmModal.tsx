import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface RollbackConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  workflowName: string;
  versionNumber: number;
}

const RollbackConfirmModal = ({
  open,
  onClose,
  onConfirm,
  workflowName,
  versionNumber,
}: RollbackConfirmModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0">
        <VisuallyHidden>
          <DialogTitle>Confirm Workflow Rollback</DialogTitle>
          <DialogDescription>
            Are you sure you want to rollback this workflow to version {versionNumber}? This action cannot be undone.
          </DialogDescription>
        </VisuallyHidden>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Rollback Workflow
          </h2>
              <p className="text-sm text-gray-600">
                This will restore {workflowName} to version {versionNumber}
              </p>
            </div>
        </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-orange-900 font-medium mb-1">
                  Warning: This action cannot be undone
                </p>
                <p className="text-sm text-orange-800">
                  Rolling back will replace the current workflow configuration with
                  the selected version. All changes made after version {versionNumber} will be lost.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RotateCcw className="w-4 h-4" />
              <span>Current version will be archived</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RotateCcw className="w-4 h-4" />
              <span>Workflow will be temporarily paused</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RotateCcw className="w-4 h-4" />
              <span>Rollback will be logged in audit trail</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Confirm Rollback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RollbackConfirmModal;
