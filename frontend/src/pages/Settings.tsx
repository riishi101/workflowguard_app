import { useState } from "react";
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
  const [activeTab, setActiveTab] = useState("billing");

  const tabs = [
    { id: "billing", label: "My Plan & Billing" },
    { id: "notifications", label: "Notifications" },
    { id: "permissions", label: "User Permissions" },
    { id: "audit", label: "Audit Log" },
    { id: "api", label: "API Access" },
    { id: "profile", label: "My Profile" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "billing":
        return (
          <div className="space-y-6">
            {/* Trial Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-1">
                      🎉 You're on a Professional Trial!
                    </h3>
                    <p className="text-sm text-blue-700 mb-2">
                      Enjoy full access to Professional Plan features for 21 days
                    </p>
                    <div className="flex items-center gap-4 text-xs text-blue-600">
                      <span>⏰ Trial ends in 5 days</span>
                      <span>📊 47/500 workflows used</span>
                      <span>💳 No credit card required</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Upgrade Now
                  </Button>
                  <Button variant="outline" size="sm">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>

            {/* Subscription Overview */}
            <div className="bg-white border border-gray-200 rounded-lg mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Your Subscription Overview</h3>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-1">Professional Plan</h4>
                    <p className="text-lg text-gray-700 font-medium mb-1">$59/month</p>
                    <p className="text-sm text-gray-500">Billed annually • Trial Plan</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Next billing</div>
                    <div className="text-lg font-semibold text-gray-900">July 1, 2024</div>
                    <div className="text-xs text-gray-500">Auto-renewal enabled</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Workflows Monitored</span>
                      <span className="text-sm font-semibold text-gray-900">47 / 500</span>
                    </div>
                    <Progress value={9.4} className="w-full h-2 bg-gray-200" />
                    <div className="text-xs text-gray-500 mt-1">9.4% of your limit used</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">90</div>
                      <div className="text-xs text-gray-600">Days History</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">24/7</div>
                      <div className="text-xs text-gray-600">Support</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">Unlimited</div>
                      <div className="text-xs text-gray-600">API Calls</div>
                    </div>
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
                  <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Check className="w-6 h-6 text-gray-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Starter</h3>
                      <div className="flex items-baseline justify-center space-x-1 mb-1">
                        <span className="text-3xl font-bold text-gray-900">$29</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      <p className="text-sm text-gray-500">Perfect for small teams</p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Up to 25 workflows/month</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Basic monitoring & alerts</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">30 days version history</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Email support</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Basic integrations</span>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white">
                      Select Starter Plan
                    </Button>
                  </div>

                  {/* Professional Plan */}
                  <div className="bg-white border-2 border-blue-500 rounded-lg p-6 ring-4 ring-blue-100 relative hover:shadow-lg transition-shadow">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white px-3 py-1">Current Plan</Badge>
                    </div>
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Check className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional</h3>
                      <div className="flex items-baseline justify-center space-x-1 mb-1">
                        <span className="text-3xl font-bold text-gray-900">$59</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      <p className="text-sm text-gray-500">Most popular choice</p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Up to 500 workflows/month</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Advanced monitoring & analytics</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">90 days version history</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Priority support</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Custom notifications</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Advanced integrations</span>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled>
                      Current Plan
                    </Button>
                  </div>

                  {/* Enterprise Plan */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Check className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise</h3>
                      <div className="flex items-baseline justify-center space-x-1 mb-1">
                        <span className="text-3xl font-bold text-gray-900">$99</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      <p className="text-sm text-gray-500">For large organizations</p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Unlimited workflows</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Advanced monitoring & analytics</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Unlimited version history</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">24/7 dedicated support</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Full API access</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Advanced user permissions</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Comprehensive audit logs</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Custom integrations</span>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Select Enterprise Plan
                    </Button>
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
        );
      case "notifications":
        return (
          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600 mt-1">Configure how you receive email notifications</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Workflow Changes</h4>
                    <p className="text-sm text-gray-600">Get notified when workflows are modified</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600">Enabled</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Version History</h4>
                    <p className="text-sm text-gray-600">Notifications for version rollbacks</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600">Enabled</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">System Alerts</h4>
                    <p className="text-sm text-gray-600">Critical system notifications</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600">Disabled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* In-App Notifications */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">In-App Notifications</h3>
                <p className="text-sm text-gray-600 mt-1">Manage notifications within the application</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Real-time Updates</h4>
                    <p className="text-sm text-gray-600">Show live workflow status changes</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600">Enabled</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Sound Alerts</h4>
                    <p className="text-sm text-gray-600">Play sounds for important notifications</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600">Disabled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Schedule */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Notification Schedule</h3>
                <p className="text-sm text-gray-600 mt-1">Set when you want to receive notifications</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Business Hours</h4>
                    <p className="text-sm text-gray-600">9:00 AM - 6:00 PM (EST)</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Weekend Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications on weekends</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600">Disabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "permissions":
        return (
          <div className="space-y-6">
            {/* Current User Role */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Your Role</h3>
                <p className="text-sm text-gray-600 mt-1">Your current permissions and access level</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Administrator</h4>
                    <p className="text-sm text-gray-600">Full access to all features and settings</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Manage workflows and versions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Access billing and subscription</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">View audit logs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Manage API access</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                  <Button size="sm">Add Member</Button>
                </div>
                <p className="text-sm text-gray-600 mt-1">Manage team access and permissions</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">SJ</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Sarah Johnson</h4>
                      <p className="text-sm text-gray-600">sarah.johnson@company.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Editor</Badge>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">MW</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Mike Wilson</h4>
                      <p className="text-sm text-gray-600">mike.wilson@company.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Viewer</Badge>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Permission Levels */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Permission Levels</h3>
                <p className="text-sm text-gray-600 mt-1">Available roles and their capabilities</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Administrator</h4>
                    <Badge className="bg-blue-100 text-blue-800">Full Access</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Complete control over all features and settings</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>✓ Manage workflows</div>
                    <div>✓ Billing access</div>
                    <div>✓ User management</div>
                    <div>✓ API access</div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Editor</h4>
                    <Badge className="bg-green-100 text-green-800">Limited</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Can modify workflows but cannot manage billing</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>✓ Edit workflows</div>
                    <div>✗ No billing</div>
                    <div>✗ No user management</div>
                    <div>✗ No API access</div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Viewer</h4>
                    <Badge className="bg-gray-100 text-gray-800">Read Only</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Can view workflows but cannot make changes</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>✓ View workflows</div>
                    <div>✗ No editing</div>
                    <div>✗ No billing</div>
                    <div>✗ No API access</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "audit":
        return (
          <div className="space-y-6">
            {/* Audit Log Header */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Audit Log</h3>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">Export</Button>
                    <Button variant="outline" size="sm">Filter</Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">Track all system activities and user actions</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Recent Activity */}
                  <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Workflow Modified</h4>
                        <p className="text-sm text-gray-600">Customer Onboarding workflow was updated</p>
                        <p className="text-xs text-gray-500">by Sarah Johnson • 2 minutes ago</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Modified</Badge>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4 py-3 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Version Rollback</h4>
                        <p className="text-sm text-gray-600">Sales Outreach Sequence rolled back to v2.1</p>
                        <p className="text-xs text-gray-500">by John Smith • 15 minutes ago</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Rollback</Badge>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-purple-500 pl-4 py-3 bg-purple-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">User Login</h4>
                        <p className="text-sm text-gray-600">Mike Wilson logged in from 192.168.1.100</p>
                        <p className="text-xs text-gray-500">• 1 hour ago</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">Login</Badge>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-orange-500 pl-4 py-3 bg-orange-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">API Access</h4>
                        <p className="text-sm text-gray-600">API key was generated for external integration</p>
                        <p className="text-xs text-gray-500">by John Smith • 2 hours ago</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">API</Badge>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-gray-500 pl-4 py-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Settings Updated</h4>
                        <p className="text-sm text-gray-600">Notification preferences were modified</p>
                        <p className="text-xs text-gray-500">by Sarah Johnson • 3 hours ago</p>
                      </div>
                      <Badge className="bg-gray-100 text-gray-800">Settings</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Activity Summary</h3>
                <p className="text-sm text-gray-600 mt-1">Last 30 days activity overview</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">47</div>
                    <div className="text-sm text-gray-600">Workflow Changes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-sm text-gray-600">Version Rollbacks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">156</div>
                    <div className="text-sm text-gray-600">User Logins</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Options */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Filter Options</h3>
                <p className="text-sm text-gray-600 mt-1">Customize your audit log view</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option>All Activities</option>
                      <option>Workflow Changes</option>
                      <option>Version Rollbacks</option>
                      <option>User Logins</option>
                      <option>API Access</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option>Last 24 hours</option>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-600">Include system events</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "api":
        return (
          <div className="space-y-6">
            {/* API Keys */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
                  <Button size="sm">Generate New Key</Button>
                </div>
                <p className="text-sm text-gray-600 mt-1">Manage your API keys for external integrations</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Production API Key</h4>
                      <p className="text-sm text-gray-600">Used for live workflow monitoring</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                      <Button variant="outline" size="sm">Regenerate</Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-gray-700 font-mono">sk_live_1234567890abcdef...</code>
                      <Button variant="outline" size="sm">Copy</Button>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Created: March 15, 2024 • Last used: 2 hours ago
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Development API Key</h4>
                      <p className="text-sm text-gray-600">Used for testing and development</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-yellow-100 text-yellow-800">Limited</Badge>
                      <Button variant="outline" size="sm">Regenerate</Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-gray-700 font-mono">sk_test_abcdef1234567890...</code>
                      <Button variant="outline" size="sm">Copy</Button>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Created: March 10, 2024 • Last used: 1 day ago
                  </div>
                </div>
              </div>
            </div>

            {/* API Usage */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">API Usage</h3>
                <p className="text-sm text-gray-600 mt-1">Monitor your API usage and limits</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">1,247</div>
                    <div className="text-sm text-gray-600">Requests Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">99.2%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">45ms</div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rate Limit</span>
                    <span className="text-sm font-medium text-gray-900">1,000 requests/hour</span>
                  </div>
                  <Progress value={75} className="w-full h-2 bg-gray-200" />
                  <div className="text-xs text-gray-500">750 requests used this hour</div>
                </div>
              </div>
            </div>

            {/* API Documentation */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">API Documentation</h3>
                <p className="text-sm text-gray-600 mt-1">Resources to help you integrate with WorkflowGuard</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">REST API Reference</h4>
                    <p className="text-sm text-gray-600">Complete API documentation and examples</p>
                  </div>
                  <Button variant="outline" size="sm">View Docs</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">SDK Libraries</h4>
                    <p className="text-sm text-gray-600">Official SDKs for popular programming languages</p>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Webhook Setup</h4>
                    <p className="text-sm text-gray-600">Configure webhooks for real-time notifications</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                <p className="text-sm text-gray-600 mt-1">Configure API security and access controls</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">IP Whitelist</h4>
                    <p className="text-sm text-gray-600">Restrict API access to specific IP addresses</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600">Enabled</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Request Logging</h4>
                    <p className="text-sm text-gray-600">Log all API requests for debugging</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600">Enabled</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Auto-expire Keys</h4>
                    <p className="text-sm text-gray-600">Automatically expire unused API keys</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600">Disabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "profile":
        return (
          <div className="space-y-6">
            {/* Profile Information */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                <p className="text-sm text-gray-600 mt-1">Update your personal information and preferences</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">JS</span>
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Photo</Button>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input type="text" defaultValue="John" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input type="text" defaultValue="Smith" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input type="email" defaultValue="john.smith@company.com" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                  <input type="text" defaultValue="Marketing Manager" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input type="text" defaultValue="Acme Corporation" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
                <p className="text-sm text-gray-600 mt-1">Manage your account preferences and security</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600">Enabled</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive email updates about your account</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600">Enabled</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Marketing Communications</h4>
                    <p className="text-sm text-gray-600">Receive updates about new features and offers</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600">Disabled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
                <p className="text-sm text-gray-600 mt-1">Customize your WorkflowGuard experience</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <option>Eastern Time (ET)</option>
                    <option>Central Time (CT)</option>
                    <option>Mountain Time (MT)</option>
                    <option>Pacific Time (PT)</option>
                    <option>UTC</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white border border-red-200 rounded-lg">
              <div className="px-6 py-4 border-b border-red-200">
                <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
                <p className="text-sm text-red-600 mt-1">Irreversible and destructive actions</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Delete Account</h4>
                    <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" size="sm">Delete Account</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Export Data</h4>
                    <p className="text-sm text-gray-600">Download all your data before deletion</p>
                  </div>
                  <Button variant="outline" size="sm">Export Data</Button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Settings; 