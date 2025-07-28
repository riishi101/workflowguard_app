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
    <div className="space-y-12">
      {/* Profile Header */}
      <div className="flex items-center gap-8">
        <Avatar className="h-20 w-20">
          <AvatarImage src="/placeholder-avatar.jpg" alt="John Smith" />
          <AvatarFallback className="text-xl">JS</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">John Smith</h2>
          <p className="text-sm text-gray-600">john.smith@example.com</p>
        </div>
      </div>

      {/* Personal Details */}
      <Card className="shadow-sm">
        <CardHeader className="pb-8">
          <CardTitle className="tracking-tight text-lg font-semibold text-gray-900">
            Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-8">
          <div>
            <Label htmlFor="full-name" className="text-sm font-medium text-gray-700">
              Full Name
            </Label>
            <Input
              id="full-name"
              value={profile.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className="mt-3 h-12 text-base"
            />
            <p className="text-sm text-gray-500 mt-3">
              This is how your name appears across the platform
            </p>
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <div className="flex items-center gap-4 mt-3">
              <Input
                id="email"
                value={profile.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="flex-1 h-12 text-base"
              />
              <Button variant="outline" className="h-12 px-8 text-base font-medium">
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
              className="mt-3 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* HubSpot Account Connection */}
      <Card className="shadow-sm">
        <CardHeader className="pb-8">
          <CardTitle className="tracking-tight text-lg font-semibold text-gray-900">
            HubSpot Account Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="flex items-start gap-8">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Connected to HubSpot
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your HubSpot account is successfully connected and syncing
                    workflows.
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">Portal ID</div>
                    <div className="text-sm text-gray-600">243112608</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">Role</div>
                    <div className="text-sm text-gray-600">Admin</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="h-12 px-8 text-base font-medium">
                  Disconnect HubSpot
                </Button>
                <Button variant="outline" className="h-12 px-8 text-base font-medium">
                  Reconnect
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="shadow-sm">
        <CardHeader className="pb-8">
          <CardTitle className="tracking-tight text-lg font-semibold text-gray-900">
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-8">
          <div>
            <Label htmlFor="timezone" className="text-sm font-medium text-gray-700">
              Timezone
            </Label>
            <Select
              value={profile.timezone}
              onValueChange={(value) => handleInputChange("timezone", value)}
            >
              <SelectTrigger className="mt-3 h-12 text-base">
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
              <SelectTrigger className="mt-3 h-12 text-base">
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
      <Card className="shadow-sm">
        <CardHeader className="pb-8">
          <CardTitle className="tracking-tight text-lg font-semibold text-gray-900">
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Two-Factor Authentication
              </h4>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline" className="h-12 px-8 text-base font-medium">
              Enable 2FA
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Change Password
              </h4>
              <p className="text-sm text-gray-600">
                Update your account password regularly
              </p>
            </div>
            <Button variant="outline" className="h-12 px-8 text-base font-medium">
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="shadow-sm">
        <CardHeader className="pb-8">
          <CardTitle className="tracking-tight text-lg font-semibold text-red-600">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <Alert className="mb-8">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="text-sm">
              These actions cannot be undone. Please proceed with caution.
            </AlertDescription>
          </Alert>
          <div className="space-y-6">
            <Button 
              variant="outline" 
              className="w-full h-12 text-base font-medium text-red-600 border-red-200 hover:bg-red-50"
            >
              Deactivate Account
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-12 text-base font-medium text-red-600 border-red-200 hover:bg-red-50"
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
