import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

const users = [
  {
    id: "1",
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com",
    role: "Admin",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@company.com",
    role: "Restorer",
  },
  {
    id: "3",
    name: "Emma Thompson",
    email: "emma.t@company.com",
    role: "Viewer",
  },
];

const UserPermissionsTab = () => {
  const [userList, setUserList] = useState(users);

  const handleRoleChange = (userId: string, newRole: string) => {
    setUserList((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user,
      ),
    );
  };

  return (
    <div className="space-y-6">
      {/* Role Descriptions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Manage App User Roles
        </h3>
        <p className="text-gray-600 text-sm mb-6">
          Assign specific roles to your HubSpot users to control their access
          and capabilities within WorkflowGuard
        </p>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Viewer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Can view workflow history and changes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Restorer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Can view and restore previous workflow versions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Full access to manage settings and users
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Access Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Access</CardTitle>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>App Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userList.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        handleRoleChange(user.id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Restorer">Restorer</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end mt-6">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPermissionsTab;
