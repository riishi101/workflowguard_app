import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import TopNavigation from "@/components/TopNavigation";
import Footer from "@/components/Footer";
import { WorkflowState } from "@/lib/workflowState";
import { Search, Info, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ApiService from "@/services/api";

interface Workflow {
  id: string;
  name: string;
  folder: string;
  status: string;
  lastModified: string;
  hubspotId: string;
}

const WorkflowSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setIsLoading(true);
        // Fetch workflows from HubSpot via our API
        const data = await ApiService.getHubSpotWorkflows();
        setWorkflows(data);
      } catch (error) {
        console.error('Error fetching workflows:', error);
        setError('Failed to load workflows from HubSpot');
        toast.error('Failed to load workflows. Please try again.');
        
        // Fallback to mock data for demo
        setWorkflows([
          {
            id: "1",
            name: "WorkflowGuard Test Workflow - Contact Enrollment",
            folder: "",
            status: "Active",
            lastModified: "7/21/2025, 11:08:51 AM",
            hubspotId: "12584080"
          },
          {
            id: "2",
            name: "WG Test - Existing Contact Update",
            folder: "",
            status: "Active",
            lastModified: "7/20/2025, 09:15:30 AM",
            hubspotId: "12584081"
          },
          {
            id: "3",
            name: "Customer Onboarding Automation",
            folder: "",
            status: "Active",
            lastModified: "7/19/2025, 16:45:22 PM",
            hubspotId: "12584082"
          },
          {
            id: "4",
            name: "Lead Nurturing - SaaS",
            folder: "",
            status: "Active",
            lastModified: "7/18/2025, 11:20:15 AM",
            hubspotId: "12584083"
          },
          {
            id: "5",
            name: "Email Campaign Follow-up",
            folder: "",
            status: "Active",
            lastModified: "7/17/2025, 13:50:45 PM",
            hubspotId: "12584084"
          },
          {
            id: "6",
            name: "Deal Pipeline Automation",
            folder: "",
            status: "Active",
            lastModified: "7/16/2025, 10:30:12 AM",
            hubspotId: "12584085"
          },
          {
            id: "7",
            name: "Customer Feedback Loop",
            folder: "",
            status: "Active",
            lastModified: "7/15/2025, 14:25:33 PM",
            hubspotId: "12584086"
          },
          {
            id: "8",
            name: "Support Ticket Automation",
            folder: "",
            status: "Active",
            lastModified: "7/14/2025, 09:45:18 AM",
            hubspotId: "12584087"
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  const handleWorkflowToggle = (workflowId: string) => {
    setSelectedWorkflows((prev) =>
      prev.includes(workflowId)
        ? prev.filter((id) => id !== workflowId)
        : [...prev, workflowId]
    );
  };

  const handleSelectAll = () => {
    if (selectedWorkflows.length === filteredWorkflows.length) {
      setSelectedWorkflows([]);
    } else {
      setSelectedWorkflows(filteredWorkflows.map(w => w.id));
    }
  };

  const handleStartProtecting = async () => {
    if (selectedWorkflows.length === 0) {
      toast.error('Please select at least one workflow to protect.');
      return;
    }

    try {
      // Save selected workflows to state
      WorkflowState.setWorkflowSelection(true);
      WorkflowState.setSelectedCount(selectedWorkflows.length);
      
      // In a real app, this would call an API to start monitoring
      console.log('Starting protection for workflows:', selectedWorkflows);
      
      toast.success(`Successfully started protecting ${selectedWorkflows.length} workflows!`);
      
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error('Error starting workflow protection:', error);
      toast.error('Failed to start workflow protection. Please try again.');
    }
  };

  const handleSkipForNow = () => {
    // User skipped workflow selection, keep empty state
    WorkflowState.setWorkflowSelection(false);
    WorkflowState.setSelectedCount(0);
    navigate("/dashboard");
  };

  const filteredWorkflows = workflows.filter((workflow) =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <TopNavigation />
        <main className="max-w-7xl mx-auto px-6 py-8 flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
            <h2 className="text-lg font-semibold text-gray-900">
              Loading Workflows...
            </h2>
            <p className="text-sm text-gray-600">
              Fetching your HubSpot workflows
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavigation />

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Select Workflows to Protect
          </h1>
          <p className="text-gray-600 text-sm">
            Great! Your HubSpot account is connected. Choose the workflows you
            want WorkflowGuard to monitor and protect.
          </p>
        </div>

        {/* Alert Banner */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm font-medium text-red-900">
              Real-time updates disabled
            </span>
          </div>
        </div>

        {/* Information Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-900">
              Your trial includes Professional Plan features, allowing you to
              monitor up to 500 workflows and retain 90 days of history. Get
              started by selecting your critical workflows below.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-900">
                {error} Using demo data for now.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search workflows by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-4">
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Folders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Folders</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="customer-success">
                      Customer Success
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedWorkflows.length === filteredWorkflows.length && filteredWorkflows.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    Workflow Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    HubSpot ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    HubSpot Folder
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    Last Modified
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredWorkflows.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedWorkflows.includes(workflow.id)}
                        onCheckedChange={() => handleWorkflowToggle(workflow.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">
                        {workflow.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {workflow.hubspotId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {workflow.folder || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={workflow.status === "Active" ? "default" : "secondary"}
                        className={
                          workflow.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {workflow.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {workflow.lastModified}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Selected {selectedWorkflows.length} of {filteredWorkflows.length} workflows. You have {500 - selectedWorkflows.length} workflows remaining in your trial.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSkipForNow}
                className="text-gray-600"
              >
                Skip for now
              </Button>
              <Button
                onClick={handleStartProtecting}
                disabled={selectedWorkflows.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start Protecting Workflows
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WorkflowSelection;
