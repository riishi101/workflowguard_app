import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import NotificationsTab from "@/components/settings/NotificationsTab";
import UserPermissionsTab from "@/components/settings/UserPermissionsTab";
import AuditLogTab from "@/components/settings/AuditLogTab";
import ApiAccessTab from "@/components/settings/ApiAccessTab";
import ProfileTab from "@/components/settings/ProfileTab";
import {
  Bell,
  Users,
  FileText,
  Code,
  UserCircle,
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("notifications");

  return (
    <MainAppLayout 
      title="App Settings"
      description="Manage app-level configurations, subscriptions, and user access for WorkflowGuard."
    >
      <ContentSection>
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Enhanced TabsList with improved design */}
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-2xl mb-8 gap-2 shadow-lg border border-gray-200">
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2 text-xs md:text-sm px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 data-[state=active]:border-blue-200 rounded-xl transition-all duration-300 hover:bg-gray-50"
              >
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Notifications</span>
                <span className="sm:hidden">Alerts</span>
              </TabsTrigger>
              <TabsTrigger
                value="user-permissions"
                className="flex items-center gap-2 text-xs md:text-sm px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 data-[state=active]:border-blue-200 rounded-xl transition-all duration-300 hover:bg-gray-50"
              >
                <Users className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">User Permissions</span>
                <span className="sm:hidden">Users</span>
              </TabsTrigger>
              <TabsTrigger
                value="audit-log"
                className="flex items-center gap-2 text-xs md:text-sm px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 data-[state=active]:border-blue-200 rounded-xl transition-all duration-300 hover:bg-gray-50"
              >
                <FileText className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Audit Log</span>
                <span className="sm:hidden">Log</span>
              </TabsTrigger>
              <TabsTrigger
                value="api-access"
                className="flex items-center gap-2 text-xs md:text-sm px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 data-[state=active]:border-blue-200 rounded-xl transition-all duration-300 hover:bg-gray-50"
              >
                <Code className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">API Access</span>
                <span className="sm:hidden">API</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="flex items-center gap-2 text-xs md:text-sm px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 data-[state=active]:border-blue-200 rounded-xl transition-all duration-300 hover:bg-gray-50"
              >
                <UserCircle className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">My Profile</span>
                <span className="sm:hidden">Profile</span>
              </TabsTrigger>
            </TabsList>

            {/* Enhanced TabsContent with better spacing */}
            <div className="w-full space-y-8">
              <TabsContent value="notifications" className="mt-0 space-y-8">
                <NotificationsTab />
              </TabsContent>
              <TabsContent value="user-permissions" className="mt-0 space-y-8">
                <UserPermissionsTab />
              </TabsContent>
              <TabsContent value="audit-log" className="mt-0 space-y-8">
                <AuditLogTab />
              </TabsContent>
              <TabsContent value="api-access" className="mt-0 space-y-8">
                <ApiAccessTab />
              </TabsContent>
              <TabsContent value="profile" className="mt-0 space-y-8">
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
