import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import { ArrowLeft, FileText, BookOpen, Search, Download, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserManual = () => {
  const navigate = useNavigate();

  const chapters = [
    {
      title: "Getting Started",
      description: "Learn the basics of WorkflowGuard and set up your first workflow protection",
      topics: [
        "Creating your account",
        "Connecting HubSpot",
        "Selecting workflows to protect",
        "Understanding the dashboard"
      ],
      estimatedTime: "15 minutes"
    },
    {
      title: "Workflow Management",
      description: "Master the core features for managing and monitoring your workflows",
      topics: [
        "Viewing workflow history",
        "Comparing versions",
        "Restoring workflows",
        "Downloading versions"
      ],
      estimatedTime: "25 minutes"
    },
    {
      title: "Advanced Features",
      description: "Explore advanced capabilities and optimization techniques",
      topics: [
        "API integration",
        "Webhook configuration",
        "Audit logging",
        "Team collaboration"
      ],
      estimatedTime: "30 minutes"
    },
    {
      title: "Troubleshooting",
      description: "Common issues and their solutions to keep your workflows running smoothly",
      topics: [
        "Connection issues",
        "Restoration problems",
        "Performance optimization",
        "Getting help"
      ],
      estimatedTime: "20 minutes"
    }
  ];

  const quickStart = [
    {
      step: 1,
      title: "Connect Your HubSpot Account",
      description: "Link your HubSpot account to start protecting workflows",
      action: "Go to Settings > My Profile"
    },
    {
      step: 2,
      title: "Select Workflows to Protect",
      description: "Choose which workflows you want to monitor and version",
      action: "Use the Workflow Selection screen"
    },
    {
      step: 3,
      title: "Monitor Your Dashboard",
      description: "Track workflow changes and view protection status",
      action: "Check the main Dashboard regularly"
    },
    {
      step: 4,
      title: "Restore When Needed",
      description: "Use version history to restore workflows to previous states",
      action: "Navigate to Workflow History"
    }
  ];

  return (
    <MainAppLayout 
      title="User Manual"
      description="Complete step-by-step guide to using all WorkflowGuard features"
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
          <div className="flex items-start gap-4">
            <BookOpen className="w-8 h-8 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-blue-900 mb-3">
                Complete User Manual
              </h2>
              <p className="text-blue-800 mb-4">
                This comprehensive manual covers everything you need to know about WorkflowGuard, 
                from basic setup to advanced features. Each chapter builds upon the previous one 
                to give you a complete understanding of the platform.
              </p>
              <div className="flex items-center gap-4 text-sm text-blue-700">
                <span>📖 4 Chapters</span>
                <span>⏱️ ~90 minutes total</span>
                <span>🎯 Step-by-step guides</span>
              </div>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* Quick Start Guide */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Quick Start Guide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickStart.map((item) => (
            <Card key={item.step} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.description}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {item.action}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ContentSection>

      {/* Chapter List */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Manual Chapters
        </h2>
        <div className="space-y-4">
          {chapters.map((chapter, index) => (
            <Card key={index} className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {chapter.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {chapter.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>⏱️ {chapter.estimatedTime}</span>
                        <span>📝 {chapter.topics.length} topics</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Search className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Topics covered:</h4>
                  <div className="flex flex-wrap gap-2">
                    {chapter.topics.map((topic, topicIndex) => (
                      <Badge key={topicIndex} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
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
                    Video Tutorials
                  </h3>
                  <p className="text-sm text-gray-600">
                    Watch step-by-step video guides for visual learners
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
                    Interactive Tutorials
                  </h3>
                  <p className="text-sm text-gray-600">
                    Hands-on guided tours of key features
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
                    PDF Download
                  </h3>
                  <p className="text-sm text-gray-600">
                    Download the complete manual as PDF
                  </p>
                </div>
                <Download className="w-4 h-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Community Forum
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get help from other users and experts
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </ContentSection>

      {/* Action Buttons */}
      <ContentSection>
        <div className="flex items-center justify-center gap-4">
          <Button 
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => navigate('/contact-us')}
          >
            Get Help
          </Button>
        </div>
      </ContentSection>
    </MainAppLayout>
  );
};

export default UserManual; 