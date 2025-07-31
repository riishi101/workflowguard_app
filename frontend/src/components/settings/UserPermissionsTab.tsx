import { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ApiService } from "@/lib/api";
import { Trash2, Plus, Loader2, Save, RefreshCw, AlertTriangle } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const UserPermissionsTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userList, setUserList] = useState<User[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.getUserPermissions();
      setUserList(response.data);
    } catch (err: any) {
      console.error('Failed to fetch user permissions:', err);
      setError(err.response?.data?.message || 'Failed to load user permissions. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load user permissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await ApiService.updateUserRole(userId, newRole);
      setUserList((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );
      setHasChanges(false);
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully.",
      });
    } catch (err: any) {
      console.error('Failed to update user role:', err);
      toast({
        title: "Update Failed",
        description: err.response?.data?.message || "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async () => {
    // This would typically open a modal or form
    // For now, we'll just show a toast
    toast({
      title: "Add User",
      description: "User management functionality will be implemented in a future update.",
    });
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeleting(userId);
      await ApiService.removeUser(userId);
      setUserList(prev => prev.filter(user => user.id !== userId));
      toast({
        title: "User Removed",
        description: "User has been removed successfully.",
      });
    } catch (err: any) {
      console.error('Failed to remove user:', err);
      toast({
        title: "Remove Failed",
        description: err.response?.data?.message || "Failed to remove user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleSaveChanges = async () => {
    // This would save any pending changes
    setHasChanges(false);
    toast({
      title: "Changes Saved",
      description: "All changes have been saved successfully.",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-24" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchUserPermissions}
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
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchUserPermissions}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleAddUser}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {userList.length > 0 ? (
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
                        onValueChange={(value) => handleRoleChange(user.id, value)}
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveUser(user.id)}
                        disabled={deleting === user.id}
                      >
                        {deleting === user.id ? (
                          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Users Found
              </h3>
              <p className="text-gray-600 mb-4">
                Add users to manage their access and permissions.
              </p>
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleAddUser}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First User
              </Button>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleSaveChanges}
              disabled={!hasChanges || saving}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPermissionsTab;
