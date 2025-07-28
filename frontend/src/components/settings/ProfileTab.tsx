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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";

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
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src="/placeholder-avatar.jpg" alt="John Smith" />
          <AvatarFallback className="text-lg">JS</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">John Smith</h2>
          <p className="text-gray-600">john.smith@example.com</p>
        </div>
      </div>

      {/* Personal Details */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="full-name">Full Name</Label>
            <Input
              id="full-name"
              value={profile.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              This is how your name appears across the platform
            </p>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="flex items-center gap-2 mt-1">
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
            <Label htmlFor="job-title">Job Title</Label>
            <Input
              id="job-title"
              value={profile.jobTitle}
              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* HubSpot Account Connection */}
      <Card>
        <CardHeader>
          <CardTitle>HubSpot Account Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  Connected
                </span>
                <span className="text-sm text-gray-500">
                  • Last connected: 2025-07-15 10:30 AM
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">
                    Portal ID:
                  </span>
                  <span className="text-sm text-gray-900 font-mono">
                    243112608
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">
                    Connected as:
                  </span>
                  <span className="text-sm text-gray-900">
                    john.smith@example.com
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">
                    Role:
                  </span>
                  <span className="text-sm text-gray-900">Viewer</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  Disconnect HubSpot
                </Button>
              </div>

              <p className="text-sm text-gray-500 pt-1">
                Disconnecting will disable all HubSpot-related features and
                monitoring.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="timezone">Time Zone</Label>
            <Select
              value={profile.timezone}
              onValueChange={(value) => handleInputChange("timezone", value)}
            >
              <SelectTrigger className="mt-1">
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
            <Label htmlFor="language">Display Language</Label>
            <Select
              value={profile.language}
              onValueChange={(value) => handleInputChange("language", value)}
            >
              <SelectTrigger className="mt-1">
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

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Delete Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Once you delete your account, there is no going back. Please be
              certain.
            </AlertDescription>
          </Alert>
          <Button variant="destructive">Delete Account</Button>
        </CardContent>
      </Card>

      {/* Save Changes */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ProfileTab;
