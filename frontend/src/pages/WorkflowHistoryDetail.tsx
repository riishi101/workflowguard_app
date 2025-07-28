import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TopNavigation from "@/components/TopNavigation";
import Footer from "@/components/Footer";
import {
  Search,
  ChevronDown,
  ExternalLink,
  MoreHorizontal,
  Eye,
  RotateCcw,
  Copy,
} from "lucide-react";

const workflowVersionHistory = [
  {
    id: "#12",
    version: "Version #12",
    dateTime: "June 23, 2025, 9:30 PM IST",
    modifiedBy: {
      name: "Sarah Johnson",
      initials: "SJ",
      avatar: "/avatars/sarah.jpg",
    },
    changeSummary: "Updated delay to 3 days in step 5",
    actions: ["View Changes", "Rollback"],
  },
  {
    id: "#11",
    version: "Version #11",
    dateTime: "June 22, 2025, 11:45 AM IST",
    modifiedBy: {
      name: "Mike Wilson",
      initials: "MW",
      avatar: "/avatars/mike.jpg",
    },
    changeSummary: "Added new 'If/Then' branch for high-value leads",
    actions: ["View Changes", "Rollback"],
  },
  {
    id: "#10",
    version: "Version #10",
    dateTime: "June 21, 2025, 4:15 PM IST",
    modifiedBy: {
      name: "Emily Chen",
      initials: "EC",
      avatar: "/avatars/emily.jpg",
    },
    changeSummary: "Removed 'Send Internal Notification' action",
    actions: ["View Changes", "Rollback"],
  },
  {
    id: "#9",
    version: "Version #9",
    dateTime: "June 21, 2025, 4:15 PM IST",
    modifiedBy: {
      name: "Emily Chen",
      initials: "EC",
      avatar: "/avatars/emily.jpg",
    },
    changeSummary: "Removed 'Send Internal Notification' action",
    actions: ["View Changes", "Rollback"],
  },
  {
    id: "#8",
    version: "Version #8",
    dateTime: "June 21, 2025, 4:15 PM IST",
    modifiedBy: {
      name: "Emily Chen",
      initials: "EC",
      avatar: "/avatars/emily.jpg",
    },
    changeSummary: "Removed 'Send Internal Notification' action",
    actions: ["View Changes", "Rollback"],
  },
  {
    id: "#7",
    version: "Version #7",
    dateTime: "June 21, 2025, 4:15 PM IST",
    modifiedBy: {
      name: "Emily Chen",
      initials: "EC",
      avatar: "/avatars/emily.jpg",
    },
    changeSummary: "Removed 'Send Internal Notification' action",
    actions: ["View Changes", "Rollback"],
  },
];

const WorkflowHistoryDetail = () => {
  const navigate = useNavigate();
  const { workflowId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");

  const handleGoToHubSpot = () => {
    window.open("https://app.hubspot.com", "_blank");
  };

  const handleRollbackLatest = () => {
    // This will be handled by the parent component (Dashboard)
    // For now, just show alert
    alert("Rollback functionality would be triggered here");
  };

  const filteredVersions = workflowVersionHistory.filter((version) =>
    version.changeSummary.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavigation />

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-gray-900"
          >
            Dashboard
          </button>
          <span>&gt;</span>
          <button
            onClick={() => navigate("/workflow-history")}
            className="hover:text-gray-900"
          >
            Workflow History
          </button>
          <span>&gt;</span>
          <span className="text-gray-900 font-medium">Customer Onboarding</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Workflow History: Customer Onboarding
            </h1>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoToHubSpot}
                className="text-blue-600"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View in HubSpot
              </Button>
              <Button
                onClick={handleRollbackLatest}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Rollback Latest
              </Button>
            </div>
          </div>
        </div>

        {/* Workflow Status */}
        <div className="flex items-center justify-between mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">
                Customer Onboarding
              </h2>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                Active
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Last modified: June 23, 2025, 2:30 PM IST
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-600">12 versions tracked</div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search history by change summary or..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="modified">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Modified By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modified">Modified By</SelectItem>
                <SelectItem value="sarah">Sarah Johnson</SelectItem>
                <SelectItem value="mike">Mike Wilson</SelectItem>
                <SelectItem value="emily">Emily Chen</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="range">
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="range">Date Range</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="text-blue-600">
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Version History Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                  Version
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                  Date & Time
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                  Modified By
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                  Change Summary
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVersions.map((version) => (
                <tr key={version.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {version.version}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {version.dateTime}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-red-100 text-red-800">
                          {version.modifiedBy.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-900">
                        {version.modifiedBy.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {version.changeSummary}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View Changes
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Rollback
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Version ID
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

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <Select defaultValue="10">
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Previous</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                1
              </Button>
              <Button variant="ghost" size="sm">
                2
              </Button>
              <Button variant="ghost" size="sm">
                3
              </Button>
              <span className="text-sm text-gray-400">...</span>
              <Button variant="ghost" size="sm">
                10
              </Button>
            </div>
            <span className="text-sm text-gray-600">Next</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WorkflowHistoryDetail;
