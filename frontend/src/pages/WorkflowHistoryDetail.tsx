import { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ApiService } from "@/lib/api";
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
  AlertTriangle,
  Loader2,
  RefreshCw,
  Download,
  ArrowLeft,
} from "lucide-react";

interface WorkflowVersion {
  id: string;
  versionNumber: string;
  dateTime: string;
  modifiedBy: {
    name: string;
    initials: string;
    avatar?: string;
  };
  changeSummary: string;
  type: string;
  steps: number;
  status: string;
}

interface WorkflowDetails {
  id: string;
  name: string;
  status: string;
  lastModified: string;
  totalVersions: number;
  hubspotUrl?: string;
}

const WorkflowHistoryDetail = () => {
  const navigate = useNavigate();
  const { workflowId } = useParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workflowDetails, setWorkflowDetails] = useState<WorkflowDetails | null>(null);
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [restoring, setRestoring] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (workflowId) {
      fetchWorkflowHistory();
    }
  }, [workflowId]);

  const fetchWorkflowHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch workflow details and history
      const [detailsResponse, historyResponse] = await Promise.all([
        ApiService.getWorkflowDetails(workflowId!),
        ApiService.getWorkflowHistory(workflowId!)
      ]);
      
      setWorkflowDetails(detailsResponse.data);
      // Transform the backend data to match frontend interface
      const transformedVersions = (historyResponse.data as any[]).map((version: any) => ({
        id: version.id,
        versionNumber: version.versionNumber.toString(),
        dateTime: version.dateTime || version.date,
        modifiedBy: {
          name: version.modifiedBy?.name || version.initiator || 'Unknown User',
          initials: (version.modifiedBy?.name || version.initiator || 'Unknown User').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          avatar: undefined
        },
        changeSummary: version.changeSummary || version.notes || `Version ${version.versionNumber}`,
        type: version.type,
        steps: version.steps || 0,
        status: version.status || 'active'
      }));
      setVersions(transformedVersions);
    } catch (err: any) {
      console.error('Failed to fetch workflow history:', err);
      setError(err.response?.data?.message || 'Failed to load workflow history. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load workflow history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoToHubSpot = () => {
    if (workflowDetails?.hubspotUrl) {
      window.open(workflowDetails.hubspotUrl, "_blank");
    } else {
      window.open("https://app.hubspot.com", "_blank");
    }
  };

  const handleRollbackVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to rollback to this version? This will create a new version with the restored content.')) {
      return;
    }
    
    try {
      setRestoring(versionId);
      await ApiService.restoreWorkflowVersion(workflowId!, versionId);
      
      toast({
        title: "Rollback Successful",
        description: "Workflow has been rolled back to the selected version.",
      });
      
      // Refresh the history
      fetchWorkflowHistory();
    } catch (err: any) {
      console.error('Failed to rollback version:', err);
      toast({
        title: "Rollback Failed",
        description: err.response?.data?.message || "Failed to rollback version. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRestoring(null);
    }
  };

  const handleDownloadVersion = async (versionId: string) => {
    try {
      setDownloading(versionId);
      const response = await ApiService.downloadWorkflowVersion(workflowId!, versionId);
      
      // Create and download the file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow-version-${versionId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Successful",
        description: "Workflow version has been downloaded successfully.",
      });
    } catch (err: any) {
      console.error('Failed to download version:', err);
      toast({
        title: "Download Failed",
        description: err.response?.data?.message || "Failed to download version. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleViewChanges = (versionId: string) => {
    navigate(`/compare-versions?workflowId=${workflowId}&versionId=${versionId}`);
  };

  const handleCopyVersionId = (versionId: string) => {
    navigator.clipboard.writeText(versionId);
    toast({
      title: "Copied",
      description: "Version ID copied to clipboard.",
    });
  };

  const filteredVersions = versions.filter((version) => {
    const matchesSearch = version.changeSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         version.modifiedBy.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = userFilter === "all" || version.modifiedBy.name.toLowerCase().includes(userFilter.toLowerCase());
    
    // Date filtering logic
    let matchesDate = true;
    if (dateFilter !== "all") {
      const versionDate = new Date(version.dateTime);
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      switch (dateFilter) {
        case "today":
          matchesDate = versionDate >= startOfDay;
          break;
        case "week":
          matchesDate = versionDate >= startOfWeek;
          break;
        case "month":
          matchesDate = versionDate >= startOfMonth;
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesUser && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'manual': return 'bg-blue-100 text-blue-800';
      case 'automatic': return 'bg-green-100 text-green-800';
      case 'system': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <TopNavigation />
        <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
          {/* Breadcrumb Skeleton */}
          <Skeleton className="h-4 w-64 mb-6" />
          
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-8 w-96 mb-4" />
            <Skeleton className="h-10 w-48" />
          </div>
          
          {/* Workflow Status Skeleton */}
          <Skeleton className="h-20 w-full mb-8" />
          
          {/* Search and Filters Skeleton */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <Skeleton className="h-10 w-80" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          
          {/* Table Skeleton */}
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <TopNavigation />
        <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchWorkflowHistory}
                className="ml-2"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  if (!workflowDetails) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <TopNavigation />
        <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Workflow not found. Please check the URL and try again.
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavigation />

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-gray-900 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
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
          <span className="text-gray-900 font-medium">{workflowDetails.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Workflow History: {workflowDetails.name}
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
                onClick={() => fetchWorkflowHistory()}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Workflow Status */}
        <div className="flex items-center justify-between mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {workflowDetails.name}
              </h2>
              <Badge className={getStatusColor(workflowDetails.status)}>
                {workflowDetails.status}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Last modified: {new Date(workflowDetails.lastModified).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-600">{workflowDetails.totalVersions} versions tracked</div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search history by change summary or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Modified By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {Array.from(new Set(versions.map(v => v.modifiedBy.name))).map(user => (
                  <SelectItem key={user} value={user.toLowerCase()}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-blue-600"
              onClick={() => {
                setSearchTerm("");
                setUserFilter("all");
                setDateFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Version History Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {filteredVersions.length > 0 ? (
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
                    Type
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
                      {version.versionNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(version.dateTime).toLocaleString()}
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
                      <Badge className={getTypeColor(version.type)}>
                        {version.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handleViewChanges(version.id)}
                        >
                          View Changes
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-orange-600 hover:text-orange-700"
                          onClick={() => handleRollbackVersion(version.id)}
                          disabled={restoring === version.id}
                        >
                          {restoring === version.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RotateCcw className="w-4 h-4" />
                          )}
                          Rollback
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewChanges(version.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadVersion(version.id)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download Version
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyVersionId(version.id)}>
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
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Versions Found
              </h3>
              <p className="text-gray-600">
                {searchTerm || userFilter !== "all" || dateFilter !== "all" 
                  ? "No versions match your current filters. Try adjusting your search criteria."
                  : "No version history found for this workflow."
                }
              </p>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {filteredVersions.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredVersions.length} of {versions.length} versions
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default WorkflowHistoryDetail;
