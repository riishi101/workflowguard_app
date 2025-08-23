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
import { Download, Calendar, AlertTriangle, Loader2, RefreshCw, ChevronLeft, ChevronRight, Users } from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string | object;
  user: string | object;
  action: string | object;
  workflowName: string | object;
  oldValue: string | object;
  newValue: string | object;
  ipAddress: string | object;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const AuditLogTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dateRange, setDateRange] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, [dateRange, userFilter, actionFilter, currentPage, pageSize]);

  const fetchUsers = async () => {
    try {
      // Fetch users from the system for the filter dropdown
      const response = await ApiService.getUsers();
      if (response && response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        // Fallback to common users if API fails
        setUsers([
          { id: 'current-user', name: 'Current User', email: 'user@example.com' },
          { id: 'admin', name: 'Admin User', email: 'admin@workflowguard.pro' },
          { id: 'support', name: 'Support Team', email: 'contact@workflowguard.pro' }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Set fallback users
      setUsers([
        { id: 'current-user', name: 'Current User', email: 'user@example.com' },
        { id: 'admin', name: 'Admin User', email: 'admin@workflowguard.pro' },
        { id: 'support', name: 'Support Team', email: 'contact@workflowguard.pro' }
      ]);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.getAuditLogs({
        dateRange,
        user: userFilter !== "all" ? userFilter : undefined,
        action: actionFilter !== "all" ? actionFilter : undefined,
        page: currentPage,
        pageSize,
      });

      // Add null check for response.data
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          setAuditLogs(response.data);
          setTotalRecords(response.data.length);
          setTotalPages(Math.ceil(response.data.length / pageSize));
        } else if (response.data.logs && Array.isArray(response.data.logs)) {
          setAuditLogs(response.data.logs);
          setTotalRecords(response.data.total || response.data.logs.length);
          setTotalPages(response.data.totalPages || Math.ceil((response.data.total || response.data.logs.length) / pageSize));
        } else {
          setAuditLogs([]);
          setTotalRecords(0);
          setTotalPages(1);
        }
      } else {
        setAuditLogs([]);
        setTotalRecords(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error('Failed to fetch audit logs:', err);
      const errMsg = err.response?.data?.message || 'Failed to load audit logs. Please try again.';
      setError(errMsg);

      setAuditLogs([]);
      setTotalRecords(0);
      setTotalPages(1);

      // Suppress toast for plan restriction/403 errors
      if (
        err.response?.status === 403 ||
        (typeof errMsg === 'string' && (
          errMsg.toLowerCase().includes('not available on your plan') ||
          errMsg.toLowerCase().includes('forbidden') ||
          errMsg.includes('403')
        ))
      ) {
        return;
      }
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const getActionColor = (action: string) => {
    if (action.toLowerCase().includes('delete')) return "bg-red-100 text-red-800";
    if (action.toLowerCase().includes('create')) return "bg-green-100 text-green-800";
    if (action.toLowerCase().includes('update')) return "bg-blue-100 text-blue-800";
    if (action.toLowerCase().includes('rollback')) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  const formatTimestamp = (timestamp: string | object) => {
    try {
      if (typeof timestamp === 'object') {
        return JSON.stringify(timestamp);
      }
      return new Date(timestamp).toLocaleString();
    } catch {
      return typeof timestamp === 'string' ? timestamp : JSON.stringify(timestamp);
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
            {[...Array(4)].map((_, i) => (
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
        {/* Render the actual Audit Log tab UI, but locked out */}
        <div className="opacity-60 pointer-events-none select-none">
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
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email || 'Unknown User'}
                      </SelectItem>
                    ))}
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
                    <SelectItem value="rolled_back">Rolled Back</SelectItem>
                    <SelectItem value="protected">Protected</SelectItem>
                    <SelectItem value="exported">Exported</SelectItem>
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
                    {[...Array(3)].map((_, i) => (
                      <TableRow key={i} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm text-gray-600">
                          {new Date().toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">Sample User</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Created
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="link" className="p-0 text-blue-600">
                            Sample Workflow
                          </Button>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          Previous value
                        </TableCell>
                        <TableCell className="font-medium">New value</TableCell>
                        <TableCell className="font-mono text-sm text-gray-600">
                          192.168.1.1
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email || 'Unknown User'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
              <SelectItem value="rolled_back">Rolled Back</SelectItem>
              <SelectItem value="protected">Protected</SelectItem>
              <SelectItem value="exported">Exported</SelectItem>
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
            <>
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
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {typeof log.user === 'object' ? 
                          (log.user?.name || log.user?.email || 'Unknown User') : 
                          (log.user || 'Unknown User')
                        }
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getActionColor(log.action)}
                        >
                          {typeof log.action === 'object' ? 
                            JSON.stringify(log.action) : 
                            (log.action || 'Unknown')
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="link" className="p-0 text-blue-600">
                          {typeof log.workflowName === 'object' ? 
                            JSON.stringify(log.workflowName) : 
                            (log.workflowName || 'Unknown Workflow')
                          }
                        </Button>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {typeof log.oldValue === 'object' ? 
                          JSON.stringify(log.oldValue) : 
                          (log.oldValue || '-')
                        }
                      </TableCell>
                      <TableCell className="font-medium">
                        {typeof log.newValue === 'object' ? 
                          JSON.stringify(log.newValue) : 
                          (log.newValue || '-')
                        }
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-600">
                        {typeof log.ipAddress === 'object' ? 
                          JSON.stringify(log.ipAddress) : 
                          (log.ipAddress || '-')
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(parseInt(value))}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <span className="text-sm text-gray-600">per page</span>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
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
