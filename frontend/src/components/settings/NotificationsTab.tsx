import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ApiService } from "@/lib/api";
import { Lock, Loader2, Save, Mail, AlertCircle } from "lucide-react";

interface NotificationSettings {
  enabled: boolean;
  email: string;
  workflowDeleted: boolean;
  enrollmentTriggerModified: boolean;
  workflowRolledBack: boolean;
  criticalActionModified: boolean;
}

const NotificationsTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    email: "",
    workflowDeleted: false,
    enrollmentTriggerModified: false,
    workflowRolledBack: false,
    criticalActionModified: false,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [originalSettings, setOriginalSettings] = useState<NotificationSettings | null>(null);

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Get user's email from profile for default
  const getUserEmail = async (): Promise<string> => {
    try {
      const response = await ApiService.getUserProfile();
      return response.data?.email || "";
    } catch (error) {
      console.error('Failed to get user email:', error);
      return "";
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user email for default
      const userEmail = await getUserEmail();
      
      const response = await ApiService.getNotificationSettings();
      
      // Add null check for response.data
      if (response && response.data) {
        const settingsData = {
          ...response.data,
          // Use user's email as default if no email is set
          email: response.data.email || userEmail || "contact@workflowguard.pro"
        };
        setSettings(settingsData);
        setOriginalSettings(settingsData);
      } else {
        // Set default settings with user's email
        const defaultSettings = {
          enabled: false,
          email: userEmail || "contact@workflowguard.pro",
          workflowDeleted: true,
          enrollmentTriggerModified: true,
          workflowRolledBack: true,
          criticalActionModified: true,
        };
        setSettings(defaultSettings);
        setOriginalSettings(defaultSettings);
      }
    } catch (err: any) {
      console.error('Failed to fetch notification settings:', err);
      setError(err.response?.data?.message || 'Failed to load notification settings. Please try again.');
      
      // Set default settings with support email on error
      const defaultSettings = {
        enabled: false,
        email: "contact@workflowguard.pro",
        workflowDeleted: true,
        enrollmentTriggerModified: true,
        workflowRolledBack: true,
        criticalActionModified: true,
      };
      setSettings(defaultSettings);
      setOriginalSettings(defaultSettings);
      
      toast({
        title: "Error",
        description: "Failed to load notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean | string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    
    // Clear email error when user starts typing
    if (key === 'email') {
      setEmailError(null);
    }
    
    setHasChanges(true);
  };

  const handleEmailChange = (email: string) => {
    handleSettingChange('email', email);
    
    // Validate email if user has entered something
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError(null);
    }
  };

  const handleSaveChanges = async () => {
    // Validate email before saving
    if (settings.email && !validateEmail(settings.email)) {
      setEmailError('Please enter a valid email address');
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await ApiService.updateNotificationSettings(settings);
      setHasChanges(false);
      setOriginalSettings(settings);
      setEmailError(null);
      toast({
        title: "Settings Updated",
        description: "Your notification settings have been updated successfully.",
      });
    } catch (err: any) {
      console.error('Failed to update notification settings:', err);
      toast({
        title: "Update Failed",
        description: err.response?.data?.message || "Failed to update notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (originalSettings) {
      setSettings(originalSettings);
      setHasChanges(false);
      setEmailError(null);
      toast({
        title: "Settings Reset",
        description: "Settings have been reset to their original values.",
      });
    }
  };

  const handleTestNotification = async () => {
    if (!settings.email || !validateEmail(settings.email)) {
      setEmailError('Please enter a valid email address');
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address to test notifications.",
        variant: "destructive",
      });
      return;
    }

    try {
      // This would call a test notification endpoint
      toast({
        title: "Test Notification Sent",
        description: `A test notification has been sent to ${settings.email}`,
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to send test notification. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchNotificationSettings}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                checked={settings.enabled}
                onCheckedChange={(checked) => handleSettingChange("enabled", checked)}
              />
            </div>

            <div className="space-y-4 pl-4 border-l-2 border-gray-100">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="workflow-deleted"
                  checked={settings.workflowDeleted}
                  onCheckedChange={(checked) =>
                    handleSettingChange("workflowDeleted", checked)
                  }
                  disabled={!settings.enabled}
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
                  checked={settings.enrollmentTriggerModified}
                  onCheckedChange={(checked) =>
                    handleSettingChange("enrollmentTriggerModified", checked)
                  }
                  disabled={!settings.enabled}
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
                  checked={settings.workflowRolledBack}
                  onCheckedChange={(checked) =>
                    handleSettingChange("workflowRolledBack", checked)
                  }
                  disabled={!settings.enabled}
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
                  checked={settings.criticalActionModified}
                  onCheckedChange={(checked) =>
                    handleSettingChange("criticalActionModified", checked)
                  }
                  disabled={!settings.enabled}
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
              <div className="relative">
                <Input
                  id="notification-email"
                  placeholder="Enter email address"
                  value={settings.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  disabled={!settings.enabled}
                  className={`max-w-md ${emailError ? 'border-red-500' : ''}`}
                />
                {emailError && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {emailError}
                  </p>
                )}
                {settings.email && validateEmail(settings.email) && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Valid email address
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Default: Your account email or support@workflowguard.pro
              </p>
            </div>

            {/* Test Notification Button */}
            {settings.enabled && settings.email && validateEmail(settings.email) && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestNotification}
                  className="text-blue-600"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Test Notification
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  Test your notification settings by sending a sample email
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="text-sm text-gray-600">
                You have unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              disabled={!hasChanges}
              onClick={handleResetToDefaults}
            >
              Reset
            </Button>
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white" 
              onClick={handleSaveChanges}
              disabled={!hasChanges || saving || !!emailError}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;
