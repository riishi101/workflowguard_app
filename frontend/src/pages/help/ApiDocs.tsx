import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import { ArrowLeft, Code, ExternalLink, Download, BookOpen, Terminal } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ApiDocs = () => {
  const navigate = useNavigate();

  const endpoints = [
    {
      method: "GET",
      path: "/api/workflow",
      description: "Get all workflows",
      category: "Workflows"
    },
    {
      method: "GET",
      path: "/api/workflow/{id}",
      description: "Get specific workflow",
      category: "Workflows"
    },
    {
      method: "GET",
      path: "/api/workflow/{id}/history",
      description: "Get workflow version history",
      category: "Versions"
    },
    {
      method: "POST",
      path: "/api/workflow/{id}/restore/{versionId}",
      description: "Restore workflow to version",
      category: "Versions"
    },
    {
      method: "GET",
      path: "/api/workflow/{id}/compare",
      description: "Compare workflow versions",
      category: "Versions"
    },
    {
      method: "GET",
      path: "/api/audit-log",
      description: "Get audit logs",
      category: "Audit"
    }
  ];

  const categories = [
    {
      name: "Authentication",
      description: "Learn how to authenticate with our API",
      icon: "🔐",
      endpoints: 2
    },
    {
      name: "Workflows",
      description: "Manage and monitor your workflows",
      icon: "🔄",
      endpoints: 6
    },
    {
      name: "Versions",
      description: "Work with workflow versions and history",
      icon: "📚",
      endpoints: 8
    },
    {
      name: "Audit",
      description: "Access audit logs and activity data",
      icon: "📝",
      endpoints: 4
    }
  ];

  const codeExamples = [
    {
      language: "JavaScript",
      title: "Get Workflow History",
      code: `const response = await fetch('/api/workflow/123/history', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const history = await response.json();`
    },
    {
      language: "Python",
      title: "Restore Workflow Version",
      code: `import requests

response = requests.post(
    'https://api.workflowguard.pro/api/workflow/123/restore/456',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)
result = response.json()`
    },
    {
      language: "cURL",
      title: "Compare Versions",
      code: `curl -X GET \\
  'https://api.workflowguard.pro/api/workflow/123/compare?versionA=456&versionB=789' \\
  -H 'Authorization: Bearer YOUR_API_KEY'`
    }
  ];

  return (
    <MainAppLayout 
      title="API Documentation"
      description="Technical documentation for developers integrating with our API"
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
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <Code className="w-8 h-8 text-gray-600 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                API Overview
              </h2>
              <p className="text-gray-700 mb-4">
                WorkflowGuard provides a comprehensive REST API for integrating workflow protection 
                into your applications. All endpoints require authentication and return JSON responses.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>🔗 RESTful API</span>
                <span>🔐 JWT Authentication</span>
                <span>📄 JSON Responses</span>
                <span>📚 OpenAPI Spec</span>
              </div>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* Quick Start */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Quick Start
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">1. Get API Key</h3>
              </div>
              <p className="text-sm text-gray-600">
                Generate an API key from Settings &gt; API Access
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-900">2. Make Request</h3>
              </div>
              <p className="text-sm text-gray-600">
                Include your API key in the Authorization header
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium text-gray-900">3. Explore Endpoints</h3>
              </div>
              <p className="text-sm text-gray-600">
                Browse available endpoints and test with examples
              </p>
            </CardContent>
          </Card>
        </div>
      </ContentSection>

      {/* API Categories */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          API Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category, index) => (
            <Card key={index} className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {category.description}
                    </p>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      {category.endpoints} endpoints
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ContentSection>

      {/* Popular Endpoints */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Popular Endpoints
        </h2>
        <div className="space-y-3">
          {endpoints.map((endpoint, index) => (
            <Card key={index} className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="secondary" 
                      className={`${
                        endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                        endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {endpoint.method}
                    </Badge>
                                         <span className="text-sm font-mono text-gray-900">
                       {endpoint.path}
                     </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {endpoint.description}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {endpoint.category}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ContentSection>

      {/* Code Examples */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Code Examples
        </h2>
        <div className="space-y-4">
          {codeExamples.map((example, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {example.title}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    {example.language}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{example.code}</code>
                </pre>
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
                    OpenAPI Specification
                  </h3>
                  <p className="text-sm text-gray-600">
                    Download the complete API specification
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
                    Interactive API Explorer
                  </h3>
                  <p className="text-sm text-gray-600">
                    Test endpoints directly in your browser
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
                    SDK Libraries
                  </h3>
                  <p className="text-sm text-gray-600">
                    Official SDKs for popular languages
                  </p>
                </div>
                <Code className="w-4 h-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Rate Limits & Quotas
                  </h3>
                  <p className="text-sm text-gray-600">
                    Understand API usage limits
                  </p>
                </div>
                <BookOpen className="w-4 h-4 text-gray-400" />
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
            onClick={() => navigate('/settings')}
          >
            Get API Key
          </Button>
          <Button 
            className="bg-gray-800 hover:bg-gray-900 text-white"
            onClick={() => navigate('/contact-us')}
          >
            Developer Support
          </Button>
        </div>
      </ContentSection>
    </MainAppLayout>
  );
};

export default ApiDocs; 