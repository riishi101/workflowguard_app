import { useState, useEffect } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import { useToast } from "@/hooks/use-toast";
import { ApiService } from "@/lib/api";
import {
  ArrowLeft,
  Plus,
  Minus,
  Mail,
  Clock,
  Calendar,
  RotateCcw,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  Download,
  Target,
  Search,
  ChevronDown,
  ChevronRight,
  Filter,
  Workflow,
  Settings,
  Users,
  Calendar as CalendarIcon
} from "lucide-react";

interface WorkflowVersion {
  id: string;
  versionNumber: string;
  dateTime: string;
  notes: string;
  changes: {
    added: number;
    modified: number;
    removed: number;
  };
  status: string;
  type?: string;
  date?: string;
  initiator?: string;
  steps?: any[];
}

interface WorkflowHistoryVersion extends WorkflowVersion {}

const CompareVersions = () => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [versionA, setVersionA] = useState(searchParams.get("versionA") || "");
  const [versionB, setVersionB] = useState(searchParams.get("versionB") || "");
  const [syncScroll, setSyncScroll] = useState(true);
  const [workflowDetails, setWorkflowDetails] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<{
    versionA: WorkflowVersion | null;
    versionB: WorkflowVersion | null;
    differences: {
      added: any[];
      modified: any[];
      removed: any[];
    };
    workflowMetadata?: {
      versionA: any;
      versionB: any;
      changes: any[];
    };
    stepComparison?: {
      steps: {
        versionA: any[];
        versionB: any[];
      };
      changes: any[];
      summary: any;
    };
  } | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (workflowId) {
      // Allow both UUID and HubSpot ID formats for comparison
      fetchVersions();
    }
  }, [workflowId]);

  useEffect(() => {
    if (versionA && versionB && workflowId) {
      fetchComparisonData();
    }
  }, [versionA, versionB, workflowId]);

  const fetchVersions = async () => {
    if (!workflowId) return;

    try {
      setLoading(true);
      setError(null);

      const [workflowResponse, versionsResponse] = await Promise.all([
        ApiService.getWorkflowDetails(workflowId),
        ApiService.getWorkflowVersionsForComparison(workflowId),
      ]);

      // Add safety checks for responses
      if (!workflowResponse || !workflowResponse.data) {
        throw new Error("No workflow details received from server");
      }

      if (!versionsResponse || !versionsResponse.data || !Array.isArray(versionsResponse.data)) {
        throw new Error("No workflow versions received from server");
      }

      // Safely set workflow details
      const safeWorkflowDetails = {
        id: typeof workflowResponse.data.id === "string" ? workflowResponse.data.id : "",
        name: typeof workflowResponse.data.name === "string" ? workflowResponse.data.name : "Unknown Workflow",
        status: typeof workflowResponse.data.status === "string" ? workflowResponse.data.status : "unknown",
        lastModified: typeof workflowResponse.data.lastModified === "string" ? workflowResponse.data.lastModified : new Date().toISOString(),
        totalVersions: typeof workflowResponse.data.totalVersions === "number" ? workflowResponse.data.totalVersions : 0,
      };

      setWorkflowDetails(safeWorkflowDetails);

      // Safely filter and map versions
      const safeVersions = versionsResponse.data
        .filter((version: any) => version && typeof version === "object")
        .map((version: any) => ({
          id: typeof version.id === "string" ? version.id : "",
          versionNumber: typeof version.versionNumber === "string" ? version.versionNumber : "",
          dateTime: typeof version.dateTime === "string" ? version.dateTime : new Date().toISOString(),
          notes: typeof version.notes === "string" ? version.notes : "No notes available",
          changes: version.changes && typeof version.changes === "object" ? version.changes : null,
          status: typeof version.status === "string" ? version.status : "unknown",
        }));

      setVersions(safeVersions);

      // Set default versions if not already set
      if (safeVersions.length >= 2) {
        if (!versionA) setVersionA(safeVersions[0].id);
        if (!versionB) setVersionB(safeVersions[1].id);
      }
    } catch (err: any) {
      console.error("Failed to fetch versions:", err);
      setError(err.response?.data?.message || err.message || "Failed to load workflow versions. Please try again.");
      setVersions([]);
      toast({
        title: "Error",
        description: "Failed to load workflow versions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComparisonData = async () => {
    if (!workflowId || !versionA || !versionB) return;

    try {
      setLoading(true);
      const response = await ApiService.compareWorkflowVersions(workflowId, versionA, versionB);

      console.log("Comparison response:", response); // Debug log

      // Add safety checks for response
      if (!response || !response.data) {
        throw new Error("No comparison data received from server");
      }

      // Safely set comparison data with validation
      const safeComparisonData = {
        versionA: response.data.versionA && typeof response.data.versionA === "object" ? response.data.versionA : null,
        versionB: response.data.versionB && typeof response.data.versionB === "object" ? response.data.versionB : null,
        differences: response.data.differences && typeof response.data.differences === "object" ? {
          added: Array.isArray(response.data.differences.added) ? response.data.differences.added : [],
          modified: Array.isArray(response.data.differences.modified) ? response.data.differences.modified : [],
          removed: Array.isArray(response.data.differences.removed) ? response.data.differences.removed : [],
        } : {
          added: [],
          modified: [],
          removed: [],
        },
      };

      console.log("Safe comparison data:", safeComparisonData); // Debug log
      setComparisonData(safeComparisonData);
    } catch (err: any) {
      console.error("Failed to fetch comparison data:", err);
      setComparisonData(null);
      toast({
        title: "Comparison Failed",
        description: err.response?.data?.message || err.message || "Failed to compare workflow versions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchVersions();
  };

  // Enhanced component to display detailed action information
  const ActionDetails = ({ action }: { action: any }) => {
    if (!action || !action.details) return null;

    const details = action.details;

    return (
      <div className="mt-2 text-sm text-gray-600 border-t border-gray-100 pt-2">
        {details.type && (
          <div className="mb-1">
            <span className="font-medium text-blue-700">Type:</span> {details.type}
          </div>
        )}

        {details.type === 'DELAY' && details.delayMillis && (
          <div className="mb-1">
            <span className="font-medium text-purple-700">Duration:</span> {Math.round(details.delayMillis / 60000)} minutes
          </div>
        )}

        {details.type === 'EMAIL' && details.subject && (
          <div className="mb-1">
            <span className="font-medium text-blue-700">Subject:</span> {details.subject}
          </div>
        )}

        {details.type === 'SET_CONTACT_PROPERTY' && details.propertyName && (
          <div className="mb-1">
            <span className="font-medium text-green-700">Property:</span> {details.propertyName}
            {details.propertyValue && (
              <span className="text-gray-600"> = {String(details.propertyValue)}</span>
            )}
          </div>
        )}

        {details.type === 'WEBHOOK' && (
          <div className="mb-1">
            <span className="font-medium text-orange-700">Integration:</span> External webhook
          </div>
        )}

        {details.type === 'TASK' && details.subject && (
          <div className="mb-1">
            <span className="font-medium text-indigo-700">Task:</span> {details.subject}
          </div>
        )}

        {/* Display raw data for debugging if needed */}
        {details.rawAction && (
          <details className="mt-2">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
              Debug: Raw Action Data
            </summary>
            <pre className="text-xs bg-gray-50 p-2 mt-1 rounded overflow-auto max-h-32">
              {JSON.stringify(details.rawAction, null, 2)}
            </pre>
          </details>
        )}

        {/* Display error information if present */}
        {details.type === 'error' && details.errorMessage && (
          <div className="mb-1 text-red-600">
            <span className="font-medium">Error:</span> {details.errorMessage}
          </div>
        )}

        {/* Display unsupported workflow message */}
        {details.type === 'UNSUPPORTED_WORKFLOW' && (
          <div className="mb-1 text-amber-600">
            <span className="font-medium">Note:</span> This workflow type is not yet supported or data is unavailable
          </div>
        )}
      </div>
    );
  };

  // New component to display differences
  const DifferenceDetails = ({ differences }: { differences: any[] }) => {
    if (!differences || differences.length === 0) return null;
    
    return (
      <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
        <h4 className="font-medium text-yellow-800 mb-1">Changes:</h4>
        <ul className="list-disc list-inside text-sm">
          {differences.map((diff: any, idx: number) => (
            <li key={idx} className="text-yellow-700">
              {diff.property}: {JSON.stringify(diff.oldValue)} → {JSON.stringify(diff.newValue)}
            </li>
          ))}
        </ul>
      </div>
    );
  };


  const handleRestoreVersion = async (versionId: string, versionLabel: string) => {
    if (!workflowId) return;

    try {
      setRestoring(true);
      await ApiService.restoreWorkflowVersion(workflowId, versionId);

      toast({
        title: "Version Restored",
        description: `Successfully restored ${versionLabel}`,
      });

      // Navigate back to workflow history
      navigate(`/workflow-history/${workflowId}`);
    } catch (err: any) {
      console.error("Failed to restore version:", err);
      toast({
        title: "Restore Failed",
        description: err.response?.data?.message || "Failed to restore version. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRestoring(false);
    }
  };

  const handleDownloadVersion = async (versionId: string, versionLabel: string) => {
    if (!workflowId) return;

    try {
      const response = await ApiService.downloadWorkflowVersion(workflowId, versionId);

      // Add safety check for response.data
      if (!response || !response.data) {
        throw new Error("No data received from server");
      }

      // Create and download the file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const workflowName = workflowDetails?.name || "unknown-workflow";
      a.download = `workflow-${workflowName}-${versionLabel}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Complete",
        description: "Workflow version downloaded successfully.",
      });
    } catch (err: any) {
      console.error("Failed to download version:", err);
      toast({
        title: "Download Failed",
        description: err.response?.data?.message || err.message || "Failed to download workflow version. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBackToHistory = () => {
    navigate(`/workflow-history/${workflowId}`);
  };

  const getStepColor = (step: any) => {
    if (step?.isNew) return "bg-green-50 border-green-200";
    if (step?.isModified) return "bg-yellow-50 border-yellow-200";
    if (step?.isRemoved) return "bg-red-50 border-red-200";

    // Enhanced color coding for different action types
    switch (step?.type) {
      case "email":
        return "bg-blue-50 border-blue-200";
      case "delay":
        return "bg-purple-50 border-purple-200";
      case "meeting":
        return "bg-indigo-50 border-indigo-200";
      case "task":
        return "bg-teal-50 border-teal-200";
      case "webhook":
        return "bg-orange-50 border-orange-200";
      case "condition":
      case "trigger":
        return "bg-amber-50 border-amber-200";
      case "list":
        return "bg-cyan-50 border-cyan-200";
      case "goal":
        return "bg-pink-50 border-pink-200";
      case "workflow":
        return "bg-slate-50 border-slate-200";
      case "unsupported":
        return "bg-gray-50 border-gray-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStepTextColor = (step: any) => {
    if (step?.isNew) return "text-green-800";
    if (step?.isModified) return "text-yellow-800";
    if (step?.isRemoved) return "text-red-800";

    // Enhanced text colors for different action types
    switch (step?.type) {
      case "email":
        return "text-blue-800";
      case "delay":
        return "text-purple-800";
      case "meeting":
        return "text-indigo-800";
      case "task":
        return "text-teal-800";
      case "webhook":
        return "text-orange-800";
      case "condition":
      case "trigger":
        return "text-amber-800";
      case "list":
        return "text-cyan-800";
      case "goal":
        return "text-pink-800";
      case "workflow":
        return "text-slate-800";
      case "unsupported":
        return "text-gray-600";
      case "error":
        return "text-red-800";
      default:
        return "text-gray-800";
    }
  };

  const getStepIcon = (step: any) => {
    switch (step?.type) {
      case "email":
        return Mail;
      case "delay":
        return Clock;
      case "meeting":
        return Calendar;
      case "task":
        return Target;
      case "webhook":
        return RotateCcw;
      case "condition":
      case "trigger":
        return AlertCircle;
      case "list":
        return Plus;
      case "goal":
        return Target;
      default:
        return Mail;
    }
  };

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getFilteredSteps = () => {
    if (!comparisonData) return [];

    const allSteps = [
      ...(comparisonData.versionA?.steps || []).map(step => ({ ...step, source: 'A' })),
      ...(comparisonData.versionB?.steps || []).map(step => ({ ...step, source: 'B' }))
    ];

    let filtered = allSteps;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(step =>
        step.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        step.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        step.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(step => step.type === filterType);
    }

    return filtered;
  };

  const getChangeTypeForStep = (step: any) => {
    if (step.isNew) return 'added';
    if (step.isModified) return 'modified';
    if (step.isRemoved) return 'removed';
    return 'unchanged';
  };

  if (loading && !comparisonData) {
    return (
      <MainAppLayout title="Compare Workflow Versions">
        <ContentSection>
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </ContentSection>
        <ContentSection>
          <div className="grid grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={j} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ContentSection>
      </MainAppLayout>
    );
  }

  if (error) {
    return (
      <MainAppLayout title="Compare Workflow Versions">
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

  const versionAData = versions.find((v) => v.id === versionA);
  const versionBData = versions.find((v) => v.id === versionB);

  const headerActions = (
    <div className="flex items-center gap-2">
      {/* Search and Filter Controls */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search steps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>

        {showFilters && (
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="delay">Delay</SelectItem>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="webhook">Webhook</SelectItem>
              <SelectItem value="trigger">Trigger</SelectItem>
              <SelectItem value="condition">Condition</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={loading}
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh
      </Button>
    </div>
  );

  return (
    <MainAppLayout
      title={`Compare Workflow Versions: ${workflowDetails?.name || "Workflow"}`}
      description={workflowDetails?.lastModified ? `Last modified: ${new Date(workflowDetails.lastModified).toLocaleString()}` : undefined}
      headerActions={headerActions}
    >
      {/* Breadcrumb */}
      <ContentSection spacing="tight">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToHistory}
            className="p-0 h-auto text-gray-600 hover:text-gray-900"
          >
            Workflow History
          </Button>
          <span>&gt;</span>
          <span className="text-gray-900 font-medium">Compare Versions</span>
        </nav>
      </ContentSection>

      {/* Action Buttons */}
      <ContentSection>
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={handleBackToHistory}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Version History
          </Button>
          {comparisonData && (
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                className="text-blue-600"
                onClick={() => handleDownloadVersion(versionA, "Version-A")}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Version A
              </Button>
              <Button 
                variant="outline" 
                className="text-blue-600"
                onClick={() => handleDownloadVersion(versionB, "Version-B")}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Version B
              </Button>
            </div>
          )}
        </div>
      </ContentSection>


      {/* Enhanced Comparison Content */}
      <ContentSection>
        {comparisonData ? (
          <>
            {/* Workflow Metadata Comparison */}
            {comparisonData.workflowMetadata && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <Workflow className="w-5 h-5 mr-2" />
                  Workflow Configuration Changes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">Version A:</span>
                    <div className="mt-1 space-y-1">
                      <div>Name: {comparisonData.workflowMetadata.versionA.name || 'N/A'}</div>
                      <div>Status: {comparisonData.workflowMetadata.versionA.enabled ? 'Enabled' : 'Disabled'}</div>
                      <div>Type: {comparisonData.workflowMetadata.versionA.type || 'N/A'}</div>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Version B:</span>
                    <div className="mt-1 space-y-1">
                      <div>Name: {comparisonData.workflowMetadata.versionB.name || 'N/A'}</div>
                      <div>Status: {comparisonData.workflowMetadata.versionB.enabled ? 'Enabled' : 'Disabled'}</div>
                      <div>Type: {comparisonData.workflowMetadata.versionB.type || 'N/A'}</div>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Changes:</span>
                    <div className="mt-1">
                      {comparisonData.workflowMetadata.changes.length > 0 ? (
                        <ul className="list-disc list-inside text-blue-600">
                          {comparisonData.workflowMetadata.changes.map((change, idx) => (
                            <li key={idx}>{change.property}: {String(change.oldValue)} → {String(change.newValue)}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-green-600">No configuration changes</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Unified Scrollable Comparison List */}
            <div className="border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-2">Step-by-Step Comparison</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Total Steps: {getFilteredSteps().length}</span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Added: {comparisonData.differences.added.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    Modified: {comparisonData.differences.modified.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    Removed: {comparisonData.differences.removed.length}
                  </span>
                </div>
              </div>

              <div className="p-4">
                {getFilteredSteps().length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {getFilteredSteps().map((step, index) => {
                      const IconComponent = getStepIcon(step);
                      const changeType = getChangeTypeForStep(step);
                      const isExpanded = expandedSteps.has(step.id || `step-${index}`);

                      return (
                        <Collapsible key={step.id || `step-${index}`}>
                          <div className={`border rounded-lg transition-colors ${
                            changeType === 'added' ? 'border-green-300 bg-green-50' :
                            changeType === 'removed' ? 'border-red-300 bg-red-50' :
                            changeType === 'modified' ? 'border-yellow-300 bg-yellow-50' :
                            'border-gray-200 bg-white'
                          }`}>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full justify-between p-4 hover:bg-transparent"
                                onClick={() => toggleStepExpansion(step.id || `step-${index}`)}
                              >
                                <div className="flex items-center space-x-3">
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                  )}
                                  <IconComponent className={`w-5 h-5 ${
                                    changeType === 'added' ? 'text-green-600' :
                                    changeType === 'removed' ? 'text-red-600' :
                                    changeType === 'modified' ? 'text-yellow-600' :
                                    'text-gray-600'
                                  }`} />
                                  <div className="text-left">
                                    <div className={`font-medium ${
                                      changeType === 'added' ? 'text-green-800' :
                                      changeType === 'removed' ? 'text-red-800' :
                                      changeType === 'modified' ? 'text-yellow-800' :
                                      'text-gray-800'
                                    }`}>
                                      {step.title}
                                      {changeType !== 'unchanged' && (
                                        <Badge
                                          variant="outline"
                                          className={`ml-2 text-xs ${
                                            changeType === 'added' ? 'border-green-300 text-green-700' :
                                            changeType === 'removed' ? 'border-red-300 text-red-700' :
                                            'border-yellow-300 text-yellow-700'
                                          }`}
                                        >
                                          {changeType === 'added' ? 'NEW' :
                                           changeType === 'removed' ? 'REMOVED' :
                                           'MODIFIED'}
                                        </Badge>
                                      )}
                                    </div>
                                    {step.description && (
                                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Version {step.source}
                                </div>
                              </Button>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <div className="px-4 pb-4 border-t border-gray-100">
                                <div className="mt-3 space-y-2">
                                  {step.details && (
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <h5 className="font-medium text-gray-700 mb-2">Configuration Details</h5>
                                        {step.details.type && (
                                          <div><span className="font-medium">Type:</span> {step.details.type}</div>
                                        )}
                                        {step.details.delayMillis && (
                                          <div><span className="font-medium">Duration:</span> {Math.round(step.details.delayMillis / 60000)} minutes</div>
                                        )}
                                        {step.details.propertyName && (
                                          <div><span className="font-medium">Property:</span> {step.details.propertyName}</div>
                                        )}
                                        {step.details.subject && (
                                          <div><span className="font-medium">Subject:</span> {step.details.subject}</div>
                                        )}
                                      </div>
                                      <div>
                                        <h5 className="font-medium text-gray-700 mb-2">Raw Data</h5>
                                        <details className="text-xs">
                                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                            View JSON
                                          </summary>
                                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                                            {JSON.stringify(step.details, null, 2)}
                                          </pre>
                                        </details>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Steps Found
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm || filterType !== 'all'
                        ? 'Try adjusting your search or filter criteria.'
                        : 'No workflow steps available for comparison.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Comparison Data
            </h3>
            <p className="text-gray-600">
              Select two different versions to compare them.
            </p>
          </div>
        )}
      </ContentSection>
    </MainAppLayout>
  );
};

export default CompareVersions;
