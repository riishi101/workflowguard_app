import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import { ArrowLeft, Rocket, Code, Users, Zap, ExternalLink, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdvancedUseCases = () => {
  const navigate = useNavigate();

  const useCases = [
    {
      title: "Enterprise Workflow Governance",
      description: "Implement comprehensive workflow governance across large organizations with multiple teams and complex approval processes.",
      icon: "🏢",
      difficulty: "Advanced",
      timeEstimate: "2-3 hours",
      benefits: [
        "Multi-team collaboration",
        "Approval workflows",
        "Compliance tracking",
        "Audit trail management"
      ],
      steps: [
        "Set up role-based access control",
        "Configure approval workflows",
        "Implement audit logging",
        "Establish compliance reporting"
      ]
    },
    {
      title: "Automated Backup & Recovery",
      description: "Create automated backup strategies and disaster recovery plans for critical workflow infrastructure.",
      icon: "🔄",
      difficulty: "Advanced",
      timeEstimate: "1-2 hours",
      benefits: [
        "Automated backups",
        "Quick disaster recovery",
        "Data integrity protection",
        "Business continuity"
      ],
      steps: [
        "Configure backup schedules",
        "Set up recovery procedures",
        "Test recovery processes",
        "Document recovery plans"
      ]
    },
    {
      title: "API Integration & Automation",
      description: "Integrate WorkflowGuard with existing systems and automate workflow management processes.",
      icon: "🔌",
      difficulty: "Expert",
      timeEstimate: "3-4 hours",
      benefits: [
        "Seamless system integration",
        "Automated workflows",
        "Custom reporting",
        "Real-time synchronization"
      ],
      steps: [
        "Design API architecture",
        "Implement webhook handlers",
        "Create custom integrations",
        "Test automation flows"
      ]
    },
    {
      title: "Multi-Environment Management",
      description: "Manage workflows across development, staging, and production environments with proper version control.",
      icon: "🌍",
      difficulty: "Advanced",
      timeEstimate: "2-3 hours",
      benefits: [
        "Environment isolation",
        "Safe deployments",
        "Version synchronization",
        "Rollback capabilities"
      ],
      steps: [
        "Set up environment configurations",
        "Configure deployment pipelines",
        "Implement version tracking",
        "Establish rollback procedures"
      ]
    },
    {
      title: "Advanced Analytics & Reporting",
      description: "Leverage WorkflowGuard's analytics capabilities to gain insights into workflow performance and optimization opportunities.",
      icon: "📊",
      difficulty: "Intermediate",
      timeEstimate: "1-2 hours",
      benefits: [
        "Performance insights",
        "Optimization opportunities",
        "Trend analysis",
        "Custom reporting"
      ],
      steps: [
        "Configure analytics tracking",
        "Set up custom reports",
        "Define KPIs and metrics",
        "Implement monitoring dashboards"
      ]
    },
    {
      title: "Compliance & Security",
      description: "Implement comprehensive security measures and compliance protocols for sensitive workflow data.",
      icon: "🔒",
      difficulty: "Expert",
      timeEstimate: "3-4 hours",
      benefits: [
        "Data protection",
        "Compliance adherence",
        "Security monitoring",
        "Audit readiness"
      ],
      steps: [
        "Implement security protocols",
        "Configure compliance settings",
        "Set up monitoring systems",
        "Establish audit procedures"
      ]
    }
  ];

  const categories = [
    {
      name: "Enterprise Solutions",
      description: "Large-scale implementations for organizations",
      count: 2
    },
    {
      name: "Technical Implementations",
      description: "Advanced technical configurations and integrations",
      count: 2
    },
    {
      name: "Analytics & Optimization",
      description: "Data-driven insights and performance optimization",
      count: 2
    }
  ];

  return (
    <MainAppLayout 
      title="Advanced Use Cases"
      description="Real-world examples and complex workflow implementations"
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
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <Rocket className="w-8 h-8 text-purple-600 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-purple-900 mb-3">
                Advanced Implementations
              </h2>
              <p className="text-purple-800 mb-4">
                Explore complex real-world scenarios and learn how to implement WorkflowGuard 
                for enterprise-level workflow management, automation, and optimization.
              </p>
              <div className="flex items-center gap-4 text-sm text-purple-700">
                <span>🚀 6 Use Cases</span>
                <span>⏱️ 1-4 hours each</span>
                <span>🎯 Intermediate to Expert</span>
              </div>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* Categories */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Use Case Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category, index) => (
            <Card key={index} className="border-l-4 border-l-purple-500">
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
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {category.count} cases
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ContentSection>

      {/* Use Cases Grid */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Advanced Use Cases
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {useCases.map((useCase, index) => (
            <Card key={index} className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl">{useCase.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {useCase.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {useCase.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`${
                          useCase.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          useCase.difficulty === 'Advanced' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {useCase.difficulty}
                      </Badge>
                      <span className="text-xs text-gray-500">⏱️ {useCase.timeEstimate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Key Benefits:</h4>
                    <ul className="space-y-1">
                      {useCase.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="text-sm text-gray-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Implementation Steps:</h4>
                    <ol className="space-y-1">
                      {useCase.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="w-5 h-5 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {stepIndex + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <Button variant="ghost" size="sm" className="text-purple-600">
                      <BookOpen className="w-4 h-4 mr-1" />
                      View Guide
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

      {/* Resources */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Additional Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-4 text-center">
              <Code className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">
                Code Examples
              </h3>
              <p className="text-sm text-gray-600">
                Ready-to-use code snippets and templates
              </p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">
                Case Studies
              </h3>
              <p className="text-sm text-gray-600">
                Real customer implementations and results
              </p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">
                Best Practices
              </h3>
              <p className="text-sm text-gray-600">
                Proven strategies and optimization tips
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
            Start Implementation
          </Button>
          <Button 
            className="bg-purple-500 hover:bg-purple-600 text-white"
            onClick={() => navigate('/contact-us')}
          >
            Get Expert Help
          </Button>
        </div>
      </ContentSection>
    </MainAppLayout>
  );
};

export default AdvancedUseCases; 