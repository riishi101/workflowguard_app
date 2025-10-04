import { useState, useEffect } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import { useToast } from "@/hooks/use-toast";
import { ApiService } from "@/lib/api";
import { renderHtmlContent, stripHtml } from "@/lib/utils";
import {
  ArrowLeft,
  Plus,
  Minus,
  Mail,
  Clock,
  Calendar,
  AlertCircle,
  RefreshCw,
  Eye,
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
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [versionA, setVersionA] = useState(searchParams.get("versionA") || "");
  const [versionB, setVersionB] = useState(searchParams.get("versionB") || "");
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
      setComparisonLoading(true);
      const response = await ApiService.compareWorkflowVersions(workflowId, versionA, versionB);

      console.log("Comparison response:", response); // Debug log

      // Add safety checks for response
      if (!response || !response.data) {
        throw new Error("No comparison data received from server");
      }

      // Validate that we have actual step data
      const versionASteps = response.data.versionA?.steps;
      const versionBSteps = response.data.versionB?.steps;

      if ((!versionASteps || versionASteps.length === 0) &&
          (!versionBSteps || versionBSteps.length === 0)) {
        throw new Error("No workflow steps available for comparison. The workflow data may be incomplete.");
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

      // Provide more specific error messages
      let errorMessage = "Failed to compare workflow versions. Please try again.";

      if (err.message?.includes("incomplete")) {
        errorMessage = "Workflow data is incomplete. Please try refreshing the page or contact support.";
      } else if (err.message?.includes("token")) {
        errorMessage = "HubSpot connection issue. Please reconnect your HubSpot account.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setComparisonData(null);
      toast({
        title: "Comparison Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setComparisonLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchVersions();
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

  if (loading) {
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
        disabled={loading || comparisonLoading}
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${(loading || comparisonLoading) ? 'animate-spin' : ''}`} />
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
        </div>
      </ContentSection>


      {/* Comparison Content */}
      <ContentSection>
        {comparisonLoading ? (
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
        ) : comparisonData ? (
          <div className="grid grid-cols-2 gap-6">
            {/* Version A */}
            <div className="border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">
                  Version A - {versionAData?.versionNumber}
                </h3>
                <p className="text-sm text-gray-600">
                  {versionAData?.dateTime && new Date(versionAData.dateTime).toLocaleString()}
                </p>
              </div>
              <div className="p-4 space-y-3">
                {comparisonData.versionA?.steps?.map((step, index) => {
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
                        <div>
                          <span className={`font-medium ${getStepTextColor(step)}`}>
                            {step.title}
                          </span>
                          {step.details && typeof step.details === 'string' && (
                            <div
                              className={`text-xs mt-1 ${getStepTextColor(step)}`}
                              dangerouslySetInnerHTML={renderHtmlContent(step.details)}
                            />
                          )}
                          {step.description && typeof step.description === 'string' && (
                            <div
                              className={`text-xs mt-1 ${getStepTextColor(step)}`}
                              dangerouslySetInnerHTML={renderHtmlContent(step.description)}
                            />
                          )}
                        </div>
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
                  Version B - {versionBData?.versionNumber}
                </h3>
                <p className="text-sm text-gray-600">
                  {versionBData?.dateTime && new Date(versionBData.dateTime).toLocaleString()}
                </p>
              </div>
              <div className="p-4 space-y-3">
                {comparisonData.versionB?.steps?.map((step, index) => {
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
                        <div>
                          <span className={`font-medium ${getStepTextColor(step)}`}>
                            {step.title}
                          </span>
                          {step.details && typeof step.details === 'string' && (
                            <div
                              className={`text-xs mt-1 ${getStepTextColor(step)}`}
                              dangerouslySetInnerHTML={renderHtmlContent(step.details)}
                            />
                          )}
                          {step.description && typeof step.description === 'string' && (
                            <div
                              className={`text-xs mt-1 ${getStepTextColor(step)}`}
                              dangerouslySetInnerHTML={renderHtmlContent(step.description)}
                            />
                          )}
                        </div>
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
    </MainAppLayout>
  );
};

export default CompareVersions;
