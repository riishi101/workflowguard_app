import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ExternalLink } from "lucide-react";

const PlanBillingTab = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Trial Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-blue-900 font-medium text-sm">
            You are currently on a 21-day free trial with access to Professional
            Plan features!
          </p>
          <p className="text-blue-800 text-sm">
            Trial ends in 5 days. Upgrade now to continue using WorkflowGuard.
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          Upgrade Now
        </Button>
      </div>

      {/* Current Subscription */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Your Subscription Overview
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold">Professional Plan</h4>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800"
            >
              Trial
            </Badge>
          </div>
          <p className="text-gray-600 text-sm">
            $49/month (billed annually)
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Workflows Monitored
                </span>
                <span className="text-sm font-medium">47/25</span>
              </div>
              <Progress value={188} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Version History</span>
                <span className="text-sm font-medium">90 days retained</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Next billing on:</span>
                <span className="text-sm font-medium">July 1, 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explore Other Plans */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Explore Other Plans
        </h3>
        <div className="grid grid-cols-3 gap-6">
          {/* Starter Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Starter</CardTitle>
              <div className="text-3xl font-bold">
                $19<span className="text-base font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Up to 5 workflows</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Workflow Selection</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Dashboard Overview</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Basic Version History</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Simple Comparison</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Basic Restore</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Email Support</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Basic Settings</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <strong>Limitations:</strong> 30 days version history, Basic comparison only
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Select Plan
              </Button>
            </CardContent>
          </Card>

          {/* Professional Plan */}
          <Card className="border-blue-500 border-2">
            <CardHeader>
              <CardTitle className="text-xl">Professional</CardTitle>
              <div className="text-3xl font-bold">
                $49<span className="text-base font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Up to 25 workflows</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Enhanced Dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Advanced Workflow History</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Improved Comparison</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Team Management</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Audit Log</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>API Access</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Enhanced Settings</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Priority Support</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <strong>Limitations:</strong> 90 days version history, Up to 5 team members
                </div>
              </div>
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Enterprise</CardTitle>
              <div className="text-3xl font-bold">
                $99<span className="text-base font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Unlimited workflows</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Extended History</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Advanced Analytics</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Unlimited Team</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Extended Audit Log</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Dedicated Support</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>All Settings Features</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Advanced Comparison</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <strong>Limitations:</strong> 1 year version history, All features unlocked
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Select Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Manage Your Subscription & Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Your Subscription & Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            To change your plan, update payment methods, or manage your
            subscription details, you will be redirected to your HubSpot
            account.
          </p>
          <Button
            onClick={() => navigate("/manage-subscription")}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <span>Manage Subscription in HubSpot</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanBillingTab;
