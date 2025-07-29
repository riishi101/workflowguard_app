import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    workflowChanges: true,
    securityAlerts: true,
    billingUpdates: false,
    marketingEmails: false,
    frequency: "immediate",
  });

  const handleToggle = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how and when you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <Label className="text-sm font-medium">Email Notifications</Label>
                <p className="text-xs text-gray-500">Receive notifications via email</p>
              </div>
              </div>
              <Switch
              checked={notifications.emailNotifications}
              onCheckedChange={() => handleToggle("emailNotifications")}
              />
            </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <Label className="text-sm font-medium">Push Notifications</Label>
                <p className="text-xs text-gray-500">Receive browser push notifications</p>
              </div>
            </div>
            <Switch
              checked={notifications.pushNotifications}
              onCheckedChange={() => handleToggle("pushNotifications")}
            />
              </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gray-600" />
              <div>
                <Label className="text-sm font-medium">SMS Notifications</Label>
                <p className="text-xs text-gray-500">Receive notifications via SMS</p>
              </div>
            </div>
            <Switch
              checked={notifications.smsNotifications}
              onCheckedChange={() => handleToggle("smsNotifications")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Select which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Workflow Changes</Label>
              <p className="text-xs text-gray-500">When workflows are modified or updated</p>
            </div>
            <Switch
              checked={notifications.workflowChanges}
              onCheckedChange={() => handleToggle("workflowChanges")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Security Alerts</Label>
              <p className="text-xs text-gray-500">Important security and access notifications</p>
            </div>
            <Switch
              checked={notifications.securityAlerts}
              onCheckedChange={() => handleToggle("securityAlerts")}
            />
              </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Billing Updates</Label>
              <p className="text-xs text-gray-500">Payment and subscription notifications</p>
            </div>
            <Switch
              checked={notifications.billingUpdates}
              onCheckedChange={() => handleToggle("billingUpdates")}
            />
              </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Marketing Emails</Label>
              <p className="text-xs text-gray-500">Product updates and promotional content</p>
            </div>
            <Switch
              checked={notifications.marketingEmails}
              onCheckedChange={() => handleToggle("marketingEmails")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Frequency</CardTitle>
          <CardDescription>
            Choose how often you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="frequency" className="text-sm font-medium">
                Frequency
              </Label>
              <Select
                value={notifications.frequency}
                onValueChange={(value) => setNotifications(prev => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Test Notifications</CardTitle>
          <CardDescription>
            Send test notifications to verify your settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              Test Email
            </Button>
            <Button variant="outline" size="sm">
              Test Push
            </Button>
            <Button variant="outline" size="sm">
              Test SMS
          </Button>
        </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsTab;