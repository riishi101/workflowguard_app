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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import EmptyDashboard from "@/components/EmptyDashboard";
import RollbackConfirmModal from "@/components/RollbackConfirmModal";
import { WorkflowState } from "@/lib/workflowState";
import { ApiService } from "@/lib/api";
import {
  Search,
  Plus,
  Download,
  CheckCircle,
  TrendingUp,
  Users,
  Eye,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Shield,
  Clock,
  Activity
} from "lucide-react";

interface DashboardWorkflow {
  id: string;
  name: string;
  lastSnapshot: string;
  versions: number;
  lastModifiedBy: {
    name: string;
    initials: string;
    email: string;
  };
  status: "active" | "inactive" | "error";
  protectionStatus: "protected" | "unprotected" | "error";
  lastModified: string;
  steps: number;
  contacts: number;
}

interface DashboardStats {
  totalWorkflows: number;
  activeWorkflows: number;
  protectedWorkflows: number;
  totalVersions: number;
  uptime: number;
  lastSnapshot: string;
  planCapacity: number;
  planUsed: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<DashboardWorkflow[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<DashboardWorkflow | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 DEBUG: Dashboard fetchDashboardData called');
      console.log('🔍 DEBUG: Current user object:', user);
      console.log('🔍 DEBUG: User ID being passed:', user?.id);
      console.log('🔍 DEBUG: DEPLOYMENT TEST 2 - This should appear if code is deployed');
      console.log('🔍 DEBUG: User object details:', {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        hasId: !!user?.id
      });

      console.log('Dashboard - Fetching dashboard data, retry count:', retryCount);
      console.log('Dashboard - Current user:', user);
      console.log('Dashboard - User ID being passed:', user?.id);
      console.log('Dashboard - User object details:', {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        hasId: !!user?.id
      });

      // Add a small delay to ensure backend is ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get user ID from multiple sources
      let userId = user?.id;
      
      // If no user ID from auth context, try to get from localStorage
      if (!userId) {
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const storedUser = JSON.parse(userStr);
            userId = storedUser.id;
            console.log('🔍 DEBUG: Got userId from localStorage:', userId);
          }
        } catch (error) {
          console.log('🔍 DEBUG: Failed to get userId from localStorage:', error);
        }
      }
      
      // If still no user ID, try to get from JWT token
      if (!userId) {
        try {
          const token = localStorage.getItem('authToken');
          if (token) {
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            userId = payload.sub || payload.userId || payload.id;
            console.log('🔍 DEBUG: Got userId from JWT token:', userId);
          }
        } catch (error) {
          console.log('🔍 DEBUG: Failed to get userId from JWT token:', error);
        }
      }

      // Check if user ID is available
      if (!userId) {
        console.log('🔍 DEBUG: No user ID available, skipping API calls');
        setWorkflows([]);
        setStats(null);
        setLoading(false);
        return;
      }

      console.log('🔍 DEBUG: Final userId being used:', userId);

      // Fetch workflows and stats in parallel
      const [workflowsResponse, statsResponse] = await Promise.all([
        ApiService.getProtectedWorkflows(userId),
        ApiService.getDashboardStats()
      ]);

      console.log('Dashboard - Workflows response:', workflowsResponse);
      console.log('Dashboard - Stats response:', statsResponse);
      console.log('Dashboard - Workflows data:', workflowsResponse.data);
      console.log('Dashboard - Workflows array length:', workflowsResponse.data?.length || 0);
      console.log('Dashboard - Workflows response type:', typeof workflowsResponse.data);
      console.log('Dashboard - Is workflows array:', Array.isArray(workflowsResponse.data));

      const workflows = workflowsResponse.data || [];
      const stats = statsResponse.data || null;

      console.log('Dashboard - Final workflows array:', workflows);
      console.log('Dashboard - Final workflows length:', workflows.length);
      console.log('Dashboard - Final stats:', stats);

      setWorkflows(workflows);
      setStats(stats);

      console.log('Dashboard - State set with workflows:', workflows.length);
      console.log('Dashboard - State set with stats:', !!stats);

      // Check if user has workflows
      const hasWorkflows = workflows && workflows.length > 0;
      WorkflowState.setWorkflowSelection(hasWorkflows);
      WorkflowState.setSelectedCount(hasWorkflows ? workflows.length : 0);

      console.log('Dashboard - Set workflow state:', { hasWorkflows, count: workflows.length });

      // If workflows are found and user had selected workflows, clear the selection state
      if (hasWorkflows && WorkflowState.hasSelectedWorkflows()) {
        console.log('Dashboard - Workflows found, clearing selection state');
        WorkflowState.clearAfterNavigation();
      }

      // If no workflows found but user has selected workflows, retry after a delay
      if (workflows.length === 0 && WorkflowState.hasSelectedWorkflows() && retryCount < 3) {
        console.log('Dashboard - No workflows found but user has selected workflows, retrying...');
        setTimeout(() => {
          fetchDashboardData(retryCount + 1);
        }, 2000 * (retryCount + 1)); // Exponential backoff: 2s, 4s, 6s
        return;
      }

    } catch (err) {
      console.error('Dashboard - Failed to fetch dashboard data:', err);
      
      // If this is a retry and we still have workflow selection state, don't show error
      if (retryCount > 0 && WorkflowState.hasSelectedWorkflows()) {
        console.log('Dashboard - Retry failed but user has selected workflows, showing empty state');
        setWorkflows([]);
        setStats(null);
        setError(null);
      } else {
      setError('Failed to load dashboard data. Please try again.');
      setWorkflows([]);
      setStats(null);
      WorkflowState.setWorkflowSelection(false);
      WorkflowState.setSelectedCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    try {
    setRefreshing(true);
      setError(null);
    await fetchDashboardData();
      toast({
        title: "Dashboard Refreshed",
        description: "Dashboard data has been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    } finally {
    setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log('🔍 DEBUG: Dashboard useEffect called');
    console.log('🔍 DEBUG: User from useAuth:', user);
    console.log('🔍 DEBUG: User ID:', user?.id);
    console.log('🔍 DEBUG: User email:', user?.email);
    console.log('🔍 DEBUG: DEPLOYMENT TEST - This should appear if code is deployed');
    
    // Add a DOM element to verify code deployment
    const debugElement = document.createElement('div');
    debugElement.id = 'debug-deployment-test';
    debugElement.style.position = 'fixed';
    debugElement.style.top = '10px';
    debugElement.style.right = '10px';
    debugElement.style.background = 'red';
    debugElement.style.color = 'white';
    debugElement.style.padding = '5px';
    debugElement.style.zIndex = '9999';
    debugElement.textContent = user?.id ? `User ID: ${user.id}` : 'No User ID';
    document.body.appendChild(debugElement);
    
    console.log('Dashboard - Component mounted, fetching dashboard data');
    console.log('Dashboard - Current workflow state:', {
      hasSelected: WorkflowState.hasSelectedWorkflows(),
      count: WorkflowState.getSelectedCount()
    });
    
    fetchDashboardData();
  }, []);

  // Add effect to track workflows state changes
  useEffect(() => {
    console.log('Dashboard - Workflows state changed:', workflows.length);
    console.log('Dashboard - Current workflows:', workflows);
  }, [workflows]);

  const handleViewHistory = (workflowId: string, workflowName: string) => {
    // Store the current workflow context for the history page
    localStorage.setItem('currentWorkflow', JSON.stringify({ id: workflowId, name: workflowName }));
    
    navigate(`/workflow-history/${workflowId}`, {
      state: { workflowName },
    });
  };

  const handleRollbackLatest = (workflow: DashboardWorkflow) => {
    // Check if workflow has versions to rollback
    if (workflow.versions === 0) {
      toast({
        title: "No Versions Available",
        description: "This workflow has no versions to rollback to.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedWorkflow(workflow);
    setShowRollbackModal(true);
  };

  const handleConfirmRollback = async () => {
    if (!selectedWorkflow) return;

    try {
      const response = await ApiService.rollbackWorkflow(selectedWorkflow.id);
      
      toast({
        title: "Rollback Successful",
        description: response.data?.message || `${selectedWorkflow.name} has been rolled back to the latest version.`,
      });

      // Refresh dashboard data
      await fetchDashboardData();
    } catch (error: any) {
      console.error('Failed to rollback workflow:', error);
      toast({
        title: "Rollback Failed",
        description: error.response?.data?.message || "Failed to rollback workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowRollbackModal(false);
      setSelectedWorkflow(null);
    }
  };

  const handleAddWorkflow = () => {
    // Check if user has reached plan limits
    if (stats && stats.planUsed >= stats.planCapacity) {
      toast({
        title: "Plan Limit Reached",
        description: "You've reached your plan limit. Please upgrade to add more workflows.",
        variant: "destructive",
      });
      return;
    }
    
    navigate("/workflow-selection");
  };

  const handleExportData = async () => {
    try {
      const response = await ApiService.exportDashboardData();
      
      // Create and download the export file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflowguard-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Successful",
        description: "Dashboard data has been exported successfully.",
      });
    } catch (error: any) {
      console.error('Failed to export data:', error);
      toast({
        title: "Export Failed",
        description: error.response?.data?.message || "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter workflows
  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get filtered stats
  const filteredStats = {
    total: filteredWorkflows.length,
    active: filteredWorkflows.filter(w => w.status === 'active').length,
    inactive: filteredWorkflows.filter(w => w.status === 'inactive').length,
    error: filteredWorkflows.filter(w => w.status === 'error').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "inactive":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      case "error":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getProtectionStatusColor = (status: string) => {
    switch (status) {
      case "protected":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "unprotected":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "error":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  if (loading) {
    return (
      <MainAppLayout title="Dashboard Overview">
        <ContentSection>
          <div className="space-y-6">
            {/* Loading Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-center gap-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Setting Up Your Dashboard
                </p>
                <p className="text-xs text-blue-800">
                  Loading your protected workflows and dashboard statistics...
                </p>
              </div>
            </div>

            {/* Loading Skeleton for Status Banner */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>

            {/* Loading Skeleton for Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-8 w-8 mb-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Loading Skeleton for Workflows Table */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </ContentSection>
      </MainAppLayout>
    );
  }

  // Show empty state if no workflows
  if (!loading && workflows.length === 0) {
    // Check if user has just completed workflow selection
    const hasSelectedWorkflows = WorkflowState.hasSelectedWorkflows();
    const selectedCount = WorkflowState.getSelectedCount();
    
    console.log('Dashboard - Showing empty state, workflow state:', { hasSelectedWorkflows, selectedCount });
    console.log('Dashboard - Workflows length:', workflows.length);
    console.log('Dashboard - Stats:', stats);
    console.log('Dashboard - Loading state:', loading);
    console.log('Dashboard - Workflows state:', workflows);
    console.log('Dashboard - Condition check: !loading && workflows.length === 0');
    console.log('Dashboard - Condition result:', !loading && workflows.length === 0);
    
    // If user has selected workflows but none are showing yet, show processing message
    if (hasSelectedWorkflows && selectedCount > 0) {
      return (
        <MainAppLayout title="Dashboard Overview">
          <ContentSection>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Processing Your Workflows
                </p>
                <p className="text-xs text-blue-800">
                  Your {selectedCount} workflow{selectedCount > 1 ? 's' : ''} are being set up for protection. This may take a moment...
                </p>
              </div>
            </div>
          </ContentSection>
          
          <ContentSection>
            <div className="bg-white border border-gray-200 rounded-lg p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Setting Up Protection
              </h3>
              <p className="text-gray-600 text-base mb-6 max-w-lg">
                WorkflowGuard is configuring protection for your {selectedCount} selected workflow{selectedCount > 1 ? 's' : ''}. 
                This process usually takes 1-2 minutes.
              </p>
              <div className="flex flex-col items-center gap-4 w-full">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow"
                >
                  ↻ Refresh Dashboard
                </button>
                <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                  <span>Your workflows will appear here once processing is complete.</span>
                </div>
              </div>
            </div>
          </ContentSection>
        </MainAppLayout>
      );
    }
    
    return <EmptyDashboard />;
  }

  return (
    <MainAppLayout title="Dashboard Overview">
      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
            <Button 
              variant="link" 
              className="p-0 h-auto text-red-800 underline ml-2"
              onClick={refreshDashboard}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Banner */}
      <ContentSection>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  {filteredStats.active} of {filteredWorkflows.length} workflows are active
                </p>
                <p className="text-xs text-green-700">
                  Last Snapshot: {stats.lastSnapshot}
                </p>
                {(searchTerm || statusFilter !== "all") && (
                  <p className="text-xs text-blue-600 mt-1">
                    Showing {filteredWorkflows.length} of {workflows.length} workflows
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshDashboard}
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
      </ContentSection>

      {/* Statistics Cards */}
      <ContentSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.activeWorkflows}
              </div>
              <div className="text-sm text-gray-600">Active Workflows</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.protectedWorkflows} protected
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.uptime}%
              </div>
              <div className="text-sm text-gray-600">Total Uptime</div>
              <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-purple-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.planUsed}/{stats.planCapacity}
              </div>
              <div className="text-sm text-gray-600">Plan Usage</div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((stats.planUsed / stats.planCapacity) * 100)}% used
              </div>
            </CardContent>
          </Card>
        </div>
      </ContentSection>

      {/* Workflows Table */}
      <ContentSection>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Protected Workflows ({filteredWorkflows.length})
              </h2>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleAddWorkflow}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Workflow
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportData}>
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
                <Input 
                  placeholder="Search workflows by name..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                {(searchTerm || statusFilter !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Workflows Table */}
          <div className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Workflow Name
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Protection
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Last Modified
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Versions
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
                {filteredWorkflows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm || statusFilter !== "all" 
                        ? "No workflows match your filters. Try adjusting your search criteria."
                        : "No workflows found. Add your first workflow to get started."
                      }
                    </td>
                  </tr>
                ) : (
                  filteredWorkflows.map((workflow) => (
                    <tr key={workflow.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900">
                            {workflow.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="secondary"
                          className={getStatusColor(workflow.status)}
                        >
                          {workflow.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="secondary"
                          className={getProtectionStatusColor(workflow.protectionStatus)}
                        >
                          {workflow.protectionStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {workflow.lastModified}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {workflow.versions} versions
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
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
                  ))
                )}
              </tbody>
            </table>
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
