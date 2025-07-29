import { useState } from "react";
import TopNavigation from "@/components/TopNavigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, ExternalLink } from "lucide-react";
import NotificationsTab from "@/components/settings/NotificationsTab";
import UserPermissionsTab from "@/components/settings/UserPermissionsTab";
import AuditLogTab from "@/components/settings/AuditLogTab";
import ApiAccessTab from "@/components/settings/ApiAccessTab";
import ProfileTab from "@/components/settings/ProfileTab";

const Settings = () => {

    const renderContent = () => {
        return (
          <>
                      {/* Trial Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between mb-8">
              <div>
                <p className="text-blue-900 font-medium">
                  You are currently on a 21-day free trial with access to
                  Professional Plan features!
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  Trial ends in 5 days. Upgrade now to continue using
                  WorkflowGuard.
                </p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Upgrade Now
              </Button>
            </div>

            {/* Subscription Overview */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Your Subscription Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">
                      Professional Plan
                    </h3>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                    >
                      Trial
                    </Badge>
                  </div>
                </div>

                <p className="text-gray-600">$59/month (billed annually)</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Workflows Monitored</span>
                    <span className="font-medium">47/500</span>
                  </div>
                  <Progress value={9.4} className="w-full h-2 bg-gray-200" />

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Version History</span>
                    <span className="font-medium">90 days retained</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Next billing on:</span>
                    <span className="font-medium">July 1, 2024</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Explore Other Plans */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Explore Other Plans
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Starter Plan */}
                <Card className="relative flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">Starter</CardTitle>
                    <div className="space-y-2">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-bold">$29</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="space-y-3 flex-grow">
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          Up to 25 workflows/month
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          Basic Monitoring
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          30 days history
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          Email Support
                        </span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full mt-8">
                      Select Plan
                    </Button>
                  </CardContent>
                </Card>

                {/* Professional Plan */}
                <Card className="relative border-blue-200 ring-2 ring-blue-100 flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">Professional</CardTitle>
                    <div className="space-y-2">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-bold">$59</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="space-y-3 flex-grow">
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          Up to 500 workflows/month
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          Advanced Monitoring
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          90 days history
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          Priority Support
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          Custom Notifications
                        </span>
                      </div>
                    </div>

                    <Button className="w-full mt-8 bg-blue-600 hover:bg-blue-700">
                      Current Plan
                    </Button>
                  </CardContent>
                </Card>

                {/* Enterprise Plan */}
                <Card className="relative flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">Enterprise</CardTitle>
                    <div className="space-y-2">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-bold">$99</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="space-y-3 flex-grow">
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          Unlimited workflows
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          Advanced Monitoring
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          Unlimited history
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          24/7 Support
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          API Access
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          User Permissions
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          Audit Logs
                        </span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full mt-8">
                      Select Plan
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Manage Subscription */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Manage Your Subscription & Plan</CardTitle>
                <CardDescription>
                  To change your plan, update payment methods, or manage your
                  subscription details, you will be redirected to your HubSpot
                  account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
                  <span>Manage Subscription in HubSpot</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </>
        );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavigation />

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            App Settings
          </h1>
        </div>

        {/* Content */}
        {renderContent()}
      </main>

      <Footer />
    </div>
  );
};

export default Settings; 