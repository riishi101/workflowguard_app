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
import { WorkflowState } from "@/lib/workflowState";
import { toast } from "sonner";
import {
  MoreHorizontal,
  ExternalLink,
  Eye,
  RotateCcw,
  Download,
  Copy,
} from "lucide-react";

// Mock data for demonstration
const mockVersions = [
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
    date: "June 19, 2025, 3:30 PM IST",
    type: "Daily Backup",
    initiator: "System",
    notes: "No notes available",
    selected: false,
  },
  {
    id: "3",
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
  const [versions, setVersions] = useState(mockVersions);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  useEffect(() => {
    // Check if user has selected workflows
    setHasWorkflows(WorkflowState.hasSelectedWorkflows());
  }, []);

  // Show empty state if no workflows are selected
  if (!hasWorkflows) {
    return <EmptyWorkflowHistory />;
  }

  const handleVersionToggle = (versionId: string) => {
    setSelectedVersions((prev) =>
      prev.includes(versionId)
        ? prev.filter((id) => id !== versionId)
        : [...prev, versionId]
    );
  };

  const handleCompareVersions = () => {
    if (selectedVersions.length === 2) {
      navigate(
        `/compare-versions?versionA=${selectedVersions[0]}&versionB=${selectedVersions[1]}`,
      );
    } else {
      toast.error('Please select exactly 2 versions to compare');
    }
  };

  const handleViewDetails = (version: any) => {
    toast.info(`Viewing details for version ${version.id}`);
  };

  const handleCreateNew = (version: any) => {
    toast.info(`Creating new workflow from version ${version.id}`);
  };

  const handleRestore = (version: any) => {
    toast.success(`Restoring to version ${version.id}`);
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
                          checked={selectedVersions.includes(version.id)}
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
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="default">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleCreateNew(version)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Create New from This Version
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRestore(version)}>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Restore to This Version
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download Version
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center">
                      <div className="text-gray-500">
                        No workflow history available
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedVersions.length} versions selected
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompareVersions}
                disabled={selectedVersions.length !== 2}
                className={selectedVersions.length === 2 ? "text-blue-600" : "text-gray-400"}
              >
                Compare Selected Versions
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WorkflowHistory; 