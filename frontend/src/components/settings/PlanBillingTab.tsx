import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ExternalLink, AlertTriangle, Star, Zap, Shield } from "lucide-react";
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
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-24 bg-gray-200 rounded-xl mb-8"></div>
          <div className="h-40 bg-gray-200 rounded-xl mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-xl"></div>
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 flex items-center justify-between shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" />
              <p className="text-blue-900 font-semibold text-lg">
                You are currently on a 21-day free trial with access to Professional Plan features!
              </p>
            </div>
            <p className="text-blue-800 text-base">
              Trial ends in <span className="font-semibold">{trialDaysRemaining} days</span>. Upgrade now to continue using WorkflowGuard.
            </p>
          </div>
          <Button 
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl shadow-lg"
            onClick={() => handleUpgrade('professional')}
          >
            Upgrade Now
          </Button>
        </div>
      )}

      {/* Your Subscription Overview */}
      <Card className="bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Your Subscription Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Current Plan</p>
              <p className="text-xl font-bold text-gray-900">Starter Plan</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Price</p>
              <p className="text-xl font-bold text-gray-900">$19/month</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Workflows Monitored</p>
              <p className="text-xl font-bold text-gray-900">0/5</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Version History</p>
              <p className="text-xl font-bold text-gray-900">30 days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Explore Other Plans */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Explore Other Plans</h3>
          <p className="text-gray-600">Choose the perfect plan for your workflow protection needs</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <Card className="relative bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-xl font-bold text-gray-900">Starter</CardTitle>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">Current Plan</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-gray-900">$19</p>
                <p className="text-gray-600">per month</p>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-3 mb-6 flex-1">
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Up to 5 workflows
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Workflow Selection
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Dashboard Overview
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Basic Version History
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Manual Backups
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Basic Rollback
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Simple Comparison
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Email Support
                </li>
              </ul>
              <div className="mt-auto space-y-3">
                <p className="text-xs text-gray-500">30 days version history, Basic comparison only</p>
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-gray-600 border-gray-300 hover:bg-gray-50" 
                  disabled
                >
                  Current Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Professional Plan */}
          <Card className="relative bg-white border-2 border-blue-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col transform scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
                <Star className="w-3 h-3 mr-1" />
                Popular
              </Badge>
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-xl font-bold text-gray-900">Professional</CardTitle>
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-gray-900">$49</p>
                <p className="text-gray-600">per month</p>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-3 mb-6 flex-1">
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Up to 25 workflows
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Enhanced Dashboard
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Complete Version History
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Automated Backups
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Change Notifications
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Advanced Rollback
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Side-by-side Comparisons
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Compliance Reporting
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Audit Trails
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Team Management
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  API Access
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Priority Support
                </li>
              </ul>
              <div className="mt-auto space-y-3">
                <p className="text-xs text-gray-500">90 days version history, Up to 5 team members</p>
                <Button 
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                  onClick={() => handleUpgrade('professional')}
                >
                  Select Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="relative bg-white border-2 border-gray-300 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-xl font-bold text-gray-900">Enterprise</CardTitle>
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-gray-900">$99</p>
                <p className="text-gray-600">per month</p>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-3 mb-6 flex-1">
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Unlimited workflows
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Extended Version History
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Real-time Change Notifications
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Approval Workflows
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Advanced Compliance Reporting
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Complete Audit Trails
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Team Collaboration Features
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Custom Retention Policies
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Advanced Security Features
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Advanced Analytics
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Unlimited Team Members
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  White-label Options
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Dedicated Support
                </li>
              </ul>
              <div className="mt-auto space-y-3">
                <p className="text-xs text-gray-500">1 year version history, All features unlocked</p>
                <Button 
                  className="w-full h-12 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white shadow-lg"
                  onClick={() => handleUpgrade('enterprise')}
                >
                  Select Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Manage Your Subscription & Plan */}
      <Card className="bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Manage Your Subscription & Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6 text-base">
            Your subscription is managed through HubSpot. To change your plan, update payment methods, 
            or manage your subscription details, you will be redirected to your HubSpot account billing section.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => window.open('https://app.hubspot.com/billing', '_blank')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg"
            >
              <span>Manage Subscription in HubSpot</span>
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://app.hubspot.com/billing/payment-methods', '_blank')}
              className="border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-xl"
            >
              <span>Update Payment Methods</span>
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://app.hubspot.com/billing/invoices', '_blank')}
              className="border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-xl"
            >
              <span>View Billing History</span>
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanBillingTab;
