import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Eye,
  GitCompare,
  RotateCcw,
  Plus,
  ChevronDown,
  Activity,
  AlertCircle,
  CheckCircle,
  Mail,
  Clock,
  Filter,
  Users,
  Zap,
  Settings,
  FileText,
  History,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import { ApiService } from "@/lib/api";

// Mock data for demonstration
const mockWorkflows = [
  { id: "wf-001", name: "Lead Nurturing Campaign", status: "active" },
  { id: "wf-002", name: "Customer Onboarding", status: "active" },
  { id: "wf-003", name: "Re-engagement Series", status: "inactive" },
  { id: "wf-004", name: "Sales Follow-up", status: "error" },
];

// No mock data - rely on backend API

interface WorkflowDetails {
  id: string;
  name: string;
  status: string;
  hubspotId?: string;
  lastModified: string;
  totalVersions: number;
}

interface ProtectedWorkflow {
  id: string;
  name: string;
  status: string;
  protectionStatus: string;
  lastModified: string;
}

interface VersionHistoryItem {
  id: string;
  version: string;
  dateTime: string;
  lastModifiedBy: string;
  changeSummary: string;
  changeType: string;
  isCurrent: boolean;
}

// Helper functions
const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "inactive":
      return <Clock className="h-4 w-4 text-gray-400" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Activity className="h-4 w-4 text-blue-500" />;
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

const getChangeTypeBadge = (type: string) => {
  switch (type.toLowerCase()) {
    case "manual save":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <Users className="h-3 w-3 mr-1" />
          Manual Save
        </Badge>
      );
    case "auto backup":
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
          <Zap className="h-3 w-3 mr-1" />
          Auto Backup
        </Badge>
      );
    case "system backup":
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          <Activity className="h-3 w-3 mr-1" />
          System Backup
        </Badge>
      );
    default:
      return <Badge variant="secondary">{type}</Badge>;
  }
};

// Mock workflow configuration data
const mockWorkflowConfig = {
  v5: {
    name: "Lead Nurturing Campaign - Version 5",
    trigger: {
      type: "Contact property change",
      property: "Lead Score",
      condition: "is greater than 75",
    },
    steps: [
      {
        id: 1,
        type: "Delay",
        name: "Wait 1 day",
        config: { delay: "1 day" },
      },
      {
        id: 2,
        type: "Email",
        name: "Welcome Email",
        config: { template: "welcome-template-v2" },
      },
      {
        id: 3,
        type: "Internal Email",
        name: "Send Internal Email",
        config: { recipient: "sales@company.com", subject: "New qualified lead" },
      },
      {
        id: 4,
        type: "Branch",
        name: "Premium Customer Check",
        config: { condition: "Contact property 'Customer Type' is 'Premium'" },
      },
    ],
    metadata: {
      created: "August 1, 2025",
      lastModified: "August 4, 2025",
      enrolledContacts: 1247,
      completedContacts: 892,
    },
  },
  v4: {
    name: "Lead Nurturing Campaign - Version 4",
    trigger: {
      type: "Contact property change",
      property: "Lead Score",
      condition: "is greater than 75",
    },
    steps: [
      {
        id: 1,
        type: "Delay",
        name: "Wait 2 days",
        config: { delay: "2 days" },
      },
      {
        id: 2,
        type: "Email",
        name: "Welcome Email",
        config: { template: "welcome-template-v1" },
      },
      {
        id: 3,
        type: "Branch",
        name: "Premium Customer Check",
        config: { condition: "Contact property 'Customer Type' is 'Premium'" },
      },
    ],
    metadata: {
      created: "August 1, 2025",
      lastModified: "August 4, 2025",
      enrolledContacts: 1180,
      completedContacts: 834,
    },
  },
  v3: {
    name: "Lead Nurturing Campaign - Version 3",
    trigger: {
      type: "Contact property change",
      property: "Lead Score",
      condition: "is greater than 75",
    },
    steps: [
      {
        id: 1,
        type: "Delay",
        name: "Wait 2 days",
        config: { delay: "2 days" },
      },
      {
        id: 2,
        type: "Email",
        name: "Welcome Email",
        config: { template: "welcome-template-v1" },
      },
      {
        id: 3,
        type: "SMS",
        name: "SMS Notification",
        config: { message: "Welcome to our platform!" },
      },
    ],
    metadata: {
      created: "August 1, 2025",
      lastModified: "August 3, 2025",
      enrolledContacts: 1050,
      completedContacts: 756,
    },
  },
};

const WorkflowHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { workflowId } = useParams();
  
  const [workflows, setWorkflows] = useState<ProtectedWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>(workflowId || "wf-001");
  const [workflowDetails, setWorkflowDetails] = useState<WorkflowDetails | null>(null);
  const [versions, setVersions] = useState<VersionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRollingBack, setIsRollingBack] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [selectedVersionForView, setSelectedVersionForView] = useState<string | null>(null);
  const [selectedVersionsForCompare, setSelectedVersionsForCompare] = useState<{
    older: string | null;
    newer: string | null;
  }>({ older: null, newer: null });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  useEffect(() => {
    if (selectedWorkflow) {
      fetchWorkflowHistory();
    }
  }, [selectedWorkflow]);

  const currentWorkflow = mockWorkflows.find(
    (wf) => wf.id === selectedWorkflow,
  );

  const selectedVersionConfig = selectedVersionForView
    ? mockWorkflowConfig[
        selectedVersionForView as keyof typeof mockWorkflowConfig
      ]
    : null;

  const olderVersionConfig = selectedVersionsForCompare.older
    ? mockWorkflowConfig[
        selectedVersionsForCompare.older as keyof typeof mockWorkflowConfig
      ]
    : null;

  const newerVersionConfig = selectedVersionsForCompare.newer
    ? mockWorkflowConfig[
        selectedVersionsForCompare.newer as keyof typeof mockWorkflowConfig
      ]
    : null;

  const fetchWorkflows = async () => {
    try {
      // Get workflows from WorkflowState (localStorage) and merge with mock data
      const workflowState = JSON.parse(localStorage.getItem('workflowState') || '[]');
      const protectedWorkflows = workflowState.filter((w: any) => w.protectionStatus === 'protected');
      
      const formattedWorkflows: ProtectedWorkflow[] = protectedWorkflows.map((w: any) => ({
        id: w.id,
        name: w.name,
        status: 'active',
        protectionStatus: w.protectionStatus,
        lastModified: new Date().toLocaleDateString()
      }));

      // Merge with mock workflows for demo purposes
      const allWorkflows = [...formattedWorkflows, ...mockWorkflows.map(w => ({
        id: w.id,
        name: w.name,
        status: w.status,
        protectionStatus: 'protected',
        lastModified: new Date().toLocaleDateString()
      }))];

      setWorkflows(allWorkflows);
      
      // Set first workflow as selected if none specified
      if (!selectedWorkflow && allWorkflows.length > 0) {
        setSelectedWorkflow(allWorkflows[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
      setError('Failed to load workflows');
    }
  };

  const fetchWorkflowHistory = async () => {
    if (!selectedWorkflow) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch workflow version history from API
      const response = await ApiService.getWorkflowHistory(selectedWorkflow);
      const versionHistory = response.data || [];

      // Set workflow details
      const currentWorkflow = workflows.find(w => w.id === selectedWorkflow);
      setWorkflowDetails({
        id: selectedWorkflow,
        name: currentWorkflow?.name || 'Lead Nurturing Campaign',
        status: currentWorkflow?.status || 'active',
        hubspotId: selectedWorkflow,
        lastModified: new Date().toLocaleDateString(),
        totalVersions: versionHistory.length
      });

      // Transform API response to match VersionHistoryItem interface
      const transformedVersions: VersionHistoryItem[] = versionHistory.map((version: any, index: number) => ({
        id: version.id || `v${index + 1}`,
        version: version.version || `v${index + 1}`,
        dateTime: version.createdAt || version.dateTime || new Date().toISOString(),
        lastModifiedBy: version.lastModifiedBy || 'System',
        changeSummary: version.changeSummary || 'Workflow updated',
        changeType: version.changeType || 'manual save',
        isCurrent: index === 0 // First version is current
      }));

      setVersions(transformedVersions);
    } catch (err) {
      console.error('Failed to fetch workflow history:', err);
      setError('Failed to load workflow history');
      
      // Fallback to empty state on error
      setVersions([]);
      setWorkflowDetails({
        id: selectedWorkflow,
        name: 'Unknown Workflow',
        status: 'error',
        hubspotId: selectedWorkflow,
        lastModified: new Date().toLocaleDateString(),
        totalVersions: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowChange = (workflowId: string) => {
    setSelectedWorkflow(workflowId);
  };

  const handleViewVersion = (versionId: string) => {
    setSelectedVersionForView(versionId);
  };

  const handleCompareVersions = (olderVersion: string, newerVersion: string) => {
    setSelectedVersionsForCompare({ older: olderVersion, newer: newerVersion });
  };

  const handleRollback = async (versionId: string) => {
    if (!confirm('Are you sure you want to rollback to this version?')) return;
    
    setIsRollingBack(versionId);
    try {
      // Simulate rollback
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Success",
        description: "Workflow rolled back successfully",
      });
      fetchWorkflowHistory();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to rollback workflow",
        variant: "destructive",
      });
    } finally {
      setIsRollingBack(null);
    }
  };

  const handleDownload = async (versionId: string) => {
    setIsDownloading(versionId);
    try {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Success",
        description: "Version downloaded successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to download version",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(null);
    }
  };

  if (loading) {
    return (
      <MainAppLayout title="Workflow History">
        <ContentSection>
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-12 w-full" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
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
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </ContentSection>
      </MainAppLayout>
    );
  }

  return (
    <MainAppLayout title="Workflow History">
      <ContentSection>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold text-gray-900">Current Workflow</h1>
                <div className="flex items-center gap-2">
                  <Select value={selectedWorkflow} onValueChange={handleWorkflowChange}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select a workflow" />
                    </SelectTrigger>
                    <SelectContent>
                      {workflows.map((workflow) => (
                        <SelectItem key={workflow.id} value={workflow.id}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(workflow.status)}
                            <span>{workflow.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Select a workflow to view its complete version history and audit trail
              </p>
              
              {workflowDetails && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <div>
                      <h3 className="font-medium text-gray-900">{workflowDetails.name}</h3>
                      <p className="text-sm text-gray-600">
                        Status: <span className="capitalize">{workflowDetails.status}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge className={`${getStatusColor(workflowDetails.status)} capitalize`}>
                      {workflowDetails.status}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Version History Section */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <History className="h-5 w-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Version History</h2>
              </div>
              <p className="text-gray-600">
                Complete audit trail of all changes made to the {workflowDetails?.name || 'selected'} workflow
              </p>
            </div>

            {error && (
              <div className="p-6 border-b border-gray-200">
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {loading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : versions.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {versions.map((version, index) => (
                  <div key={version.id} className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Version indicator */}
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          <span className="text-sm font-medium text-blue-600">v{index + 1}</span>
                        </div>
                        {index < versions.length - 1 && (
                          <div className="w-px h-16 bg-gray-200 mt-4"></div>
                        )}
                      </div>
                      
                      {/* Version content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium text-gray-900">
                              Version {version.version}
                              {version.isCurrent && (
                                <Badge variant="secondary" className="ml-2">Current</Badge>
                              )}
                            </h3>
                            {getChangeTypeBadge(version.changeType)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewVersion(version.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Version {version.version} Details</DialogTitle>
                                  <DialogDescription>
                                    Detailed view of workflow configuration for this version
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Date & Time</label>
                                      <p className="text-sm text-gray-900">
                                        {new Date(version.dateTime).toLocaleString()}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Modified By</label>
                                      <p className="text-sm text-gray-900">{version.lastModifiedBy}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Change Summary</label>
                                    <p className="text-sm text-gray-900 mt-1">{version.changeSummary}</p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(version.id)}
                              disabled={isDownloading === version.id}
                              className="h-8 w-8 p-0"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            
                            {!version.isCurrent && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRollback(version.id)}
                                disabled={isRollingBack === version.id}
                                className="h-8 w-8 p-0"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3">
                          {new Date(version.dateTime).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} IST
                        </div>
                        
                        <p className="text-gray-900 mb-3">{version.changeSummary}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span>Modified by</span>
                            <span className="font-medium text-gray-900">{version.lastModifiedBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Version History
                </h3>
                <p className="text-gray-600">
                  Version history will appear here once changes are made to the workflow.
                </p>
              </div>
            )}
          </div>
        </div>
      </ContentSection>
    </MainAppLayout>
  );
};

export default WorkflowHistory;
