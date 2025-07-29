import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopNavigation from "@/components/TopNavigation";
import Footer from "@/components/Footer";
import {
  Bell,
  CreditCard,
  FileText,
  Code,
  Users,
  CircleUser,
} from "lucide-react";
import PlanBillingTab from "@/components/settings/PlanBillingTab";
import ProfileTab from "@/components/settings/ProfileTab";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("plan-billing");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavigation />

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            App Settings
          </h1>
          <p className="text-gray-600 text-sm">
            Manage app-level configurations, subscriptions, and user access for
            WorkflowGuard.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gray-50 p-2 rounded-xl mb-10 shadow-sm border border-gray-200">
            <TabsTrigger
              value="plan-billing"
              className="flex items-center gap-3 text-sm font-medium py-4 px-6 rounded-lg transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200"
            >
              <CreditCard className="w-5 h-5" />
              My Plan & Billing
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-3 text-sm font-medium py-4 px-6 rounded-lg transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200"
            >
              <Bell className="w-5 h-5" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="user-permissions"
              className="flex items-center gap-3 text-sm font-medium py-4 px-6 rounded-lg transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200"
            >
              <Users className="w-5 h-5" />
              User Permissions
            </TabsTrigger>
            <TabsTrigger
              value="audit-log"
              className="flex items-center gap-3 text-sm font-medium py-4 px-6 rounded-lg transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200"
            >
              <FileText className="w-5 h-5" />
              Audit Log
            </TabsTrigger>
            <TabsTrigger
              value="api-access"
              className="flex items-center gap-3 text-sm font-medium py-4 px-6 rounded-lg transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200"
            >
              <Code className="w-5 h-5" />
              API Access
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="flex items-center gap-3 text-sm font-medium py-4 px-6 rounded-lg transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200"
            >
              <CircleUser className="w-5 h-5" />
              My Profile
            </TabsTrigger>
          </TabsList>

          <div className="mt-10">
            <TabsContent value="plan-billing">
              <PlanBillingTab />
            </TabsContent>
            <TabsContent value="notifications">
              <div className="space-y-12">
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Notification Settings
                  </h3>
                  <p className="text-sm text-gray-600">
                    Configure how you receive notifications about workflow changes.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="user-permissions">
              <div className="space-y-12">
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    User Permissions
                  </h3>
                  <p className="text-sm text-gray-600">
                    Manage user access and permissions for your WorkflowGuard account.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="audit-log">
              <div className="space-y-12">
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Audit Log
                  </h3>
                  <p className="text-sm text-gray-600">
                    View detailed logs of all activities and changes in your account.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="api-access">
              <div className="space-y-12">
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    API Access
                  </h3>
                  <p className="text-sm text-gray-600">
                    Manage API keys and access for programmatic integration.
                  </p>
                </div>
              </div>
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
