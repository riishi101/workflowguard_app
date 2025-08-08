import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Mail, Clock, Zap, User, FileText, Calendar } from "lucide-react";
import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ViewDetailsModalProps {
  open: boolean;
  onClose: () => void;
  version: any;
}

const ViewDetailsModal = ({
  open,
  onClose,
  version,
}: ViewDetailsModalProps) => {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    overview: true,
    changes: true,
    metadata: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!version) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto p-0" aria-describedby="view-details-modal-desc">
        <VisuallyHidden>
          <DialogTitle>Workflow Version Details</DialogTitle>
        </VisuallyHidden>

        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4" id="view-details-modal-desc">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Version {version.versionNumber} Details
            </h2>
            <p className="text-sm text-gray-600">
              {new Date(version.dateTime).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })} by {version.modifiedBy?.name || 'Unknown User'}
            </p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Overview Section */}
          <div>
            <button
              onClick={() => toggleSection('overview')}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Overview
              </h3>
              {expandedSections.overview ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSections.overview && (
              <div className="mt-4 grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Version Number
                    </label>
                    <p className="text-sm text-gray-900 font-medium">{version.versionNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Type
                    </label>
                    <Badge className="mt-1">
                      {version.type}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Modified By
                    </label>
                    <p className="text-sm text-gray-900">{version.modifiedBy?.name || 'Unknown User'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Created Date
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(version.dateTime).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Status
                    </label>
                    <Badge className={`mt-1 ${
                      version.status === 'current' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {version.status === 'current' ? 'Current' : 'Archived'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Changes Section */}
          <div>
            <button
              onClick={() => toggleSection('changes')}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Changes Summary
              </h3>
              {expandedSections.changes ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSections.changes && (
              <div className="mt-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {version.changeSummary || 'No change details available for this version.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Metadata Section */}
          <div>
            <button
              onClick={() => toggleSection('metadata')}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Technical Details
              </h3>
              {expandedSections.metadata ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSections.metadata && (
              <div className="mt-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Version ID:</span>
                    <span className="font-mono text-gray-900">{version.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">
                      {new Date(version.dateTime).toISOString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="text-gray-900">{version.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-gray-900">{version.status}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDetailsModal;
