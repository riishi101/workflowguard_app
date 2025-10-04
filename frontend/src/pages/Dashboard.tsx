import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkflows } from "@/hooks/use-workflows";
import { useWorkflowStats } from "@/hooks/use-workflow-stats";
import { useWorkflowActions } from "@/hooks/use-workflow-actions";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import EmptyDashboard from "@/components/EmptyDashboard";
import RollbackConfirmModal from '../components/RollbackConfirmModal';
import { RestoreDeletedWorkflowModal } from '../components/RestoreDeletedWorkflowModal';
import { WorkflowState } from "@/lib/workflowState";
import { ApiService } from "@/lib/api";
import WorkflowService from "../services/WorkflowService";
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
  internalId?: string;
  name: string;
  versions: number;
  lastModifiedBy: {
    name: string;
    initials: string;
    email: string;
  };
  status: "active" | "inactive" | "error" | "deleted";
  protectionStatus: "protected" | "unprotected" | "error";
  lastModified: string;
  isDeleted?: boolean;
  deletedAt?: string;
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

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"name" | "lastModified" | "versions">("lastModified");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [syncing, setSyncing] = useState(false);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState<any>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<DashboardWorkflow | null>(null);
  const [restoring, setRestoring] = useState<Record<string, boolean>>({});

  // Use our custom hooks
  const { 
    workflows, 
    loading, 
    error: fetchError, 
    refetch: refreshWorkflows,
    loading: isRefreshing 
  } = useWorkflows({
    autoRefresh: true,
    refreshInterval: 30000
  } as const);

  const stats = useWorkflowStats(workflows);
  const { 
    handleRollback,
    handleExport,
    loadingStates: rollbacking,
    isLoading: checkLoading
  } = useWorkflowActions();

  const refreshDashboard = () => {
    refreshWorkflows();
    toast({
      title: "Dashboard Refreshed",
      description: "Dashboard data has been updated successfully.",
    });
  };

  const syncHubSpotChanges = async () => {
    setSyncing(true);
    try {
      const response = await ApiService.syncHubSpotWorkflows();
      if (response.success) {
        refreshWorkflows();
        toast({
          title: "Sync Complete",
          description: response.message || "Successfully synced workflow changes from HubSpot.",
        });
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync changes from HubSpot. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Removed useEffect as data fetching is handled by useWorkflows hook

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
    await handleRollback(selectedWorkflow.id);
    setShowRollbackModal(false);
    setSelectedWorkflow(null);
  };

  const handleRestoreDeleted = (workflow: DashboardWorkflow) => {
    setSelectedWorkflow(workflow);
    setShowRestoreModal(true);
  };

  const handleConfirmRestore = async () => {
    if (!selectedWorkflow) return;
    
    setRestoring(prev => ({ ...prev, [selectedWorkflow.id]: true }));
    
    try {
      const response = await ApiService.restoreDeletedWorkflow(selectedWorkflow.internalId || selectedWorkflow.id);
      if (response.success) {
        toast({
          title: "Workflow Restored",
          description: `${selectedWorkflow.name} has been successfully restored to HubSpot.`,
        });
        refreshWorkflows();
      }
    } catch (error) {
      toast({
        title: "Restore Failed",
        description: "Failed to restore workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRestoring(prev => ({ ...prev, [selectedWorkflow.id]: false }));
      setShowRestoreModal(false);
      setSelectedWorkflow(null);
    }
  };

  const handleAddWorkflow = async () => {
    try {
      // Fetch current subscription status
      const subscriptionResponse = await ApiService.getSubscription();
      const subscription = subscriptionResponse.data;
      
      if (subscription && subscription.planUsed >= subscription.planCapacity) {
        toast({
          title: "Plan Limit Reached",
          description: "You've reached your plan limit. Please upgrade to add more workflows.",
          variant: "destructive",
        });
        return;
      }
      
      navigate("/workflow-selection");
    } catch (error) {
      console.error('Failed to check plan limits:', error);
      // Proceed anyway if check fails
      navigate("/workflow-selection");
    }
  };

  // Removed handleExportData as we use handleExport from useWorkflowActions hook

  // Filter workflows
  const filteredWorkflows = useMemo(() => {
    return workflows.filter((workflow) => {
      const matchesSearch =
        workflow.name?.toLowerCase().includes(searchTerm?.toLowerCase() || "") ?? true;
      const matchesStatus =
        statusFilter === "all" || workflow.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [workflows, searchTerm, statusFilter]);

  // Get filtered stats
  const filteredStats = useMemo(() => {
    return {
      total: filteredWorkflows.length,
      active: filteredWorkflows.filter(w => w.status === 'active').length,
      inactive: filteredWorkflows.filter(w => w.status === 'inactive').length,
      error: filteredWorkflows.filter(w => w.status === 'error').length,
    };
  }, [filteredWorkflows]);

  const getStatusColor = (status: string | undefined) => {
    if (!status || typeof status !== 'string') {
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
    switch (status.toLowerCase()) {
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

  const getProtectionStatusColor = (status: string | undefined) => {
    if (!status) {
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    }
    switch (status.toLowerCase()) {
      case "protected":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "unprotected":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "error":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"; // Fallback for unknown status
    }
  };

  // Helper function to safely convert any value to string for rendering
  const safeToString = (value: any, fallback: string = 'Unknown'): string => {
    if (value === null || value === undefined) {
      return fallback;
    }
    if (typeof value === 'object') {
      // If it's a Date object, format it
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      // For other objects, return fallback to avoid rendering [object Object]
      return fallback;
    }
    return String(value);
  };

  const handleExportWorkflow = async (workflow: DashboardWorkflow) => {
    try {
      setSelectedWorkflow(workflow);
      
      // 🔧 FIX: Use correct ID for deleted workflows
      // For deleted workflows, use internalId (WorkflowGuard UUID)
      // For active workflows, use id (HubSpot ID)
      const workflowIdToUse = workflow.isDeleted && workflow.internalId 
        ? workflow.internalId 
        : workflow.id;
      
      console.log('🔍 Export workflow - Using ID:', workflowIdToUse, 'for workflow:', workflow.name, 'isDeleted:', workflow.isDeleted);
      
      const response = await ApiService.exportDeletedWorkflow(workflowIdToUse);
      setExportData(response.data);
      setShowExportModal(true);
      toast({
        title: "Success",
        description: "Workflow data exported successfully",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to export workflow data',
        variant: "destructive",
      });
    }
  };

  const downloadExportData = () => {
    if (!exportData || !selectedWorkflow) return;
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedWorkflow.name}-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  // Refactor empty state handling to improve UI consistency
  if (!loading && workflows.length === 0) {
    return (
      <MainAppLayout title="Dashboard Overview">
        <ContentSection>
          <div className="bg-white border border-gray-200 rounded-lg p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Workflows Found
            </h3>
            <p className="text-gray-600 text-base mb-6 max-w-lg">
              It looks like you haven't added any workflows yet. Start by adding your first workflow to get started with WorkflowGuard.
            </p>
            <Button
              onClick={handleAddWorkflow}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow"
            >
              + Add Workflow
            </Button>
          </div>
        </ContentSection>
      </MainAppLayout>
    );
  }

  // Calculate active and protected workflows count for stats cards
  const activeWorkflowsCount = filteredWorkflows.filter(w => w.status === 'active').length;
  const protectedWorkflowsCount = filteredWorkflows.filter(w => w.protectionStatus === 'protected').length;

  return (
    <MainAppLayout title="Dashboard Overview">
      {/* Error Alert */}
      {fetchError && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {fetchError}
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
                  Last Snapshot: {stats?.lastSnapshot ? new Date(stats.lastSnapshot).toLocaleString() : 'Not available'}
                </p>
                {(searchTerm || statusFilter !== "all") && (
                  <p className="text-xs text-blue-600 mt-1">
                    Showing {filteredWorkflows.length} of {workflows.length} workflows
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={syncHubSpotChanges}
                disabled={syncing || isRefreshing}
                aria-label="Sync HubSpot Changes"
              >
                {syncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Sync Changes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshWorkflows()}
                disabled={isRefreshing || syncing}
                aria-label="Refresh Dashboard"
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh
              </Button>
            </div>
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
                {activeWorkflowsCount}
              </div>
              <div className="text-sm text-gray-600">Active Workflows</div>
              <div className="text-xs text-gray-500 mt-1">
                {protectedWorkflowsCount} protected
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
                {stats?.planUsed || 0}/{stats?.planCapacity || 100}
              </div>
              <div className="text-sm text-gray-600">Plan Usage</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats?.planCapacity && stats?.planUsed ? 
                  Math.round((stats.planUsed / stats.planCapacity) * 100) : 0}% used
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
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Protected Workflows ({filteredWorkflows.length})
                </h2>
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />}
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleAddWorkflow}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Workflow
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleExport('all')}
                  disabled={checkLoading('export')}
                >
                  {checkLoading('export') ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </>
                  )}
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
                <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
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
                    <tr key={workflow.id} className={`hover:bg-gray-50 ${workflow.isDeleted ? 'bg-red-50 border-l-4 border-red-400' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {workflow.isDeleted && (
                            <div className="w-2 h-2 bg-red-500 rounded-full" title="Deleted Workflow" />
                          )}
                          <span className={`text-sm font-medium ${workflow.isDeleted ? 'text-red-700 line-through' : 'text-gray-900'}`}>
                            {safeToString(workflow.name, 'Unnamed Workflow')}
                            {workflow.isDeleted && (
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                DELETED
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="secondary"
                          className={workflow.isDeleted ? 'bg-red-100 text-red-800 border-red-200' : getStatusColor(workflow.status)}
                        >
                          {workflow.isDeleted ? 'deleted' : safeToString(workflow.status, 'Unknown')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="secondary"
                          className={getProtectionStatusColor(workflow.protectionStatus)}
                        >
                          {safeToString(workflow.protectionStatus, 'Unprotected')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {safeToString(workflow.lastModified, 'Unknown')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {safeToString(workflow.versions, '1')} versions
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                              {(() => {
                                if (!workflow.lastModifiedBy || typeof workflow.lastModifiedBy !== 'object') {
                                  return 'U';
                                }
                                const initials = safeToString(workflow.lastModifiedBy.initials, '');
                                if (initials) return initials;
                                const name = safeToString(workflow.lastModifiedBy.name, 'Unknown');
                                return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
                              })()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">
                            {(() => {
                              if (!workflow.lastModifiedBy || typeof workflow.lastModifiedBy !== 'object') {
                                return 'Unknown User';
                              }
                              return safeToString(workflow.lastModifiedBy.name, 'Unknown User');
                            })()}
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
                          {workflow.isDeleted ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExportWorkflow(workflow)}
                              className="text-blue-600"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Export Data
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRollbackLatest(workflow)}
                              disabled={rollbacking[workflow.id]}
                              className="text-orange-600"
                            >
                              {rollbacking[workflow.id] ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                  Rolling Back...
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="w-4 h-4 mr-1" />
                                  Rollback
                                </>
                              )}
                            </Button>
                          )}
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
        version={selectedWorkflow ? {
          id: selectedWorkflow.id,
          versionNumber: selectedWorkflow.versions || 1,
          dateTime: selectedWorkflow.lastModified || new Date().toISOString(),
          modifiedBy: {
            name: selectedWorkflow.lastModifiedBy?.name || 'Unknown User',
            initials: selectedWorkflow.lastModifiedBy?.initials || 'U'
          },
          changeSummary: `Rollback workflow: ${selectedWorkflow.name}`,
          type: 'rollback',
          status: selectedWorkflow.status || 'unknown'
        } : null}
        loading={selectedWorkflow ? rollbacking[selectedWorkflow.id] : false}
      />

      {/* Restore Deleted Workflow Modal */}
      <RestoreDeletedWorkflowModal
        open={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        onConfirm={handleConfirmRestore}
        workflow={selectedWorkflow ? {
          id: selectedWorkflow.id,
          name: selectedWorkflow.name,
          deletedAt: selectedWorkflow.deletedAt || new Date().toISOString(),
        } : null}
        loading={selectedWorkflow ? restoring[selectedWorkflow.id] : false}
      />

      {/* Export Data Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Workflow Data: {selectedWorkflow?.name}
            </DialogTitle>
            <DialogDescription>
              Since HubSpot doesn't allow automatic workflow creation via API, use this data to manually recreate your workflow.
            </DialogDescription>
          </DialogHeader>

          {exportData && (
            <div className="space-y-6">
              {/* Manual Recreation Steps */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">📋 Manual Recreation Steps</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  {exportData.manualRecreationSteps?.map((step: string, index: number) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Workflow Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">ℹ️ Workflow Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {exportData.workflowInfo?.name}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {exportData.workflowInfo?.type}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Description:</span> {exportData.workflowInfo?.description}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {exportData.actions && exportData.actions.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-3">⚡ Workflow Actions</h3>
                  <div className="space-y-2">
                    {exportData.actions.map((action: any, index: number) => (
                      <div key={index} className="bg-white p-3 rounded border text-sm">
                        <div className="font-medium">Step {action.step}: {action.description}</div>
                        <div className="text-gray-600 mt-1">Type: {action.type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Triggers */}
              {exportData.triggers && exportData.triggers.length > 0 && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-3">🎯 Enrollment Triggers</h3>
                  <div className="space-y-2">
                    {exportData.triggers.map((trigger: any, index: number) => (
                      <div key={index} className="bg-white p-3 rounded border text-sm">
                        <div className="font-medium">{trigger.description}</div>
                        <div className="text-gray-600 mt-1">
                          Filters: {trigger.filters?.length || 0} conditions
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-3">⚙️ Workflow Settings</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Multiple Enrollments:</span>{' '}
                    {exportData.settings?.allowMultipleEnrollments ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <span className="font-medium">Start Enabled:</span> No (for safety)
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">📊 Backup Metadata</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Original HubSpot ID:</span> {exportData.metadata?.originalHubSpotId}
                  </div>
                  <div>
                    <span className="font-medium">Deleted At:</span>{' '}
                    {exportData.metadata?.deletedAt ? new Date(exportData.metadata.deletedAt).toLocaleString() : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Last Backup:</span>{' '}
                    {exportData.metadata?.lastBackupDate ? new Date(exportData.metadata.lastBackupDate).toLocaleString() : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Exported At:</span>{' '}
                    {exportData.metadata?.exportedAt ? new Date(exportData.metadata.exportedAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Close
            </Button>
            <Button onClick={downloadExportData} className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </MainAppLayout>
  );
};

export default Dashboard;
