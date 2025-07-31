import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import { ArrowLeft, Lightbulb, Play, ExternalLink, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FeatureSpotlights = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Automatic Version Control",
      description: "WorkflowGuard automatically creates versions of your workflows every time they're published or modified.",
      icon: "🔄",
      color: "text-blue-500",
      benefits: [
        "No manual version management required",
        "Complete change history",
        "Automatic timestamps and metadata"
      ],
      demo: "Watch how automatic versioning works",
      difficulty: "Beginner"
    },
    {
      title: "Smart Comparison Engine",
      description: "Compare any two workflow versions side-by-side with visual indicators for changes, additions, and deletions.",
      icon: "⚖️",
      color: "text-green-500",
      benefits: [
        "Visual change indicators",
        "Step-by-step comparison",
        "Detailed change analysis"
      ],
      demo: "See comparison in action",
      difficulty: "Intermediate"
    },
    {
      title: "One-Click Restoration",
      description: "Restore workflows to any previous version with a single click, creating a new version with the restored content.",
      icon: "⏮️",
      color: "text-orange-500",
      benefits: [
        "Instant workflow restoration",
        "Safe rollback process",
        "Version history preservation"
      ],
      demo: "Learn restoration process",
      difficulty: "Beginner"
    },
    {
      title: "Real-Time Monitoring",
      description: "Monitor your workflows in real-time with instant notifications when changes are detected.",
      icon: "📊",
      color: "text-purple-500",
      benefits: [
        "Instant change detection",
        "Email notifications",
        "Dashboard alerts"
      ],
      demo: "Explore monitoring features",
      difficulty: "Intermediate"
    },
    {
      title: "Advanced Audit Logging",
      description: "Comprehensive audit trail of all actions, changes, and user activities for compliance and security.",
      icon: "📝",
      color: "text-red-500",
      benefits: [
        "Complete activity tracking",
        "Export capabilities",
        "Security compliance"
      ],
      demo: "View audit log demo",
      difficulty: "Advanced"
    },
    {
      title: "API Integration",
      description: "Integrate WorkflowGuard with your existing tools and workflows through our comprehensive API.",
      icon: "🔌",
      color: "text-indigo-500",
      benefits: [
        "RESTful API access",
        "Webhook support",
        "Custom integrations"
      ],
      demo: "API documentation",
      difficulty: "Advanced"
    }
  ];

  const categories = [
    {
      name: "Core Features",
      description: "Essential functionality for workflow protection",
      count: 3
    },
    {
      name: "Advanced Features",
      description: "Powerful tools for experienced users",
      count: 3
    }
  ];

  return (
    <MainAppLayout 
      title="Feature Spotlights"
      description="In-depth tutorials highlighting specific features and capabilities"
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <Lightbulb className="w-8 h-8 text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-yellow-900 mb-3">
                Feature Deep Dives
              </h2>
              <p className="text-yellow-800 mb-4">
                Explore the powerful features that make WorkflowGuard the ultimate workflow protection solution. 
                Each spotlight includes detailed explanations, benefits, and interactive demos.
              </p>
              <div className="flex items-center gap-4 text-sm text-yellow-700">
                <span>✨ 6 Features</span>
                <span>🎯 Beginner to Advanced</span>
                <span>📹 Interactive Demos</span>
              </div>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* Feature Categories */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Feature Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category, index) => (
            <Card key={index} className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {category.count} features
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ContentSection>

      {/* Feature Grid */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          All Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl">{feature.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {feature.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`${
                          feature.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                          feature.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {feature.difficulty}
                      </Badge>
                      <Star className="w-4 h-4 text-yellow-500" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Key Benefits:</h4>
                    <ul className="space-y-1">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="text-sm text-gray-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      <Play className="w-4 h-4 mr-1" />
                      {feature.demo}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ContentSection>

      {/* Interactive Learning */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Interactive Learning
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-4 text-center">
              <Play className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">
                Video Tutorials
              </h3>
              <p className="text-sm text-gray-600">
                Watch step-by-step video guides for each feature
              </p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-4 text-center">
              <Lightbulb className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">
                Interactive Demos
              </h3>
              <p className="text-sm text-gray-600">
                Hands-on demonstrations with real examples
              </p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">
                Best Practices
              </h3>
              <p className="text-sm text-gray-600">
                Learn optimal ways to use each feature
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
            onClick={() => navigate('/dashboard')}
          >
            Try Features
          </Button>
          <Button 
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={() => navigate('/contact-us')}
          >
            Get Support
          </Button>
        </div>
      </ContentSection>
    </MainAppLayout>
  );
};

export default FeatureSpotlights; 