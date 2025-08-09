import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Loader2 } from "lucide-react";

interface RollbackConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  version: {
    id: string;
    versionNumber: string | number;
    dateTime: string;
    modifiedBy: {
      name: string;
      initials: string;
    };
    changeSummary: string;
    type: string;
    status: string;
  } | null;
  loading?: boolean;
}

const RollbackConfirmModal = ({
  open,
  onClose,
  onConfirm,
  version,
  loading = false
}: RollbackConfirmModalProps) => {
  if (!version) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Confirm Rollback
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 mb-1">
                  Warning: This will permanently change your workflow
                </p>
                <p className="text-orange-700">
                  Rolling back to version {version.versionNumber} will revert all changes made after this version. 
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Version Details</h4>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">{version.versionNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{version.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created By:</span>
                  <span className="font-medium">{version.modifiedBy.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(version.dateTime).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">What will happen</h4>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm text-gray-600">
                <p>• The workflow will be reverted to its latest saved version</p>
                <p>• Any unsaved changes will be lost</p>
                <p>• The rollback will be logged in the audit trail</p>
                <p>• You can view the rollback history in the workflow details</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Rolling Back...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Rollback Workflow
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RollbackConfirmModal;
