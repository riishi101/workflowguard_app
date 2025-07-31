import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ExternalLink, AlertTriangle } from "lucide-react";
import { ApiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const PlanBillingTab = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trialStatus, setTrialStatus] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trialResponse, usageResponse, subscriptionResponse] = await Promise.all([
          ApiService.getTrialStatus(),
          ApiService.getUsageStats(),
          ApiService.getSubscription()
        ]);

        setTrialStatus(trialResponse);
        setUsageStats(usageResponse);
        setSubscription(subscriptionResponse);
      } catch (error) {
        console.error('Failed to fetch subscription data:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription information.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleUpgrade = async (planId: string) => {
    try {
      await ApiService.upgradeSubscription(planId);
      toast({
        title: "Subscription Updated",
        description: "Your subscription has been successfully upgraded.",
      });
      // Refresh data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Upgrade Failed",
        description: error.response?.data?.message || "Failed to upgrade subscription.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isTrialActive = trialStatus?.isTrialActive;
  const trialDaysRemaining = trialStatus?.trialDaysRemaining || 0;
  const isTrialExpired = trialStatus?.isTrialExpired;

  return (
    <div className="space-y-6">
      {/* Trial Banner */}
      {isTrialActive && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-blue-900 font-medium text-sm">
              You are currently on a 21-day free trial with access to Professional
              Plan features!
            </p>
            <p className="text-blue-800 text-sm">
              Trial ends in {trialDaysRemaining} days. Upgrade now to continue using WorkflowGuard.
            </p>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleUpgrade('professional')}
          >
            Upgrade Now
          </Button>
        </div>
      )}

      {/* Trial Expired Banner */}
      {isTrialExpired && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-red-900 font-medium text-sm">
              Your trial has expired. Please upgrade to continue using WorkflowGuard.
            </p>
            <p className="text-red-800 text-sm">
              You can no longer access the app features until you upgrade.
            </p>
          </div>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => handleUpgrade('professional')}
          >
            Upgrade Now
          </Button>
        </div>
      )}

      {/* Current Subscription */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Your Subscription Overview
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold">
              {subscription?.plan === 'professional' ? 'Professional Plan' : 
               subscription?.plan === 'enterprise' ? 'Enterprise Plan' : 'Starter Plan'}
            </h4>
            {isTrialActive && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Trial
              </Badge>
            )}
            {isTrialExpired && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Expired
              </Badge>
            )}
          </div>
          
          <p className="text-gray-600 text-sm">
            ${subscription?.plan === 'professional' ? '49' : 
              subscription?.plan === 'enterprise' ? '99' : '19'}/month (billed annually)
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Workflows Monitored
                </span>
                <span className="text-sm font-medium">
                  {usageStats?.totalWorkflows || 0}/{usageStats?.workflowLimit || 5}
                </span>
              </div>
              <Progress 
                value={usageStats?.usagePercentage || 0} 
                className="h-2" 
              />
              {usageStats?.isOverLimit && (
                <p className="text-xs text-red-600 mt-1">
                  You've exceeded your plan limit
                </p>
              )}
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Version History</span>
                <span className="text-sm font-medium">
                  {subscription?.plan === 'enterprise' ? 'Unlimited' : 
                   subscription?.plan === 'professional' ? '90 days' : '30 days'} retained
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Next billing on:</span>
                <span className="text-sm font-medium">
                  {subscription?.nextBillingDate ? 
                    new Date(subscription.nextBillingDate).toLocaleDateString() : 
                    'Not set'}
                </span>
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
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">Starter</CardTitle>
              <div className="text-3xl font-bold">
                $19<span className="text-base font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 flex flex-col">
              <div className="space-y-2 flex-1">
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
              <Button 
                variant="outline" 
                className="w-full mt-auto"
                onClick={() => handleUpgrade('starter')}
                disabled={subscription?.plan === 'starter'}
              >
                {subscription?.plan === 'starter' ? 'Current Plan' : 'Select Plan'}
              </Button>
            </CardContent>
          </Card>

          {/* Professional Plan */}
          <Card className="border-blue-500 border-2 flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">Professional</CardTitle>
              <div className="text-3xl font-bold">
                $49<span className="text-base font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 flex flex-col">
              <div className="space-y-2 flex-1">
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
              <Button 
                className="w-full bg-blue-500 hover:bg-blue-600 mt-auto"
                onClick={() => handleUpgrade('professional')}
                disabled={subscription?.plan === 'professional'}
              >
                {subscription?.plan === 'professional' ? 'Current Plan' : 'Select Plan'}
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">Enterprise</CardTitle>
              <div className="text-3xl font-bold">
                $99<span className="text-base font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 flex flex-col">
              <div className="space-y-2 flex-1">
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
              <Button 
                variant="outline" 
                className="w-full mt-auto"
                onClick={() => handleUpgrade('enterprise')}
                disabled={subscription?.plan === 'enterprise'}
              >
                {subscription?.plan === 'enterprise' ? 'Current Plan' : 'Select Plan'}
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
