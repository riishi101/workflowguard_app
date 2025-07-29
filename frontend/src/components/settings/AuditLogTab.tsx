import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Filter, Calendar, User, Settings, Shield } from "lucide-react";

const AuditLogTab = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [selectedAction, setSelectedAction] = useState("all");

  const auditLogs = [
    {
      id: 1,
      action: "Workflow Modified",
      user: "John Smith",
      timestamp: "2024-01-15 14:30:00",
      details: "Modified 'Lead Nurturing Campaign' workflow",
      severity: "info",
      ip: "192.168.1.100",
    },
    {
      id: 2,
      action: "User Added",
      user: "Sarah Johnson",
      timestamp: "2024-01-15 13:45:00",
      details: "Added new team member: mike.wilson@example.com",
      severity: "info",
      ip: "192.168.1.101",
    },
    {
      id: 3,
      action: "Security Alert",
      user: "System",
      timestamp: "2024-01-15 12:20:00",
      details: "Multiple failed login attempts detected",
      severity: "warning",
      ip: "192.168.1.102",
    },
    {
      id: 4,
      action: "Settings Changed",
      user: "John Smith",
      timestamp: "2024-01-15 11:15:00",
      details: "Updated notification preferences",
      severity: "info",
      ip: "192.168.1.100",
    },
    {
      id: 5,
      action: "Workflow Deleted",
      user: "Sarah Johnson",
      timestamp: "2024-01-15 10:30:00",
      details: "Deleted 'Old Marketing Campaign' workflow",
      severity: "danger",
      ip: "192.168.1.101",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "danger":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "Workflow Modified":
      case "Workflow Deleted":
        return <Settings className="w-4 h-4" />;
      case "User Added":
        return <User className="w-4 h-4" />;
      case "Security Alert":
        return <Shield className="w-4 h-4" />;
      case "Settings Changed":
        return <Settings className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>
            View detailed logs of all activities and changes in your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium">
                Search
              </Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search audit logs..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-32">
              <Label htmlFor="period" className="text-sm font-medium">
                Period
              </Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Label htmlFor="action" className="text-sm font-medium">
                Action
              </Label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest audit log entries from your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-3 border border-gray-200 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getActionIcon(log.action)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {log.action}
                      </span>
                      <Badge className={`text-xs ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {log.details}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>User: {log.user}</span>
                    <span>IP: {log.ip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Total Actions</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-xs text-gray-500">Team members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Security Events</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-xs text-gray-500">This week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditLogTab;
