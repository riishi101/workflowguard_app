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
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src="/placeholder-avatar.jpg" alt="John Smith" />
          <AvatarFallback className="text-xl font-semibold">JS</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">John Smith</h2>
          <p className="text-gray-600 text-lg">john.smith@example.com</p>
        </div>
      </div>

      {/* Personal Details */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-semibold text-gray-900">Personal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="full-name" className="text-sm font-medium text-gray-700 mb-2 block">Full Name</Label>
            <Input
              id="full-name"
              value={profile.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className="mt-1 h-12 text-base"
            />
            <p className="text-sm text-gray-500 mt-2">
              This is how your name appears across the platform
            </p>
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">Email Address</Label>
            <div className="flex items-center gap-3 mt-1">
              <Input
                id="email"
                value={profile.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="flex-1 h-12 text-base"
              />
              <Button variant="outline" size="sm" className="h-12 px-6">
                Verify Email
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="job-title" className="text-sm font-medium text-gray-700 mb-2 block">Job Title</Label>
            <Input
              id="job-title"
              value={profile.jobTitle}
              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              className="mt-1 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* HubSpot Account Connection */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-semibold text-gray-900">HubSpot Account Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-base font-semibold text-gray-900">
                  Connected
                </span>
                <span className="text-sm text-gray-500">
                  • Last connected: 2025-07-15 10:30 AM
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium min-w-[80px]">
                    Portal ID:
                  </span>
                  <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                    243112608
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium min-w-[80px]">
                    Connected as:
                  </span>
                  <span className="text-sm text-gray-900">
                    john.smith@example.com
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium min-w-[80px]">
                    Role:
                  </span>
                  <span className="text-sm text-gray-900">Viewer</span>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 h-10 px-4"
                >
                  Disconnect HubSpot
                </Button>
              </div>

              <p className="text-sm text-gray-500 pt-2">
                Disconnecting will disable all HubSpot-related features and
                monitoring.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-semibold text-gray-900">Regional Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="timezone" className="text-sm font-medium text-gray-700 mb-2 block">Time Zone</Label>
            <Select
              value={profile.timezone}
              onValueChange={(value) => handleInputChange("timezone", value)}
            >
              <SelectTrigger className="mt-1 h-12 text-base">
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
            <Label htmlFor="language" className="text-sm font-medium text-gray-700 mb-2 block">Display Language</Label>
            <Select
              value={profile.language}
              onValueChange={(value) => handleInputChange("language", value)}
            >
              <SelectTrigger className="mt-1 h-12 text-base">
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
      <Card className="border-red-200 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-semibold text-red-800 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            Delete Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50 mb-6">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 text-base">
              Once you delete your account, there is no going back. Please be
              certain.
            </AlertDescription>
          </Alert>
          <Button variant="destructive" className="h-12 px-6 text-base">
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Save Changes */}
      <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-200">
        <Button variant="outline" className="h-12 px-8 text-base">
          Cancel
        </Button>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white h-12 px-8 text-base">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ProfileTab;
