import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkflowStep } from "@/components/WorkflowStep";
import {
  Plus,
  Minus,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeftRight,
  Eye,
  EyeOff,
  Layers,
  Activity
} from "lucide-react";

export interface ComparisonWorkflowVersion {
  id: string;
  name: string;
  date: string;
  author: string;
  steps: Array<{
    type: "email" | "delay" | "notification" | "schedule" | "complete" | "assign" | "trigger" | "webhook" | "condition" | "task" | "list" | "goal";
    title: string;
    status: "unchanged" | "modified" | "added" | "removed";
    details?: string;
    summary?: string;
    highlightClass?: string;
    diffIndicator?: 'added' | 'modified' | 'removed' | null;
  }>;
}

interface StepData {
  type: string;
  title: string;
  status: string;
  details?: string;
  summary?: string;
}

interface WorkflowComparisonProps {
  versionA: ComparisonWorkflowVersion;
  versionB: ComparisonWorkflowVersion;
}

export function WorkflowComparison({ versionA, versionB }: WorkflowComparisonProps) {
  return (
    <div className="space-y-6">
      {/* Enhanced Header with Statistics */}
      <div className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Workflow Version Comparison</h2>
            <p className="text-gray-600">
              Detailed comparison showing changes, additions, and modifications between versions
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Comparison Statistics */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full">
                <Plus className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {versionB.steps.filter(s => s.diffIndicator === 'added').length}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
                <Edit className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  {versionA.steps.filter(s => s.diffIndicator === 'modified').length}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-red-100 px-3 py-1 rounded-full">
                <Minus className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  {versionA.steps.filter(s => s.diffIndicator === 'removed').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Version Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{versionA.name}</h3>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Version A</Badge>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                {versionA.date}
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-400" />
                {versionA.author}
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-400" />
                {versionA.steps.length} steps
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{versionB.name}</h3>
              <Badge className="bg-green-100 text-green-700">Version B</Badge>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                {versionB.date}
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-400" />
                {versionB.author}
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-400" />
                {versionB.steps.length} steps
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Version A */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Version A</CardTitle>
                <Badge variant="secondary">Previous</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <div>{versionA.date}</div>
                <div>Created by {versionA.author}</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {versionA.steps.map((step, index) => (
                <WorkflowStep
                  key={`${versionA.id}-${index}`}
                  type={step.type}
                  title={step.title}
                  status={step.status}
                  details={step.details}
                  summary={step.summary}
                />
              ))}
            </CardContent>
          </Card>

          {/* Version B */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Version B</CardTitle>
                <Badge>Current Version</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <div>{versionB.date}</div>
                <div>Last modified by {versionB.author}</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {versionB.steps.map((step, index) => (
                <WorkflowStep
                  key={`${versionB.id}-${index}`}
                  type={step.type}
                  title={step.title}
                  status={step.status}
                  details={step.details}
                  summary={step.summary}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Legend */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium mb-3 text-gray-900">Change Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded flex items-center justify-center">
                <Plus className="w-2 h-2 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">Added</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded flex items-center justify-center">
                <Edit className="w-2 h-2 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-700">Modified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded flex items-center justify-center">
                <Minus className="w-2 h-2 text-red-600" />
              </div>
              <span className="text-sm text-gray-700">Removed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
              <span className="text-sm text-gray-700">Unchanged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}