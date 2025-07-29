import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { H3, PSmall } from "@/components/ui/typography";
import TopNavigation from "@/components/TopNavigation";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  Plus,
  Minus,
  Mail,
  Clock,
  Calendar,
  RotateCcw,
} from "lucide-react";

// Mock data for versions
const allVersions = [
  {
    id: "1",
    date: "June 15, 2025, 2:30 PM",
    creator: "John Smith",
    type: "Manual Snapshot",
  },
  {
    id: "2",
    date: "June 20, 2025, 3:45 PM",
    creator: "Sarah Johnson",
    type: "Current Version",
  },
  {
    id: "3",
    date: "June 19, 2025, 1:30 PM",
    creator: "Mike Wilson",
    type: "On-Publish Save",
  },
];

// Define step interface
interface WorkflowStep {
  type: string;
  title: string;
  icon: any;
  isNew?: boolean;
}

// Mock workflow data for comparison
const workflowVersionsData: Record<string, { steps: WorkflowStep[] }> = {
  "1": {
    steps: [
      { type: "email", title: "Send Welcome Email", icon: Mail },
      { type: "delay", title: "Wait 5 days", icon: Clock },
      { type: "email", title: "Send Follow-up Email", icon: Mail },
      { type: "meeting", title: "Schedule Meeting", icon: Calendar },
    ] as WorkflowStep[],
  },
  "2": {
    steps: [
      { type: "email", title: "Send Welcome Email", icon: Mail },
      { type: "delay", title: "Wait 7 days", icon: Clock },
      { type: "email", title: "Send Follow-up Email", icon: Mail },
      { type: "meeting", title: "Schedule Meeting", icon: Calendar },
      { type: "email", title: "Send Thank You Email", icon: Mail, isNew: true },
    ] as WorkflowStep[],
  },
};

const CompareVersions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [versionA, setVersionA] = useState(searchParams.get("versionA") || "1");
  const [versionB, setVersionB] = useState(searchParams.get("versionB") || "2");
  const [syncScroll, setSyncScroll] = useState(true);

  const versionAData = allVersions.find((v) => v.id === versionA);
  const versionBData = allVersions.find((v) => v.id === versionB);

  const versionASteps =
    workflowVersionsData[versionA as keyof typeof workflowVersionsData] ||
    workflowVersionsData["1"];
  const versionBSteps =
    workflowVersionsData[versionB as keyof typeof workflowVersionsData] ||
    workflowVersionsData["2"];

  const handleBackToHistory = () => {
    navigate("/workflow-history");
  };

  const getStepColor = (step: WorkflowStep) => {
    if (step.isNew) return "bg-red-50 border-red-200";
    if (step.type === "email") return "bg-green-50 border-green-200";
    if (step.type === "delay") return "bg-yellow-50 border-yellow-200";
    if (step.type === "meeting") return "bg-blue-50 border-blue-200";
    return "bg-gray-50 border-gray-200";
  };

  const getStepTextColor = (step: WorkflowStep) => {
    if (step.isNew) return "text-red-800";
    if (step.type === "email") return "text-green-800";
    if (step.type === "delay") return "text-yellow-800";
    if (step.type === "meeting") return "text-blue-800";
    return "text-gray-800";
  };

  return (
    <div className="min-h-screen bg-white">
      <TopNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={handleBackToHistory}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to History
            </Button>
          </div>
          <H3 className="mb-2">
            Compare Workflow Versions
          </H3>
          <PSmall>
            Compare two versions of your workflow to see what changed
          </PSmall>
        </div>

        {/* Version Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Version A</h3>
              <Select value={versionA} onValueChange={setVersionA}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allVersions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.type} - {version.date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {versionAData && (
                <div className="mt-2 text-xs text-gray-500">
                  Created by {versionAData.creator}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Version B</h3>
              <Select value={versionB} onValueChange={setVersionB}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allVersions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.type} - {version.date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {versionBData && (
                <div className="mt-2 text-xs text-gray-500">
                  Created by {versionBData.creator}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={syncScroll}
                onCheckedChange={setSyncScroll}
                id="sync-scroll"
              />
              <label htmlFor="sync-scroll" className="text-sm text-gray-700">
                Sync scrolling
              </label>
            </div>
          </div>
        </div>

        {/* Comparison View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Version A */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Version A</h3>
              <p className="text-sm text-gray-600">
                {versionAData?.type} - {versionAData?.date}
              </p>
            </div>
            <div className="p-6 space-y-4">
              {versionASteps.steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getStepColor(step)}`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                      <span className={`text-sm font-medium ${getStepTextColor(step)}`}>
                      {step.title}
                    </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Version B */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Version B</h3>
              <p className="text-sm text-gray-600">
                {versionBData?.type} - {versionBData?.date}
              </p>
            </div>
            <div className="p-6 space-y-4">
              {versionBSteps.steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getStepColor(step)}`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                      <span className={`text-sm font-medium ${getStepTextColor(step)}`}>
                      {step.title}
                    </span>
                    {step.isNew && (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                        New
                      </Badge>
                    )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Found {versionBSteps.steps.length - versionASteps.steps.length} changes
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="text-gray-600">
              Export Comparison
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore Version B
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CompareVersions;
