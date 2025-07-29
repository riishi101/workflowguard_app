import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Shield, Settings, Trash2 } from "lucide-react";

const UserPermissionsTab = () => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");

  const teamMembers = [
  {
      id: 1,
      name: "John Smith",
      email: "john.smith@example.com",
      role: "admin",
      avatar: "JS",
      status: "active",
  },
  {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      role: "editor",
      avatar: "SJ",
      status: "active",
  },
  {
      id: 3,
      name: "Mike Wilson",
      email: "mike.wilson@example.com",
      role: "viewer",
      avatar: "MW",
      status: "pending",
  },
];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "editor":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="space-y-6">
      {/* Invite Users */}
          <Card>
            <CardHeader>
          <CardTitle>Invite Team Members</CardTitle>
          <CardDescription>
            Invite new users to your WorkflowGuard account
          </CardDescription>
            </CardHeader>
            <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="w-32">
              <Label htmlFor="role" className="text-sm font-medium">
                Role
              </Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </Button>
            </div>
          </div>
            </CardContent>
          </Card>

      {/* Team Members */}
          <Card>
            <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage user access and permissions
          </CardDescription>
            </CardHeader>
            <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`/avatars/${member.avatar.toLowerCase()}.jpg`} />
                    <AvatarFallback className="bg-blue-50 text-blue-700">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      <Badge className={getRoleColor(member.role)}>
                        {member.role}
                      </Badge>
                      <Badge className={getStatusColor(member.status)}>
                        {member.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
            </CardContent>
          </Card>

      {/* Role Permissions */}
          <Card>
            <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Understand what each role can do in your account
          </CardDescription>
            </CardHeader>
            <CardContent>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-gray-900">Admin</h4>
                <Badge className="bg-red-100 text-red-800">Full Access</Badge>
              </div>
              <p className="text-sm text-gray-600">
                Can manage all workflows, team members, billing, and account settings.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-gray-900">Editor</h4>
                <Badge className="bg-blue-100 text-blue-800">Limited Access</Badge>
        </div>
              <p className="text-sm text-gray-600">
                Can view and edit workflows, but cannot manage team or billing.
              </p>
      </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">Viewer</h4>
                <Badge className="bg-gray-100 text-gray-800">Read Only</Badge>
              </div>
              <p className="text-sm text-gray-600">
                Can only view workflows and reports, no editing permissions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPermissionsTab;