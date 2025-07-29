import { useState } from "react";
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
import { Plus, Trash2, Eye, AlertTriangle, ExternalLink } from "lucide-react";
import SsoConfiguration from "./SsoConfiguration";
import WebhooksConfiguration from "./WebhooksConfiguration";

const apiKeys = [
  {
    id: "1",
    keyId: "wg_key_123***",
    description: "Production API Key",
    created: "Jan 15, 2024",
    lastUsed: "Jun 20, 2024",
  },
  {
    id: "2",
    keyId: "wg_key_456***",
    description: "Development API Key",
    created: "Mar 22, 2024",
    lastUsed: "Jun 19, 2024",
  },
  {
    id: "3",
    keyId: "wg_key_789***",
    description: "Testing API Key",
    created: "May 10, 2024",
    lastUsed: "Jun 18, 2024",
  },
];

const ApiAccessTab = () => {
  const [activeSubTab, setActiveSubTab] = useState("api-access");

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
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Generate New Key
              </Button>
            </CardHeader>
            <CardContent>
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
                      <TableCell>{key.description}</TableCell>
                      <TableCell className="text-gray-600">
                        {key.created}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {key.lastUsed}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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
