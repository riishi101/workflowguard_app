import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import ContentPageHeader from "@/components/ContentPageHeader";
import Footer from "@/components/Footer";
import { WorkflowState } from "@/lib/workflowState";
import { ApiService } from "@/lib/api";
import { 
  Search, 
  Info, 
  AlertTriangle, 
  Shield, 
  RotateCcw, 
  FileText,
  CheckCircle,
  Loader2,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc
} from "lucide-react";

interface WorkflowSelectionProps {
  onComplete?: () => void;
}

interface HubSpotWorkflow {
  id: string;
  name: string;
  folder: string;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  lastModified: string;
  steps: number;
  contacts: number;
  isProtected?: boolean;
  isDemo?: boolean;
}

const WorkflowSelection = ({ onComplete }: WorkflowSelectionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<HubSpotWorkflow[]>([]);
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [folderFilter, setFolderFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch workflows from HubSpot
  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get real data from HubSpot API
      const response = await ApiService.getHubSpotWorkflows();
      
      if (response.data && response.data.length > 0) {
        setWorkflows(response.data);
        toast({
          title: "Connected to HubSpot",
          description: `Found ${response.data.length} workflows in your account.`,
        });
      } else {
        // No workflows found in HubSpot
        setWorkflows([]);
        toast({
          title: "No Workflows Found",
          description: "No active workflows found in your HubSpot account.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
      
      // Check if it's a network error vs API error
      const isNetworkError = err.message?.includes('Network Error') || err.code === 'NETWORK_ERROR';
      
      if (isNetworkError) {
        setError('Unable to connect to HubSpot. Please check your internet connection and try again.');
      } else {
        setError('Failed to load workflows from HubSpot. This might be a temporary issue.');
      }
      
      // Show demo data with clear indication
      toast({
        title: "Demo Mode Active",
        description: "Showing sample workflows for demonstration purposes.",
        variant: "default",
      });
      
      // Fallback to demo data with clear labeling
      setWorkflows([
        {
          id: "demo-1",
          name: "Customer Onboarding (Demo)",
          folder: "Sales Automation",
          status: "ACTIVE",
          lastModified: "2024-01-15 14:30",
          steps: 12,
          contacts: 1500,
          isDemo: true,
        },
        {
          id: "demo-2",
          name: "Lead Nurturing - SaaS (Demo)",
          folder: "Marketing",
          status: "ACTIVE",
          lastModified: "2024-01-14 09:15",
          steps: 8,
          contacts: 3200,
          isDemo: true,
        },
        {
          id: "demo-3",
          name: "Email Campaign Follow-up (Demo)",
          folder: "Marketing",
          status: "INACTIVE",
          lastModified: "2024-01-13 16:45",
          steps: 6,
          contacts: 800,
          isDemo: true,
        },
        {
          id: "demo-4",
          name: "Deal Pipeline Automation (Demo)",
          folder: "Sales",
          status: "ACTIVE",
          lastModified: "2024-01-12 11:20",
          steps: 15,
          contacts: 2100,
          isDemo: true,
        },
        {
          id: "demo-5",
          name: "Customer Feedback Loop (Demo)",
          folder: "Customer Success",
          status: "ACTIVE",
          lastModified: "2024-01-11 13:50",
          steps: 10,
          contacts: 950,
          isDemo: true,
        },
        {
          id: "demo-6",
          name: "Welcome Series - New Users (Demo)",
          folder: "Marketing",
          status: "ACTIVE",
          lastModified: "2024-01-10 08:30",
          steps: 7,
          contacts: 1800,
          isDemo: true,
        },
        {
          id: "demo-7",
          name: "Sales Qualification (Demo)",
          folder: "Sales",
          status: "ACTIVE",
          lastModified: "2024-01-09 15:45",
          steps: 9,
          contacts: 1200,
          isDemo: true,
        },
        {
          id: "demo-8",
          name: "Customer Retention (Demo)",
          folder: "Customer Success",
          status: "DRAFT",
          lastModified: "2024-01-08 12:20",
          steps: 5,
          contacts: 0,
          isDemo: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const refreshWorkflows = async () => {
    setRefreshing(true);
    await fetchWorkflows();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleWorkflowToggle = (workflowId: string) => {
    setSelectedWorkflows((prev) =>
      prev.includes(workflowId)
        ? prev.filter((id) => id !== workflowId)
        : [...prev, workflowId],
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedWorkflows([]);
      setSelectAll(false);
    } else {
      const activeWorkflowIds = filteredWorkflows
        .filter(w => w.status === "ACTIVE")
        .map(w => w.id);
      setSelectedWorkflows(activeWorkflowIds);
      setSelectAll(true);
    }
  };

  const handleStartProtecting = async () => {
    try {
      // Show loading state
      toast({
        title: "Setting up protection...",
        description: "Configuring WorkflowGuard for your selected workflows.",
      });

      // Simulate API call to start protection
      await ApiService.startWorkflowProtection(selectedWorkflows);
      
      // Set workflow selection state
      WorkflowState.setWorkflowSelection(true);
      WorkflowState.setSelectedCount(selectedWorkflows.length);
      
      toast({
        title: "Protection Activated!",
        description: `${selectedWorkflows.length} workflows are now being monitored.`,
      });
      
      // Call onComplete if provided, otherwise navigate
      if (onComplete) {
        onComplete();
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Failed to start protection. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSkipForNow = () => {
    WorkflowState.setWorkflowSelection(false);
    WorkflowState.setSelectedCount(0);
    
    toast({
      title: "Setup Skipped",
      description: "You can configure workflow protection later in settings.",
    });
    
    if (onComplete) {
      onComplete();
    } else {
      navigate("/dashboard");
    }
  };

  // Filter and sort workflows
  const filteredWorkflows = workflows
    .filter((workflow) => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || workflow.status === statusFilter;
      const matchesFolder = folderFilter === "all" || workflow.folder === folderFilter;
      return matchesSearch && matchesStatus && matchesFolder;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "folder":
          comparison = a.folder.localeCompare(b.folder);
          break;
        case "lastModified":
          comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "INACTIVE":
      case "DRAFT":
        return "secondary";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <ContentPageHeader />
        <main className="max-w-6xl mx-auto px-6 py-8 flex-1">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <Skeleton className="h-4 w-full" />
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-10 w-64" />
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-40" />
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ContentPageHeader />

      <main className="max-w-6xl mx-auto px-6 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Select Workflows to Protect
          </h1>
          <p className="text-gray-600 text-sm">
            Great! Your HubSpot account is connected. Choose the workflows you
            want WorkflowGuard to monitor and protect.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                Protection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {selectedWorkflows.length}
              </p>
              <p className="text-xs text-gray-600">workflows selected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-green-500" />
                Auto Recovery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                90 days
              </p>
              <p className="text-xs text-gray-600">version history</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                Trial Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600">
                Professional
              </p>
              <p className="text-xs text-gray-600">up to 500 workflows</p>
            </CardContent>
          </Card>
        </div>

        {/* Alert Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-900 font-medium mb-1">
                Professional Trial Active
              </p>
              <p className="text-sm text-blue-800">
                Your trial includes Professional Plan features, allowing you to
                monitor up to 500 workflows and retain 90 days of history. Get
                started by selecting your critical workflows below.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Mode Alert */}
        {workflows.some(w => w.isDemo) && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Demo Mode:</strong> You're viewing sample workflows because we couldn't connect to your HubSpot account. 
              In production, you'll see your actual HubSpot workflows here.
              <Button 
                variant="link" 
                className="p-0 h-auto text-orange-800 underline ml-2"
                onClick={refreshWorkflows}
              >
                Try connecting again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              <Button 
                variant="link" 
                className="p-0 h-auto text-red-800 underline ml-2"
                onClick={refreshWorkflows}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white border border-gray-200 rounded-lg">
          {/* Header with filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search workflows by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshWorkflows}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={folderFilter} onValueChange={setFolderFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Folders</SelectItem>
                    <SelectItem value="Sales Automation">Sales Automation</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Customer Success">Customer Success</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="folder">Folder</SelectItem>
                    <SelectItem value="lastModified">Last Modified</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">
                  Select all active workflows
                </span>
              </div>
            </div>
          </div>

          {/* Workflows Table */}
          <div className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-4 py-3"></th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    Workflow Name
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    HubSpot Folder
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    Steps
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    Contacts
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    Last Modified
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredWorkflows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      {searchTerm || statusFilter !== "all" || folderFilter !== "all" 
                        ? "No workflows match your filters. Try adjusting your search criteria."
                        : "No workflows found in your HubSpot account."
                      }
                    </td>
                  </tr>
                ) : (
                  filteredWorkflows.map((workflow) => (
                    <tr key={workflow.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedWorkflows.includes(workflow.id)}
                          onCheckedChange={() => handleWorkflowToggle(workflow.id)}
                          disabled={workflow.status === "DRAFT"}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {workflow.name}
                          </span>
                          {workflow.isProtected && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          {workflow.isDemo && (
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                              Demo
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {workflow.folder}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={getStatusVariant(workflow.status)}
                          className={getStatusColor(workflow.status)}
                        >
                          {workflow.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {workflow.steps} steps
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {workflow.contacts.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {workflow.lastModified}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer with actions */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                Selected {selectedWorkflows.length} of {filteredWorkflows.length} workflows
              </p>
              {workflows.some(w => w.isDemo) ? (
                <p className="text-sm text-orange-600">
                  • Demo mode - showing sample data
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  • {500 - selectedWorkflows.length} remaining in your trial
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleSkipForNow} variant="outline" size="sm">
                Skip for now
              </Button>
              <Button
                onClick={handleStartProtecting}
                disabled={selectedWorkflows.length === 0}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                size="sm"
              >
                {workflows.some(w => w.isDemo) ? "Try Demo Protection" : "Start Protecting Workflows"}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WorkflowSelection;
