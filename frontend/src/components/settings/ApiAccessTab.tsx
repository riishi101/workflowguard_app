import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, Key, Copy, Eye, EyeOff, RefreshCw, Trash2, ExternalLink, AlertTriangle } from "lucide-react";

const ApiAccessTab = () => {
  const [showKey, setShowKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");

const apiKeys = [
  {
      id: 1,
      name: "Production API Key",
      key: "sk_live_1234567890abcdef",
      created: "2024-01-10",
      lastUsed: "2024-01-15 14:30:25",
      status: "active",
  },
  {
      id: 2,
      name: "Development API Key",
      key: "sk_test_abcdef1234567890",
      created: "2024-01-05",
      lastUsed: "2024-01-12 09:15:30",
      status: "active",
  },
  {
      id: 3,
      name: "Old API Key",
      key: "sk_old_1234567890abcdef",
      created: "2023-12-20",
      lastUsed: "2024-01-01 16:45:12",
      status: "inactive",
  },
];

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="space-y-6">
      {/* API Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active API Keys</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">API Calls Today</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rate Limit</p>
                <p className="text-2xl font-bold text-gray-900">10,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New API Key */}
      <Card>
        <CardHeader>
          <CardTitle>Create New API Key</CardTitle>
          <CardDescription>
            Generate a new API key for your applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="key-name" className="text-sm font-medium">
                Key Name
              </Label>
              <Input
                id="key-name"
                placeholder="Enter a descriptive name for this API key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Key className="w-4 h-4 mr-2" />
              Generate API Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Keys List */}
          <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Manage your API keys and their permissions
          </CardDescription>
            </CardHeader>
            <CardContent>
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                      <Badge className={getStatusColor(apiKey.status)}>
                        {apiKey.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {showKey ? apiKey.key : "••••••••••••••••••••••••••••••••"}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowKey(!showKey)}
                      >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Created: {apiKey.created}</span>
                      <span>•</span>
                      <span>Last used: {apiKey.lastUsed}</span>
                    </div>
                  </div>
                        <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4" />
                          </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Learn how to integrate with WorkflowGuard API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Keep your API keys secure and never share them publicly. Each key has full access to your account.
              </AlertDescription>
            </Alert>
            <div className="flex gap-3">
              <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View API Documentation
                </Button>
              <Button variant="outline">
                <Code className="w-4 h-4 mr-2" />
                Download SDK
              </Button>
            </div>
              </div>
            </CardContent>
          </Card>
    </div>
  );
};

export default ApiAccessTab;