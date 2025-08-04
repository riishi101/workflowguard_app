import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import EmptyWorkflowHistory from "@/components/EmptyWorkflowHistory";
import ViewDetailsModal from "@/components/ViewDetailsModal";
import CreateNewWorkflowModal from "@/components/CreateNewWorkflowModal";
import RestoreVersionModal from "@/components/RestoreVersionModal";
import { WorkflowState } from "@/lib/workflowState";
import { ApiService, WorkflowHistoryVersion } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  MoreHorizontal,
  ExternalLink,
  Eye,
  RotateCcw,
  Download,
  Copy,
  RefreshCw,
  AlertCircle,
  Clock,
  Shield,
} from "lucide-react";

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
  const [showViewDetails, setShowViewDetails] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ExtendedWorkflowHistoryVersion | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (workflowId) {
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
      
      // Safely filter and map workflows
      const safeWorkflows = response.data
        .filter((workflow: any) => workflow && typeof workflow === 'object')
        .map((workflow: any) => ({
          id: typeof workflow.id === 'string' ? workflow.id : '',
          name: typeof workflow.name === 'string' ? workflow.name : 'Unknown Workflow',
          status: typeof workflow.status === 'string' ? workflow.status : 'unknown',
          protectionStatus: typeof workflow.protectionStatus === 'string' ? workflow.protectionStatus : 'unknown',
          lastModified: typeof workflow.lastModified === 'string' ? workflow.lastModified : new Date().toISOString(),
          versions: typeof workflow.versions === 'number' ? workflow.versions : 0,
          lastModifiedBy: workflow.lastModifiedBy && typeof workflow.lastModifiedBy === 'object' ? {
            name: typeof workflow.lastModifiedBy.name === 'string' ? workflow.lastModifiedBy.name : 'Unknown',
            initials: typeof workflow.lastModifiedBy.initials === 'string' ? workflow.lastModifiedBy.initials : 'U',
            email: typeof workflow.lastModifiedBy.email === 'string' ? workflow.lastModifiedBy.email : 'unknown@example.com'
          } : {
            name: 'Unknown',
            initials: 'U',
            email: 'unknown@example.com'
          }
        }));
      
      setProtectedWorkflows(safeWorkflows);
      setHasWorkflows(safeWorkflows.length > 0);
      
    } catch (err: any) {
      console.error('Failed to fetch protected workflows:', err);
      setError(err.response?.data?.message || 'Failed to load workflows. Please try again.');
      setProtectedWorkflows([]);
      setHasWorkflows(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowData = async () => {
    if (!workflowId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch workflow details and history in parallel
      const [detailsResponse, historyResponse] = await Promise.all([
        ApiService.getWorkflowDetails(workflowId),
        ApiService.getWorkflowHistory(workflowId)
      ]);
      
      // Add safety checks for responses
      if (!detailsResponse || !detailsResponse.data) {
        throw new Error('No workflow details received from server');
      }
      
      if (!historyResponse || !historyResponse.data || !Array.isArray(historyResponse.data)) {
        throw new Error('No workflow history received from server');
      }
      
      setWorkflowDetails(detailsResponse.data);
      
      // Safely map versions with validation
      const safeVersions = historyResponse.data
        .filter((version: any) => version && typeof version === 'object')
        .map((version: WorkflowHistoryVersion) => ({
          id: typeof version.id === 'string' ? version.id : '',
          date: typeof version.date === 'string' ? version.date : new Date().toISOString(),
          type: typeof version.type === 'string' ? version.type : 'Unknown',
          initiator: typeof version.initiator === 'string' ? version.initiator : 'Unknown',
          notes: typeof version.notes === 'string' ? version.notes : 'No notes available',
          workflowId: typeof version.workflowId === 'string' ? version.workflowId : '',
          versionNumber: typeof version.versionNumber === 'number' ? version.versionNumber : 0,
          changes: version.changes && typeof version.changes === 'object' ? version.changes : null,
          status: typeof version.status === 'string' ? version.status : 'unknown',
          selected: false
        }));
      
      setVersions(safeVersions);
      
    } catch (err: any) {
      console.error('Failed to fetch workflow data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load workflow history. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load workflow history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setError(null);
    fetchWorkflowData();
  };

  const handleRestoreVersion = async (version: ExtendedWorkflowHistoryVersion) => {
    if (!workflowId) return;
    
    try {
      setRestoring(true);
      const response = await ApiService.restoreWorkflowVersion(workflowId, version.id);
      
      toast({
        title: "Version Restored",
        description: response.data?.message || `Successfully restored version from ${version.date}`,
      });
      
      // Refresh the data
      fetchWorkflowData();
      setShowRestore(false);
      
    } catch (err: any) {
      console.error('Failed to restore version:', err);
      toast({
        title: "Restore Failed",
        description: err.response?.data?.message || "Failed to restore version. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRestoring(false);
    }
  };

  const handleDownloadVersion = async (version: ExtendedWorkflowHistoryVersion) => {
    if (!workflowId) return;
    
    try {
      const response = await ApiService.downloadWorkflowVersion(workflowId, version.id);
      
      // Add safety check for response.data
      if (!response || !response.data) {
        throw new Error('No data received from server');
      }
      
      // Create and download the file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const workflowName = workflowDetails?.name || 'unknown-workflow';
      const versionNumber = typeof version.versionNumber === 'number' ? version.versionNumber : 'unknown';
      a.download = `workflow-${workflowName}-version-${versionNumber}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Complete",
        description: "Workflow version downloaded successfully.",
      });
      
    } catch (err: any) {
      console.error('Failed to download version:', err);
      toast({
        title: "Download Failed",
        description: "Failed to download workflow version. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!hasWorkflows) {
    return <EmptyWorkflowHistory />;
  }

  if (!workflowId) {
    // Show list of protected workflows
    return (
      <MainAppLayout title="Workflow History">
        <ContentSection>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Workflow History</h2>
              <p className="text-gray-600 mt-1">Select a workflow to view its version history</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProtectedWorkflows}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchProtectedWorkflows}
                  className="ml-2"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
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
                        Versions
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                        Last Modified
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {protectedWorkflows.map((workflow) => (
                      <tr key={workflow.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-blue-500" />
                            <span className="text-sm font-medium text-gray-900">
                              {workflow.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="secondary"
                            className={workflow.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                          >
                            {workflow.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            {workflow.protectionStatus}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {workflow.versions} versions
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(workflow.lastModified).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/workflow-history/${workflow.id}`)}
                            className="text-blue-600"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View History
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </ContentSection>
      </MainAppLayout>
    );
  }

  if (loading) {
    return (
      <MainAppLayout title="Workflow History">
        <ContentSection>
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </ContentSection>
        <ContentSection>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ContentSection>
      </MainAppLayout>
    );
  }

  if (error) {
    return (
      <MainAppLayout title="Workflow History">
        <ContentSection>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="ml-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </ContentSection>
      </MainAppLayout>
    );
  }

  const selectedCount = versions.filter((v) => v.selected).length;
  const selectedVersions = versions.filter((v) => v.selected);

  const handleCompareVersions = () => {
    if (selectedCount === 2) {
      const selectedVersions = versions.filter((v) => v.selected);
      if (selectedVersions.length === 2 && selectedVersions[0]?.id && selectedVersions[1]?.id) {
        navigate(
          `/compare-versions?versionA=${selectedVersions[0].id}&versionB=${selectedVersions[1].id}`,
        );
      } else {
        toast({
          title: "Error",
          description: "Unable to compare versions. Please try selecting different versions.",
          variant: "destructive",
        });
      }
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

  const handleViewDetails = (version: ExtendedWorkflowHistoryVersion) => {
    setSelectedVersion(version);
    setShowViewDetails(true);
  };

  const handleCreateNew = (version: ExtendedWorkflowHistoryVersion) => {
    setSelectedVersion(version);
    setShowCreateNew(true);
  };

  const handleRestore = (version: ExtendedWorkflowHistoryVersion) => {
    setSelectedVersion(version);
    setShowRestore(true);
  };

  const handleCopyVersionInfo = (version: ExtendedWorkflowHistoryVersion) => {
    const versionInfo = {
      id: version.id,
      versionNumber: version.versionNumber,
      date: version.date,
      type: version.type,
      initiator: version.initiator,
      notes: version.notes,
    };
    
    navigator.clipboard.writeText(JSON.stringify(versionInfo, null, 2));
    toast({
      title: "Version Info Copied",
      description: "Version information has been copied to clipboard.",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "On-Publish Save":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Manual Snapshot":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "Daily Backup":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      case "System Backup":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-gray-400";
      case "restored":
        return "bg-blue-500";
      default:
        return "bg-gray-400";
    }
  };

  const getChangesSummary = (version: ExtendedWorkflowHistoryVersion) => {
    if (!version.changes || typeof version.changes !== 'object') {
      return "No changes recorded";
    }
    
    const { added, modified, removed } = version.changes;
    const changes = [];
    
    if (added && typeof added === 'number' && added > 0) {
      changes.push(`${added} added`);
    }
    if (modified && typeof modified === 'number' && modified > 0) {
      changes.push(`${modified} modified`);
    }
    if (removed && typeof removed === 'number' && removed > 0) {
      changes.push(`${removed} removed`);
    }
    
    return changes.length > 0 ? changes.join(', ') : "No changes recorded";
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRefresh}
        disabled={loading}
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh
      </Button>
      {workflowDetails?.hubspotId && (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-blue-600"
          onClick={() => {
            const hubspotUrl = `https://app.hubspot.com/workflows/${workflowDetails.hubspotId}`;
            window.open(hubspotUrl, '_blank');
          }}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Go to Workflow in HubSpot
        </Button>
      )}
    </div>
  );

  return (
    <MainAppLayout 
      title="Workflow History"
      headerActions={headerActions}
    >
      {/* Workflow Info */}
      <ContentSection>
        {workflowDetails && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {typeof workflowDetails.name === 'string' ? workflowDetails.name : 'Unknown Workflow'}
                </h2>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(workflowDetails.status)}`}></div>
                  <span className="text-sm text-gray-600 capitalize">{typeof workflowDetails.status === 'string' ? workflowDetails.status : 'Unknown'}</span>
                </div>
                <span className="text-sm text-gray-500">ID: {typeof workflowDetails.id === 'string' ? workflowDetails.id : 'Unknown'}</span>
              </div>
              <div className="text-sm text-gray-500">
                Last modified: {workflowDetails.lastModified ? new Date(workflowDetails.lastModified).toLocaleString() : 'Unknown'}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>📊 {Array.isArray(versions) ? versions.length : 0} versions</span>
              <span>📅 {versions.length > 0 && versions[0]?.date ? new Date(versions[0].date).toLocaleDateString() : 'Unknown'} - {versions.length > 0 && versions[versions.length - 1]?.date ? new Date(versions[versions.length - 1].date).toLocaleDateString() : 'Unknown'}</span>
            </div>
          </div>
        )}
      </ContentSection>

      {/* Versions Table */}
      <ContentSection>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {versions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No versions found
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                This workflow doesn't have any saved versions yet.
              </p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          ) : (
            <>
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
                        Changes
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
                          {version.date ? new Date(version.date).toLocaleString() : 'Unknown date'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="secondary"
                            className={getTypeColor(version.type)}
                          >
                            {typeof version.type === 'string' ? version.type : 'Unknown'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <span>👤</span>
                            <span>{typeof version.initiator === 'string' ? version.initiator : 'Unknown'}</span>
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
                              {typeof version.notes === 'string' ? version.notes : 'No notes available'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <span>📊</span>
                            <span className="text-xs">
                              {getChangesSummary(version)}
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
                                  disabled={restoring}
                                >
                                  <RotateCcw className="w-4 h-4 mr-3" />
                                  {restoring ? "Restoring..." : "Restore this Version"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDownloadVersion(version)}
                                >
                                  <Download className="w-4 h-4 mr-3" />
                                  Download Workflow JSON
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleCreateNew(version)}
                                >
                                  <Copy className="w-4 h-4 mr-3" />
                                  Set as Base for New Workflow
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleCopyVersionInfo(version)}
                                >
                                  <Copy className="w-4 h-4 mr-3" />
                                  Copy Version Info
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
            </>
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
        onRestore={handleRestoreVersion}
        loading={restoring}
      />
    </MainAppLayout>
  );
};

export default WorkflowHistory;
