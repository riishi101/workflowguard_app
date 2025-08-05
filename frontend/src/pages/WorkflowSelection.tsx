import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ContentPageHeader from "@/components/ContentPageHeader";
import Footer from "@/components/Footer";
import { WorkflowState } from "@/lib/workflowState";
import { ApiService } from "@/lib/api";
import { 
  Search, 
  Info, 
  AlertTriangle, 
  Shield, 
  RotateCcw, 
  FileText,
  CheckCircle,
  Loader2,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc
} from "lucide-react";

interface WorkflowSelectionProps {
  onComplete?: () => void;
}

interface HubSpotWorkflow {
  id: string;
  name: string;
  folder: string;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  lastModified: string;
  steps: number;
  contacts: number;
  isProtected?: boolean;
}

const WorkflowSelection = ({ onComplete }: WorkflowSelectionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [workflows, setWorkflows] = useState<HubSpotWorkflow[]>([]);
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [folderFilter, setFolderFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [workflowsFetched, setWorkflowsFetched] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const maxRetries = 10; // Increased from 3 to 10

  // Fetch workflows from HubSpot
  const fetchWorkflows = async () => {
    // Check if user is authenticated before making API call
    if (!isAuthenticated) {
      console.log('WorkflowSelection - User not authenticated, skipping workflow fetch');
      setError('Please connect your HubSpot account first to view workflows.');
      setWorkflows([]);
      setLoading(false);
      return;
    }

    // Debug authentication status
    console.log('WorkflowSelection - Authentication check:', {
      isAuthenticated,
      authLoading,
      user: user ? { id: user.id, email: user.email } : null,
      token: localStorage.getItem('authToken') ? 'exists' : 'missing'
    });

    // Ensure minimum loading time to prevent too quick completion
    const minLoadingTime = 2000; // 2 seconds minimum
    const startTime = Date.now();

    try {
      setLoading(true);
      setError(null);
      
      console.log('WorkflowSelection - Starting to fetch workflows from HubSpot');
      
      // Try to get real data from HubSpot API
      console.log('WorkflowSelection - Making API call to fetch workflows...');
      const apiStartTime = Date.now();
      
      const response = await ApiService.getHubSpotWorkflows();
      
      const apiEndTime = Date.now();
      console.log(`WorkflowSelection - API call completed in ${apiEndTime - apiStartTime}ms`);
      console.log('WorkflowSelection - HubSpot API response:', response);
      console.log('WorkflowSelection - Response type:', typeof response);
      console.log('WorkflowSelection - Response structure:', {
        success: response.success,
        hasData: !!response.data,
        dataType: typeof response.data,
        isDataArray: Array.isArray(response.data),
        dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
      });
      
      // Validate the response structure
      if (!response || !response.success) {
        throw new Error(response?.message || 'Invalid response structure from HubSpot API');
      }
      
      // Extract workflows from the response data
      const workflows = response.data || [];
      console.log('WorkflowSelection - Extracted workflows:', workflows.length);
      
      if (workflows.length > 0) {
        console.log('WorkflowSelection - Found workflows:', workflows.length);
        console.log('WorkflowSelection - Sample workflow:', workflows[0]);
        
        // Validate workflow structure
        const validWorkflows = workflows.filter(workflow => 
          workflow && workflow.id && workflow.name
        );
        
        if (validWorkflows.length === 0) {
          throw new Error('No valid workflows found in response');
        }
        
        setWorkflows(validWorkflows);
        setWorkflowsFetched(true);
        toast({
          title: "Connected to HubSpot",
          description: `Found ${validWorkflows.length} workflows in your account.`,
        });
      } else {
        // No workflows found in HubSpot
        console.log('WorkflowSelection - No workflows found in HubSpot');
        setWorkflows([]);
        toast({
          title: "No Workflows Found",
          description: response.message || "No active workflows found in your HubSpot account. Please create workflows in HubSpot and try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('WorkflowSelection - Failed to fetch workflows:', err);
      console.error('WorkflowSelection - Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        code: err.code
      });
      
      // Check if it's a network error vs API error
      const isNetworkError = err.message?.includes('Network Error') || err.code === 'NETWORK_ERROR';
      const isTimeoutError = err.code === 'ECONNABORTED';
      
      if (isTimeoutError) {
        setError('Request timed out. The server is taking too long to respond. Please try again.');
      } else if (isNetworkError) {
        setError('Unable to connect to HubSpot. Please check your internet connection and try again.');
      } else if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.message || err.response?.data;
        if (errorMessage && (errorMessage.includes('HubSpot not connected') || 
                            errorMessage.includes('HubSpot account not connected') ||
                            errorMessage.includes('Please connect your HubSpot account'))) {
          setError('Your HubSpot account is not connected. Please connect your HubSpot account to view workflows.');
          // Stop retrying for connection issues
          setRetryCount(maxRetries);
        } else if (errorMessage && errorMessage.includes('token expired')) {
          setError('Your HubSpot connection has expired. Please reconnect your HubSpot account to view workflows.');
          // Stop retrying for connection issues
          setRetryCount(maxRetries);
        } else {
          setError('Invalid request. Please check your HubSpot connection and try again.');
        }
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please reconnect your HubSpot account.');
      } else {
        setError('Failed to load workflows from HubSpot. This might be a temporary issue.');
      }
      
      // Set empty workflows array instead of demo data
      setWorkflows([]);
      
      // Mark as fetched even on error so user can see the screen
      setWorkflowsFetched(true);
    } finally {
      // Ensure minimum loading time
      const totalTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - totalTime);
      
      if (remainingTime > 0) {
        console.log(`WorkflowSelection - Waiting ${remainingTime}ms to ensure minimum loading time`);
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      setLoading(false);
    }
  };

  const refreshWorkflows = async () => {
    if (retryCount >= maxRetries) {
      setError('Maximum retry attempts reached. Please reconnect your HubSpot account.');
      return;
    }
    
    try {
      setRefreshing(true);
      setError(null);
      setRetryCount(prev => prev + 1);
      await fetchWorkflows();
    } catch (error) {
      console.error('Failed to refresh workflows:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Only fetch workflows if user is authenticated and auth loading is complete
    if (!authLoading) {
      setRetryCount(0); // Reset retry count on new auth state
      fetchWorkflows();
      
      // Fallback: if workflows don't load within 10 seconds, show the screen anyway
      const fallbackTimer = setTimeout(() => {
        if (!workflowsFetched) {
          console.log('WorkflowSelection - Fallback: showing screen after 10 seconds');
          setWorkflowsFetched(true);
        }
      }, 10000);
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [isAuthenticated, authLoading]);

  // Auto-retry with exponential backoff
  useEffect(() => {
    if (error && retryCount < maxRetries && !loading) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
      console.log(`WorkflowSelection - Auto-retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        fetchWorkflows();
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, loading]);

  const handleWorkflowToggle = (workflowId: string) => {
    setSelectedWorkflows((prev) =>
      prev.includes(workflowId)
        ? prev.filter((id) => id !== workflowId)
        : [...prev, workflowId],
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedWorkflows([]);
      setSelectAll(false);
    } else {
      const activeWorkflowIds = filteredWorkflows
        .filter(w => w.status === "ACTIVE" && !w.isProtected)
        .map(w => w.id);
      setSelectedWorkflows(activeWorkflowIds);
      setSelectAll(true);
    }
  };

  const handleStartProtecting = async () => {
    if (isNavigating) {
      return; // Prevent multiple clicks
    }
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please connect your HubSpot account first to start protecting workflows.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Set navigation state to prevent multiple clicks
      setIsNavigating(true);
      
      // Show loading state
      toast({
        title: "Setting up protection...",
        description: "Configuring WorkflowGuard for your selected workflows.",
      });

      console.log('WorkflowSelection - Starting protection for workflows:', selectedWorkflows);
      console.log('WorkflowSelection - Authentication state:', { isAuthenticated, user });
      console.log('🔍 DEBUG: WorkflowSelection handleStartProtecting called');
      console.log('🔍 DEBUG: User object:', user);
      console.log('🔍 DEBUG: User ID:', user?.id);
      console.log('WorkflowSelection - User object details:', {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        hasId: !!user?.id
      });

      // Check if we have a valid token
      const token = localStorage.getItem('authToken');
      console.log('WorkflowSelection - Auth token exists:', !!token);

      // Call API to start protection
      const selectedWorkflowObjects = workflows.filter(workflow => 
        selectedWorkflows.includes(workflow.id)
      );
      
      const requestBody = {
        workflowIds: selectedWorkflows,
        workflows: selectedWorkflowObjects, // Include full workflow objects with names
        userId: user?.id // Include user ID if available
      };
      
      console.log('WorkflowSelection - API request body:', requestBody);
      console.log('WorkflowSelection - User ID being sent:', user?.id);
      console.log('WorkflowSelection - Selected workflows count:', selectedWorkflows.length);
      
      const response = await ApiService.startWorkflowProtection(selectedWorkflows, user?.id, selectedWorkflowObjects);
      
      console.log('WorkflowSelection - Protection API response:', response);
      
      // Set workflow selection state
      WorkflowState.setWorkflowSelection(true);
      WorkflowState.setSelectedCount(selectedWorkflows.length);
      
      // Add a longer delay to ensure dashboard has time to load properly
      await new Promise(resolve => setTimeout(resolve, 2000)); // Increased from 500ms to 2000ms
      
      // Always navigate directly to dashboard instead of calling onComplete
      console.log('WorkflowSelection - Navigating directly to dashboard after 2 second delay');
      navigate("/dashboard");
      
      // Show success toast after navigation
      toast({
        title: "Protection Activated!",
        description: response.data?.message || `${selectedWorkflows.length} workflows are now being monitored.`,
      });
      
    } catch (error: any) {
      console.error('WorkflowSelection - Failed to start protection:', error);
      console.error('WorkflowSelection - Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        statusText: error.response?.statusText
      });
      
      // Reset navigation state on error
      setIsNavigating(false);
      
      let errorMessage = "Failed to start protection. Please try again.";
      
      if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please reconnect your HubSpot account.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || "Invalid request. Please check your selection.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message?.includes('Network Error')) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast({
        title: "Setup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSkipForNow = () => {
    if (isNavigating) {
      return; // Prevent multiple clicks
    }
    
    setIsNavigating(true);
    
    WorkflowState.setWorkflowSelection(false);
    WorkflowState.setSelectedCount(0);
    
    toast({
      title: "Setup Skipped",
      description: "You can configure workflow protection later in settings.",
    });
    
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        navigate("/dashboard");
      }
    }, 100);
  };

  const handleViewProtectedWorkflows = () => {
    navigate("/dashboard");
  };

  // Filter and sort workflows
  const filteredWorkflows = workflows
    .filter((workflow) => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || workflow.status === statusFilter;
      const matchesFolder = folderFilter === "all" || workflow.folder === folderFilter;
      return matchesSearch && matchesStatus && matchesFolder;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "folder":
          comparison = a.folder.localeCompare(b.folder);
          break;
        case "lastModified":
          comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "INACTIVE":
      case "DRAFT":
        return "secondary";
      default:
        return "secondary";
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <ContentPageHeader />
        <main className="max-w-6xl mx-auto px-6 py-8 flex-1">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <Skeleton className="h-4 w-full" />
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-10 w-64" />
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-40" />
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ContentPageHeader />

      <main className="max-w-6xl mx-auto px-6 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Select Workflows to Protect
          </h1>
          <p className="text-gray-600 text-sm">
            Great! Your HubSpot account is connected. Choose the workflows you
            want WorkflowGuard to monitor and protect.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                Protection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {selectedWorkflows.length}
              </p>
              <p className="text-xs text-gray-600">workflows selected</p>
              <p className="text-xs text-green-600 mt-1">
                {workflows.filter(w => w.isProtected).length} already protected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-green-500" />
                Auto Recovery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                90 days
              </p>
              <p className="text-xs text-gray-600">version history</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                Trial Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600">
                Professional
              </p>
              <p className="text-xs text-gray-600">up to 500 workflows</p>
            </CardContent>
          </Card>
        </div>

        {/* Alert Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-900 font-medium mb-1">
                Professional Trial Active
              </p>
              <p className="text-sm text-blue-800">
                Your trial includes Professional Plan features, allowing you to
                monitor up to 500 workflows and retain 90 days of history. Get
                started by selecting your critical workflows below.
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="space-y-2">
                <p>{error}</p>
                {isAuthenticated && (
                  <div className="flex items-center gap-3 pt-2">
                    {error.includes('HubSpot connection has expired') || error.includes('HubSpot connection required') ? (
                      <>
                        <Button 
                          variant="default" 
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            // Clear current authentication and force fresh OAuth
                            localStorage.removeItem('authToken');
                            localStorage.removeItem('user');
                            // Force the connect step by adding a query parameter
                            window.location.href = '/?force_connect=true';
                          }}
                        >
                          🔗 Reconnect HubSpot Account
                        </Button>
                        <span className="text-sm text-red-700">
                          This will take you to the main page to reconnect your HubSpot account
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            // Force complete fresh start
                            localStorage.clear();
                            sessionStorage.clear();
                            
                            // Direct OAuth redirect
                            const clientId = '6be1632d-8007-45e4-aecb-6ec93e6ff528';
                            const redirectUri = 'https://api.workflowguard.pro/api/auth/hubspot/callback';
                            const scopes = 'crm.schemas.deals.read automation oauth crm.objects.companies.read crm.objects.deals.read crm.schemas.contacts.read crm.objects.contacts.read crm.schemas.companies.read';
                            
                            const authUrl = `https://app-na2.hubspot.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
                            window.location.href = authUrl;
                          }}
                        >
                          🔗 Force Fresh OAuth
                        </Button>
                                    <Button 
              variant="destructive" 
              size="sm"
              className="mt-2"
              onClick={() => {
                // Nuclear option - complete reset
                localStorage.clear();
                sessionStorage.clear();
                
                // Clear all cookies
                document.cookie.split(";").forEach(function(c) { 
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                });
                
                // Force hard reload to main page
                window.location.href = 'https://www.workflowguard.pro?reset=true';
              }}
            >
              🚨 Nuclear Reset
            </Button>
            
            {/* 
              DEBUG BUTTONS - TO BE REMOVED AFTER WORKFLOW FETCHING IS FIXED
              
              These buttons are temporary debugging tools to help diagnose HubSpot connection issues.
              Once workflow fetching is working reliably, these should be removed to clean up the UI.
              
              Buttons to remove:
              - Stop Retrying
              - Fix Portal ID  
              - Test Connection
              - Nuclear Reset
              
              Keep only:
              - Reconnect HubSpot Account (if needed)
              - Skip for now
              - Start Protecting Workflows
            */}
            {process.env.NODE_ENV === 'development' && !workflowsFetched && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2 ml-2"
                  onClick={() => {
                    // Stop retrying
                    setRetryCount(maxRetries);
                    setError('Retry stopped by user. Please reconnect your HubSpot account.');
                  }}
                >
                  ⏹️ Stop Retrying
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2 ml-2"
                  onClick={async () => {
                    try {
                      console.log('WorkflowSelection - Manually updating portal ID');
                      await ApiService.updateHubSpotPortalId();
                      toast({
                        title: "Portal ID Updated",
                        description: "HubSpot portal ID has been updated. Please try fetching workflows again.",
                      });
                      // Retry fetching workflows
                      setRetryCount(0);
                      fetchWorkflows();
                    } catch (error) {
                      console.error('Failed to update portal ID:', error);
                      toast({
                        title: "Update Failed",
                        description: "Failed to update portal ID. Please reconnect your HubSpot account.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  🔧 Fix Portal ID
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2 ml-2"
                  onClick={async () => {
                    try {
                      console.log('WorkflowSelection - Testing HubSpot connection');
                      const result = await ApiService.testHubSpotConnection();
                      console.log('WorkflowSelection - Connection test result:', result);
                      toast({
                        title: "Connection Test",
                        description: result.data.success ? 
                          `HubSpot connection working! Found ${result.data.workflowCount} workflows.` : 
                          `Connection failed: ${result.data.error}`,
                        variant: result.data.success ? "default" : "destructive",
                      });
                    } catch (error) {
                      console.error('Failed to test connection:', error);
                      toast({
                        title: "Test Failed",
                        description: "Failed to test HubSpot connection.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  🧪 Test Connection
                </Button>
              </>
            )}
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={refreshWorkflows}
                          disabled={refreshing}
                        >
                          {refreshing ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                          )}
                          Try Again
                        </Button>
                        <span className="text-sm text-red-700">
                          If the problem persists, try reconnecting your HubSpot account
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Authentication Required Alert */}
        {!isAuthenticated && !loading && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Please connect your HubSpot account to view and select workflows for protection.
              <Button 
                variant="link" 
                className="p-0 h-auto text-blue-800 underline ml-2"
                onClick={() => window.location.href = '/'}
              >
                Connect HubSpot
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white border border-gray-200 rounded-lg">
          {/* Header with filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search workflows by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={!isAuthenticated}
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshWorkflows}
                  disabled={refreshing || !isAuthenticated}
                >
                  {refreshing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter} disabled={!isAuthenticated}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={folderFilter} onValueChange={setFolderFilter} disabled={!isAuthenticated}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Folders</SelectItem>
                    <SelectItem value="Sales Automation">Sales Automation</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Customer Success">Customer Success</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy} disabled={!isAuthenticated}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="folder">Folder</SelectItem>
                    <SelectItem value="lastModified">Last Modified</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  disabled={!isAuthenticated}
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                  disabled={filteredWorkflows.filter(w => w.status === "ACTIVE" && !w.isProtected).length === 0 || !isAuthenticated}
                />
                <span className="text-sm text-gray-600">
                  Select all active workflows
                </span>
              </div>
            </div>
          </div>

          {/* Workflows Table */}
          <div className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-4 py-3"></th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    Workflow Name
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    HubSpot Folder
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    Steps
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    Contacts
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                    Last Modified
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredWorkflows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      {searchTerm || statusFilter !== "all" || folderFilter !== "all" ? (
                        <div className="text-gray-500">
                          No workflows match your filters. Try adjusting your search criteria.
                        </div>
                      ) : error && (error.includes('HubSpot connection') || error.includes('connection required')) ? (
                        <div className="space-y-4">
                          <div className="text-gray-600 mb-4">
                            <p className="text-lg font-medium mb-2">🔗 HubSpot Connection Required</p>
                            <p className="text-sm">We need to reconnect to your HubSpot account to view your workflows.</p>
                          </div>
                          <Button 
                            variant="default" 
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => window.location.href = '/'}
                          >
                            🔗 Reconnect HubSpot Account
                          </Button>
                          <p className="text-xs text-gray-500 mt-2">
                            This will take you to the main page to reconnect your HubSpot account
                          </p>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          No workflows found in your HubSpot account.
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredWorkflows.map((workflow) => (
                    <tr key={workflow.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedWorkflows.includes(workflow.id)}
                          onCheckedChange={() => handleWorkflowToggle(workflow.id)}
                          disabled={workflow.status === "DRAFT" || workflow.isProtected || !isAuthenticated}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {workflow.name}
                          </span>
                          {workflow.isProtected && (
                            <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Protected
                              </Badge>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {workflow.folder}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={getStatusVariant(workflow.status)}
                          className={getStatusColor(workflow.status)}
                        >
                          {workflow.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {workflow.steps} steps
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {(workflow.contacts || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {workflow.lastModified}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer with actions */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                Selected {selectedWorkflows.length} of {filteredWorkflows.length} workflows
              </p>
              <p className="text-sm text-gray-500">
                • {500 - selectedWorkflows.length} remaining in your trial
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => window.location.href = '/'} 
                    variant="default" 
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    🔗 Connect HubSpot First
                  </Button>
                  <Button onClick={handleSkipForNow} variant="outline" size="sm">
                    Skip for now
                  </Button>
                </div>
              ) : (
                <>
                  {workflows.filter(w => w.isProtected).length > 0 && (
                    <Button onClick={handleViewProtectedWorkflows} variant="outline" size="sm">
                      View Protected Workflows
                    </Button>
                  )}
                  <Button onClick={handleSkipForNow} variant="outline" size="sm">
                    Skip for now
                  </Button>
                  <Button
                    onClick={handleStartProtecting}
                    disabled={selectedWorkflows.length === 0 || isNavigating}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    size="sm"
                  >
                    {isNavigating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Setting up protection...
                      </>
                    ) : (
                      "Start Protecting Workflows"
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WorkflowSelection;
