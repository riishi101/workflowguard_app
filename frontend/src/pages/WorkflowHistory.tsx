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
  const [versions, setVersions] = useState<VersionHistoryItem[]>(mockVersionHistory);
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

      // Use mock data for consistent demo experience
      setWorkflowDetails({
        id: selectedWorkflow,
        name: currentWorkflow?.name || 'Lead Nurturing Campaign',
        status: currentWorkflow?.status || 'active',
        hubspotId: selectedWorkflow,
        lastModified: new Date().toLocaleDateString(),
        totalVersions: mockVersionHistory.length
      });

      setVersions(mockVersionHistory);
    } catch (err) {
      console.error('Failed to fetch workflow history:', err);
      setError('Failed to load workflow history');
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
                  onValueChange={setSelectedWorkflow}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWorkflows.map((workflow) => (
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
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  <TableHead className="text-left font-semibold text-gray-900 px-6 py-4">
                    Version
                  </TableHead>
                  <TableHead className="text-left font-semibold text-gray-900 px-6 py-4">
                    Date & Time
                  </TableHead>
                  <TableHead className="text-left font-semibold text-gray-900 px-6 py-4">
                    Last Modified By
                  </TableHead>
                  <TableHead className="text-left font-semibold text-gray-900 px-6 py-4">
                    Change Summary
                  </TableHead>
                  <TableHead className="text-left font-semibold text-gray-900 px-6 py-4">
                    Change Type
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-900 px-6 py-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((version, index) => (
                  <TableRow
                    key={version.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      version.isCurrent ? "bg-blue-50" : ""
                    }`}
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-blue-700">
                            {version.version.replace("Version ", "V")}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {version.version}
                          </div>
                          {version.isCurrent && (
                            <Badge className="mt-1 bg-blue-100 text-blue-800 text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {version.dateTime}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {version.lastModifiedBy
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">
                          {version.lastModifiedBy}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 max-w-md">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {version.changeSummary}
                      </p>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {getChangeTypeBadge(version.changeType)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewVersion(version.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                View {version.version} Configuration
                              </DialogTitle>
                              <DialogDescription>
                                Read-only view of the workflow configuration as it existed at
                                this version. This represents the exact state of your workflow
                                at the time this version was created.
                              </DialogDescription>
                            </DialogHeader>
                            {selectedVersionConfig && (
                              <div className="space-y-6">
                                {/* Workflow Trigger */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">
                                    Workflow Trigger
                                  </h3>
                                  <Card>
                                    <CardContent className="pt-6">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">
                                            Trigger Type
                                          </label>
                                          <p className="text-sm text-gray-900">
                                            {selectedVersionConfig.trigger.type}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">
                                            Property
                                          </label>
                                          <p className="text-sm text-gray-900">
                                            {selectedVersionConfig.trigger.property}
                                          </p>
                                        </div>
                                        <div className="col-span-2">
                                          <label className="text-sm font-medium text-gray-700">
                                            Condition
                                          </label>
                                          <p className="text-sm text-gray-900">
                                            {selectedVersionConfig.trigger.condition}
                                          </p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* Workflow Steps */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">
                                    Workflow Steps
                                  </h3>
                                  <div className="space-y-4">
                                    {selectedVersionConfig.steps.map((step, stepIndex) => (
                                      <Card key={step.id}>
                                        <CardContent className="pt-6">
                                          <div className="flex items-start space-x-4">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                              <span className="text-sm font-semibold text-blue-700">
                                                {stepIndex + 1}
                                              </span>
                                            </div>
                                            <div className="flex-1">
                                              <div className="flex items-center space-x-2 mb-2">
                                                <h4 className="font-medium text-gray-900">
                                                  {step.name}
                                                </h4>
                                                <Badge variant="outline">{step.type}</Badge>
                                              </div>
                                              <div className="text-sm text-gray-600">
                                                {Object.entries(step.config).map(([key, value]) => (
                                                  <div key={key} className="mb-1">
                                                    <span className="font-medium capitalize">
                                                      {key.replace(/([A-Z])/g, " $1").toLowerCase()}:
                                                    </span>{" "}
                                                    {String(value)}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </div>

                                {/* Workflow Metadata */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">
                                    Workflow Metadata
                                  </h3>
                                  <Card>
                                    <CardContent className="pt-6">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">
                                            Created
                                          </label>
                                          <p className="text-sm text-gray-900">
                                            {selectedVersionConfig.metadata.created}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">
                                            Last Modified
                                          </label>
                                          <p className="text-sm text-gray-900">
                                            {selectedVersionConfig.metadata.lastModified}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">
                                            Enrolled Contacts
                                          </label>
                                          <p className="text-sm text-gray-900">
                                            {selectedVersionConfig.metadata.enrolledContacts.toLocaleString()}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">
                                            Completed Contacts
                                          </label>
                                          <p className="text-sm text-gray-900">
                                            {selectedVersionConfig.metadata.completedContacts.toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(version.id)}
                          disabled={isDownloading === version.id}
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        {!version.isCurrent && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRollback(version.id)}
                            disabled={isRollingBack === version.id}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {versions.length === 0 && !loading && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Version History
            </h3>
            <p className="text-gray-600">
              Version history will appear here once changes are made to the
              workflow.
            </p>
          </div>
        )}
      </ContentSection>
    </MainAppLayout>
  );
};

export default WorkflowHistory;
