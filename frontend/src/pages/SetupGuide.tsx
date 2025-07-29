import { useNavigate } from "react-router-dom";
import ContentPageHeader from "@/components/ContentPageHeader";
import Footer from "@/components/Footer";
import { LAYOUT, TYPOGRAPHY, COLORS } from "@/lib/layout-constants";
import { Lightbulb } from "lucide-react";

const SetupGuide = () => {
  const navigate = useNavigate();

  return (
    <div className={`${LAYOUT.pageMinHeight} ${LAYOUT.pageBackground} ${LAYOUT.pageLayout}`}>
      <ContentPageHeader />

      <main className={`${LAYOUT.contentMaxWidth} mx-auto ${LAYOUT.containerPadding} ${LAYOUT.contentSpacing} flex-1`}>
        <div className={TYPOGRAPHY.sectionMargin}>
          <h1 className={`${TYPOGRAPHY.pageTitle} ${TYPOGRAPHY.titleMargin}`}>
            HubSpot Setup Guide: Get Started with WorkflowGuard
          </h1>
          <p className={`${TYPOGRAPHY.pageDescription} max-w-3xl`}>
            This guide will walk you through the essential steps to connect your
            HubSpot account and begin protecting your invaluable workflows with
            WorkflowGuard's robust version control and monitoring features.
          </p>
          <p className={`${TYPOGRAPHY.helperText} mt-2`}>Updated May 24, 2024</p>
        </div>

        {/* Steps */}
        <div className="space-y-12">
          {/* Step 1: Welcome */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                1
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Welcome to WorkflowGuard!
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Congratulations on installing WorkflowGuard! We're excited to
                help you safeguard your HubSpot automations. Let's get your
                account connected.
              </p>

              {/* Quick Tip */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 text-sm mb-1">
                      Quick Tip
                    </h3>
                    <p className="text-sm text-blue-800">
                      Make sure you have the necessary permissions to access
                      workflows in your HubSpot account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Connect HubSpot Account */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                2
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Connect Your HubSpot Account
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                To begin monitoring your HubSpot workflows, you need to grant
                WorkflowGuard access to your HubSpot portal. This allows us to
                read your workflow definitions for versioning and to perform
                rollbacks when needed.
              </p>

              {/* Mockup Image Placeholder */}
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-8 text-center">
                <div className="bg-white rounded-lg shadow-sm border p-6 max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-sm">
                      W
                    </div>
                    <span className="text-lg">+</span>
                    <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-sm">
                      H
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    WorkflowGuard + HubSpot
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose an account
                  </p>
                  <div className="space-y-2 text-left">
                    <div className="bg-gray-50 p-2 rounded text-xs">
                      Account Information
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-xs">
                      Workflow Management
                    </div>
                  </div>
                  <button className="w-full bg-orange-500 text-white py-2 px-4 rounded text-sm font-medium mt-4">
                    Connect
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Grant Permissions */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                3
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Grant WorkflowGuard Permissions
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                After clicking "Connect to HubSpot" in the previous step, you'll
                be redirected to HubSpot's authorization screen. Here, you'll
                select the HubSpot account you wish to connect and approve the
                necessary permissions for WorkflowGuard to operate.
              </p>

              {/* Mockup Image Placeholder */}
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-8 text-center">
                <div className="bg-white rounded-lg shadow-sm border p-6 max-w-lg mx-auto">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-sm">
                      W
                    </div>
                    <span className="text-lg">+</span>
                    <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-sm">
                      H
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    WorkflowGuard + HubSpot
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    WorkflowGuard is requesting permission to access
                  </p>
                  <div className="space-y-3 text-left mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Read your workflows</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Update your workflows</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Read contact data</span>
                    </div>
                  </div>
                  <button className="w-full bg-orange-500 text-white py-2 px-4 rounded text-sm font-medium">
                    Grant access
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Account Connected */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                4
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Your HubSpot Account is Connected!
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Great job! Your HubSpot account is now linked with
                WorkflowGuard. You'll automatically see all available workflows
                from your connected HubSpot portal. Now, simply select the
                workflows you wish to protect and begin monitoring.
              </p>

              {/* Mockup Image Placeholder */}
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Select Workflows to Protect
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose the workflows you want WorkflowGuard to monitor and
                    protect from your available workflows below.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded">
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          Lead Nurturing Campaign
                        </div>
                        <div className="text-xs text-gray-500">
                          Marketing | Active | Last modified today
                        </div>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded">
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          Customer Onboarding
                        </div>
                        <div className="text-xs text-gray-500">
                          Sales Automation | Active | Last modified yesterday
                        </div>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded">
                      <input type="checkbox" readOnly className="w-4 h-4" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          Deal Pipeline Automation
                        </div>
                        <div className="text-xs text-gray-500">
                          Sales | Active | Last modified 2 days ago
                        </div>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Active
                      </span>
                    </div>
                  </div>
                  <button className="w-full bg-blue-500 text-white py-2 px-4 rounded text-sm font-medium mt-4">
                    Start Protecting Workflows
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5: Manage Connected Portals */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                5
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Manage Your Connected HubSpot Portals
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                You can always review and manage your connected HubSpot accounts
                directly within WorkflowGuard's profile settings. This section
                allows you to check connection status, disconnect, or reconnect
                to HubSpot if needed.
              </p>

              {/* Mockup Image Placeholder */}
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    App Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Personal Details
                      </h4>
                      <div className="text-sm text-gray-600">
                        Update your account information
                      </div>
                    </div>
                    <div className="border-b pb-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        HubSpot Account Connection
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Connected</span>
                        <span className="text-sm text-gray-500">
                          • Last connected: 2025-07-15 10:30 AM
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Portal ID: 243112608</div>
                        <div>Connected as: john.smith@example.com</div>
                        <div>Role: Admin</div>
                      </div>
                      <button className="text-sm text-red-600 hover:text-red-700 mt-2">
                        Disconnect HubSpot
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SetupGuide;
