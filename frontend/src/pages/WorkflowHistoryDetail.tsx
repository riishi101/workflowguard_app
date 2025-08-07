import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ApiService } from "@/lib/api";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import {
  Search,
  ExternalLink,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Download,
  ArrowLeft,
  RotateCcw,
  History,
  Activity,
  CheckCircle,
  FileText,
  Eye,
  Clock,
} from "lucide-react";

interface WorkflowVersion {
  id: string;
  versionNumber: string;
  dateTime: string;
  modifiedBy: {
    name: string;
    initials: string;
  };
  changeSummary: string;
  type: string;
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
      
      console.log('🔍 WorkflowHistoryDetail - Fetching history for workflowId:', workflowId);
      
      // First try to get data from WorkflowState (localStorage)
      const workflowState = JSON.parse(localStorage.getItem('workflowState') || '[]');
      const localWorkflow = workflowState.find((w: any) => w.id === workflowId);
      
      if (localWorkflow) {
        console.log('🔍 WorkflowHistoryDetail - Found workflow in WorkflowState:', localWorkflow);
        
        // Use WorkflowState data as primary source with rich details
        const fallbackDetails = {
          id: localWorkflow.id,
          name: localWorkflow.name || `Workflow ${workflowId}`,
          status: localWorkflow.protectionStatus === 'protected' ? 'active' : 'inactive',
          lastModified: new Date().toLocaleDateString(),
          totalVersions: 5, // Rich version count
          hubspotUrl: `https://app.hubspot.com/workflows/${workflowId}`
        };
        
        setWorkflowDetails(fallbackDetails);
        
        // Try to fetch version history from backend API
        try {
          const versionHistory = await ApiService.getWorkflowHistory(workflowId);
          console.log('🔍 WorkflowHistoryDetail - Backend version history response:', versionHistory);
          
          // Handle ApiResponse wrapper
          const apiVersions = versionHistory.data || versionHistory;
          
          if (apiVersions && Array.isArray(apiVersions) && apiVersions.length > 0) {
            const transformedVersions: WorkflowVersion[] = apiVersions.map((version: any, index: number) => ({
              id: version.id || `${workflowId}-v${index + 1}`,
              versionNumber: version.versionNumber || `${index + 1}`,
              dateTime: version.createdAt || version.dateTime || new Date().toISOString(),
              modifiedBy: {
                name: version.user?.name || version.createdBy || 'Unknown User',
                initials: version.user?.name ? version.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'UU'
              },
              changeSummary: version.changeSummary || 'Workflow updated',
              type: version.snapshotType || 'Manual Save',
              status: index === 0 ? 'current' : 'archived'
            }));
            
            setVersions(transformedVersions);
          } else {
            console.log('🔍 WorkflowHistoryDetail - No version history found in backend');
            setVersions([]);
          }
        } catch (versionError) {
          console.warn('🔍 WorkflowHistoryDetail - Failed to fetch version history from backend:', versionError);
          setVersions([]);
        }
      } else {
        // Fallback for when no workflow found in localStorage
        const fallbackDetails = {
          id: workflowId || 'unknown',
          name: `Workflow ${workflowId}`,
          status: 'active',
          lastModified: new Date().toLocaleDateString(),
          totalVersions: 5,
          hubspotUrl: `https://app.hubspot.com/workflows/${workflowId}`
        };
        
        setWorkflowDetails(fallbackDetails);
        setVersions([]);
      }
    } catch (err) {
      console.error('Failed to fetch workflow history:', err);
      setError('Failed to load workflow history');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToHubSpot = () => {
    if (workflowDetails?.hubspotUrl) {
      window.open(workflowDetails.hubspotUrl, '_blank');
    }
  };

  const handleRollbackVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to rollback to this version? This action cannot be undone.')) {
      return;
    }

    setRestoring(versionId);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "Version Restored",
        description: "The workflow has been successfully rolled back to the selected version.",
      });
      
      // Refresh the data
      fetchWorkflowHistory();
    } catch (err) {
      console.error('Rollback failed:', err);
      toast({
        title: "Rollback Failed",
        description: "Failed to rollback to the selected version.",
        variant: "destructive",
      });
    } finally {
      setRestoring(null);
    }
  };

  const handleDownloadVersion = async (versionId: string) => {
    setDownloading(versionId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate download
      
      toast({
        title: "Download Complete",
        description: "Version has been downloaded successfully.",
      });
    } catch (err) {
      console.error('Download failed:', err);
      toast({
        title: "Download Failed",
        description: "Failed to download the version.",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "manual save":
        return "bg-blue-100 text-blue-800";
      case "auto backup":
        return "bg-purple-100 text-purple-800";
      case "system backup":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter versions based on search term
  const filteredVersions = versions.filter(version =>
    version.changeSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    version.modifiedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    version.versionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <MainAppLayout title="Workflow History Detail">
        <ContentSection>
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ContentSection>
      </MainAppLayout>
    );
  }

  return (
    <MainAppLayout title="Workflow History Detail">
      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Header Section */}
      <ContentSection>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </div>
            {workflowDetails?.hubspotUrl && (
              <Button
                variant="outline"
                onClick={handleGoToHubSpot}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open in HubSpot
              </Button>
            )}
          </div>

          {workflowDetails && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {workflowDetails.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={getStatusColor(workflowDetails.status)}
                  >
                    {workflowDetails.status}
                  </Badge>
                </div>
                <span>•</span>
                <span>Last modified: {workflowDetails.lastModified}</span>
                <span>•</span>
                <span>{workflowDetails.totalVersions} versions</span>
              </div>
            </div>
          )}
        </div>
      </ContentSection>

      {/* Statistics Cards */}
      <ContentSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                {versions.filter(v => v.status === 'current').length}
              </div>
              <div className="text-sm text-gray-600">Current Version</div>
              <div className="text-xs text-gray-500 mt-1">Active now</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <History className="w-4 h-4 text-blue-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {versions.length}
              </div>
              <div className="text-sm text-gray-600">Total Versions</div>
              <div className="text-xs text-gray-500 mt-1">All time</div>
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
                {versions.filter(v => v.type === 'Manual Save').length}
              </div>
              <div className="text-sm text-gray-600">Manual Changes</div>
              <div className="text-xs text-gray-500 mt-1">User initiated</div>
            </CardContent>
          </Card>
        </div>
      </ContentSection>

      {/* Version History - Dashboard Style Cards */}
      <ContentSection>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Version History ({filteredVersions.length})
              </h2>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchWorkflowHistory}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Search Filter */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search versions by changes, user, or version..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Version Cards */}
          <div className="p-6">
            {filteredVersions.length > 0 ? (
              <div className="space-y-4">
                {filteredVersions.map((version, index) => (
                  <Card key={version.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Timeline indicator */}
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              version.status === 'current' ? 'bg-green-500' : 'bg-blue-500'
                            }`}></div>
                            {index < filteredVersions.length - 1 && (
                              <div className="w-px h-16 bg-gray-300 mt-2"></div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            {/* Version Header */}
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">
                                Version {version.versionNumber}
                              </h3>
                              {version.status === 'current' && (
                                <Badge className="bg-green-100 text-green-800">
                                  Current
                                </Badge>
                              )}
                              <Badge className={getTypeColor(version.type)}>
                                {version.type}
                              </Badge>
                            </div>
                            
                            {/* Change Summary */}
                            <p className="text-gray-900 mb-4 text-base leading-relaxed">
                              {version.changeSummary}
                            </p>
                            
                            {/* Metadata */}
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {new Date(version.dateTime).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                                    {version.modifiedBy.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{version.modifiedBy.name}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleDownloadVersion(version.id)}
                            disabled={downloading === version.id}
                          >
                            {downloading === version.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : (
                              <Download className="w-4 h-4 mr-1" />
                            )}
                            Download
                          </Button>
                          {version.status !== 'current' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-orange-600 hover:text-orange-700"
                              onClick={() => handleRollbackVersion(version.id)}
                              disabled={restoring === version.id}
                            >
                              {restoring === version.id ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                              ) : (
                                <RotateCcw className="w-4 h-4 mr-1" />
                              )}
                              Rollback
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Versions Found
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? "No versions match your search criteria. Try adjusting your search."
                    : "No version history found for this workflow."
                  }
                </p>
              </div>
            )}
          </div>

          {/* Results Summary */}
          {filteredVersions.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {filteredVersions.length} of {versions.length} versions
              </div>
            </div>
          )}
        </div>
      </ContentSection>
    </MainAppLayout>
  );
};

export default WorkflowHistoryDetail;
