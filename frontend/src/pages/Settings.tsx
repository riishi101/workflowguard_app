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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gray-50 p-1 rounded-lg mb-8">
            <TabsTrigger
              value="plan-billing"
              className="flex items-center gap-2 text-sm"
            >
              <CreditCard className="w-4 h-4" />
              My Plan & Billing
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2 text-sm"
            >
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="user-permissions"
              className="flex items-center gap-2 text-sm"
            >
              <Users className="w-4 h-4" />
              User Permissions
            </TabsTrigger>
            <TabsTrigger
              value="audit-log"
              className="flex items-center gap-2 text-sm"
            >
              <FileText className="w-4 h-4" />
              Audit Log
            </TabsTrigger>
            <TabsTrigger
              value="api-access"
              className="flex items-center gap-2 text-sm"
            >
              <Code className="w-4 h-4" />
              API Access
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 text-sm"
            >
              <UserCircle className="w-4 h-4" />
              My Profile
            </TabsTrigger>
          </TabsList>

          <div className="w-full">
            <TabsContent value="plan-billing" className="mt-0">
              <PlanBillingTab />
            </TabsContent>
            <TabsContent value="notifications" className="mt-0">
              <NotificationsTab />
            </TabsContent>
            <TabsContent value="user-permissions" className="mt-0">
              <UserPermissionsTab />
            </TabsContent>
            <TabsContent value="audit-log" className="mt-0">
              <AuditLogTab />
            </TabsContent>
            <TabsContent value="api-access" className="mt-0">
              <ApiAccessTab />
            </TabsContent>
            <TabsContent value="profile" className="mt-0">
              <ProfileTab />
            </TabsContent>
          </div>
        </Tabs>
      </ContentSection>
    </MainAppLayout>
  );
};

export default Settings;
