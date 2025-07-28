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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Subscription Overview</CardTitle>
          <Button variant="outline" className="text-blue-600">
            Manage Subscription
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Professional Plan</h3>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  Trial
                </Badge>
              </div>
              <p className="text-gray-600 text-sm">
                $59/month (billed annually)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Workflows Monitored
                </span>
                <span className="text-sm font-medium">47/500</span>
              </div>
              <Progress value={9.4} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Version History</span>
                <span className="text-sm font-medium">90 days retained</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Next billing on:</span>
                <span className="text-sm font-medium">July 1, 2024</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                $29<span className="text-base font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Up to 25 workflows/month</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Basic Monitoring</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>30 days history</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Email Support</span>
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
                $59<span className="text-base font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Up to 500 workflows/month</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Advanced Monitoring</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>90 days history</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Priority Support</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Custom Notifications</span>
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
                  <span>Advanced Monitoring</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Unlimited history</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>API Access</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>User Permissions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Audit Logs</span>
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
