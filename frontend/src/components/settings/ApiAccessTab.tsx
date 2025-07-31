import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ApiService } from "@/lib/api";
import { Plus, Trash2, Eye, AlertTriangle, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import SsoConfiguration from "./SsoConfiguration";
import WebhooksConfiguration from "./WebhooksConfiguration";

interface ApiKey {
  id: string;
  keyId: string;
  name: string;
  description?: string;
  created: string;
  lastUsed?: string;
}

const ApiAccessTab = () => {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState("api-access");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  useEffect(() => {
    if (activeSubTab === "api-access") {
      fetchApiKeys();
    }
  }, [activeSubTab]);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.getApiKeys();
      setApiKeys(response.data);
    } catch (err: any) {
      console.error('Failed to fetch API keys:', err);
      setError(err.response?.data?.message || 'Failed to load API keys. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load API keys. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    try {
      setCreating(true);
      const response = await ApiService.createApiKey({
        name: `API Key ${new Date().toLocaleDateString()}`,
        description: "Generated API key",
      });
      
      setApiKeys(prev => [...prev, response.data]);
      toast({
        title: "API Key Created",
        description: "New API key has been generated successfully.",
      });
    } catch (err: any) {
      console.error('Failed to create API key:', err);
      toast({
        title: "Creation Failed",
        description: err.response?.data?.message || "Failed to create API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeleting(keyId);
      await ApiService.deleteApiKey(keyId);
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      toast({
        title: "API Key Deleted",
        description: "API key has been deleted successfully.",
      });
    } catch (err: any) {
      console.error('Failed to delete API key:', err);
      toast({
        title: "Delete Failed",
        description: err.response?.data?.message || "Failed to delete API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="pt-10 pb-6">
          <Skeleton className="h-6 w-64 mb-4" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <Skeleton className="h-8 w-48" />
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <Skeleton className="h-4 w-full" />
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchApiKeys}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="api-access">API Access</TabsTrigger>
          <TabsTrigger value="single-sign-on">Single Sign-On</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="api-access" className="space-y-6">
          <div className="pt-10 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              API & Integrations Management
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Generate API keys for programmatic access to WorkflowGuard's
              version control and audit data
            </p>
          </div>

          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Security Notice: API keys provide full access to your account.
              Keep them secure and never share them publicly.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>API Keys</CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchApiKeys}
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={handleCreateApiKey}
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Generate New Key
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {apiKeys.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>KEY ID</TableHead>
                      <TableHead>DESCRIPTION</TableHead>
                      <TableHead>CREATED</TableHead>
                      <TableHead>LAST USED</TableHead>
                      <TableHead>ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-mono text-sm">
                          {key.keyId}
                        </TableCell>
                        <TableCell>{key.description || key.name}</TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(key.created).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : "Never"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 text-gray-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteApiKey(key.id)}
                              disabled={deleting === key.id}
                            >
                              {deleting === key.id ? (
                                <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-red-500" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No API Keys Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Generate your first API key to start integrating with WorkflowGuard.
                  </p>
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handleCreateApiKey}
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Generate First Key
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="mt-4">
                <Button variant="outline" className="text-blue-600">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View API Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="single-sign-on" className="space-y-6">
          <SsoConfiguration />
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <WebhooksConfiguration />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiAccessTab;
