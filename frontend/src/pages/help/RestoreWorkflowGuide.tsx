import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import { ArrowLeft, RotateCcw, AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RestoreWorkflowGuide = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: 1,
      title: "Navigate to Workflow History",
      description: "Go to the Workflow History page and select the workflow you want to restore.",
      status: "completed"
    },
    {
      number: 2,
      title: "Select a Version",
      description: "Browse through the version history and click on the version you want to restore to.",
      status: "completed"
    },
    {
      number: 3,
      title: "Review Changes",
      description: "Use the Compare Versions feature to see what changes will be made when you restore.",
      status: "current"
    },
    {
      number: 4,
      title: "Confirm Restoration",
      description: "Click the 'Restore' button and confirm the action. This will create a new version with the restored content.",
      status: "pending"
    },
    {
      number: 5,
      title: "Verify Restoration",
      description: "Check that the workflow has been restored correctly and all changes are as expected.",
      status: "pending"
    }
  ];

  const bestPractices = [
    {
      title: "Always Review Before Restoring",
      description: "Use the comparison feature to understand exactly what changes will be made."
    },
    {
      title: "Test in Development First",
      description: "If possible, test the restoration in a development environment before applying to production."
    },
    {
      title: "Document Your Changes",
      description: "Keep notes of why you're restoring and what you expect to achieve."
    },
    {
      title: "Communicate with Team",
      description: "Inform your team members about the restoration to avoid conflicts."
    }
  ];

  const warnings = [
    {
      icon: AlertTriangle,
      title: "Data Loss Warning",
      description: "Restoring a workflow will overwrite the current version. Make sure you have a backup if needed."
    },
    {
      icon: Clock,
      title: "Processing Time",
      description: "Large workflows may take several minutes to restore. Don't close the browser during the process."
    },
    {
      icon: FileText,
      title: "Version History",
      description: "The restoration creates a new version entry, so you can always revert back if needed."
    }
  ];

  return (
    <MainAppLayout 
      title="Restoring a Workflow to a Previous State"
      description="Complete guide to restoring workflows to previous versions safely and effectively"
    >
      {/* Back Navigation */}
      <ContentSection spacing="tight">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/help-support')}
          className="p-0 h-auto text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Help & Support
        </Button>
      </ContentSection>

      {/* Overview */}
      <ContentSection>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-orange-900 mb-3">
            Important Information
          </h2>
          <p className="text-orange-800">
            Restoring a workflow will create a new version with the content from the selected previous version. 
            This action cannot be undone, so make sure to review the changes carefully before proceeding.
          </p>
        </div>
      </ContentSection>

      {/* Step-by-Step Guide */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Step-by-Step Restoration Guide
        </h2>
        <div className="space-y-4">
          {steps.map((step) => (
            <Card key={step.number} className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : step.status === 'current'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {step.title}
                      </h3>
                      {step.status === 'current' && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Current Step
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ContentSection>

      {/* Warnings */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Important Warnings
        </h2>
        <div className="space-y-4">
          {warnings.map((warning, index) => {
            const IconComponent = warning.icon;
            return (
              <Card key={index} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <IconComponent className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        {warning.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {warning.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ContentSection>

      {/* Best Practices */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Best Practices
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bestPractices.map((practice, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {practice.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {practice.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ContentSection>

      {/* Features */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Available Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <RotateCcw className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">
                Version Comparison
              </h3>
              <p className="text-sm text-gray-600">
                Compare any two versions side-by-side to see exactly what changed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">
                Download Versions
              </h3>
              <p className="text-sm text-gray-600">
                Download workflow versions as JSON files for backup or analysis
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">
                Version History
              </h3>
              <p className="text-sm text-gray-600">
                Complete history of all workflow changes with timestamps and details
              </p>
            </CardContent>
          </Card>
        </div>
      </ContentSection>

      {/* Action Buttons */}
      <ContentSection>
        <div className="flex items-center justify-center gap-4">
          <Button 
            variant="outline"
            onClick={() => navigate('/workflow-history')}
          >
            View Workflow History
          </Button>
          <Button 
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => navigate('/compare-versions')}
          >
            Compare Versions
          </Button>
        </div>
      </ContentSection>
    </MainAppLayout>
  );
};

export default RestoreWorkflowGuide; 