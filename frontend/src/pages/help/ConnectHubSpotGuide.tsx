import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import { ArrowLeft, CheckCircle, ExternalLink, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ConnectHubSpotGuide = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: 1,
      title: "Navigate to Settings",
      description: "Go to the Settings page in your WorkflowGuard dashboard and click on the 'My Profile' tab.",
      status: "completed"
    },
    {
      number: 2,
      title: "Click Connect HubSpot",
      description: "In the HubSpot Account Connection section, click the 'Connect HubSpot' button.",
      status: "completed"
    },
    {
      number: 3,
      title: "Authorize Access",
      description: "You'll be redirected to HubSpot's authorization page. Click 'Allow' to grant WorkflowGuard access to your HubSpot account.",
      status: "completed"
    },
    {
      number: 4,
      title: "Select Workflows",
      description: "After successful connection, you'll be taken to the Workflow Selection screen where you can choose which workflows to protect.",
      status: "current"
    },
    {
      number: 5,
      title: "Start Monitoring",
      description: "Once you've selected your workflows, WorkflowGuard will begin monitoring them for changes and creating version history.",
      status: "pending"
    }
  ];

  const troubleshooting = [
    {
      issue: "Authorization failed",
      solution: "Make sure you're logged into the correct HubSpot account and have admin permissions."
    },
    {
      issue: "Connection timeout",
      solution: "Check your internet connection and try again. If the problem persists, contact support."
    },
    {
      issue: "No workflows found",
      solution: "Ensure you have active workflows in your HubSpot account and that you have the necessary permissions to view them."
    }
  ];

  return (
    <MainAppLayout 
      title="How to Connect Your HubSpot Account"
      description="Step-by-step guide to connecting your HubSpot account with WorkflowGuard"
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            Quick Overview
          </h2>
          <p className="text-blue-800">
            Connecting your HubSpot account to WorkflowGuard is a simple process that takes just a few minutes. 
            This will allow WorkflowGuard to monitor your workflows and create version history automatically.
          </p>
        </div>
      </ContentSection>

      {/* Step-by-Step Guide */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Step-by-Step Connection Guide
        </h2>
        <div className="space-y-4">
          {steps.map((step) => (
            <Card key={step.number} className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : step.status === 'current'
                        ? 'bg-blue-100 text-blue-800'
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
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
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

      {/* Prerequisites */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Prerequisites
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-900">HubSpot Account</h3>
              </div>
              <p className="text-sm text-gray-600">
                You need an active HubSpot account with workflows that you want to protect.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-900">Admin Permissions</h3>
              </div>
              <p className="text-sm text-gray-600">
                You must have admin or owner permissions in your HubSpot account to authorize the connection.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-900">Active Workflows</h3>
              </div>
              <p className="text-sm text-gray-600">
                At least one active workflow in your HubSpot account is required for monitoring.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-900">Stable Internet</h3>
              </div>
              <p className="text-sm text-gray-600">
                A stable internet connection is required for the authorization process.
              </p>
            </CardContent>
          </Card>
        </div>
      </ContentSection>

      {/* Troubleshooting */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Troubleshooting
        </h2>
        <div className="space-y-4">
          {troubleshooting.map((item, index) => (
            <Card key={index} className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {item.issue}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.solution}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ContentSection>

      {/* Additional Resources */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Additional Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    HubSpot Documentation
                  </h3>
                  <p className="text-sm text-gray-600">
                    Learn more about HubSpot workflows and permissions
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Contact Support
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get help from our support team
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </ContentSection>

      {/* Action Button */}
      <ContentSection>
        <div className="flex items-center justify-center">
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3"
            onClick={() => navigate('/settings')}
          >
            Go to Settings
          </Button>
        </div>
      </ContentSection>
    </MainAppLayout>
  );
};

export default ConnectHubSpotGuide; 