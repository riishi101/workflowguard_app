import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Download,
  Eye,
  GitCompare,
  RotateCcw,
  Plus,
  Activity,
  AlertCircle,
  CheckCircle,
  Mail,
  Clock,
  Filter,
  Users,
  Zap,
  RefreshCw,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import EmptyWorkflowHistory from "@/components/EmptyWorkflowHistory";
import { WorkflowState } from "@/lib/workflowState";
import { ApiService, WorkflowHistoryVersion } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface ExtendedWorkflowHistoryVersion extends WorkflowHistoryVersion {
  selected?: boolean;
}

interface WorkflowDetails {
  id: string;
  name: string;
  status: string;
  hubspotId: string;
  lastModified: string;
  totalVersions: number;
}

interface ProtectedWorkflow {
  id: string;
  name: string;
  status: string;
  protectionStatus: string;
  lastModified: string;
  versions: number;
  lastModifiedBy: {
    name: string;
    initials: string;
    email: string;
  };
}

// Mock workflow configuration data for demonstration
const mockWorkflowConfig = {
  v5: {
    name: "Lead Nurturing Campaign - Version 5",
    trigger: {
      type: "Contact property updated",
      property: "Lead Score",
      condition: "is greater than 75",
    },
    steps: [
      {
        id: 1,
        type: "delay",
        name: "Wait 1 day",
        icon: Clock,
        config: { delay: "1 day" },
      },
      {
        id: 2,
        type: "email",
        name: "Welcome Email",
        icon: Mail,
        config: {
          template: "Welcome_Template_v2",
          subject: "Welcome to our platform!",
        },
      },
      {
        id: 3,
        type: "internal_email",
        name: "Send Internal Email",
        icon: Mail,
        config: {
          recipients: ["sales@company.com"],
          subject: "New qualified lead",
        },
      },
      {
        id: 4,
        type: "branch",
        name: "Premium Customer Branch",
        icon: Filter,
        config: { condition: "Contact property 'Plan Type' is 'Premium'" },
      },
      {
        id: 5,
        type: "automation",
        name: "Assign to Sales Rep",
        icon: Users,
        config: { action: "Create task for sales team" },
      },
    ],
  },
  v4: {
    name: "Lead Nurturing Campaign - Version 4",
    trigger: {
      type: "Contact property updated",
      property: "Lead Score",
      condition: "is greater than 50",
    },
    steps: [
      {
        id: 1,
        type: "delay",
        name: "Wait 2 days",
        icon: Clock,
        config: { delay: "2 days" },
      },
      {
        id: 2,
        type: "email",
        name: "Welcome Email",
        icon: Mail,
        config: { template: "Welcome_Template_v1", subject: "Welcome!" },
      },
      {
        id: 3,
        type: "branch",
        name: "Premium Customer Branch",
        icon: Filter,
        config: { condition: "Contact property 'Plan Type' is 'Premium'" },
      },
      {
        id: 4,
        type: "automation",
        name: "Assign to Sales Rep",
        icon: Users,
        config: { action: "Create task for sales team" },
      },
    ],
  },
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "inactive":
      return <Activity className="h-4 w-4 text-gray-400" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Activity className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-50 text-green-700 border-green-200";
    case "inactive":
      return "bg-gray-50 text-gray-700 border-gray-200";
    case "error":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const getChangeTypeBadge = (type: string) => {
  switch (type) {
    case "Manual Save":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          Manual Save
        </Badge>
      );
    case "Auto Backup":
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200"
        >
          Auto Backup
        </Badge>
      );
    case "System Backup":
      return (
        <Badge
          variant="outline"
          className="bg-orange-50 text-orange-700 border-orange-200"
        >
          System Backup
        </Badge>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

const WorkflowHistory = () => {
  const navigate = useNavigate();
  const { workflowId } = useParams<{ workflowId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [hasWorkflows, setHasWorkflows] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<ExtendedWorkflowHistoryVersion[]>([]);
  const [workflowDetails, setWorkflowDetails] = useState<WorkflowDetails | null>(null);
  const [protectedWorkflows, setProtectedWorkflows] = useState<ProtectedWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("");
  const [rollbackConfirmOpen, setRollbackConfirmOpen] = useState(false);
  const [selectedVersionForRollback, setSelectedVersionForRollback] = useState<string | null>(null);
  const [viewVersionOpen, setViewVersionOpen] = useState(false);
  const [selectedVersionForView, setSelectedVersionForView] = useState<string | null>(null);
  const [compareVersionsOpen, setCompareVersionsOpen] = useState(false);
  const [selectedVersionsForCompare, setSelectedVersionsForCompare] = useState<{
    older: string;
    newer: string;
  } | null>(null);

  useEffect(() => {
    if (workflowId) {
      setSelectedWorkflow(workflowId);
      fetchWorkflowData();
    } else {
      fetchProtectedWorkflows();
    }
  }, [workflowId]);

  const fetchProtectedWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.getProtectedWorkflows(user?.id);
      
      // Add safety checks for response
      if (!response || !response.data || !Array.isArray(response.data)) {
        setProtectedWorkflows([]);
        setHasWorkflows(false);
        return;
      }

      // Safely map the response data
      const safeWorkflows: ProtectedWorkflow[] = response.data.map((workflow: any) => ({
        id: workflow.id || 'unknown',
        name: workflow.name || 'Unknown Workflow',
        status: workflow.status || 'unknown',
        protectionStatus: workflow.protectionStatus || 'unknown',
        lastModified: workflow.lastModified || 'Unknown',
        versions: typeof workflow.versions === 'number' ? workflow.versions : 0,
        lastModifiedBy: {
          name: workflow.lastModifiedBy?.name || 'Unknown User',
          initials: workflow.lastModifiedBy?.initials || 'UU',
          email: workflow.lastModifiedBy?.email || 'unknown@example.com'
        }
      }));

      setProtectedWorkflows(safeWorkflows);
      setHasWorkflows(safeWorkflows.length > 0);
      
      if (safeWorkflows.length > 0 && !selectedWorkflow) {
        setSelectedWorkflow(safeWorkflows[0].id);
      }
    } catch (err: any) {
      console.error('Failed to fetch protected workflows:', err);
      setError(err.message || 'Failed to load workflows');
      setProtectedWorkflows([]);
      setHasWorkflows(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowData = async () => {
    if (!selectedWorkflow) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch workflow details and history
      const [detailsResponse, historyResponse] = await Promise.all([
        ApiService.getWorkflowDetails(selectedWorkflow),
        ApiService.getWorkflowHistory(selectedWorkflow)
      ]);

      // Safely set workflow details
      if (detailsResponse && detailsResponse.data) {
        const details = detailsResponse.data;
        setWorkflowDetails({
          id: details.id || selectedWorkflow,
          name: details.name || 'Unknown Workflow',
          status: details.status || 'unknown',
          hubspotId: details.hubspotId || 'unknown',
          lastModified: details.lastModified || 'Unknown',
          totalVersions: typeof details.totalVersions === 'number' ? details.totalVersions : 0
        });
      } else {
        setWorkflowDetails({
          id: selectedWorkflow,
          name: 'Unknown Workflow',
          status: 'unknown',
          hubspotId: 'unknown',
          lastModified: 'Unknown',
          totalVersions: 0
        });
      }

      // Safely set versions
      if (historyResponse && historyResponse.data && Array.isArray(historyResponse.data)) {
        const safeVersions: ExtendedWorkflowHistoryVersion[] = historyResponse.data.map((version: any) => ({
          id: version.id || 'unknown',
          workflowId: version.workflowId || selectedWorkflow,
          versionNumber: typeof version.versionNumber === 'number' ? version.versionNumber : 0,
          date: version.date || 'Unknown',
          type: version.type || 'Unknown',
          initiator: version.initiator || 'Unknown User',
          notes: version.notes || 'No notes available',
          changes: version.changes || { added: 0, modified: 0, removed: 0 },
          status: version.status || 'unknown',
          selected: false
        }));
        setVersions(safeVersions);
      } else {
        setVersions([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch workflow data:', err);
      setError(err.message || 'Failed to load workflow data');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowChange = (workflowId: string) => {
    setSelectedWorkflow(workflowId);
    navigate(`/workflow-history/${workflowId}`);
  };

  const handleSyncHubSpot = async () => {
    try {
      setLoading(true);
      const response = await ApiService.syncHubSpotWorkflows();
      
      toast({
        title: "Sync Successful",
        description: response.message || "Successfully synced workflows from HubSpot",
      });
      
      // Refresh the workflows list
      await fetchProtectedWorkflows();
    } catch (err: any) {
      console.error('Failed to sync HubSpot workflows:', err);
      toast({
        title: "Sync Failed",
        description: err.message || "Failed to sync workflows from HubSpot",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutomatedBackup = async () => {
    if (!selectedWorkflow) return;
    
    try {
      setLoading(true);
      const response = await ApiService.createAutomatedBackup(selectedWorkflow);
      
      toast({
        title: "Backup Created",
        description: "Automated backup created successfully",
      });
      
      // Refresh the workflow data
      await fetchWorkflowData();
    } catch (err: any) {
      console.error('Failed to create automated backup:', err);
      toast({
        title: "Backup Failed",
        description: err.message || "Failed to create automated backup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeNotification = async (changes: any) => {
    if (!selectedWorkflow) return;
    
    try {
      await ApiService.createChangeNotification(selectedWorkflow, changes);
      
      toast({
        title: "Change Notified",
        description: "Change notification sent successfully",
      });
    } catch (err: any) {
      console.error('Failed to create change notification:', err);
      toast({
        title: "Notification Failed",
        description: err.message || "Failed to send change notification",
        variant: "destructive",
      });
    }
  };

  const handleApprovalRequest = async (requestedChanges: any) => {
    if (!selectedWorkflow) return;
    
    try {
      setLoading(true);
      const response = await ApiService.createApprovalRequest(selectedWorkflow, requestedChanges);
      
      toast({
        title: "Approval Requested",
        description: "Approval request created successfully",
      });
    } catch (err: any) {
      console.error('Failed to create approval request:', err);
      toast({
        title: "Request Failed",
        description: err.message || "Failed to create approval request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplianceReport = async () => {
    if (!selectedWorkflow) return;
    
    try {
      setLoading(true);
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // Last 30 days
      
      const report = await ApiService.generateComplianceReport(selectedWorkflow, startDate, endDate);
      
      // Create and download the report
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${selectedWorkflow}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Report Generated",
        description: "Compliance report downloaded successfully",
      });
    } catch (err: any) {
      console.error('Failed to generate compliance report:', err);
      toast({
        title: "Report Failed",
        description: err.message || "Failed to generate compliance report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = (versionId: string) => {
    setSelectedVersionForRollback(versionId);
    setRollbackConfirmOpen(true);
  };

  const handleViewVersion = (versionId: string) => {
    setSelectedVersionForView(versionId);
    setViewVersionOpen(true);
  };

  const handleCompareVersions = (versionId: string) => {
    // For demo purposes, we'll compare with the previous version
    const versionNumber = parseInt(versionId.replace("v", ""));
    const olderVersion = `v${versionNumber - 1}`;
    const newerVersion = versionId;

    setSelectedVersionsForCompare({ older: olderVersion, newer: newerVersion });
    setCompareVersionsOpen(true);
  };

  const confirmRollback = async () => {
    if (!selectedVersionForRollback) return;
    
    try {
      setLoading(true);
      await ApiService.restoreWorkflowVersion(selectedWorkflow, selectedVersionForRollback);
      
      toast({
        title: "Rollback Successful",
        description: "Workflow has been restored to the selected version.",
      });
      
      // Refresh the data
      await fetchWorkflowData();
    } catch (err: any) {
      toast({
        title: "Rollback Failed",
        description: err.message || "Failed to restore workflow version.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRollbackConfirmOpen(false);
      setSelectedVersionForRollback(null);
    }
  };

  const handleDownloadVersion = async (versionId: string) => {
    try {
      const response = await ApiService.downloadWorkflowVersion(selectedWorkflow, versionId);
      
      // Add safety check for response.data
      if (!response || !response.data) {
        throw new Error('No data received from server');
      }
      
      // Create and download the file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const workflowName = workflowDetails?.name || 'unknown-workflow';
      a.download = `workflow-${workflowName}-v${versionId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Complete",
        description: "Workflow version downloaded successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Download Failed",
        description: err.response?.data?.message || err.message || "Failed to download workflow version. Please try again.",
        variant: "destructive",
      });
    }
  };

  const currentWorkflow = protectedWorkflows.find(
    (wf) => wf.id === selectedWorkflow,
  );

  const currentViewConfig = selectedVersionForView
    ? mockWorkflowConfig[
        selectedVersionForView as keyof typeof mockWorkflowConfig
      ]
    : null;
  const olderVersionConfig = selectedVersionsForCompare?.older
    ? mockWorkflowConfig[
        selectedVersionsForCompare.older as keyof typeof mockWorkflowConfig
      ]
    : null;
  const newerVersionConfig = selectedVersionsForCompare?.newer
    ? mockWorkflowConfig[
        selectedVersionsForCompare.newer as keyof typeof mockWorkflowConfig
      ]
    : null;

  if (loading) {
    return (
      <MainAppLayout>
        <ContentSection>
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
        </ContentSection>
      </MainAppLayout>
    );
  }

  if (error) {
    return (
      <MainAppLayout>
        <ContentSection>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </ContentSection>
      </MainAppLayout>
    );
  }

  if (!hasWorkflows) {
    return <EmptyWorkflowHistory />;
  }

  // Transform versions to match the new UI format
  const transformedVersions = versions.map((version, index) => ({
    id: version.id,
    version: `Version ${version.versionNumber}`,
    dateTime: version.date,
    lastModifiedBy: version.initiator,
    changeSummary: version.notes,
    changeType: version.type,
    isCurrent: index === 0, // Assume the first version is current
  }));

  return (
    <MainAppLayout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-semibold text-gray-900">
                Workflow History
              </h1>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncHubSpot}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Sync HubSpot
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAutomatedBackup}
                  disabled={loading || !selectedWorkflow}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Auto Backup
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleComplianceReport}
                  disabled={loading || !selectedWorkflow}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Compliance Report
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchWorkflowData}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Workflow Selector */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Current Workflow
              </CardTitle>
              <CardDescription>
                Select a workflow to view its complete version history and audit
                trail
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-1 max-w-md">
                  <Select
                    value={selectedWorkflow}
                    onValueChange={handleWorkflowChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a workflow" />
                    </SelectTrigger>
                    <SelectContent>
                      {protectedWorkflows.map((workflow) => (
                        <SelectItem key={workflow.id} value={workflow.id}>
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(workflow.status)}
                            <span>{workflow.name}</span>
                            <Badge className={getStatusColor(workflow.status)}>
                              {workflow.status}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {currentWorkflow && (
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(currentWorkflow.status)}
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={getStatusColor(currentWorkflow.status)}>
                      {currentWorkflow.status}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Version History Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Version History
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Complete audit trail of all changes made to the{" "}
                {currentWorkflow?.name} workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-white rounded-lg">
                {transformedVersions.length > 0 ? (
                  transformedVersions.map((version, index) => (
                    <div
                      key={version.id}
                      className={`border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors ${
                        version.isCurrent ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          {/* Left side - Main content */}
                          <div className="flex-1 space-y-3">
                            {/* Version and Date Header */}
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                    version.isCurrent
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {version.version.replace("Version ", "V")}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-gray-900 text-lg">
                                      {version.version}
                                    </span>
                                    {version.isCurrent && (
                                      <Badge className="bg-green-100 text-green-700 border-green-300 font-medium">
                                        Current
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {version.dateTime}
                                  </p>
                                </div>
                              </div>

                              <div className="ml-auto">
                                {getChangeTypeBadge(version.changeType)}
                              </div>
                            </div>

                            {/* Change Summary */}
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-gray-800 leading-relaxed">
                                {version.changeSummary}
                              </p>
                            </div>

                            {/* Modified By */}
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {version.lastModifiedBy
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </span>
                              </div>
                              <span className="text-gray-600">Modified by</span>
                              <span className="font-medium text-gray-900">
                                {version.lastModifiedBy}
                              </span>
                            </div>
                          </div>

                          {/* Right side - Actions */}
                          <div className="ml-6 flex items-start">
                            <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                                onClick={() => handleViewVersion(version.id)}
                                title="View Version"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                                onClick={() => handleCompareVersions(version.id)}
                                title="Compare Versions"
                              >
                                <GitCompare className="h-4 w-4" />
                              </Button>
                              {!version.isCurrent && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm text-orange-600 hover:text-orange-700"
                                      onClick={() => handleRollback(version.id)}
                                      title="Rollback to this version"
                                    >
                                      <RotateCcw className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Confirm Rollback</DialogTitle>
                                      <DialogDescription>
                                        Are you sure you want to rollback to{" "}
                                        {version.version}? This will replace the
                                        current workflow configuration and cannot be
                                        undone.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
                                      <div className="flex">
                                        <AlertCircle className="h-5 w-5 text-amber-400 mr-2 mt-0.5" />
                                        <div>
                                          <h4 className="text-sm font-medium text-amber-800">
                                            Warning
                                          </h4>
                                          <p className="text-sm text-amber-700 mt-1">
                                            This action will permanently replace
                                            your current workflow with the selected
                                            version. All changes made after{" "}
                                            {version.dateTime} will be lost.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() =>
                                          setRollbackConfirmOpen(false)
                                        }
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={confirmRollback}
                                      >
                                        Confirm Rollback
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                                onClick={() => handleDownloadVersion(version.id)}
                                title="Download Version"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm text-green-600 hover:text-green-700"
                                title="Create New from Version"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Version History
                    </h3>
                    <p className="text-gray-600">
                      This workflow doesn't have any version history yet.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* View Version Modal */}
          <Dialog open={viewVersionOpen} onOpenChange={setViewVersionOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  {currentViewConfig?.name}
                </DialogTitle>
                <DialogDescription>
                  Read-only view of the workflow configuration as it existed at
                  this version
                </DialogDescription>
              </DialogHeader>

              {currentViewConfig && (
                <div className="space-y-6">
                  {/* Trigger Configuration */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      Workflow Trigger
                    </h3>
                    <div className="text-sm text-blue-800">
                      <p>
                        <strong>Type:</strong> {currentViewConfig.trigger.type}
                      </p>
                      <p>
                        <strong>Property:</strong>{" "}
                        {currentViewConfig.trigger.property}
                      </p>
                      <p>
                        <strong>Condition:</strong>{" "}
                        {currentViewConfig.trigger.condition}
                      </p>
                    </div>
                  </div>

                  {/* Workflow Diagram */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Workflow Steps
                    </h3>
                    <div className="space-y-4">
                      {currentViewConfig.steps.map((step, index) => {
                        const IconComponent = step.icon;
                        return (
                          <div
                            key={step.id}
                            className="flex items-start space-x-4"
                          >
                            {/* Step Number */}
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                              {index + 1}
                            </div>

                            {/* Step Content */}
                            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <IconComponent className="h-5 w-5 text-gray-600" />
                                <h4 className="font-medium text-gray-900">
                                  {step.name}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {step.type}
                                </Badge>
                              </div>

                              {/* Step Configuration */}
                              <div className="bg-white border border-gray-100 rounded p-3 text-sm">
                                <h5 className="font-medium text-gray-700 mb-2">
                                  Configuration:
                                </h5>
                                <div className="space-y-1 text-gray-600">
                                  {Object.entries(step.config).map(
                                    ([key, value]) => (
                                      <div
                                        key={key}
                                        className="flex justify-between"
                                      >
                                        <span className="capitalize">{key}:</span>
                                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                          {Array.isArray(value)
                                            ? value.join(", ")
                                            : value.toString()}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Connector Line */}
                            {index < currentViewConfig.steps.length - 1 && (
                              <div className="absolute left-4 mt-8 w-0.5 h-6 bg-gray-300 transform translate-x-3.5"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Workflow Metadata */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Version Metadata
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Steps:</p>
                        <p className="font-medium">
                          {currentViewConfig.steps.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Trigger Type:</p>
                        <p className="font-medium">
                          {currentViewConfig.trigger.type}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setViewVersionOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Compare Versions Modal */}
          <Dialog
            open={compareVersionsOpen}
            onOpenChange={setCompareVersionsOpen}
          >
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-4">
                <DialogTitle className="text-lg font-medium text-gray-900">
                  Comparing Version 4 vs. Version 5
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-8">
                {/* Left Column - Version 4 */}
                <div className="space-y-4">
                  <div className="pb-2">
                    <h3 className="font-semibold text-gray-900 text-base">
                      Version 4
                    </h3>
                    <p className="text-sm text-gray-500">
                      August 4, 2025 at 14:23 IST
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Initial Setup */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            Initial Setup
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            Configure project environment and dependencies
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Database Configuration */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            Database Configuration
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            Set up database connection and migrations
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* User Authentication */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            User Authentication
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            Implement login and registration flows
                          </p>
                        </div>
                        <div className="ml-3">
                          <span className="text-xs text-orange-600 font-medium">
                            Modified
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dashboard Layout */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            Dashboard Layout
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            Create main dashboard interface
                          </p>
                        </div>
                        <div className="ml-3">
                          <span className="text-xs text-red-600 font-medium">
                            Deleted
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Version 5 */}
                <div className="space-y-4">
                  <div className="pb-2">
                    <h3 className="font-semibold text-gray-900 text-base">
                      Version 5
                    </h3>
                    <p className="text-sm text-gray-500">
                      August 4, 2025 at 17:01 IST
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Initial Setup */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            Initial Setup
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            Configure project environment and dependencies
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Database Configuration */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            Database Configuration
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            Set up database connection and migrations
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* User Authentication */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            User Authentication
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            Implement login, registration, and password recovery
                            flows
                          </p>
                        </div>
                        <div className="ml-3">
                          <span className="text-xs text-orange-600 font-medium">
                            Modified
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Analytics Dashboard */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            Analytics Dashboard
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            Create analytics dashboard with data visualization
                          </p>
                        </div>
                        <div className="ml-3">
                          <span className="text-xs text-green-600 font-medium">
                            Added
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-6 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-100 rounded border border-green-300"></div>
                    <span className="text-green-600 font-medium">Added</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-100 rounded border border-red-300"></div>
                    <span className="text-red-600 font-medium">Removed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-100 rounded border border-orange-300"></div>
                    <span className="text-orange-600 font-medium">Modified</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCompareVersionsOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </MainAppLayout>
  );
};

export default WorkflowHistory;
