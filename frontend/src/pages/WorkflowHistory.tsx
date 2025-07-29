import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TopNavigation from "@/components/TopNavigation";
import Footer from "@/components/Footer";
import EmptyWorkflowHistory from "@/components/EmptyWorkflowHistory";
import ViewDetailsModal from "@/components/ViewDetailsModal";
import CreateNewWorkflowModal from "@/components/CreateNewWorkflowModal";
import RestoreVersionModal from "@/components/RestoreVersionModal";
import { WorkflowState } from "@/lib/workflowState";
import { useWorkflowHistory, useDeleteWorkflowVersion } from "@/hooks/useWorkflowVersions";
import { toast } from "sonner";
import {
  MoreHorizontal,
  ExternalLink,
  Eye,
  RotateCcw,
  Download,
  Copy,
  Loader2,
} from "lucide-react";

const workflowVersions = [
  {
    id: "1",
    date: "June 20, 2025, 10:00 AM IST",
    type: "On-Publish Save",
    initiator: "John Doe",
    notes: "Refactored email content to align with Q2 campaign",
    selected: false,
  },
  {
    id: "2",
    date: "June 20, 2025, 10:00 AM IST",
    type: "On-Publish Save",
    initiator: "John Doe",
    notes: "Refactored email content to align with Q2 campaign",
    selected: false,
  },
  {
    id: "3",
    date: "June 19, 2025, 3:30 PM IST",
    type: "Daily Backup",
    initiator: "System",
    notes: "No notes available",
    selected: false,
  },
  {
    id: "4",
    date: "June 18, 2025, 11:45 AM IST",
    type: "Manual Snapshot",
    initiator: "Jane Smith",
    notes: "Added new welcome email sequence",
    selected: false,
  },
  {
    id: "5",
    date: "June 18, 2025, 11:45 AM IST",
    type: "Manual Snapshot",
    initiator: "Jane Smith",
    notes: "Added new welcome email sequence",
    selected: false,
  },
  {
    id: "6",
    date: "June 18, 2025, 11:45 AM IST",
    type: "Manual Snapshot",
    initiator: "Jane Smith",
    notes: "Added new welcome email sequence",
    selected: false,
  },
];

const WorkflowHistory = () => {
  const navigate = useNavigate();
  const { workflowId } = useParams<{ workflowId: string }>();
  const [hasWorkflows, setHasWorkflows] = useState(false);
  const [showViewDetails, setShowViewDetails] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);

  // API hooks
  const { data: versions = [], isLoading, error } = useWorkflowHistory(workflowId || '');
  const deleteVersionMutation = useDeleteWorkflowVersion();

  useEffect(() => {
    // Check if user has selected workflows
    setHasWorkflows(WorkflowState.hasSelectedWorkflows());
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading workflow history...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load workflow history</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Show empty state if no workflows are selected
  if (!hasWorkflows) {
    return <EmptyWorkflowHistory />;
  }

  const selectedCount = versions.filter((v) => v.selected).length;
  const selectedVersions = versions.filter((v) => v.selected);

  const handleCompareVersions = () => {
    if (selectedCount === 2) {
      navigate(
        `/compare-versions?versionA=${selectedVersions[0].id}&versionB=${selectedVersions[1].id}`,
      );
    }
  };

  const handleVersionToggle = (versionId: string) => {
    setVersions((prev) => {
      const currentSelected = prev.filter((v) => v.selected);

      return prev.map((version) => {
        if (version.id === versionId) {
          // If trying to unselect, allow it
          if (version.selected) {
            return { ...version, selected: false };
          }
          // If trying to select and less than 2 are selected, allow it
          if (currentSelected.length < 2) {
            return { ...version, selected: true };
          }
          // If 2 are already selected, don't allow more
          return version;
        }
        return version;
      });
    });
  };

  const handleViewDetails = (version: any) => {
    setSelectedVersion(version);
    setShowViewDetails(true);
  };

  const handleCreateNew = (version: any) => {
    setSelectedVersion(version);
    setShowCreateNew(true);
  };

  const handleRestore = (version: any) => {
    setSelectedVersion(version);
    setShowRestore(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "On-Publish Save":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Manual Snapshot":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "Daily Backup":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavigation />

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Workflow History
          </h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  Customer Onboarding
                </h2>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Active</span>
                </div>
                <span className="text-sm text-gray-500">ID: a1b2c304</span>
              </div>
            </div>

            <Button variant="outline" size="sm" className="text-blue-600">
              <ExternalLink className="w-4 h-4 mr-2" />
              Go to Workflow in HubSpot
            </Button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-16 px-8 py-6"></th>
                  <th className="text-left px-8 py-6 text-base font-semibold text-gray-900">
                    Date & Time
                  </th>
                  <th className="text-left px-8 py-6 text-base font-semibold text-gray-900">
                    Type
                  </th>
                  <th className="text-left px-8 py-6 text-base font-semibold text-gray-900">
                    Initiator
                  </th>
                  <th className="text-left px-8 py-6 text-base font-semibold text-gray-900">
                    Notes
                  </th>
                  <th className="text-left px-8 py-6 text-base font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {versions.length > 0 ? (
                  versions.map((version) => (
                  <tr key={version.id} className="hover:bg-gray-50">
                      <td className="px-8 py-6">
                      <Checkbox
                        checked={version.selected}
                        onCheckedChange={() => handleVersionToggle(version.id)}
                      />
                    </td>
                      <td className="px-8 py-6 text-base text-gray-900">
                      {version.date}
                    </td>
                      <td className="px-8 py-6">
                      <Badge
                        variant="secondary"
                        className={getTypeColor(version.type)}
                      >
                        {version.type}
                      </Badge>
                    </td>
                      <td className="px-8 py-6 text-base text-gray-600">
                        <div className="flex items-center gap-2">
                        <span>👤</span>
                        <span>{version.initiator}</span>
                      </div>
                    </td>
                      <td className="px-8 py-6 text-base text-gray-600">
                        <div className="flex items-center gap-2">
                        <span>📝</span>
                        <span
                          className={
                            version.notes === "No notes available"
                              ? "italic"
                              : ""
                          }
                        >
                          {version.notes}
                        </span>
                      </div>
                    </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                            size="default"
                          onClick={() => handleViewDetails(version)}
                          className="text-blue-600"
                        >
                          View Details
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="default">
                                <MoreHorizontal className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(version)}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleCreateNew(version)}
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Create New from This
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleRestore(version)}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Restore This Version
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No workflow history yet
                          </h3>
                          <p className="text-gray-600 max-w-md">
                            When you make changes to this workflow, we'll automatically save versions here for you to track and restore.
                          </p>
                        </div>
                        <Button variant="outline" className="mt-4">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Go to Workflow in HubSpot
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selectedCount > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                ✓ {selectedCount} versions selected
                {selectedCount === 1 && " (select 1 more to compare)"}
                {selectedCount === 2 && " (ready to compare)"}
              </p>
              <Button
                onClick={handleCompareVersions}
                disabled={selectedCount !== 2}
                className="bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Compare Selected Versions
              </Button>
            </div>
          )}
        </div>
      </main>

      <ViewDetailsModal
        open={showViewDetails}
        onClose={() => setShowViewDetails(false)}
        version={selectedVersion}
      />

      <CreateNewWorkflowModal
        open={showCreateNew}
        onClose={() => setShowCreateNew(false)}
        version={selectedVersion}
      />

      <RestoreVersionModal
        open={showRestore}
        onClose={() => setShowRestore(false)}
        version={selectedVersion}
      />

      <Footer />
    </div>
  );
};

export default WorkflowHistory;
