import { Mail, Clock, Bell, Calendar, CheckCircle, Users, Zap, RotateCcw, AlertCircle, Target, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStepProps {
  type: "email" | "delay" | "notification" | "schedule" | "complete" | "assign" | "trigger" | "webhook" | "condition" | "task" | "list" | "goal";
  title: string;
  status: "unchanged" | "modified" | "added" | "removed";
  details?: string;
  summary?: string;
  className?: string;
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

export function WorkflowStep({ type, title, status, details, summary, className }: WorkflowStepProps) {
  const Icon = stepIcons[type] || Mail;
  const colors = stepColors[status] || stepColors.unchanged;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 hover:shadow-sm",
        colors.bg,
        colors.border,
        colors.text,
        className
      )}
    >
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
             status === 'modified' ? 'MODIFIED' : ''}
          </div>
        </div>
      )}
    </div>
  );
}