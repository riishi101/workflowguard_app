import { useNavigate } from "react-router-dom";
import TopNavigation from "@/components/TopNavigation";
import Footer from "@/components/Footer";
import { HelpCircle, Settings, Lightbulb } from "lucide-react";

const SetupGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavigation />

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            HubSpot Setup Guide: Get Started with WorkflowGuard
          </h1>
          <p className="text-gray-600 text-sm">
            This guide will walk you through the essential steps to connect your
            HubSpot account and begin protecting your invaluable workflows with
            WorkflowGuard's robust version control and monitoring features.
          </p>
          <p className="text-xs text-gray-500 mt-2">Updated May 24, 2024</p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {/* Step 1: Welcome */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                1
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Welcome to WorkflowGuard!
              </h2>
              <p className="text-sm text-gray-600 mb-4">
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
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Connect Your HubSpot Account
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                The first step is to securely connect your HubSpot account to
                WorkflowGuard. This allows us to access and monitor your
                workflows.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">What happens during connection:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Secure OAuth authentication with HubSpot</li>
                  <li>• Read-only access to your workflows</li>
                  <li>• No modifications to your existing workflows</li>
                  <li>• Automatic workflow discovery and listing</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 3: Select Workflows */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                3
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Select Workflows to Protect
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Choose which workflows you want WorkflowGuard to monitor. You can
                select individual workflows or entire folders.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">Best Practices:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Start with critical workflows that handle customer data</li>
                  <li>• Include workflows with complex logic or frequent changes</li>
                  <li>• Consider workflows used by multiple team members</li>
                  <li>• Don't worry - you can add or remove workflows anytime</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 4: Configure Monitoring */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                4
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Configure Monitoring Settings
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Set up how WorkflowGuard should monitor your workflows. You can
                customize snapshot frequency and notification preferences.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 mb-2">Default Settings:</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Automatic snapshots on workflow changes</li>
                  <li>• Daily backup snapshots</li>
                  <li>• Email notifications for significant changes</li>
                  <li>• 90-day version history retention</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 5: Start Monitoring */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                5
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Start Monitoring and Protecting
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Once configured, WorkflowGuard will begin monitoring your selected
                workflows. You'll receive notifications about changes and can
                restore previous versions when needed.
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-medium text-purple-900 mb-2">What you'll get:</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Real-time change detection and alerts</li>
                  <li>• Complete version history for each workflow</li>
                  <li>• One-click rollback to previous versions</li>
                  <li>• Detailed change comparison tools</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/workflow-selection")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              Connect HubSpot Account
            </button>
            <button
              onClick={() => navigate("/help-support")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Need Help? Contact Support
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SetupGuide;
