import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { 
  Calendar, 
  User, 
  FileText, 
  ArrowLeft, 
  ArrowRight,
  Download,
  Eye,
  History,
  RotateCcw
} from "lucide-react";

interface ViewDetailsModalProps {
  open: boolean;
  onClose: () => void;
  workflow: any;
  version: any;
}

const ViewDetailsModal = ({
  open,
  onClose,
  workflow,
  version,
}: ViewDetailsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto p-0">
        <VisuallyHidden>
          <DialogTitle>Workflow Version Details</DialogTitle>
          <DialogDescription>
            View detailed information about this workflow version including changes, metadata, and actions.
          </DialogDescription>
        </VisuallyHidden>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
                {workflow?.name || "Workflow Details"}
            </h2>
            <p className="text-sm text-gray-600">
                Version {version?.versionNumber || "Latest"}
            </p>
          </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Close
            </Button>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Version Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Version Number:</span>
                    <Badge variant="secondary">
                      {version?.versionNumber || "Latest"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Snapshot Type:</span>
                    <span className="text-sm text-gray-900">
                      {version?.snapshotType || "Manual"}
                    </span>
                </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created By:</span>
                    <span className="text-sm text-gray-900">
                      {version?.createdBy || "System"}
                    </span>
                </div>
                </div>
              </div>

                <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Timestamps
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Created: {version?.createdAt || "Unknown"}
                    </span>
                </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Modified: {workflow?.updatedAt || "Unknown"}
                    </span>
                </div>
              </div>
            </div>
          </div>

            <div className="space-y-4">
          <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Workflow Status
            </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Folder:</span>
                    <span className="text-sm text-gray-900">
                      {workflow?.folder || "Sales Automation"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Versions:</span>
                    <span className="text-sm text-gray-900">
                      {workflow?.versions?.length || 1}
                    </span>
                  </div>
                        </div>
                      </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Actions
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    View Raw JSON
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export Version
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <History className="w-4 h-4 mr-2" />
                    Compare with Previous
                  </Button>
                  </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Version Data Preview
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Workflow Configuration
                </span>
                <Badge variant="outline" className="text-xs">
                  {version?.data ? "JSON" : "No Data"}
                </Badge>
              </div>
              
              {version?.data ? (
                <ScrollArea className="h-32">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(version.data, null, 2)}
                  </pre>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No version data available
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                This version was created automatically
              </span>
              </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous Version
              </Button>
              <Button variant="outline" size="sm">
                Next Version
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDetailsModal;
