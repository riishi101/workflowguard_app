import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ExternalLink } from "lucide-react";

const PlanBillingTab = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-12">
      {/* Trial Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-blue-900 font-semibold text-sm mb-3">
            You are currently on a 21-day free trial with access to Professional
            Plan features!
          </p>
          <p className="text-blue-800 text-sm">
            Trial ends in 5 days. Upgrade now to continue using WorkflowGuard.
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white h-12 px-8 text-base font-medium ml-8">
          Upgrade Now
        </Button>
      </div>

      {/* Current Subscription */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-8">
          <CardTitle className="tracking-tight text-lg font-semibold text-gray-900">
            Your Subscription Overview
          </CardTitle>
          <Button variant="outline" className="text-blue-600 h-12 px-8 text-base">
            Manage Subscription
          </Button>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Professional Plan</h3>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1"
                >
                  Trial
                </Badge>
              </div>
              <p className="text-gray-600 text-sm">
                $59/month (billed annually)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-12">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-700 font-medium">
                  Workflows Monitored
                </span>
                <span className="text-sm font-semibold text-gray-900">47/500</span>
              </div>
              <Progress value={9.4} className="h-3" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-700 font-medium">Version History</span>
                <span className="text-sm font-semibold text-gray-900">90 days retained</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-700 font-medium">Next billing on:</span>
                <span className="text-sm font-semibold text-gray-900">July 1, 2024</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Explore Other Plans */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-10">
          Explore Other Plans
        </h3>
        <div className="grid grid-cols-3 gap-10">
          {/* Starter Plan */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-col space-y-1.5 p-8 pb-8">
              <CardTitle className="tracking-tight text-lg font-semibold text-gray-900">
                Starter
              </CardTitle>
              <div className="text-3xl font-bold text-gray-900">
                $29<span className="text-lg font-normal text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Up to 25 workflows/month</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Basic Monitoring</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>30 days history</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Email Support</span>
                </div>
              </div>
              <Button variant="outline" className="w-full h-12 text-base font-medium">
                Select Plan
              </Button>
            </CardContent>
          </Card>

          {/* Professional Plan */}
          <Card className="border-blue-500 border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-col space-y-1.5 p-8 pb-8">
              <CardTitle className="tracking-tight text-lg font-semibold text-gray-900">
                Professional
              </CardTitle>
              <div className="text-3xl font-bold text-gray-900">
                $59<span className="text-lg font-normal text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Up to 500 workflows/month</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Advanced Monitoring</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>90 days history</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Priority Support</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Custom Notifications</span>
                </div>
              </div>
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 text-base font-medium">
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-col space-y-1.5 p-8 pb-8">
              <CardTitle className="tracking-tight text-lg font-semibold text-gray-900">
                Enterprise
              </CardTitle>
              <div className="text-3xl font-bold text-gray-900">
                $99<span className="text-lg font-normal text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Unlimited workflows</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Advanced Monitoring</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Unlimited history</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>API Access</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>User Permissions</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Audit Logs</span>
                </div>
              </div>
              <Button variant="outline" className="w-full h-12 text-base font-medium">
                Select Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Manage Your Subscription & Plan */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col space-y-1.5 p-8 pb-8">
          <CardTitle className="tracking-tight text-lg font-semibold text-gray-900">
            Manage Your Subscription & Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <p className="text-sm text-gray-600 mb-8 leading-relaxed">
            To change your plan, update payment methods, or manage your
            subscription details, you will be redirected to your HubSpot
            account.
          </p>
          <Button
            onClick={() => navigate("/manage-subscription")}
            className="bg-blue-500 hover:bg-blue-600 text-white h-12 px-8 text-base font-medium"
          >
            <span>Manage Subscription in HubSpot</span>
            <ExternalLink className="w-5 h-5 ml-3" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanBillingTab;
