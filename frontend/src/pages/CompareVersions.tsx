import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from "react";
import { useSearchParams, useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import { WorkflowComparison, ComparisonWorkflowVersion } from "@/components/WorkflowComparison";
import { useToast } from "@/hooks/use-toast";
import { ApiService } from "@/lib/api";
import {
  ArrowLeft,
  Plus,
  Minus,
  Mail,
  Clock,
  Calendar,
  RotateCcw,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  Download,
  Target,
  Search,
  ChevronDown,
  ChevronRight,
  Filter,
  Workflow,
  Settings,
  Users,
  Calendar as CalendarIcon,
  Edit,
  ArrowLeftRight,
  GitCompare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  TrendingUp,
  Activity,
  Layers,
  Share2,
  Bookmark,
  BookmarkCheck,
  Copy,
  ExternalLink,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  HelpCircle,
  Lightbulb,
  Timer,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  ZapOff,
  Star,
  StarOff
} from "lucide-react";

interface WorkflowVersion {
  id: string;
  versionNumber: string;
  dateTime: string;
  notes: string;
  name?: string;
  author?: string;
  changes: {
    added: number;
    modified: number;
    removed: number;
  };
  status: string;
  type?: string;
  date?: string;
  initiator?: string;
  steps?: any[];
}

interface WorkflowHistoryVersion extends WorkflowVersion {}

// HubSpot-style design system
const hubspotTheme = {
  colors: {
    primary: {
      50: '#FCE8E6',
      500: '#FF7A59',
      600: '#FF6B47',
      700: '#E85D3F'
    },
    success: {
      50: '#E8F5E8',
      500: '#2EA44F',
      600: '#2C974B'
    },
    warning: {
      50: '#FFF8E1',
      500: '#FFBA08',
      600: '#FF9F00'
    },
    danger: {
      50: '#F8D7DA',
      500: '#D73A49',
      600: '#CB2431'
    }
  }
};

// Enhanced comparison cache
const comparisonCache = new Map();

const CompareVersions = () => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [versionA, setVersionA] = useState(searchParams.get("versionA") || "");
  const [versionB, setVersionB] = useState(searchParams.get("versionB") || "");
  const [syncScroll, setSyncScroll] = useState(true);
  const [workflowDetails, setWorkflowDetails] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<{
    versionA: WorkflowVersion | null;
    versionB: WorkflowVersion | null;
    differences: {
      added: any[];
      modified: any[];
      removed: any[];
    };
    workflowMetadata?: {
      versionA: any;
      versionB: any;
      changes: any[];
    };
    stepComparison?: {
      steps: {
        versionA: any[];
        versionB: any[];
      };
      changes: any[];
      summary: {
        totalStepsA: number;
        totalStepsB: number;
        added: number;
        removed: number;
        modified: number;
      };
    };
  } | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // Advanced state management for 100% perfection
  const [isHubSpotContext, setIsHubSpotContext] = useState(false);
  const [showFloatingPanel, setShowFloatingPanel] = useState(true);
  const [comparisonHistory, setComparisonHistory] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [bookmarkedComparisons, setBookmarkedComparisons] = useState<Set<string>>(new Set());
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    apiCalls: 0,
    cacheHits: 0,
    memoryUsage: 0
  });
  const [showPerformanceStats, setShowPerformanceStats] = useState(false);
  const [realTimeSync, setRealTimeSync] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [personalizedTips, setPersonalizedTips] = useState<string[]>([]);

  // Performance optimization refs
  const cacheRef = useRef<Map<string, any>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  const renderStartTime = useRef<number>(0);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);

  // Enhanced URL state management
  useEffect(() => {
    if (workflowId) {
      // Allow both UUID and HubSpot ID formats for comparison
      fetchVersions();
    }
  }, [workflowId]);

  useEffect(() => {
    if (versionA && versionB && workflowId) {
      fetchComparisonData();
    }
  }, [versionA, versionB, workflowId]);

  // HubSpot context detection
  useEffect(() => {
    setIsHubSpotContext(window.self !== window.top);

    // Listen for HubSpot theme changes
    const handleThemeChange = (event: any) => {
      if (event.detail?.theme) {
        document.documentElement.setAttribute('data-theme', event.detail.theme);
      }
    };

    window.addEventListener('hubspot:theme-change', handleThemeChange);
    return () => window.removeEventListener('hubspot:theme-change', handleThemeChange);
  }, []);

  // Debounced search for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== "") {
        const params = new URLSearchParams();
        if (versionA) params.set('versionA', versionA);
        if (versionB) params.set('versionB', versionB);
        if (searchTerm) params.set('search', searchTerm);
        if (filterType !== 'all') params.set('filter', filterType);

        const newUrl = `${location.pathname}?${params.toString()}`;
        if (newUrl !== `${location.pathname}${location.search}`) {
          navigate(newUrl, { replace: true });
        }
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, filterType, versionA, versionB, location.pathname, location.search, navigate]);

  // Enhanced URL state synchronization for version changes (immediate)
  useEffect(() => {
    const params = new URLSearchParams();
    if (versionA) params.set('versionA', versionA);
    if (versionB) params.set('versionB', versionB);
    if (filterType !== 'all') params.set('filter', filterType);

    const newUrl = `${location.pathname}?${params.toString()}`;
    if (newUrl !== `${location.pathname}${location.search}`) {
      navigate(newUrl, { replace: true });
    }
  }, [versionA, versionB, filterType, location.pathname, location.search, navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'k': // Ctrl+K to go back to workflow history
            e.preventDefault();
            navigate(`/workflow-history/${workflowId}`);
            break;
          case 's': // Ctrl+S to swap versions
            e.preventDefault();
            if (versionA && versionB) {
              setVersionA(versionB);
              setVersionB(versionA);
              toast({
                title: "Versions Swapped",
                description: "Version A and Version B have been swapped",
              });
            }
            break;
          case 'r': // Ctrl+R to refresh
            e.preventDefault();
            handleRefresh();
            break;
          case 'f': // Ctrl+F to focus search
            e.preventDefault();
            const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
            searchInput?.focus();
            break;
        }
      }

      // Single key shortcuts
      switch (e.key) {
        case 'Escape':
          if (showFilters) setShowFilters(false);
          break;
        case 'F1':
          e.preventDefault();
          navigate('/help/feature-spotlights');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [versionA, versionB, workflowId, searchTerm, showFilters, navigate, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchVersions = async () => {
    if (!workflowId) return;

    try {
      setLoading(true);
      setError(null);

      const [workflowResponse, versionsResponse] = await Promise.all([
        ApiService.getWorkflowDetails(workflowId),
        ApiService.getWorkflowVersionsForComparison(workflowId),
      ]);

      // Add safety checks for responses
      if (!workflowResponse || !workflowResponse.data) {
        throw new Error("No workflow details received from server");
      }

      if (!versionsResponse || !versionsResponse.data || !Array.isArray(versionsResponse.data)) {
        throw new Error("No workflow versions received from server");
      }

      // Safely set workflow details
      const safeWorkflowDetails = {
        id: typeof workflowResponse.data.id === "string" ? workflowResponse.data.id : "",
        name: typeof workflowResponse.data.name === "string" ? workflowResponse.data.name : "Unknown Workflow",
        status: typeof workflowResponse.data.status === "string" ? workflowResponse.data.status : "unknown",
        lastModified: typeof workflowResponse.data.lastModified === "string" ? workflowResponse.data.lastModified : new Date().toISOString(),
        totalVersions: typeof workflowResponse.data.totalVersions === "number" ? workflowResponse.data.totalVersions : 0,
      };

      setWorkflowDetails(safeWorkflowDetails);

      // Safely filter and map versions
      const safeVersions = versionsResponse.data
        .filter((version: any) => version && typeof version === "object")
        .map((version: any) => ({
          id: typeof version.id === "string" ? version.id : "",
          versionNumber: typeof version.versionNumber === "string" ? version.versionNumber : "",
          dateTime: typeof version.dateTime === "string" ? version.dateTime : new Date().toISOString(),
          notes: typeof version.notes === "string" ? version.notes : "No notes available",
          changes: version.changes && typeof version.changes === "object" ? version.changes : null,
          status: typeof version.status === "string" ? version.status : "unknown",
        }));

      setVersions(safeVersions);

      // Set default versions if not already set
      if (safeVersions.length >= 2) {
        if (!versionA) setVersionA(safeVersions[0].id);
        if (!versionB) setVersionB(safeVersions[1].id);
      }
    } catch (err: any) {
      console.error("Failed to fetch versions:", err);
      setError(err.response?.data?.message || err.message || "Failed to load workflow versions. Please try again.");
      setVersions([]);
      toast({
        title: "Error",
        description: "Failed to load workflow versions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComparisonData = async () => {
    if (!workflowId || !versionA || !versionB) return;

    try {
      setLoading(true);
      const response = await ApiService.compareWorkflowVersions(workflowId, versionA, versionB);

      console.log("Comparison response:", response); // Debug log

      // Add safety checks for response
      if (!response || !response.data) {
        throw new Error("No comparison data received from server");
      }

      // Safely set comparison data with validation
      const safeComparisonData = {
        versionA: response.data.versionA && typeof response.data.versionA === "object" ? response.data.versionA : null,
        versionB: response.data.versionB && typeof response.data.versionB === "object" ? response.data.versionB : null,
        differences: response.data.differences && typeof response.data.differences === "object" ? {
          added: Array.isArray(response.data.differences.added) ? response.data.differences.added : [],
          modified: Array.isArray(response.data.differences.modified) ? response.data.differences.modified : [],
          removed: Array.isArray(response.data.differences.removed) ? response.data.differences.removed : [],
        } : {
          added: [],
          modified: [],
          removed: [],
        },
      };

      console.log("Safe comparison data:", safeComparisonData); // Debug log
      setComparisonData(safeComparisonData);
    } catch (err: any) {
      console.error("Failed to fetch comparison data:", err);
      setComparisonData(null);
      toast({
        title: "Comparison Failed",
        description: err.response?.data?.message || err.message || "Failed to compare workflow versions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchVersions();
  };

  // Enhanced component to display detailed action information
  const ActionDetails = ({ action }: { action: any }) => {
    if (!action || !action.details) return null;

    const details = action.details;

    return (
      <div className="mt-2 text-sm text-gray-600 border-t border-gray-100 pt-2">
        {details.type && (
          <div className="mb-1">
            <span className="font-medium text-blue-700">Type:</span> {details.type}
          </div>
        )}

        {details.type === 'DELAY' && details.delayMillis && (
          <div className="mb-1">
            <span className="font-medium text-purple-700">Duration:</span> {Math.round(details.delayMillis / 60000)} minutes
          </div>
        )}

        {details.type === 'EMAIL' && details.subject && (
          <div className="mb-1">
            <span className="font-medium text-blue-700">Subject:</span> {details.subject}
          </div>
        )}

        {details.type === 'SET_CONTACT_PROPERTY' && details.propertyName && (
          <div className="mb-1">
            <span className="font-medium text-green-700">Property:</span> {details.propertyName}
            {details.propertyValue && (
              <span className="text-gray-600"> = {String(details.propertyValue)}</span>
            )}
          </div>
        )}

        {details.type === 'WEBHOOK' && (
          <div className="mb-1">
            <span className="font-medium text-orange-700">Integration:</span> External webhook
          </div>
        )}

        {details.type === 'TASK' && details.subject && (
          <div className="mb-1">
            <span className="font-medium text-indigo-700">Task:</span> {details.subject}
          </div>
        )}

        {/* Display raw data for debugging if needed */}
        {details.rawAction && (
          <details className="mt-2">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
              Debug: Raw Action Data
            </summary>
            <pre className="text-xs bg-gray-50 p-2 mt-1 rounded overflow-auto max-h-32">
              {JSON.stringify(details.rawAction, null, 2)}
            </pre>
          </details>
        )}

        {/* Display error information if present */}
        {details.type === 'error' && details.errorMessage && (
          <div className="mb-1 text-red-600">
            <span className="font-medium">Error:</span> {details.errorMessage}
          </div>
        )}

        {/* Display unsupported workflow message */}
        {details.type === 'UNSUPPORTED_WORKFLOW' && (
          <div className="mb-1 text-amber-600">
            <span className="font-medium">Note:</span> This workflow type is not yet supported or data is unavailable
          </div>
        )}
      </div>
    );
  };

  // New component to display differences
  const DifferenceDetails = ({ differences }: { differences: any[] }) => {
    if (!differences || differences.length === 0) return null;
    
    return (
      <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
        <h4 className="font-medium text-yellow-800 mb-1">Changes:</h4>
        <ul className="list-disc list-inside text-sm">
          {differences.map((diff: any, idx: number) => (
            <li key={idx} className="text-yellow-700">
              {diff.property}: {JSON.stringify(diff.oldValue)} → {JSON.stringify(diff.newValue)}
            </li>
          ))}
        </ul>
      </div>
    );
  };


  const handleRestoreVersion = async (versionId: string, versionLabel: string) => {
    if (!workflowId) return;

    try {
      setRestoring(true);
      await ApiService.restoreWorkflowVersion(workflowId, versionId);

      toast({
        title: "Version Restored",
        description: `Successfully restored ${versionLabel}`,
      });

      // Navigate back to workflow history
      navigate(`/workflow-history/${workflowId}`);
    } catch (err: any) {
      console.error("Failed to restore version:", err);
      toast({
        title: "Restore Failed",
        description: err.response?.data?.message || "Failed to restore version. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRestoring(false);
    }
  };

  const handleDownloadVersion = async (versionId: string, versionLabel: string) => {
    if (!workflowId) return;

    try {
      const response = await ApiService.downloadWorkflowVersion(workflowId, versionId);

      // Add safety check for response.data
      if (!response || !response.data) {
        throw new Error("No data received from server");
      }

      // Create and download the file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const workflowName = workflowDetails?.name || "unknown-workflow";
      a.download = `workflow-${workflowName}-${versionLabel}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Complete",
        description: "Workflow version downloaded successfully.",
      });
    } catch (err: any) {
      console.error("Failed to download version:", err);
      toast({
        title: "Download Failed",
        description: err.response?.data?.message || err.message || "Failed to download workflow version. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBackToHistory = () => {
    navigate(`/workflow-history/${workflowId}`);
  };

  const getStepColor = (step: any) => {
    if (step?.isNew) return "bg-green-50 border-green-200";
    if (step?.isModified) return "bg-yellow-50 border-yellow-200";
    if (step?.isRemoved) return "bg-red-50 border-red-200";

    // Enhanced color coding for different action types
    switch (step?.type) {
      case "email":
        return "bg-blue-50 border-blue-200";
      case "delay":
        return "bg-purple-50 border-purple-200";
      case "meeting":
        return "bg-indigo-50 border-indigo-200";
      case "task":
        return "bg-teal-50 border-teal-200";
      case "webhook":
        return "bg-orange-50 border-orange-200";
      case "condition":
      case "trigger":
        return "bg-amber-50 border-amber-200";
      case "list":
        return "bg-cyan-50 border-cyan-200";
      case "goal":
        return "bg-pink-50 border-pink-200";
      case "workflow":
        return "bg-slate-50 border-slate-200";
      case "unsupported":
        return "bg-gray-50 border-gray-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  // Helper function to get detailed step information
  const getStepDetails = (step: any): string => {
    if (!step || !step.details) return '';

    // For triggers, show filter information
    if (step.type === 'trigger' && step.details.filters) {
      const filters = step.details.filters;
      if (filters.length > 0) {
        return filters.map((filter: any) => {
          if (filter.property && filter.operator && filter.value !== undefined) {
            return `${filter.property} ${filter.operator} ${filter.value}`;
          }
          return 'Custom filter';
        }).join(', ');
      }
    }

    // For actions, show relevant details
    if (step.details.type === 'EMAIL' && step.details.subject) {
      return step.details.subject;
    }

    if (step.details.type === 'SET_CONTACT_PROPERTY' && step.details.propertyName) {
      return `${step.details.propertyName}: ${step.details.propertyValue || ''}`;
    }

    if (step.details.type === 'DELAY' && step.details.delayMillis) {
      const minutes = Math.round(step.details.delayMillis / 60000);
      return `Wait ${minutes} minutes`;
    }

    // Fallback to description
    return step.description || '';
  };

  // Helper function to get step summary
  const getStepSummary = (step: any): string => {
    if (!step || !step.details) return '';

    // Return the summary from details if available
    if (step.details.summary) {
      return step.details.summary;
    }

    // Fallback to type
    if (step.details.type) {
      return step.details.type;
    }

    return '';
  };

  const getStepTextColor = (step: any) => {
    if (step?.isNew) return "text-green-800";
    if (step?.isModified) return "text-yellow-800";
    if (step?.isRemoved) return "text-red-800";

    // Enhanced text colors for different action types
    switch (step?.type) {
      case "email":
        return "text-blue-800";
      case "delay":
        return "text-purple-800";
      case "meeting":
        return "text-indigo-800";
      case "task":
        return "text-teal-800";
      case "webhook":
        return "text-orange-800";
      case "condition":
      case "trigger":
        return "text-amber-800";
      case "list":
        return "text-cyan-800";
      case "goal":
        return "text-pink-800";
      case "workflow":
        return "text-slate-800";
      case "unsupported":
        return "text-gray-600";
      case "error":
        return "text-red-800";
      default:
        return "text-gray-800";
    }
  };

  const getStepIcon = (step: any) => {
    switch (step?.type) {
      case "email":
        return Mail;
      case "delay":
        return Clock;
      case "meeting":
        return Calendar;
      case "task":
        return Target;
      case "webhook":
        return RotateCcw;
      case "condition":
      case "trigger":
        return AlertCircle;
      case "list":
        return Plus;
      case "goal":
        return Target;
      default:
        return Mail;
    }
  };

  // Enhanced utility functions for better performance and UX

  // Memoized comparison data calculation
  const comparisonKey = useMemo(() => {
    return `${versionA}-${versionB}-${workflowId}`;
  }, [versionA, versionB, workflowId]);

  // Cached comparison data
  const cachedComparison = useMemo(() => {
    return cacheRef.current.get(comparisonKey);
  }, [comparisonKey]);

  // Enhanced step highlighting with better visual indicators
  const getStepHighlightClass = useCallback((step: any) => {
    const baseClasses = "transition-all duration-200 rounded-md";

    if (step?.isNew) return `${baseClasses} ring-2 ring-green-300 bg-green-50 border-green-200`;
    if (step?.isModified) return `${baseClasses} ring-2 ring-yellow-300 bg-yellow-50 border-yellow-200`;
    if (step?.isRemoved) return `${baseClasses} opacity-60 bg-red-50 border-red-200`;

    return `${baseClasses} hover:bg-gray-50`;
  }, []);

  // HubSpot-style alert component
  const HubSpotAlert = useCallback(({ type, title, message }: {
    type: 'success' | 'warning' | 'error' | 'info',
    title: string,
    message: string
  }) => {
    const styles = {
      success: 'border-l-4 border-green-400 bg-green-50 text-green-800',
      warning: 'border-l-4 border-yellow-400 bg-yellow-50 text-yellow-800',
      error: 'border-l-4 border-red-400 bg-red-50 text-red-800',
      info: 'border-l-4 border-blue-400 bg-blue-50 text-blue-800'
    };

    const icons = {
      success: CheckCircle,
      warning: AlertTriangle,
      error: XCircle,
      info: AlertCircle
    };

    const Icon = icons[type];

    return (
      <div className={`p-4 rounded-md ${styles[type]}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`w-5 h-5 ${
              type === 'success' ? 'text-green-600' :
              type === 'warning' ? 'text-yellow-600' :
              type === 'error' ? 'text-red-600' : 'text-blue-600'
            }`} />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium">{title}</h3>
            <div className="mt-1 text-sm">{message}</div>
          </div>
        </div>
      </div>
    );
  }, []);

  // Enhanced diff indicator component
  const DiffIndicator = useCallback(({ type, size = "md" }: {
    type: 'added' | 'modified' | 'removed',
    size?: 'sm' | 'md' | 'lg'
  }) => {
    const indicators = {
      added: { icon: Plus, color: 'text-green-600', bg: 'bg-green-100', hoverBg: 'hover:bg-green-200' },
      modified: { icon: Edit, color: 'text-yellow-600', bg: 'bg-yellow-100', hoverBg: 'hover:bg-yellow-200' },
      removed: { icon: Minus, color: 'text-red-600', bg: 'bg-red-100', hoverBg: 'hover:bg-red-200' }
    };

    const indicator = indicators[type];
    const Icon = indicator.icon;

    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className={`inline-flex items-center justify-center rounded-full ${indicator.bg} ${indicator.hoverBg} transition-colors cursor-help ${sizeClasses[size]}`}>
        <Icon className={`w-3 h-3 ${indicator.color}`} />
      </div>
    );
  }, []);

  // Floating action panel component
  const FloatingActionPanel = useCallback(() => (
    <div className="fixed bottom-6 right-6 bg-white border border-gray-200 rounded-lg shadow-lg p-3 space-y-2 z-50">
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          if (versionA && versionB) {
            setVersionA(versionB);
            setVersionB(versionA);
            toast({
              title: "Versions Swapped",
              description: "Version A and Version B have been swapped",
            });
          }
        }}
        className="w-full justify-start"
      >
        <ArrowLeftRight className="w-4 h-4 mr-2" />
        Swap Versions
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleRefresh}
        disabled={loading}
        className="w-full justify-start"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleDownloadVersion(versionA || '', "Version-A")}
        className="w-full justify-start"
      >
        <Download className="w-4 h-4 mr-2" />
        Export A
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleDownloadVersion(versionB || '', "Version-B")}
        className="w-full justify-start"
      >
        <Download className="w-4 h-4 mr-2" />
        Export B
      </Button>
    </div>
  ), [versionA, versionB, loading, toast]);

  // Performance optimized comparison data transformation
  const transformComparisonDataForUI = useCallback((): { versionA: ComparisonWorkflowVersion; versionB: ComparisonWorkflowVersion } | null => {
    if (!comparisonData) return null;

    const versionAData = comparisonData.versionA;
    const versionBData = comparisonData.versionB;

    if (!versionAData || !versionBData) return null;

    // Transform version A data
    const transformedVersionA: ComparisonWorkflowVersion = {
      id: versionAData.id || 'version-a',
      name: `Version ${versionAData.versionNumber || 'A'}`,
      date: versionAData.dateTime ?
        new Date(versionAData.dateTime).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Unknown Date',
      author: versionAData.author || 'User',
      steps: (versionAData.steps || []).map((step: any) => ({
        type: mapStepTypeToIcon(step.type) as any,
        title: String(step.title || 'Unknown Step'),
        status: getChangeTypeForStep(step) as any,
        details: getStepDetails(step),
        summary: getStepSummary(step),
        highlightClass: getStepHighlightClass(step),
        diffIndicator: step.isNew ? 'added' : step.isModified ? 'modified' : step.isRemoved ? 'removed' : null
      }))
    };

    // Transform version B data
    const transformedVersionB: ComparisonWorkflowVersion = {
      id: versionBData.id || 'version-b',
      name: `Version ${versionBData.versionNumber || 'B'}`,
      date: versionBData.dateTime ?
        new Date(versionBData.dateTime).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Unknown Date',
      author: versionBData.author || 'User',
      steps: (versionBData.steps || []).map((step: any) => ({
        type: mapStepTypeToIcon(step.type) as any,
        title: String(step.title || 'Unknown Step'),
        status: getChangeTypeForStep(step) as any,
        details: getStepDetails(step),
        summary: getStepSummary(step),
        highlightClass: getStepHighlightClass(step),
        diffIndicator: step.isNew ? 'added' : step.isModified ? 'modified' : step.isRemoved ? 'removed' : null
      }))
    };

    return {
      versionA: transformedVersionA,
      versionB: transformedVersionB,
    };
  }, [comparisonData, getStepHighlightClass]);

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  // Memoized filtered steps for better performance
  const filteredSteps = useMemo(() => {
    if (!comparisonData) return [];

    const allSteps = [
      ...(comparisonData.versionA?.steps || []).map(step => ({ ...step, source: 'A' })),
      ...(comparisonData.versionB?.steps || []).map(step => ({ ...step, source: 'B' }))
    ];

    let filtered = allSteps;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(step =>
        step.title?.toLowerCase().includes(searchLower) ||
        step.description?.toLowerCase().includes(searchLower) ||
        step.type?.toLowerCase().includes(searchLower) ||
        step.details?.summary?.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(step => step.type === filterType);
    }

    return filtered;
  }, [comparisonData, searchTerm, filterType]);

  const getChangeTypeForStep = (step: any) => {
    if (step.isNew) return 'added';
    if (step.isModified) return 'modified';
    if (step.isRemoved) return 'removed';
    return 'unchanged';
  };

  // Enhanced transformComparisonDataForUI moved to useCallback version above

  const mapStepTypeToIcon = (stepType: string): "email" | "delay" | "notification" | "schedule" | "complete" | "assign" | "trigger" | "webhook" | "condition" | "task" | "list" | "goal" => {
    switch (stepType?.toLowerCase()) {
      case 'email':
        return 'email';
      case 'delay':
        return 'delay';
      case 'webhook':
        return 'webhook';
      case 'condition':
      case 'trigger':
        return 'trigger';
      case 'task':
        return 'task';
      case 'list':
        return 'list';
      case 'goal':
        return 'goal';
      case 'meeting':
      case 'schedule':
        return 'schedule';
      case 'notification':
        return 'notification';
      case 'complete':
        return 'complete';
      case 'assign':
        return 'assign';
      default:
        return 'email';
    }
  };

  if (loading && !comparisonData) {
    return (
      <MainAppLayout title="Compare Workflow Versions">
        <ContentSection>
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </ContentSection>
        <ContentSection>
          <div className="grid grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={j} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ContentSection>
      </MainAppLayout>
    );
  }

  if (error) {
    return (
      <MainAppLayout title="Compare Workflow Versions">
        <ContentSection>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="ml-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </ContentSection>
      </MainAppLayout>
    );
  }

  const versionAData = versions.find((v) => v.id === versionA);
  const versionBData = versions.find((v) => v.id === versionB);

  const headerActions = (
    <div className="flex items-center gap-2">
      {/* Keyboard shortcuts hint */}
      <div className="hidden md:flex items-center gap-1 text-xs text-gray-500 mr-2">
        <Badge variant="secondary" className="text-xs">
          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+K</kbd> Back
        </Badge>
        <Badge variant="secondary" className="text-xs">
          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+S</kbd> Swap
        </Badge>
        <Badge variant="secondary" className="text-xs">
          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+F</kbd> Search
        </Badge>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search steps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "bg-orange-50 border-orange-200 text-orange-700" : ""}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {showFilters && <ChevronDown className="w-4 h-4 ml-1" />}
        </Button>

        {showFilters && (
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="delay">Delay</SelectItem>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="webhook">Webhook</SelectItem>
              <SelectItem value="trigger">Trigger</SelectItem>
              <SelectItem value="condition">Condition</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="border-l border-gray-300 h-6 mx-2"></div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (versionA && versionB) {
              setVersionA(versionB);
              setVersionB(versionA);
              toast({
                title: "Versions Swapped",
                description: "Version A and Version B have been swapped",
              });
            }
          }}
          disabled={!versionA || !versionB}
          className="text-orange-600 border-orange-200 hover:bg-orange-50"
        >
          <ArrowLeftRight className="w-4 h-4 mr-2" />
          Swap
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>

        {/* HubSpot-style primary action */}
        <Button
          size="sm"
          className={`bg-orange-500 hover:bg-orange-600 text-white border-orange-500 ${isHubSpotContext ? 'shadow-lg' : ''}`}
          onClick={() => {
            // Export comparison report
            toast({
              title: "Feature Coming Soon",
              description: "Comparison report export will be available soon",
            });
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>
    </div>
  );

  return (
    <MainAppLayout
      title={`Compare Workflow Versions: ${workflowDetails?.name || "Workflow"}`}
      description={workflowDetails?.lastModified ? `Last modified: ${new Date(workflowDetails.lastModified).toLocaleString()}` : undefined}
      headerActions={headerActions}
    >
      {/* Breadcrumb */}
      <ContentSection spacing="tight">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToHistory}
            className="p-0 h-auto text-gray-600 hover:text-gray-900"
          >
            Workflow History
          </Button>
          <span>&gt;</span>
          <span className="text-gray-900 font-medium">Compare Versions</span>
        </nav>
      </ContentSection>

      {/* Action Buttons */}
      <ContentSection>
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={handleBackToHistory}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Version History
          </Button>
          {comparisonData && (
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                className="text-blue-600"
                onClick={() => handleDownloadVersion(versionA, "Version-A")}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Version A
              </Button>
              <Button 
                variant="outline" 
                className="text-blue-600"
                onClick={() => handleDownloadVersion(versionB, "Version-B")}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Version B
              </Button>
            </div>
          )}
        </div>
      </ContentSection>


      {/* Enhanced Comparison Interface with HubSpot-style alerts */}
      <ContentSection>
        {/* HubSpot-style status alerts */}
        {comparisonData?.differences && (
          <div className="mb-6 space-y-3">
            {comparisonData.differences.added.length > 0 && (
              <HubSpotAlert
                type="success"
                title={`${comparisonData.differences.added.length} Steps Added`}
                message={`Found ${comparisonData.differences.added.length} new steps in Version ${versionBData?.versionNumber || 'B'}`}
              />
            )}
            {comparisonData.differences.modified.length > 0 && (
              <HubSpotAlert
                type="warning"
                title={`${comparisonData.differences.modified.length} Steps Modified`}
                message={`Found ${comparisonData.differences.modified.length} modified steps between versions`}
              />
            )}
            {comparisonData.differences.removed.length > 0 && (
              <HubSpotAlert
                type="error"
                title={`${comparisonData.differences.removed.length} Steps Removed`}
                message={`Found ${comparisonData.differences.removed.length} removed steps from Version ${versionAData?.versionNumber || 'A'}`}
              />
            )}
          </div>
        )}

        {/* Main comparison interface */}
        {comparisonData && transformComparisonDataForUI() ? (
          <div className="relative">
            <WorkflowComparison
              versionA={transformComparisonDataForUI()!.versionA}
              versionB={transformComparisonDataForUI()!.versionB}
            />

            {/* Floating action panel */}
            {showFloatingPanel && (
              <div className="fixed bottom-6 right-6 z-50">
                <FloatingActionPanel />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GitCompare className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Compare Versions
              </h3>
              <p className="text-gray-600 mb-4">
                Select two different versions above to see a detailed comparison of changes, additions, and modifications.
              </p>

              {/* Quick tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Tips
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">Ctrl+K</kbd> to return to workflow history</li>
                  <li>• Use <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">Ctrl+S</kbd> to quickly swap versions</li>
                  <li>• Use <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">Ctrl+F</kbd> to focus the search box</li>
                  <li>• Green highlights show new additions, yellow shows modifications</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </ContentSection>

      {/* HubSpot-style footer with help */}
      <ContentSection spacing="tight">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-gray-600">
              <span>💡 Need help with version comparison?</span>
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate('/help/feature-spotlights')}
                className="text-orange-600 hover:text-orange-700 p-0"
              >
                View Feature Guide
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {isHubSpotContext ? 'HubSpot Mode' : 'Standalone Mode'}
              </Badge>
              <span className="text-gray-500">
                {comparisonData ? `${(comparisonData.differences?.added?.length || 0) + (comparisonData.differences?.modified?.length || 0) + (comparisonData.differences?.removed?.length || 0)} changes detected` : 'No comparison active'}
              </span>
            </div>
          </div>
        </div>
      </ContentSection>
    </MainAppLayout>
  );
};

export default CompareVersions;
