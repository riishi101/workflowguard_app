import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import PlanBillingTab from "@/components/settings/PlanBillingTab";
import NotificationsTab from "@/components/settings/NotificationsTab";
import UserPermissionsTab from "@/components/settings/UserPermissionsTab";
import AuditLogTab from "@/components/settings/AuditLogTab";
import ApiAccessTab from "@/components/settings/ApiAccessTab";
import ProfileTab from "@/components/settings/ProfileTab";
import {
  CreditCard,
  Bell,
  Users,
  FileText,
  Code,
  UserCircle,
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("plan-billing");

  return (
    <MainAppLayout 
      title="App Settings"
      description="Manage app-level configurations, subscriptions, and user access for WorkflowGuard."
    >
      <ContentSection>
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Enhanced TabsList with better spacing and responsive design */}
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 bg-gray-50 p-2 rounded-xl mb-8 gap-1 shadow-sm">
              <TabsTrigger
                value="plan-billing"
                className="flex items-center gap-2 text-xs md:text-sm px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg transition-all duration-200"
              >
                <CreditCard className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">My Plan & Billing</span>
                <span className="sm:hidden">Plan</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2 text-xs md:text-sm px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg transition-all duration-200"
              >
                <Bell className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Notifications</span>
                <span className="sm:hidden">Alerts</span>
              </TabsTrigger>
              <TabsTrigger
                value="user-permissions"
                className="flex items-center gap-2 text-xs md:text-sm px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg transition-all duration-200"
              >
                <Users className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">User Permissions</span>
                <span className="sm:hidden">Users</span>
              </TabsTrigger>
              <TabsTrigger
                value="audit-log"
                className="flex items-center gap-2 text-xs md:text-sm px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg transition-all duration-200"
              >
                <FileText className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Audit Log</span>
                <span className="sm:hidden">Log</span>
              </TabsTrigger>
              <TabsTrigger
                value="api-access"
                className="flex items-center gap-2 text-xs md:text-sm px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg transition-all duration-200"
              >
                <Code className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">API Access</span>
                <span className="sm:hidden">API</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="flex items-center gap-2 text-xs md:text-sm px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg transition-all duration-200"
              >
                <UserCircle className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">My Profile</span>
                <span className="sm:hidden">Profile</span>
              </TabsTrigger>
            </TabsList>

            {/* Enhanced TabsContent with better spacing */}
            <div className="w-full space-y-6">
              <TabsContent value="plan-billing" className="mt-0 space-y-6">
                <PlanBillingTab />
              </TabsContent>
              <TabsContent value="notifications" className="mt-0 space-y-6">
                <NotificationsTab />
              </TabsContent>
              <TabsContent value="user-permissions" className="mt-0 space-y-6">
                <UserPermissionsTab />
              </TabsContent>
              <TabsContent value="audit-log" className="mt-0 space-y-6">
                <AuditLogTab />
              </TabsContent>
              <TabsContent value="api-access" className="mt-0 space-y-6">
                <ApiAccessTab />
              </TabsContent>
              <TabsContent value="profile" className="mt-0 space-y-6">
                <ProfileTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </ContentSection>
    </MainAppLayout>
  );
};

export default Settings;
