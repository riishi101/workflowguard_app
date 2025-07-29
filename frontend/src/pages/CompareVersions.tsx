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
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
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

// Mock workflow data for comparison
const workflowVersionsData = {
  "1": {
    steps: [
      { type: "email", title: "Send Welcome Email", icon: Mail },
      { type: "delay", title: "Wait 5 days", icon: Clock },
      { type: "email", title: "Send Follow-up Email", icon: Mail },
      { type: "meeting", title: "Schedule Meeting", icon: Calendar },
    ],
  },
  "2": {
    steps: [
      { type: "email", title: "Send Welcome Email", icon: Mail },
      { type: "delay", title: "Wait 7 days", icon: Clock },
      { type: "email", title: "Send Follow-up Email", icon: Mail },
      { type: "meeting", title: "Schedule Meeting", icon: Calendar },
      { type: "email", title: "Send Thank You Email", icon: Mail, isNew: true },
    ],
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

  const getStepColor = (step: any) => {
    if (step.isNew) return "bg-red-50 border-red-200";
    if (step.type === "email") return "bg-green-50 border-green-200";
    if (step.type === "delay") return "bg-yellow-50 border-yellow-200";
    if (step.type === "meeting") return "bg-blue-50 border-blue-200";
    return "bg-gray-50 border-gray-200";
  };

  const getStepTextColor = (step: any) => {
    if (step.isNew) return "text-red-800";
    if (step.type === "email") return "text-green-800";
    if (step.type === "delay") return "text-yellow-800";
    if (step.type === "meeting") return "text-blue-800";
    return "text-gray-800";
  };

  return (
    <MainAppLayout
      title="Compare Workflow Versions: Customer Onboarding"
      description="Last modified: June 21, 2025, 9:00 AM IST"
    >
      {/* Breadcrumb */}
      <ContentSection spacing="tight">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Workflow History</span>
          <span>&gt;</span>
          <span className="text-gray-900 font-medium">Compare Versions</span>
        </nav>
      </ContentSection>

      {/* Version Selectors and Controls */}
      <ContentSection>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Version A:
              </span>
              <Select value={versionA} onValueChange={setVersionA}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allVersions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Version B:
              </span>
              <Select value={versionB} onValueChange={setVersionB}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allVersions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={syncScroll}
                onCheckedChange={setSyncScroll}
                id="sync-scroll"
              />
              <label htmlFor="sync-scroll" className="text-sm text-gray-700">
                Sync Scroll
              </label>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Minus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* Comparison Content */}
      <ContentSection>
        <div className="grid grid-cols-2 gap-6">
          {/* Version A */}
          <div className="border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                Version A - {versionAData?.date}
              </h3>
              <p className="text-sm text-gray-600">
                Created by {versionAData?.creator}
              </p>
            </div>
            <div className="p-4 space-y-3">
              {versionASteps.steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border flex items-center space-x-3 ${getStepColor(step)}`}
                  >
                    <IconComponent
                      className={`w-5 h-5 ${getStepTextColor(step)}`}
                    />
                    <span className={`font-medium ${getStepTextColor(step)}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Version B */}
          <div className="border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                Version B - {versionBData?.type} ({versionBData?.date})
              </h3>
              <p className="text-sm text-gray-600">
                Last modified by {versionBData?.creator}
              </p>
            </div>
            <div className="p-4 space-y-3">
              {versionBSteps.steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border flex items-center space-x-3 ${getStepColor(step)}`}
                  >
                    <IconComponent
                      className={`w-5 h-5 ${getStepTextColor(step)}`}
                    />
                    <span className={`font-medium ${getStepTextColor(step)}`}>
                      {step.title}
                    </span>
                    {step.isNew && (
                      <Badge variant="destructive" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ContentSection>

      {/* Action Buttons */}
      <ContentSection>
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={handleBackToHistory}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Version History
          </Button>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="text-blue-600">
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore Version A
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore Version B
            </Button>
          </div>
        </div>
      </ContentSection>
    </MainAppLayout>
  );
};

export default CompareVersions;
