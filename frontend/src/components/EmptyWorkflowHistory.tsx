import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import { 
  FileText, 
  Plus, 
  ExternalLink, 
  Clock, 
  Shield, 
  History,
  ArrowRight,
  Info
} from "lucide-react";
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

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleGoToDashboard}
        className="text-gray-600"
      >
        <ArrowRight className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleGoToHubSpot}
        className="text-blue-600"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Go to HubSpot
      </Button>
    </div>
  );

  return (
    <MainAppLayout title="Workflow History" headerActions={headerActions}>
      {/* Workflow Info */}
      <ContentSection>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Workflow History
            </h2>
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              <Clock className="w-3 h-3 mr-1" />
              No versions yet
            </Badge>
          </div>
        </div>
      </ContentSection>

      {/* Empty State */}
      <ContentSection>
        <div className="py-16 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <History className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            No Workflow History Available
          </h3>
          <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
            This workflow doesn't have any saved versions yet. Once you start protecting workflows, 
            you'll see a complete history of changes, backups, and snapshots here.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              onClick={handleCreateWorkflow}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Start Protecting Workflows
            </Button>
            <Button
              variant="outline"
              onClick={handleGoToHubSpot}
              className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
              size="lg"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View in HubSpot
            </Button>
          </div>
        </div>
      </ContentSection>

      {/* Helpful Information */}
      <ContentSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-semibold text-blue-900">Version Protection</h4>
              </div>
              <p className="text-sm text-blue-800">
                Automatically save workflow versions when changes are made, ensuring you never lose important configurations.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-green-600" />
                </div>
                <h4 className="font-semibold text-green-900">Change Tracking</h4>
              </div>
              <p className="text-sm text-green-800">
                Track who made changes, when they were made, and what was modified with detailed version history.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <h4 className="font-semibold text-purple-900">Easy Rollback</h4>
              </div>
              <p className="text-sm text-purple-800">
                Quickly restore previous versions with one click, perfect for undoing unwanted changes or testing configurations.
              </p>
            </CardContent>
          </Card>
        </div>
      </ContentSection>

      {/* Getting Started Tips */}
      <ContentSection>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Getting Started</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Select workflows from your HubSpot account to protect
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                WorkflowGuard will automatically start monitoring changes
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                View version history and compare changes side-by-side
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Restore previous versions with confidence
              </p>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* Bottom Actions */}
      <ContentSection>
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">0 versions available</p>
            <Badge variant="outline" className="text-xs">
              Start protecting workflows to see history
            </Badge>
          </div>
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
