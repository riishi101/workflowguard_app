import { Mail, Clock, Bell, Calendar, CheckCircle, Users, Zap, RotateCcw, AlertCircle, Target, Plus, ChevronDown, ChevronUp, Eye, EyeOff, Search, Copy, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

interface WorkflowStepProps {
  type: "email" | "delay" | "notification" | "schedule" | "complete" | "assign" | "trigger" | "webhook" | "condition" | "task" | "list" | "goal";
  title: string;
  status: "unchanged" | "modified" | "added" | "removed";
  details?: string | any;
  summary?: string;
  className?: string;
  properties?: Record<string, any>; // Detailed step properties
  oldProperties?: Record<string, any>; // Previous version properties for comparison
  changedProperties?: Record<string, any>; // Properties that have changed between versions
  showDetailedDiff?: boolean; // Whether to show detailed property differences
  onToggleDetails?: (stepId: string, showDetails: boolean) => void; // Callback for detail toggle state
  stepId?: string; // Unique identifier for the step
}

const stepIcons = {
  email: Mail,
  delay: Clock,
  notification: Bell,
  schedule: Calendar,
  complete: CheckCircle,
  assign: Users,
  trigger: Zap,
  webhook: RotateCcw,
  condition: AlertCircle,
  task: Target,
  list: Plus,
  goal: Target,
};

const stepColors = {
  unchanged: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    icon: "text-green-600",
  },
  modified: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
    icon: "text-yellow-600",
  },
  added: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    icon: "text-blue-600",
  },
  removed: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    icon: "text-red-600",
  },
};

