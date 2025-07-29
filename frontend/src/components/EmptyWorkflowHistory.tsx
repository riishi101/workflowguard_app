import { Button } from "@/components/ui/button";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
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

  const headerActions = (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGoToHubSpot}
      className="text-blue-600"
    >
      <ExternalLink className="w-4 h-4 mr-2" />
      Go to Workflow in HubSpot
    </Button>
  );

  return (
    <MainAppLayout title="Workflow History" headerActions={headerActions}>
      {/* Workflow Info */}
      <ContentSection>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Customer Onboarding
            </h2>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <span className="text-sm text-gray-500">ID: adx2c-344</span>
          </div>
        </div>
      </ContentSection>

      {/* Empty State */}
      <ContentSection>
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No Workflow History Yet
          </h3>
          <p className="text-gray-600 mb-2">
            Start creating workflows to track changes and activities.
          </p>
          <p className="text-gray-600 mb-8">
            Your workflow history will appear here.
          </p>
          <Button
            onClick={handleCreateWorkflow}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Workflow
          </Button>
        </div>
      </ContentSection>

      {/* Bottom Actions */}
      <ContentSection>
        <div className="flex items-center justify-between pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">0 versions selected</p>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="text-gray-400"
          >
            Compare Selected Versions
          </Button>
        </div>
      </ContentSection>
    </MainAppLayout>
  );
};

export default EmptyWorkflowHistory;
