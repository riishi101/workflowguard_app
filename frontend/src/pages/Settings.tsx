import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TopNavigation from "@/components/TopNavigation";
import Footer from "@/components/Footer";

const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            App Settings
          </h1>
        </div>

        {/* Tabs */}
        <div className="space-y-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="border-b-2 border-blue-600 py-2 px-1 text-sm font-medium text-blue-600">
                <span>My Plan & Billing</span>
              </button>
              <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Notifications
              </button>
              <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                User Permissions
              </button>
              <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Audit Log
              </button>
              <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                API Access
              </button>
              <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                My Profile
              </button>
            </nav>
          </div>

          {/* Billing Content */}
          <div className="space-y-6">
            {/* Trial Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Check className="w-3 h-3 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    You are currently on a 21-day free trial with access to
                    Professional Plan features!
                  </p>
                  <p className="text-xs text-blue-700">
                    Trial ends in 5 days. Upgrade now to continue using
                    WorkflowGuard.
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Overview */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Check className="w-4 h-4 text-blue-500" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">Professional Plan</div>
                <div className="text-base text-gray-700 font-medium mb-2">$59/month (billed annually)</div>
                <div className="text-sm text-gray-500 mb-4">Trial Plan</div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Workflows Monitored</span>
                    <span className="font-medium text-gray-900">47/500</span>
                  </div>
                  <Progress value={9.4} className="w-full h-2 bg-gray-200" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Version History</span>
                    <span className="font-medium text-gray-900">90 days retained</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Next billing on:</span>
                    <span className="font-medium text-gray-900">July 1, 2024</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Explore Other Plans */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Explore Other Plans
                  </h2>
                </div>
              </div>

              <div className="p-8 border-b border-gray-200">
                <div className="grid grid-cols-3 gap-6">
                  {/* Starter Plan */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Check className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">$29</div>
                      <div className="text-base text-gray-700 font-medium mb-4">Starter Plan</div>
                      <div className="text-sm text-gray-500 mb-4">/month</div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">Up to 25 workflows/month</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">Basic Monitoring</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">30 days history</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">Email Support</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Plan */}
                  <div className="bg-white border border-blue-200 rounded-lg p-6 ring-2 ring-blue-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Check className="w-4 h-4 text-blue-500" />
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">$59</div>
                      <div className="text-base text-gray-700 font-medium mb-4">Professional Plan</div>
                      <div className="text-sm text-gray-500 mb-4">/month</div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">Up to 500 workflows/month</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">Advanced Monitoring</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">90 days history</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">Priority Support</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">Custom Notifications</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enterprise Plan */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Check className="w-4 h-4 text-purple-500" />
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">$99</div>
                      <div className="text-base text-gray-700 font-medium mb-4">Enterprise Plan</div>
                      <div className="text-sm text-gray-500 mb-4">/month</div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">Unlimited workflows</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">Advanced Monitoring</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">Unlimited history</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">24/7 Support</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">API Access</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">User Permissions</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">Audit Logs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Manage Subscription */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Manage Your Subscription & Plan
                  </h2>
                </div>
              </div>
              <div className="p-8 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="relative flex-1 max-w-lg">
                    <p className="text-sm text-gray-600 mb-4">
                      To change your plan, update payment methods, or manage your
                      subscription details, you will be redirected to your HubSpot
                      account.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
                      <span>Manage Subscription in HubSpot</span>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Settings; 