export function WorkflowStep({
  type,
  title,
  status,
  details,
  summary,
  className,
  properties,
  oldProperties,
  changedProperties = {},
  showDetailedDiff = false,
  onToggleDetails,
  stepId
}: WorkflowStepProps) {
  const Icon = stepIcons[type] || Mail;
  const colors = stepColors[status] || stepColors.unchanged;
  const [expanded, setExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'changed' | 'added' | 'removed'>('all');

  // Enhanced function to render property differences with recursive comparison
  const renderPropertyDiff = (key: string, newValue: any, oldValue: any, depth = 0) => {
    const isChanged = JSON.stringify(newValue) !== JSON.stringify(oldValue);
    const indent = depth * 16; // 16px per depth level

    // Format value based on type
    const formatValue = (value: any, isOld = false) => {
      if (value === null || value === undefined) {
        return <span className="text-gray-400 italic">null</span>;
      }

      if (typeof value === 'boolean') {
        return <span className={cn(isOld ? "text-red-600" : "text-green-600", "font-medium")}>
          {value.toString()}
        </span>;
      }

      if (typeof value === 'number') {
        return <span className={cn(isOld ? "text-red-600" : "text-green-600", "font-medium")}>
          {value}
        </span>;
      }

      if (typeof value === 'string') {
        return <span className="font-mono text-xs break-all">{value}</span>;
      }

      if (Array.isArray(value)) {
        return (
          <div className="text-xs">
            <span className="text-gray-500">[</span>
            {value.slice(0, 3).map((item, idx) => (
              <span key={idx}>
                {formatValue(item)}
                {idx < Math.min(value.length - 1, 2) && <span className="text-gray-500">, </span>}
              </span>
            ))}
            {value.length > 3 && <span className="text-gray-400">... {value.length} items</span>}
            <span className="text-gray-500">]</span>
          </div>
        );
      }

      if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length === 0) return <span className="text-gray-400 italic">{"{}"}</span>;

        return (
          <div className="text-xs">
            <span className="text-gray-500">{"{"}</span>
            {keys.slice(0, 2).map((k, idx) => (
              <div key={k} className="ml-2">
                <span className="text-gray-500">{k}: </span>
                {formatValue(value[k])}
                {idx < Math.min(keys.length - 1, 1) && <span className="text-gray-500">, </span>}
              </div>
            ))}
            {keys.length > 2 && <div className="text-gray-400 italic">... {keys.length} properties</div>}
            <span className="text-gray-500">{"}"}</span>
          </div>
        );
      }

      return <span className="font-mono text-xs">{String(value)}</span>;
    };

    // Apply search filter
    if (searchTerm && !key.toLowerCase().includes(searchTerm.toLowerCase())) {
      return null;
    }

    // Apply type filter
    if (filterType !== 'all' && !isChanged) {
      return null;
    }

    return (
      <div key={key} className={cn(
        "py-2 border-b border-gray-100 text-xs transition-all",
        isChanged ? "bg-yellow-50 border-yellow-200" : "bg-gray-50",
        depth > 0 && "ml-4 border-l-2 border-gray-200 pl-3"
      )} style={{ marginLeft: `${indent}px` }}>
        <div className="flex items-center justify-between mb-1">
          <div className="font-medium text-gray-700 flex items-center gap-2">
            <span className="font-mono">{key}</span>
            {isChanged && (
              <span className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
                Modified
              </span>
            )}
          </div>
          {depth === 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={() => navigator.clipboard.writeText(`${key}: ${JSON.stringify(newValue)}`)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>

        {isChanged ? (
          <div className="grid grid-cols-1 gap-2">
            <div className="bg-red-50 p-2 rounded border border-red-200">
              <div className="text-xs text-red-700 font-medium mb-1">Previous:</div>
              <div className="line-through opacity-75">
                {formatValue(oldValue, true)}
              </div>
            </div>
            <div className="bg-green-50 p-2 rounded border border-green-200">
              <div className="text-xs text-green-700 font-medium mb-1">Current:</div>
              <div>
                {formatValue(newValue)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-600">
            {formatValue(newValue)}
          </div>
        )}
      </div>
    );
  };

  // Memoized filtered properties for performance
  const filteredProperties = useMemo(() => {
    if (!properties) return {};

    const allKeys = new Set([...Object.keys(properties), ...Object.keys(oldProperties || {})]);
    const filtered: Record<string, { new: any; old: any; changed: boolean }> = {};

    allKeys.forEach(key => {
      const newValue = properties[key];
      const oldValue = oldProperties?.[key];
      const changed = JSON.stringify(newValue) !== JSON.stringify(oldValue);

      if (searchTerm && !key.toLowerCase().includes(searchTerm.toLowerCase())) {
        return;
      }

      if (filterType === 'changed' && !changed) {
        return;
      }

      filtered[key] = { new: newValue, old: oldValue, changed };
    });

    return filtered;
  }, [properties, oldProperties, searchTerm, filterType]);

  // Handle detail toggle
  const handleToggleDetails = () => {
    const newShowDetails = !showDetails;
    setShowDetails(newShowDetails);
    if (onToggleDetails && stepId) {
      onToggleDetails(stepId, newShowDetails);
    }
  };

  // Handle export functionality
  const handleExport = () => {
    const exportData = {
      stepTitle: title,
      type,
      status,
      properties,
      oldProperties,
      changedProperties,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `step-${title.replace(/\s+/g, '-').toLowerCase()}-comparison.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasChanges = Object.keys(changedProperties).length > 0;
  const changeCount = Object.keys(changedProperties).length;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 rounded-lg border transition-all duration-200 hover:shadow-sm",
        colors.bg,
        colors.border,
        colors.text,
        className
      )}
    >
      <div className="flex items-center gap-3 w-full">
        <div className="flex-shrink-0">
          <Icon className={cn("h-5 w-5", colors.icon)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{title}</div>
          {(summary || (details && typeof details === 'string')) && (
            <div className="text-xs opacity-75 mt-1">
              {summary && <div className="font-medium">{summary}</div>}
              {details && typeof details === 'string' && (
                <div>{details}</div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {status !== 'unchanged' && (
            <div className="flex-shrink-0">
              <div className={cn(
                "px-2 py-1 text-xs font-medium rounded-full",
                status === 'added' && "bg-blue-100 text-blue-700",
                status === 'removed' && "bg-red-100 text-red-700",
                status === 'modified' && "bg-yellow-100 text-yellow-700"
              )}>
                {status === 'added' ? 'NEW' :
                 status === 'removed' ? 'REMOVED' :
                 status === 'modified' ? `MODIFIED${changeCount > 0 ? ` (${changeCount})` : ''}` : ''}
              </div>
            </div>
          )}
          {(properties || oldProperties) && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 p-1 h-auto"
                onClick={() => setExpanded(!expanded)}
                aria-label={expanded ? "Collapse step details" : "Expand step details"}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              {hasChanges && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "p-1 h-auto",
                    showDetails ? "text-blue-600" : "text-gray-400"
                  )}
                  onClick={handleToggleDetails}
                  title={showDetails ? "Hide detailed differences" : "Show detailed differences"}
                >
                  {showDetails ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto text-gray-400 hover:text-gray-600"
                onClick={handleExport}
                title="Export step comparison data"
              >
                <FileDown className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Enhanced properties section */}
      {expanded && (properties || oldProperties) && (
        <div className="mt-2 border-t pt-3 w-full">
          {/* Controls */}
          <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Properties</option>
              <option value="changed">Changed Only</option>
              <option value="added">Added</option>
              <option value="removed">Removed</option>
            </select>
          </div>

          {/* Properties display */}
          <div className="text-xs font-medium mb-2 text-gray-700 flex items-center gap-2">
            Properties Comparison:
            {Object.keys(filteredProperties).length > 0 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {Object.keys(filteredProperties).length} shown
              </span>
            )}
          </div>

          <div className="space-y-1 max-h-96 overflow-y-auto">
            {showDetailedDiff && oldProperties && showDetails ? (
              // Enhanced diff view
              Object.entries(filteredProperties).map(([key, { new: newValue, old: oldValue }]) =>
                renderPropertyDiff(key, newValue, oldValue)
              )
            ) : (
              // Show only current properties with basic formatting
              Object.entries(filteredProperties).map(([key, { new: value }]) => (
                <div key={key} className="py-2 border-b border-gray-100 text-xs">
                  <div className="font-medium text-gray-700 flex items-center justify-between">
                    <span className="font-mono">{key}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 opacity-50 hover:opacity-100"
                      onClick={() => navigator.clipboard.writeText(`${key}: ${JSON.stringify(value)}`)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-gray-600 mt-1">
                    {(() => {
                      if (value === null || value === undefined) {
                        return <span className="text-gray-400 italic">null</span>;
                      }
                      if (typeof value === 'object') {
                        return <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>;
                      }
                      return <span className="font-mono">{String(value)}</span>;
                    })()}
                  </div>
                </div>
              ))
            )}
          </div>

          {Object.keys(filteredProperties).length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No properties match the current filter
            </div>
          )}
        </div>
      )}
    </div>
  );
}