import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import TopNavigation from "@/components/TopNavigation";
import EmptyDashboard from "@/components/EmptyDashboard";
import Footer from "@/components/Footer";
import { WorkflowState } from "@/lib/workflowState";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Download,
  CheckCircle,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
} from "lucide-react";

// Mock data for demonstration
const mockWorkflows = [
  {
    id: "1",
    name: "Customer Onboarding",
    lastSnapshot: "Today, 2:30 PM",
    versions: 12,
    lastModifiedBy: { name: "Sarah Johnson", initials: "SJ" },
    status: "Active",
  },
  {
    id: "2",
    name: "Lead Nurturing - Webinar",
    lastSnapshot: "Today, 2:30 PM",
    versions: 8,
    lastModifiedBy: { name: "Mike Wilson", initials: "MW" },
    status: "Active",
  },
  {
    id: "3",
    name: "Sales Outreach Sequence",
    lastSnapshot: "Today, 2:30 PM",
    versions: 15,
    lastModifiedBy: { name: "Tom Brown", initials: "TB" },
    status: "Active",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [hasWorkflows, setHasWorkflows] = useState(false);
  const [workflows, setWorkflows] = useState(mockWorkflows);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState("all");

  useEffect(() => {
    // Check if user has selected workflows
    setHasWorkflows(WorkflowState.hasSelectedWorkflows());
  }, []);

  // Show empty state if no workflows are selected
  if (!hasWorkflows) {
    return <EmptyDashboard />;
  }

  const handleAddWorkflow = () => {
    // Reset workflow state when going back to selection
    WorkflowState.reset();
    navigate("/workflow-selection");
  };

  const handleViewHistory = (workflowId: string, workflowName: string) => {
    navigate(`/workflow-history/${workflowId}`, {
      state: { workflowName },
    });
  };

  const handleRollbackLatest = (workflow: any) => {
    toast.success(`Rollback initiated for ${workflow.name}`);
  };

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavigation />

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Dashboard Overview
          </h1>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-900">
                All {workflows.length} active workflows are being monitored
              </p>
              <p className="text-xs text-green-700">
                Last Snapshot: Today, 2:30 PM IST
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{workflows.length}</div>
              <div className="text-base text-gray-700 font-medium">Active Workflows</div>
              <div className="text-sm text-gray-500 mt-2">
                +1% from last month
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">99.9%</div>
              <div className="text-sm text-gray-600">Total Uptime</div>
              <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-500" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">500</div>
              <div className="text-sm text-gray-600">Monitored Services</div>
              <div className="text-xs text-gray-500 mt-1">
                Max. plan capacity
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                All Protected Workflows
              </h2>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleAddWorkflow}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Workflow
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          <div className="p-8 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search workflows by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base"
                />
              </div>
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={folderFilter} onValueChange={setFolderFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="HubSpot Folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Folders</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="text-blue-600">
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-8 py-6 text-base font-semibold text-gray-900">
                    Workflow Name
                  </th>
                  <th className="text-left px-8 py-6 text-base font-semibold text-gray-900">
                    Last Snapshot
                  </th>
                  <th className="text-left px-8 py-6 text-base font-semibold text-gray-900">
                    Versions Available
                  </th>
                  <th className="text-left px-8 py-6 text-base font-semibold text-gray-900">
                    Last Modified By
                  </th>
                  <th className="text-left px-8 py-6 text-base font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredWorkflows.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-gray-50">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {workflow.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={workflow.status === "Active" ? "default" : "secondary"}
                              className={
                                workflow.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {workflow.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {workflow.lastSnapshot}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {workflow.versions} versions
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {workflow.lastModifiedBy?.initials || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">
                          {workflow.lastModifiedBy?.name || "Unknown User"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewHistory(workflow.id, workflow.name)}
                          className="text-blue-600"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View History
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRollbackLatest(workflow)}
                          className="text-orange-600"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Rollback
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Rows per page:
              <Select defaultValue="10">
                <SelectTrigger className="w-16 ml-2 inline-flex">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </p>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{filteredWorkflows.length} workflows</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  1
                </Button>
                <Button variant="ghost" size="sm" disabled>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard; 