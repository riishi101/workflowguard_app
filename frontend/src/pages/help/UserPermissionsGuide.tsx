import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import { ArrowLeft, Users, Shield, Eye, RotateCcw, Settings, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserPermissionsGuide = () => {
  const navigate = useNavigate();

  const roles = [
    {
      name: "Viewer",
      icon: Eye,
      color: "text-blue-500",
      description: "Can view workflow history and changes",
      permissions: [
        "View workflow history",
        "Browse version history",
        "Compare workflow versions",
        "Download workflow versions",
        "View audit logs"
      ],
      restrictions: [
        "Cannot restore workflows",
        "Cannot modify settings",
        "Cannot manage users"
      ]
    },
    {
      name: "Restorer",
      icon: RotateCcw,
      color: "text-green-500",
      description: "Can view and restore previous workflow versions",
      permissions: [
        "All Viewer permissions",
        "Restore workflow versions",
        "Create new workflows from versions",
        "Download workflow versions"
      ],
      restrictions: [
        "Cannot modify settings",
        "Cannot manage users",
        "Cannot delete workflows"
      ]
    },
    {
      name: "Admin",
      icon: Shield,
      color: "text-purple-500",
      description: "Full access to manage settings and users",
      permissions: [
        "All Restorer permissions",
        "Manage user permissions",
        "Configure app settings",
        "Manage API keys",
        "View audit logs",
        "Export data",
        "Delete workflows"
      ],
      restrictions: [
        "Cannot delete the account owner"
      ]
    }
  ];

  const managementSteps = [
    {
      number: 1,
      title: "Access User Management",
      description: "Go to Settings > User Permissions to view all users and their current roles.",
      status: "completed"
    },
    {
      number: 2,
      title: "Add New Users",
      description: "Click 'Add User' and enter their email address and select the appropriate role.",
      status: "completed"
    },
    {
      number: 3,
      title: "Modify User Roles",
      description: "Use the dropdown menu next to each user to change their role. Changes take effect immediately.",
      status: "current"
    },
    {
      number: 4,
      title: "Remove Users",
      description: "Click the trash icon next to a user to remove them from the account. This action cannot be undone.",
      status: "pending"
    },
    {
      number: 5,
      title: "Save Changes",
      description: "Click 'Save Changes' to confirm all modifications to user permissions.",
      status: "pending"
    }
  ];

  const bestPractices = [
    {
      title: "Principle of Least Privilege",
      description: "Only grant users the minimum permissions they need to perform their job functions."
    },
    {
      title: "Regular Access Reviews",
      description: "Periodically review user permissions to ensure they're still appropriate and necessary."
    },
    {
      title: "Document Role Changes",
      description: "Keep records of when and why user roles were changed for audit purposes."
    },
    {
      title: "Communicate Changes",
      description: "Inform users when their permissions change and explain the reasons why."
    }
  ];

  return (
    <MainAppLayout 
      title="Managing User Permissions"
      description="Complete guide to managing user roles and permissions in WorkflowGuard"
    >
      {/* Back Navigation */}
      <ContentSection spacing="tight">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/help-support')}
          className="p-0 h-auto text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Help & Support
        </Button>
      </ContentSection>

      {/* Overview */}
      <ContentSection>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-purple-900 mb-3">
            User Role Overview
          </h2>
          <p className="text-purple-800">
            WorkflowGuard uses a role-based access control system with three main roles: Viewer, Restorer, and Admin. 
            Each role has specific permissions and restrictions to ensure secure workflow management.
          </p>
        </div>
      </ContentSection>

      {/* Role Definitions */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Role Definitions & Permissions
        </h2>
        <div className="space-y-6">
          {roles.map((role, index) => {
            const IconComponent = role.icon;
            return (
              <Card key={index} className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-6 h-6 ${role.color}`} />
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Permissions
                      </h4>
                      <ul className="space-y-2">
                        {role.permissions.map((permission, permIndex) => (
                          <li key={permIndex} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            {permission}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        Restrictions
                      </h4>
                      <ul className="space-y-2">
                        {role.restrictions.map((restriction, restIndex) => (
                          <li key={restIndex} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            {restriction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ContentSection>

      {/* Management Steps */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          How to Manage User Permissions
        </h2>
        <div className="space-y-4">
          {managementSteps.map((step) => (
            <Card key={step.number} className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : step.status === 'current'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {step.title}
                      </h3>
                      {step.status === 'current' && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          Current Step
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ContentSection>

      {/* Best Practices */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Best Practices for User Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bestPractices.map((practice, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {practice.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {practice.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ContentSection>

      {/* Security Considerations */}
      <ContentSection>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Security Considerations
        </h2>
        <div className="space-y-4">
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Admin Role Responsibility
                  </h3>
                  <p className="text-sm text-gray-600">
                    Admin users have full access to the account. Only grant admin access to trusted team members who need complete control.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Regular Access Reviews
                  </h3>
                  <p className="text-sm text-gray-600">
                    Conduct regular reviews of user permissions, especially when team members change roles or leave the organization.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Audit Trail
                  </h3>
                  <p className="text-sm text-gray-600">
                    All permission changes are logged in the audit trail for security and compliance purposes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ContentSection>

      {/* Action Buttons */}
      <ContentSection>
        <div className="flex items-center justify-center gap-4">
          <Button 
            variant="outline"
            onClick={() => navigate('/settings')}
          >
            Go to Settings
          </Button>
          <Button 
            className="bg-purple-500 hover:bg-purple-600 text-white"
            onClick={() => navigate('/contact-us')}
          >
            Contact Support
          </Button>
        </div>
      </ContentSection>
    </MainAppLayout>
  );
};

export default UserPermissionsGuide; 