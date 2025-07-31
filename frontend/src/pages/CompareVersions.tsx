import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
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
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import { useToast } from "@/hooks/use-toast";
import { ApiService, WorkflowVersion, WorkflowHistoryVersion } from "@/lib/api";
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
} from "lucide-react";

const CompareVersions = () => {
  const navigate = useNavigate();
  const { workflowId } = useParams<{ workflowId: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<WorkflowHistoryVersion[]>([]);
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
  } | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (workflowId) {
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
        ApiService.getWorkflowVersionsForComparison(workflowId)
      ]);
      
      setWorkflowDetails(workflowResponse.data);
      setVersions(versionsResponse.data);
      
      // Set default versions if not already set
      if (versionsResponse.data.length >= 2) {
        if (!versionA) setVersionA(versionsResponse.data[0].id);
        if (!versionB) setVersionB(versionsResponse.data[1].id);
      }
      
    } catch (err: any) {
      console.error('Failed to fetch versions:', err);
      setError(err.response?.data?.message || 'Failed to load workflow versions. Please try again.');
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
      setComparisonData(response.data);
    } catch (err: any) {
      console.error('Failed to fetch comparison data:', err);
      toast({
        title: "Comparison Failed",
        description: "Failed to compare workflow versions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchVersions();
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

  const handleDownloadVersion = async (versionId: string, versionLabel: string) => {
    if (!workflowId) return;
    
    try {
      const response = await ApiService.downloadWorkflowVersion(workflowId, versionId);
      
      // Create and download the file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow-${workflowDetails?.name}-${versionLabel}.json`;
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

  const handleBackToHistory = () => {
    navigate(`/workflow-history/${workflowId}`);
  };

  const getStepColor = (step: any) => {
    if (step?.isNew) return "bg-green-50 border-green-200";
    if (step?.isModified) return "bg-yellow-50 border-yellow-200";
    if (step?.isRemoved) return "bg-red-50 border-red-200";
    if (step?.type === "email") return "bg-blue-50 border-blue-200";
    if (step?.type === "delay") return "bg-purple-50 border-purple-200";
    if (step?.type === "meeting") return "bg-indigo-50 border-indigo-200";
    if (step?.type === "condition") return "bg-orange-50 border-orange-200";
    return "bg-gray-50 border-gray-200";
  };

  const getStepTextColor = (step: any) => {
    if (step?.isNew) return "text-green-800";
    if (step?.isModified) return "text-yellow-800";
    if (step?.isRemoved) return "text-red-800";
    if (step?.type === "email") return "text-blue-800";
    if (step?.type === "delay") return "text-purple-800";
    if (step?.type === "meeting") return "text-indigo-800";
    if (step?.type === "condition") return "text-orange-800";
    return "text-gray-800";
  };

  const getStepIcon = (step: any) => {
    switch (step?.type) {
      case "email":
        return Mail;
      case "delay":
        return Clock;
      case "meeting":
        return Calendar;
      default:
        return Mail;
    }
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
      title={`Compare Workflow Versions: ${workflowDetails?.name || 'Workflow'}`}
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

      {/* Version Selectors and Controls */}
      <ContentSection>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Version A:
              </span>
              <Select value={versionA} onValueChange={setVersionA} disabled={loading}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {new Date(version.date).toLocaleString()} - {version.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Version B:
              </span>
              <Select value={versionB} onValueChange={setVersionB} disabled={loading}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {new Date(version.date).toLocaleString()} - {version.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={syncScroll}
                onCheckedChange={setSyncScroll}
                id="sync-scroll"
                disabled={loading}
              />
              <label htmlFor="sync-scroll" className="text-sm text-gray-700">
                Sync Scroll
              </label>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* Comparison Content */}
      <ContentSection>
        {comparisonData ? (
          <div className="grid grid-cols-2 gap-6">
            {/* Version A */}
            <div className="border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">
                  Version A - {versionAData?.type}
                </h3>
                <p className="text-sm text-gray-600">
                  {versionAData?.date && new Date(versionAData.date).toLocaleString()} by {versionAData?.initiator}
                </p>
              </div>
              <div className="p-4 space-y-3">
                {comparisonData.versionA?.steps.map((step, index) => {
                  const IconComponent = getStepIcon(step);
                  return (
                    <div
                      key={step.id || index}
                      className={`p-3 rounded-lg border flex items-center justify-between ${getStepColor(step)}`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent
                          className={`w-5 h-5 ${getStepTextColor(step)}`}
                        />
                        <span className={`font-medium ${getStepTextColor(step)}`}>
                          {step.title}
                        </span>
                      </div>
                      {step.isRemoved && (
                        <Badge variant="destructive" className="text-xs">
                          Removed
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Version B */}
            <div className="border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">
                  Version B - {versionBData?.type}
                </h3>
                <p className="text-sm text-gray-600">
                  {versionBData?.date && new Date(versionBData.date).toLocaleString()} by {versionBData?.initiator}
                </p>
              </div>
              <div className="p-4 space-y-3">
                {comparisonData.versionB?.steps.map((step, index) => {
                  const IconComponent = getStepIcon(step);
                  return (
                    <div
                      key={step.id || index}
                      className={`p-3 rounded-lg border flex items-center justify-between ${getStepColor(step)}`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent
                          className={`w-5 h-5 ${getStepTextColor(step)}`}
                        />
                        <span className={`font-medium ${getStepTextColor(step)}`}>
                          {step.title}
                        </span>
                      </div>
                      {step.isNew && (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                          New
                        </Badge>
                      )}
                      {step.isModified && (
                        <Badge variant="default" className="text-xs bg-yellow-100 text-yellow-800">
                          Modified
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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
              <Button 
                variant="outline" 
                className="text-green-600"
                onClick={() => handleRestoreVersion(versionA, "Version A")}
                disabled={restoring}
              >
                {restoring ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore Version A
                  </>
                )}
              </Button>
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => handleRestoreVersion(versionB, "Version B")}
                disabled={restoring}
              >
                {restoring ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore Version B
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </ContentSection>
    </MainAppLayout>
  );
};

export default CompareVersions;
