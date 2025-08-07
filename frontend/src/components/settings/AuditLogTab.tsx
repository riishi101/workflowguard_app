import { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ApiService } from "@/lib/api";
import { Download, Calendar, AlertTriangle, Loader2, RefreshCw } from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  workflowName: string;
  oldValue: string;
  newValue: string;
  ipAddress: string;
}

const AuditLogTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dateRange, setDateRange] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    fetchAuditLogs();
  }, [dateRange, userFilter, actionFilter]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.getAuditLogs({
        dateRange,
        user: userFilter !== "all" ? userFilter : undefined,
        action: actionFilter !== "all" ? actionFilter : undefined,
      });
      
      // Add null check for response.data
      if (response && response.data && Array.isArray(response.data)) {
        setAuditLogs(response.data);
      } else {
        // Set empty array if no data received
        setAuditLogs([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch audit logs:', err);
      setError(err.response?.data?.message || 'Failed to load audit logs. Please try again.');
      
      // Set empty array on error
      setAuditLogs([]);
      
      toast({
        title: "Error",
        description: "Failed to load audit logs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportLogs = async () => {
    try {
      setExporting(true);
      const response = await ApiService.exportAuditLogs({
        dateRange,
        user: userFilter !== "all" ? userFilter : undefined,
        action: actionFilter !== "all" ? actionFilter : undefined,
      });
      
      // Create and download the file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Successful",
        description: "Audit logs have been exported successfully.",
      });
    } catch (err: any) {
      console.error('Failed to export audit logs:', err);
      toast({
        title: "Export Failed",
        description: err.response?.data?.message || "Failed to export audit logs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-40" />
            ))}
          </div>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4">
              <Skeleton className="h-4 w-full" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 border-b border-gray-200">
                <div className="grid grid-cols-7 gap-4">
                  {[...Array(7)].map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If forbidden, show locked screen with overlay
  if (error && (error.includes('not available on your plan') || error.includes('forbidden') || error.includes('403'))) {
    return (
      <div className="relative">
        {/* Render the normal Audit Log tab UI, but locked out */}
        <div className="opacity-60 pointer-events-none select-none">
          {/* ...existing code for the tab UI... */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-40" />
                ))}
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4">
                  <Skeleton className="h-4 w-full" />
                </div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 border-b border-gray-200">
                    <div className="grid grid-cols-7 gap-4">
                      {[...Array(7)].map((_, j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Overlay lock message, clickable and visible */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white bg-opacity-80 pointer-events-auto select-auto">
          <AlertTriangle className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Audit Log Access Restricted</h3>
          <p className="text-gray-600 mb-4 max-w-md text-center">
            Your current plan does not include access to audit logs.<br />
            Please upgrade your subscription to unlock this feature.
          </p>
        </div>
      </div>
    );
  }

  // For other errors, show a more user-friendly message
  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error === 'Failed to load audit logs. Please try again.' || error === 'Internal server error' ? (
              <>
                We couldn&apos;t load the audit logs at this time. Please check your connection or try again later.
              </>
            ) : (
              error
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAuditLogs}
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
              {/* Dynamic user list would be populated from API */}
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

          <Button 
            variant="outline" 
            className="text-blue-600"
            onClick={handleExportLogs}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Log
              </>
            )}
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchAuditLogs}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Audit Log Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {auditLogs.length > 0 ? (
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
                      {new Date(log.timestamp).toLocaleString()}
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
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Audit Logs Found
              </h3>
              <p className="text-gray-600">
                No audit logs match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogTab;
