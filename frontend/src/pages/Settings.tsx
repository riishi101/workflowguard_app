import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopNavigation from "@/components/TopNavigation";
import Footer from "@/components/Footer";
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
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavigation />

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            App Settings
          </h1>
          <p className="text-gray-600 text-sm">
            Manage app-level configurations, subscriptions, and user access for
            WorkflowGuard.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gray-50 p-1 rounded-lg mb-6">
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

          <div className="mt-6">
            <TabsContent value="plan-billing">
              <PlanBillingTab />
            </TabsContent>
            <TabsContent value="notifications">
              <NotificationsTab />
            </TabsContent>
            <TabsContent value="user-permissions">
              <UserPermissionsTab />
            </TabsContent>
            <TabsContent value="audit-log">
              <AuditLogTab />
            </TabsContent>
            <TabsContent value="api-access">
              <ApiAccessTab />
            </TabsContent>
            <TabsContent value="profile">
              <ProfileTab />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
