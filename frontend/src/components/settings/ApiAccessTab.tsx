import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, Copy, Eye, EyeOff, RefreshCw, Trash2, Key, Globe } from "lucide-react";

const ApiAccessTab = () => {
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: "Production API Key",
      key: "wg_live_1234567890abcdef",
      status: "active",
      created: "2024-01-10",
      lastUsed: "2024-01-15 14:30:00",
      permissions: ["read", "write"],
    },
    {
      id: 2,
      name: "Development API Key",
      key: "wg_test_abcdef1234567890",
      status: "active",
      created: "2024-01-05",
      lastUsed: "2024-01-14 09:15:00",
      permissions: ["read"],
    },
    {
      id: 3,
      name: "Webhook Integration",
      key: "wg_webhook_9876543210fedcba",
      status: "inactive",
      created: "2024-01-01",
      lastUsed: "2024-01-12 16:45:00",
      permissions: ["read"],
    },
  ]);

  const [showKeys, setShowKeys] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPermissions, setNewKeyPermissions] = useState(["read"]);

  const handleCreateKey = () => {
    if (newKeyName) {
      const newKey = {
        id: Date.now(),
        name: newKeyName,
        key: `wg_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`,
        status: "active",
        created: new Date().toISOString().split('T')[0],
        lastUsed: "Never",
        permissions: newKeyPermissions,
      };
      setApiKeys(prev => [newKey, ...prev]);
      setNewKeyName("");
      setNewKeyPermissions(["read"]);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  const handleRevokeKey = (keyId: number) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId ? { ...key, status: "inactive" } : key
    ));
  };

  const handleRegenerateKey = (keyId: number) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId ? { 
        ...key, 
        key: `wg_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`,
        lastUsed: "Never"
      } : key
    ));
  };

  return (
    <div className="space-y-6">
      {/* API Overview */}
      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>
            Manage API keys and access for programmatic integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Key className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Active Keys</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Globe className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">API Calls</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <RefreshCw className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Rate Limit</p>
                <p className="text-2xl font-bold text-gray-900">85%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create New API Key */}
      <Card>
        <CardHeader>
          <CardTitle>Create New API Key</CardTitle>
          <CardDescription>
            Generate a new API key for your integrations
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
                placeholder="Enter a descriptive name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Permissions</Label>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newKeyPermissions.includes("read")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setNewKeyPermissions(prev => [...prev, "read"]);
                      } else {
                        setNewKeyPermissions(prev => prev.filter(p => p !== "read"));
                      }
                    }}
                  />
                  <Label className="text-sm">Read Access</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newKeyPermissions.includes("write")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setNewKeyPermissions(prev => [...prev, "write"]);
                      } else {
                        setNewKeyPermissions(prev => prev.filter(p => p !== "write"));
                      }
                    }}
                  />
                  <Label className="text-sm">Write Access</Label>
                </div>
              </div>
            </div>
            <Button onClick={handleCreateKey} disabled={!newKeyName}>
              <Key className="w-4 h-4 mr-2" />
              Create API Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your existing API keys
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKeys(!showKeys)}
            >
              {showKeys ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showKeys ? "Hide Keys" : "Show Keys"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                    <p className="text-sm text-gray-500">
                      Created: {apiKey.created} • Last used: {apiKey.lastUsed}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={apiKey.status === "active" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {apiKey.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyKey(apiKey.key)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRegenerateKey(apiKey.id)}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleRevokeKey(apiKey.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">API Key:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {showKeys ? apiKey.key : "••••••••••••••••••••••••••••••••"}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Permissions:</span>
                    <div className="flex gap-1">
                      {apiKey.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
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
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">API Documentation</h4>
                <p className="text-sm text-gray-600">Complete API reference and examples</p>
              </div>
              <Button variant="outline" size="sm">
                <Code className="w-4 h-4 mr-2" />
                View Docs
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">SDK Libraries</h4>
                <p className="text-sm text-gray-600">Official SDKs for popular languages</p>
              </div>
              <Button variant="outline" size="sm">
                <Code className="w-4 h-4 mr-2" />
                Download SDKs
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Webhook Guide</h4>
                <p className="text-sm text-gray-600">Set up webhooks for real-time updates</p>
              </div>
              <Button variant="outline" size="sm">
                <Code className="w-4 h-4 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiAccessTab;
