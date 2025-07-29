import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, User, Shield, Settings, Trash2 } from "lucide-react";

const ProfileTab = () => {
  const [profile, setProfile] = useState({
    fullName: "John Smith",
    email: "john.smith@example.com",
    jobTitle: "Senior Product Manager",
    timezone: "Pacific Time (PT) UTC-7",
    language: "English (US)",
  });

  const handleInputChange = (field: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div>
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-6">
        <Avatar className="h-16 w-16 border-2 border-blue-100">
          <AvatarImage src="/placeholder-avatar.jpg" alt="John Smith" />
          <AvatarFallback className="text-lg bg-blue-50 text-blue-700">JS</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">John Smith</h2>
          <p className="text-sm text-gray-600">john.smith@example.com</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-600 font-medium">Active</span>
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>
            Update your personal information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="full-name" className="text-sm font-medium text-gray-700">
              Full Name
            </Label>
            <Input
              id="full-name"
              value={profile.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              This is how your name appears across the platform
            </p>
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <div className="flex items-center gap-3 mt-2">
              <Input
                id="email"
                value={profile.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="sm">
                Verify Email
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="job-title" className="text-sm font-medium text-gray-700">
              Job Title
            </Label>
            <Input
              id="job-title"
              value={profile.jobTitle}
              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* HubSpot Account Connection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>HubSpot Account Connection</CardTitle>
          <CardDescription>
            Manage your HubSpot account integration and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Connected to HubSpot
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your HubSpot account is successfully connected and syncing workflows.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right bg-gray-50 rounded p-2">
                    <div className="text-xs font-medium text-gray-900">Portal ID</div>
                    <div className="text-xs text-gray-600">243112608</div>
                  </div>
                  <div className="text-right bg-gray-50 rounded p-2">
                    <div className="text-xs font-medium text-gray-900">Role</div>
                    <div className="text-xs text-gray-600">Admin</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  Disconnect HubSpot
                </Button>
                <Button variant="outline" size="sm">
                  Reconnect
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Customize your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="timezone" className="text-sm font-medium text-gray-700">
              Timezone
            </Label>
            <Select
              value={profile.timezone}
              onValueChange={(value) => handleInputChange("timezone", value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pacific Time (PT) UTC-7">
                  Pacific Time (PT) UTC-7
                </SelectItem>
                <SelectItem value="Mountain Time (MT) UTC-6">
                  Mountain Time (MT) UTC-6
                </SelectItem>
                <SelectItem value="Central Time (CT) UTC-5">
                  Central Time (CT) UTC-5
                </SelectItem>
                <SelectItem value="Eastern Time (ET) UTC-4">
                  Eastern Time (ET) UTC-4
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="language" className="text-sm font-medium text-gray-700">
              Language
            </Label>
            <Select
              value={profile.language}
              onValueChange={(value) => handleInputChange("language", value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English (US)">English (US)</SelectItem>
                <SelectItem value="English (UK)">English (UK)</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="German">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your account security settings and authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                Two-Factor Authentication
              </h4>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline" size="sm">
              Enable 2FA
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                Change Password
              </h4>
              <p className="text-sm text-gray-600">
                Update your account password regularly
              </p>
            </div>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-700">
              These actions cannot be undone. Please proceed with caution.
            </AlertDescription>
          </Alert>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              Deactivate Account
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;
