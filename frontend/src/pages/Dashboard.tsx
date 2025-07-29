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
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import EmptyDashboard from "@/components/EmptyDashboard";
import RollbackConfirmModal from "@/components/RollbackConfirmModal";
import { WorkflowState } from "@/lib/workflowState";
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

const workflows = [
  {
    id: "1",
    name: "Customer Onboarding",
    lastSnapshot: "Today, 2:30 PM",
    versions: 12,
    lastModifiedBy: { name: "Sarah Johnson", initials: "SJ" },
    link: "#",
  },
  {
    id: "2",
    name: "Lead Nurturing - Webinar",
    lastSnapshot: "Today, 2:30 PM",
    versions: 8,
    lastModifiedBy: { name: "Mike Wilson", initials: "MW" },
    link: "#",
  },
  {
    id: "3",
    name: "Sales Outreach Sequence",
    lastSnapshot: "Today, 2:30 PM",
    versions: 15,
    lastModifiedBy: { name: "Tom Brown", initials: "TB" },
    link: "#",
  },
  {
    id: "4",
    name: "Sales Outreach Sequence",
    lastSnapshot: "Today, 2:30 PM",
    versions: 15,
    lastModifiedBy: { name: "Tom Brown", initials: "TB" },
    link: "#",
  },
  {
    id: "5",
    name: "Sales Outreach Sequence",
    lastSnapshot: "Today, 2:30 PM",
    versions: 15,
    lastModifiedBy: { name: "Tom Brown", initials: "TB" },
    link: "#",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [hasWorkflows, setHasWorkflows] = useState(false);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);

  useEffect(() => {
    setHasWorkflows(WorkflowState.hasSelectedWorkflows());
  }, []);

  const handleViewHistory = (workflowId: string, workflowName: string) => {
    navigate(`/workflow-history/${workflowId}`, {
      state: { workflowName },
    });
  };

  const handleRollbackLatest = (workflow: any) => {
    setSelectedWorkflow(workflow);
    setShowRollbackModal(true);
  };

  const handleConfirmRollback = () => {
    console.log("Rolling back workflow:", selectedWorkflow?.name);
  };

  if (!hasWorkflows) {
    return <EmptyDashboard />;
  }

  return (
    <MainAppLayout title="Dashboard Overview">
      {/* Status Banner */}
      <ContentSection>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-900">
                All 156 active workflows are being monitored
              </p>
              <p className="text-xs text-green-700">
                Last Snapshot: Today, 2:30 PM IST
              </p>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* Statistics Cards */}
      <ContentSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">156</div>
              <div className="text-sm text-gray-600">Active Workflows</div>
              <div className="text-xs text-gray-500 mt-1">+1% from last month</div>
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
              <div className="text-xs text-gray-500 mt-1">Max. plan capacity</div>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* Workflows Table */}
      <ContentSection>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                All Protected Workflows
              </h2>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
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

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search workflows by name..." className="pl-10" />
              </div>
              <div className="flex items-center gap-3">
                <Select defaultValue="modified">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Last Modified" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modified">Last Modified</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="versions">Versions</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="status">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="folder">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="HubSpot Folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="folder">HubSpot Folder</SelectItem>
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Workflow Name
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Last Snapshot
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Versions Available
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Last Modified By
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {workflows.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <a
                        href={workflow.link}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {workflow.name}
                      </a>
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
                            {workflow.lastModifiedBy.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">
                          {workflow.lastModifiedBy.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() =>
                            handleViewHistory(workflow.id, workflow.name)
                          }
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View History
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-orange-600 hover:text-orange-700"
                          onClick={() => handleRollbackLatest(workflow)}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Rollback Latest
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
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
              <span className="text-sm text-gray-600">156 workflows</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  1
                </Button>
                <Button variant="ghost" size="sm">2</Button>
                <Button variant="ghost" size="sm">3</Button>
                <span className="text-sm text-gray-400">...</span>
                <Button variant="ghost" size="sm">10</Button>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* Rollback Confirmation Modal */}
      <RollbackConfirmModal
        open={showRollbackModal}
        onClose={() => setShowRollbackModal(false)}
        onConfirm={handleConfirmRollback}
        workflowName={selectedWorkflow?.name}
      />
    </MainAppLayout>
  );
};

export default Dashboard;
