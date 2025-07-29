import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Filter, Clock, User, Settings, Shield, AlertTriangle } from "lucide-react";

const AuditLogTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("all");

  const auditEntries = [
  {
      id: 1,
      action: "Workflow Modified",
      description: "Lead Nurturing Campaign workflow was updated",
    user: "John Smith",
      timestamp: "2024-01-15 14:30:25",
      severity: "info",
      category: "workflow",
    },
    {
      id: 2,
      action: "User Invited",
      description: "Sarah Johnson was invited to the team",
      user: "John Smith",
      timestamp: "2024-01-15 13:45:12",
      severity: "info",
      category: "user",
    },
    {
      id: 3,
      action: "Security Alert",
      description: "Failed login attempt from unknown IP",
      user: "System",
      timestamp: "2024-01-15 12:20:45",
      severity: "warning",
      category: "security",
    },
    {
      id: 4,
      action: "Billing Updated",
      description: "Payment method updated successfully",
      user: "John Smith",
      timestamp: "2024-01-15 11:15:30",
      severity: "info",
      category: "billing",
    },
    {
      id: 5,
      action: "Permission Changed",
      description: "Mike Wilson role changed from Editor to Viewer",
      user: "John Smith",
      timestamp: "2024-01-15 10:30:15",
      severity: "warning",
      category: "user",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "workflow":
        return <Settings className="w-4 h-4" />;
      case "user":
        return <User className="w-4 h-4" />;
      case "security":
        return <Shield className="w-4 h-4" />;
      case "billing":
        return <Settings className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>
            View detailed logs of all activities in your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium">
                Search
              </Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search audit logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
        </div>
      </div>
            <div className="w-48">
              <Label htmlFor="severity" className="text-sm font-medium">
                Severity
              </Label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
            <div className="flex items-end">
              <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
                Export
          </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

      {/* Audit Log Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditEntries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getCategoryIcon(entry.category)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{entry.action}</h4>
                    <Badge className={getSeverityColor(entry.severity)}>
                      {entry.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>By: {entry.user}</span>
                    <span>•</span>
                    <span>{entry.timestamp}</span>
                  </div>
        </div>
      </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogTab;