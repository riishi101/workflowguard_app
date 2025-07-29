import { useState } from "react";
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
import NotificationsTab from "@/components/settings/NotificationsTab";
import UserPermissionsTab from "@/components/settings/UserPermissionsTab";
import AuditLogTab from "@/components/settings/AuditLogTab";
import ApiAccessTab from "@/components/settings/ApiAccessTab";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("plan-billing");

  const tabs = [
    { id: "plan-billing", label: "My Plan & Billing", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "user-permissions", label: "User Permissions", icon: Users },
    { id: "audit-log", label: "Audit Log", icon: FileText },
    { id: "api-access", label: "API Access", icon: Code },
    { id: "profile", label: "My Profile", icon: CircleUser },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "plan-billing":
        return <PlanBillingTab />;
      case "notifications":
        return <NotificationsTab />;
      case "user-permissions":
        return <UserPermissionsTab />;
      case "audit-log":
        return <AuditLogTab />;
      case "api-access":
        return <ApiAccessTab />;
      case "profile":
        return <ProfileTab />;
      default:
        return <PlanBillingTab />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavigation />

      {/* Main Content */}
      <div className="max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">App Settings</h1>
          <p className="text-gray-600 text-sm">
            Manage app-level configurations, subscriptions, and user access for
            WorkflowGuard.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`border-b-2 py-2 px-1 text-sm font-medium flex items-center gap-2 transition-colors duration-200 ${
                      isActive
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-6">
          {renderTabContent()}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Settings;
