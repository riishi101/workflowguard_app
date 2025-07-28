import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar } from "lucide-react";

const auditLogs = [
  {
    id: "1",
    timestamp: "2024-01-20 14:30:25 UTC",
    user: "John Smith",
    action: "Updated workflow",
    workflowName: "Customer Onboarding",
    oldValue: "3 steps",
    newValue: "4 steps",
    ipAddress: "192.168.1.1",
  },
  {
    id: "2",
    timestamp: "2024-01-20 13:15:12 UTC",
    user: "Sarah Johnson",
    action: "Added user",
    workflowName: "Invoice Processing",
    oldValue: "-",
    newValue: "Mike Wilson",
    ipAddress: "192.168.1.2",
  },
  {
    id: "3",
    timestamp: "2024-01-20 11:45:33 UTC",
    user: "David Brown",
    action: "Modified trigger",
    workflowName: "Email Notifications",
    oldValue: "Daily",
    newValue: "Weekly",
    ipAddress: "192.168.1.3",
  },
  {
    id: "4",
    timestamp: "2024-01-20 10:20:18 UTC",
    user: "Emily Davis",
    action: "Deleted workflow",
    workflowName: "Legacy Process",
    oldValue: "Active",
    newValue: "Deleted",
    ipAddress: "192.168.1.4",
  },
  {
    id: "5",
    timestamp: "2024-01-20 09:05:45 UTC",
    user: "Michael Wilson",
    action: "Created workflow",
    workflowName: "New Hire Setup",
    oldValue: "-",
    newValue: "Created",
    ipAddress: "192.168.1.5",
  },
];

const AuditLogTab = () => {
  const [dateRange, setDateRange] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  return (
    <div className="space-y-6">
      {/* Upgrade Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Upgrade to Enterprise Plan
          </h3>
          <p className="text-gray-600 text-sm">
            Get access to comprehensive audit logs and advanced security
            features
          </p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          Upgrade Now
        </Button>
      </div>

      {/* Audit Log Content */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Comprehensive App Activity Log
        </h3>
        <p className="text-gray-600 text-sm mb-6">
          Track all changes and actions performed in your workflows
        </p>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="john">John Smith</SelectItem>
              <SelectItem value="sarah">Sarah Johnson</SelectItem>
              <SelectItem value="david">David Brown</SelectItem>
            </SelectContent>
          </Select>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="text-blue-600">
            <Download className="w-4 h-4 mr-2" />
            Export Log
          </Button>
        </div>

        {/* Audit Log Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>TIMESTAMP</TableHead>
                <TableHead>USER</TableHead>
                <TableHead>ACTION</TableHead>
                <TableHead>WORKFLOW NAME</TableHead>
                <TableHead>OLD VALUE</TableHead>
                <TableHead>NEW VALUE</TableHead>
                <TableHead>IP ADDRESS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-sm text-gray-600">
                    {log.timestamp}
                  </TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        log.action.includes("Delete")
                          ? "bg-red-100 text-red-800"
                          : log.action.includes("Create")
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                      }
                    >
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="link" className="p-0 text-blue-600">
                      {log.workflowName}
                    </Button>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {log.oldValue}
                  </TableCell>
                  <TableCell className="font-medium">{log.newValue}</TableCell>
                  <TableCell className="font-mono text-sm text-gray-600">
                    {log.ipAddress}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogTab;
