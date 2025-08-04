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
      // Redirect to HubSpot billing instead of in-app upgrade
      const hubspotBillingUrl = `https://app.hubspot.com/billing/${planId}`;
      window.open(hubspotBillingUrl, '_blank');
      
      toast({
        title: "Redirecting to HubSpot",
        description: "You're being redirected to HubSpot to complete your subscription upgrade.",
      });
    } catch (error: any) {
      toast({
        title: "Upgrade Failed",
        description: "Failed to redirect to HubSpot billing. Please try again.",
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
    <div className="space-y-8">
      {/* Trial Banner */}
      {isTrialActive && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-2">
            <p className="text-blue-900 font-semibold text-base">
              You are currently on a 21-day free trial with access to Professional
              Plan features!
            </p>
            <p className="text-blue-800 text-sm">
              Trial ends in {trialDaysRemaining} days. Upgrade now to continue using WorkflowGuard.
            </p>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
            onClick={() => handleUpgrade('professional')}
          >
            Upgrade Now
          </Button>
        </div>
      )}

      {/* Your Subscription Overview */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Subscription Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Current Plan</p>
            <p className="text-lg font-semibold text-gray-900">Starter Plan</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Price</p>
            <p className="text-lg font-semibold text-gray-900">$19/month (billed annually)</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Workflows Monitored</p>
            <p className="text-lg font-semibold text-gray-900">0/5</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Version History</p>
            <p className="text-lg font-semibold text-gray-900">30 days retained</p>
          </div>
        </div>
      </div>

      {/* Explore Other Plans */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Explore Other Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Starter</h4>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">Current Plan</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-4">$19/month</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Up to 5 workflows
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Workflow Selection
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Dashboard Overview
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Basic Version History
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Manual Backups
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Basic Rollback
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Simple Comparison
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Email Support
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Basic Settings
              </li>
            </ul>
            <p className="text-xs text-gray-500 mb-4">30 days version history, Basic comparison only</p>
            <Button 
              variant="outline" 
              className="w-full" 
              disabled
            >
              Select Plan
            </Button>
          </div>

          {/* Professional Plan */}
          <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500 text-white px-3 py-1">Popular</Badge>
            </div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Professional</h4>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-4">$49/month</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Up to 25 workflows
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Enhanced Dashboard
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Complete Version History
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Automated Backups
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Change Notifications
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Advanced Rollback
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Side-by-side Comparisons
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Compliance Reporting
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Audit Trails
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Team Management
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                API Access
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Priority Support
              </li>
            </ul>
            <p className="text-xs text-gray-500 mb-4">90 days version history, Up to 5 team members</p>
            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => handleUpgrade('professional')}
            >
              Select Plan
            </Button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Enterprise</h4>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-4">$99/month</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Unlimited workflows
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Extended Version History
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Real-time Change Notifications
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Approval Workflows
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Advanced Compliance Reporting
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Complete Audit Trails
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Team Collaboration Features
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Custom Retention Policies
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Advanced Security Features
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Advanced Analytics
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Unlimited Team Members
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                White-label Options
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Dedicated Support
              </li>
            </ul>
            <p className="text-xs text-gray-500 mb-4">1 year version history, All features unlocked</p>
            <Button 
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              onClick={() => handleUpgrade('enterprise')}
            >
              Select Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Manage Your Subscription & Plan */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Your Subscription & Plan</h3>
        <p className="text-gray-600 mb-6">
          Your subscription is managed through HubSpot. To change your plan, update payment methods, 
          or manage your subscription details, you will be redirected to your HubSpot account billing section.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => window.open('https://app.hubspot.com/billing', '_blank')}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <span>Manage Subscription in HubSpot</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('https://app.hubspot.com/billing/payment-methods', '_blank')}
          >
            <span>Update Payment Methods</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('https://app.hubspot.com/billing/invoices', '_blank')}
          >
            <span>View Billing History</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanBillingTab;
