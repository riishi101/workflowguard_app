import { Button } from "@/components/ui/button";
import { H3, H4, PSmall, SpanSmall } from "@/components/ui/typography";
import TopNavigation from "@/components/TopNavigation";
import { FileText, Plus, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmptyWorkflowHistory = () => {
  const navigate = useNavigate();

  const handleCreateWorkflow = () => {
    navigate("/workflow-selection");
  };

  const handleGoToHubSpot = () => {
    // In a real app, this would open HubSpot
    window.open("https://app.hubspot.com", "_blank");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <H3>
                  Workflow History
                </H3>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Info */}
        <div className="flex items-center justify-between mb-8 p-6 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <H4>
              Customer Onboarding
            </H4>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <PSmall>Active</PSmall>
            </div>
            <SpanSmall>ID: adx2c-344</SpanSmall>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToHubSpot}
            className="text-blue-600"
          >
            Go to Workflow in HubSpot
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Empty State */}
        <div className="py-32 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
          <H4 className="mb-3">
            No Workflow History Yet
          </H4>
          <PSmall className="mb-2">
            Start creating workflows to track changes and activities.
          </PSmall>
          <PSmall className="mb-8">
            Your workflow history will appear here.
          </PSmall>
          <Button
            onClick={handleCreateWorkflow}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Workflow
          </Button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-200">
          <PSmall>0 versions selected</PSmall>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="text-gray-400"
          >
            Compare Selected Versions
          </Button>
        </div>
      </main>
    </div>
  );
};

export default EmptyWorkflowHistory;
