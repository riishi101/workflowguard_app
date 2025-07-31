import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import { ArrowLeft, AlertTriangle, Search, CheckCircle, XCircle, HelpCircle, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Troubleshooting = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [openIssue, setOpenIssue] = useState<string | null>(null);

  const issues = [
    {
      id: "connection",
      category: "Connection Issues",
      title: "HubSpot Connection Problems",
      severity: "High",
      symptoms: [
        "Cannot connect to HubSpot account",
        "Authorization errors",
        "Connection timeout"
      ],
      solutions: [
        "Verify you're logged into the correct HubSpot account",
        "Check that you have admin permissions in HubSpot",
        "Ensure your internet connection is stable",
        "Try refreshing the page and reconnecting"
      ],
      prevention: "Regularly check your HubSpot account permissions and keep your browser updated."
    },
    {
      id: "restoration",
      category: "Restoration Issues",
      title: "Workflow Restoration Fails",
      severity: "Medium",
      symptoms: [
        "Restore button doesn't work",
        "Restoration process times out",
        "Workflow not updated after restore"
      ],
      solutions: [
        "Check that you have the necessary permissions",
        "Ensure the workflow isn't being edited by another user",
        "Try restoring to a different version",
        "Contact support if the issue persists"
      ],
      prevention: "Always review changes before restoring and communicate with team members."
    },
    {
      id: "performance",
      category: "Performance Issues",
      title: "Slow Loading or Timeouts",
      severity: "Medium",
      symptoms: [
        "Pages take too long to load",
        "API calls timeout",
        "Dashboard not updating"
      ],
      solutions: [
        "Check your internet connection speed",
        "Clear browser cache and cookies",
        "Try using a different browser",
        "Contact support if the issue continues"
      ],
      prevention: "Use a stable internet connection and keep your browser updated."
    },
    {
      id: "notifications",
      category: "Notification Issues",
      title: "Email Notifications Not Working",
      severity: "Low",
      symptoms: [
        "Not receiving email notifications",
        "Notifications going to spam",
        "Wrong email address"
      ],
      solutions: [
        "Check your spam/junk folder",
        "Verify your email address in settings",
        "Add WorkflowGuard to your safe senders list",
        "Update your email preferences"
      ],
      prevention: "Regularly check your notification settings and email preferences."
    },
    {
      id: "api",
      category: "API Issues",
      title: "API Integration Problems",
      severity: "High",
      symptoms: [
        "API calls returning errors",
        "Authentication failures",
        "Rate limiting issues"
      ],
      solutions: [
        "Verify your API key is valid and active",
        "Check API rate limits and quotas",
        "Ensure proper authentication headers",
        "Review API documentation for correct usage"
      ],
      prevention: "Monitor API usage and implement proper error handling in your integrations."
    },
    {
      id: "data",
      category: "Data Issues",
      title: "Missing or Incorrect Data",
      severity: "Medium",
      symptoms: [
        "Workflow versions not showing",
        "Incorrect version history",
        "Missing audit logs"
      ],
      solutions: [
        "Refresh the page and try again",
        "Check your HubSpot connection status",
        "Verify workflow permissions",
        "Contact support for data recovery"
      ],
      prevention: "Regularly backup important data and monitor connection status."
    }
  ];

  const filteredIssues = issues.filter(issue =>
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.symptoms.some(symptom => 
      symptom.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainAppLayout 
      title="Troubleshooting"
      description="Common issues and their solutions to keep your workflows running smoothly"
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

      {/* Search */}
      <ContentSection>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search for issues, symptoms, or solutions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-3 text-base"
          />
        </div>
      </ContentSection>

      {/* Quick Fixes */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Quick Fixes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-900">Refresh Page</h3>
              </div>
              <p className="text-sm text-gray-600">
                Most issues can be resolved by refreshing your browser page.
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Check Connection</h3>
              </div>
              <p className="text-sm text-gray-600">
                Verify your HubSpot connection is active and stable.
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3 className="font-medium text-gray-900">Clear Cache</h3>
              </div>
              <p className="text-sm text-gray-600">
                Clear browser cache and cookies for performance issues.
              </p>
            </CardContent>
          </Card>
        </div>
      </ContentSection>

      {/* Issues List */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Common Issues & Solutions
        </h2>
        <div className="space-y-4">
          {filteredIssues.map((issue) => (
            <Collapsible
              key={issue.id}
              open={openIssue === issue.id}
              onOpenChange={(isOpen) =>
                setOpenIssue(isOpen ? issue.id : null)
              }
            >
              <CollapsibleTrigger className="w-full">
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {issue.title}
                            </h3>
                            <Badge variant="secondary" className={getSeverityColor(issue.severity)}>
                              {issue.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {issue.category}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                          openIssue === issue.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="border-t-0 rounded-t-none">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Symptoms:</h4>
                        <ul className="space-y-1">
                          {issue.symptoms.map((symptom, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              {symptom}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Solutions:</h4>
                        <ol className="space-y-1">
                          {issue.solutions.map((solution, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                {index + 1}
                              </span>
                              {solution}
                            </li>
                          ))}
                        </ol>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Prevention:</h4>
                        <p className="text-sm text-gray-600">
                          {issue.prevention}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ContentSection>

      {/* Still Need Help */}
      <ContentSection>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            Still Need Help?
          </h2>
          <p className="text-blue-800 mb-4">
            If you're still experiencing issues after trying these solutions, 
            our support team is here to help. We can provide personalized assistance 
            and troubleshoot your specific situation.
          </p>
          <div className="flex items-center gap-4">
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => navigate('/contact-us')}
            >
              Contact Support
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/help-support')}
            >
              Browse More Help
            </Button>
          </div>
        </div>
      </ContentSection>
    </MainAppLayout>
  );
};

export default Troubleshooting; 