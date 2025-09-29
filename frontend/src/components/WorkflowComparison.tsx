import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkflowStep } from "@/components/WorkflowStep";

interface WorkflowVersion {
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
  versionA: WorkflowVersion;
  versionB: WorkflowVersion;
}

export function WorkflowComparison({ versionA, versionB }: WorkflowComparisonProps) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Workflow Version Comparison</h1>
          <p className="text-muted-foreground">
            Compare workflow versions to see changes, additions, and modifications
          </p>
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
        <div className="mt-8 p-4 bg-card rounded-lg border">
          <h3 className="font-medium mb-3">Change Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
              <span className="text-sm">Unchanged</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
              <span className="text-sm">Modified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
              <span className="text-sm">Added</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span className="text-sm">Removed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}