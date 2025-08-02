import { Button } from "@/components/ui/button";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import { CheckCircle, FolderOpen, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WorkflowState } from "@/lib/workflowState";
import { useEffect, useState } from "react";

const EmptyDashboard = () => {
  const navigate = useNavigate();
  const [hasSelectedWorkflows, setHasSelectedWorkflows] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    // Check if user has just completed workflow selection
    const hasSelected = WorkflowState.hasSelectedWorkflows();
    const count = WorkflowState.getSelectedCount();
    setHasSelectedWorkflows(hasSelected);
    setSelectedCount(count);
    
    console.log('EmptyDashboard - Workflow state:', { hasSelected, count });
  }, []);

  const handleAddWorkflow = () => {
    // Only reset state if user hasn't just completed workflow selection
    if (!hasSelectedWorkflows) {
      WorkflowState.reset();
    }
    navigate("/workflow-selection");
  };

  // If user has just completed workflow selection, show a different message
  if (hasSelectedWorkflows && selectedCount > 0) {
    return (
      <MainAppLayout title="Dashboard Overview">
        {/* Status Banner */}
        <ContentSection>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Workflow Protection Setup Complete!
              </p>
              <p className="text-xs text-blue-800">
                Your {selectedCount} workflow{selectedCount > 1 ? 's' : ''} are being monitored. It may take a few moments for them to appear in your dashboard.
              </p>
            </div>
          </div>
        </ContentSection>

        {/* Setup Complete Message */}
        <ContentSection>
          <div className="bg-white border border-gray-200 rounded-lg p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Protection Setup Complete
            </h3>
            <p className="text-gray-600 text-base mb-6 max-w-lg">
              Your {selectedCount} workflow{selectedCount > 1 ? 's' : ''} are now being monitored by WorkflowGuard. 
              The system is processing your workflows and they will appear in your dashboard shortly.
            </p>
            <div className="flex flex-col items-center gap-4 w-full">
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow"
                size="lg"
              >
                ↻ Refresh Dashboard
              </Button>
              <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span>Your workflows are being processed. This usually takes 1-2 minutes.</span>
              </div>
            </div>
          </div>
        </ContentSection>
      </MainAppLayout>
    );
  }

  return (
    <MainAppLayout title="Dashboard Overview">
      {/* Status Banner */}
      <ContentSection>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Welcome to WorkflowGuard!
            </p>
            <p className="text-xs text-blue-800">
              Get started by adding your first workflow to protect and monitor.
            </p>
          </div>
        </div>
      </ContentSection>

      {/* Onboarding Tips */}
      <ContentSection>
        <div className="bg-white border border-gray-200 rounded-lg p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No workflows yet
          </h3>
          <p className="text-gray-600 text-base mb-6 max-w-lg">
            Protect your HubSpot automations from accidental changes and data loss. Click the button below to connect your HubSpot account and start monitoring your workflows.
          </p>
          <div className="flex flex-col items-center gap-4 w-full">
            <Button
              onClick={handleAddWorkflow}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow"
              size="lg"
            >
              + Add Your First Workflow
            </Button>
            <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span>Tip: You can always add more workflows later from the dashboard.</span>
            </div>
          </div>
        </div>
      </ContentSection>
    </MainAppLayout>
  );
};

export default EmptyDashboard;
