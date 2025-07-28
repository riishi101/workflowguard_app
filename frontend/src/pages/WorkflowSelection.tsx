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
import { Search, Info, Loader2 } from "lucide-react";
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/workflows/hubspot`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('workflowGuard_token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch workflows');
        }

        const data = await response.json();
        setWorkflows(data);
      } catch (error) {
        console.error('Error fetching workflows:', error);
        setError('Failed to load workflows from HubSpot');
        toast.error('Failed to load workflows. Please try again.');
        
        // Fallback to mock data for demo
        setWorkflows([
          {
            id: "1",
            name: "Customer Onboarding",
            folder: "Sales Automation",
            status: "Active",
            lastModified: "2024-01-15 14:30",
            hubspotId: "workflow_1"
          },
          {
            id: "2",
            name: "Lead Nurturing - SaaS",
            folder: "Marketing",
            status: "Active",
            lastModified: "2024-01-14 09:15",
            hubspotId: "workflow_2"
          },
          {
            id: "3",
            name: "Email Campaign Follow-up",
            folder: "Marketing",
            status: "Inactive",
            lastModified: "2024-01-13 16:45",
            hubspotId: "workflow_3"
          },
          {
            id: "4",
            name: "Deal Pipeline Automation",
            folder: "Sales",
            status: "Active",
            lastModified: "2024-01-12 11:20",
            hubspotId: "workflow_4"
          },
          {
            id: "5",
            name: "Customer Feedback Loop",
            folder: "Customer Success",
            status: "Active",
            lastModified: "2024-01-11 13:50",
            hubspotId: "workflow_5"
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
        : [...prev, workflowId],
    );
  };

  const handleStartProtecting = async () => {
    try {
      // Create workflows in our system
      const promises = selectedWorkflows.map(async (workflowId) => {
        const workflow = workflows.find(w => w.id === workflowId);
        if (workflow) {
          return ApiService.createWorkflow({
            name: workflow.name,
            hubspotId: workflow.hubspotId,
            ownerId: user?.id || 'default',
          });
        }
      });

      await Promise.all(promises);
      
      // Set workflow selection state
      WorkflowState.setWorkflowSelection(true);
      WorkflowState.setSelectedCount(selectedWorkflows.length);
      
      toast.success(`Successfully protected ${selectedWorkflows.length} workflows!`);
      navigate("/dashboard");
    } catch (error) {
      console.error('Error creating workflows:', error);
      toast.error('Failed to protect workflows. Please try again.');
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
        <main className="max-w-6xl mx-auto px-6 py-8 flex-1 flex items-center justify-center">
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

      <main className="max-w-6xl mx-auto px-6 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Select Workflows to Protect
          </h1>
          <p className="text-gray-600 text-sm">
            Great! Your HubSpot account is connected. Choose the workflows you
            want WorkflowGuard to monitor and protect.
          </p>
        </div>

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
                <Select defaultValue="status">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="folder">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="HubSpot Folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="folder">HubSpot Folder</SelectItem>
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

          <div className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-4 py-3"></th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    Workflow Name
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    HubSpot Folder
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    HubSpot Status
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
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
                        onCheckedChange={() =>
                          handleWorkflowToggle(workflow.id)
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {workflow.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {workflow.folder}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          workflow.status === "Active" ? "default" : "secondary"
                        }
                        className={
                          workflow.status === "Active"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                      >
                        {workflow.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {workflow.lastModified}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Selected {selectedWorkflows.length} of {workflows.length}{" "}
              workflows. You have 500 workflows remaining in your trial.
            </p>
            <div className="flex items-center gap-3">
              <Button onClick={handleSkipForNow} variant="outline" size="sm">
                Skip for now
              </Button>
              <Button
                onClick={handleStartProtecting}
                disabled={selectedWorkflows.length === 0}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                size="sm"
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
