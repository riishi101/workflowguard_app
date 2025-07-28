import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";

const NotificationsTab = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [notifications, setNotifications] = useState({
    workflowDeleted: false,
    enrollmentTriggerModified: false,
    workflowRolledBack: false,
    criticalActionModified: false,
  });

  const handleNotificationToggle = (key: string) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Upgrade Banner */}
      <Alert className="border-orange-200 bg-orange-50">
        <Lock className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          Upgrade to Professional Plan to configure notifications
        </AlertDescription>
      </Alert>

      {/* Workflow Change Notifications */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Workflow Change Notifications
          </h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable-notifications" className="font-medium">
                  Enable Notifications
                </Label>
                <p className="text-sm text-gray-600">
                  Receive email alerts for critical workflow events
                </p>
              </div>
              <Switch
                id="enable-notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
                disabled
              />
            </div>

            <div className="space-y-4 pl-4 border-l-2 border-gray-100">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="workflow-deleted"
                  checked={notifications.workflowDeleted}
                  onCheckedChange={() =>
                    handleNotificationToggle("workflowDeleted")
                  }
                  disabled
                />
                <Label
                  htmlFor="workflow-deleted"
                  className="text-sm text-gray-700"
                >
                  Notify me when a workflow is Deleted
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="enrollment-trigger"
                  checked={notifications.enrollmentTriggerModified}
                  onCheckedChange={() =>
                    handleNotificationToggle("enrollmentTriggerModified")
                  }
                  disabled
                />
                <Label
                  htmlFor="enrollment-trigger"
                  className="text-sm text-gray-700"
                >
                  Notify me when an Enrollment Trigger is Modified
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="workflow-rolled-back"
                  checked={notifications.workflowRolledBack}
                  onCheckedChange={() =>
                    handleNotificationToggle("workflowRolledBack")
                  }
                  disabled
                />
                <Label
                  htmlFor="workflow-rolled-back"
                  className="text-sm text-gray-700"
                >
                  Notify me when a workflow is Rolled Back
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="critical-action"
                  checked={notifications.criticalActionModified}
                  onCheckedChange={() =>
                    handleNotificationToggle("criticalActionModified")
                  }
                  disabled
                />
                <Label
                  htmlFor="critical-action"
                  className="text-sm text-gray-700"
                >
                  Notify me when a Critical Action is Modified (e.g., Send
                  Email, Update Property, Create Task)
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-email" className="font-medium">
                Send notifications to:
              </Label>
              <Input
                id="notification-email"
                placeholder="Enter email addresses or select users"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                disabled
                className="max-w-md"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" disabled>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;
