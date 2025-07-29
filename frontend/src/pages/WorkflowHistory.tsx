import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import EmptyWorkflowHistory from "@/components/EmptyWorkflowHistory";
import ViewDetailsModal from "@/components/ViewDetailsModal";
import CreateNewWorkflowModal from "@/components/CreateNewWorkflowModal";
import RestoreVersionModal from "@/components/RestoreVersionModal";
import { WorkflowState } from "@/lib/workflowState";
import {
  MoreHorizontal,
  ExternalLink,
  Eye,
  RotateCcw,
  Download,
  Copy,
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
  const [hasWorkflows, setHasWorkflows] = useState(false);
  const [versions, setVersions] = useState(workflowVersions);
  const [showViewDetails, setShowViewDetails] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);

  useEffect(() => {
    setHasWorkflows(WorkflowState.hasSelectedWorkflows());
  }, []);

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
          if (version.selected) {
            return { ...version, selected: false };
          }
          if (currentSelected.length < 2) {
            return { ...version, selected: true };
          }
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

  const headerActions = (
    <Button variant="outline" size="sm" className="text-blue-600">
      <ExternalLink className="w-4 h-4 mr-2" />
      Go to Workflow in HubSpot
    </Button>
  );

  return (
    <MainAppLayout 
      title="Workflow History"
      headerActions={headerActions}
    >
      {/* Workflow Info */}
      <ContentSection>
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
      </ContentSection>

      {/* Versions Table */}
      <ContentSection>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-6 py-3"></th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Date & Time
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Type
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Initiator
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Notes
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {versions.map((version) => (
                  <tr key={version.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={version.selected}
                        onCheckedChange={() => handleVersionToggle(version.id)}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {version.date}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className={getTypeColor(version.type)}
                      >
                        {version.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span>👤</span>
                        <span>{version.initiator}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(version)}
                          className="text-blue-600"
                        >
                          View Details
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(version)}
                            >
                              <Eye className="w-4 h-4 mr-3" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRestore(version)}
                            >
                              <RotateCcw className="w-4 h-4 mr-3" />
                              Restore this Version
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-3" />
                              Download Workflow JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCreateNew(version)}
                            >
                              <Copy className="w-4 h-4 mr-3" />
                              Set as Base for New Workflow
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
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
      </ContentSection>

      {/* Modals */}
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
    </MainAppLayout>
  );
};

export default WorkflowHistory;
