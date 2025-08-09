import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Loader2, RotateCcw } from "lucide-react";
import { DashboardWorkflow } from "@/types";

interface WorkflowTableRowProps {
  workflow: DashboardWorkflow;
  isLoading: boolean;
  error?: string;
  onViewHistory: (id: string, name: string) => void;
  onRollback: (workflow: DashboardWorkflow) => void;
  isRollbacking: boolean;
  getStatusColor: (status: string) => string;
  getProtectionStatusColor: (status: string) => string;
}

export const WorkflowTableRow = ({
  workflow,
  isLoading,
  error,
  onViewHistory,
  onRollback,
  isRollbacking,
  getStatusColor,
  getProtectionStatusColor,
}: WorkflowTableRowProps) => {
  return (
    <tr key={workflow.id} className={`hover:bg-gray-50 ${isLoading ? 'opacity-50' : ''}`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-900">
            {workflow.name}
          </span>
          {error && (
            <Badge variant="destructive" className="text-xs">
              Error: {error}
            </Badge>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge
          variant="secondary"
          className={getStatusColor(workflow.status)}
        >
          {workflow.status}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <Badge
          variant="secondary"
          className={getProtectionStatusColor(workflow.protectionStatus)}
        >
          {workflow.protectionStatus}
        </Badge>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {workflow.lastModified}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {workflow.versions} versions
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
              {workflow.lastModifiedBy?.initials || 'UN'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">
            {workflow.lastModifiedBy?.name || 'Unknown User'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewHistory(workflow.id, workflow.name)}
            className="text-blue-600"
            disabled={isLoading}
          >
            <Eye className="w-4 h-4 mr-1" />
            View History
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRollback(workflow)}
            disabled={isRollbacking || isLoading || workflow.versions === 0}
            className="text-orange-600"
          >
            {isRollbacking ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Rolling Back...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-1" />
                Rollback
              </>
            )}
          </Button>
        </div>
      </td>
    </tr>
  );
};
