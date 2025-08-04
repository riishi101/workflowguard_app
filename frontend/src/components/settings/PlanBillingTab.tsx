import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Check, 
  ExternalLink, 
  Star, 
  Zap, 
  Shield,
  AlertTriangle,
  Clock,
  Users,
  FileText,
  Settings,
  CreditCard,
  History
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApiService } from '@/lib/api';

const PlanBillingTab = () => {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<any>(null);
  const [trialStatus, setTrialStatus] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subscriptionRes, trialRes, usageRes] = await Promise.all([
        ApiService.getSubscription(),
        ApiService.getTrialStatus(),
        ApiService.getUsageStats()
      ]);

      setSubscription(subscriptionRes.data);
      setTrialStatus(trialRes.data);
      setUsageStats(usageRes.data);
    } catch (error: any) {
      console.error('Failed to fetch subscription data:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      // This would typically redirect to HubSpot billing or handle plan upgrade
      toast({
        title: "Plan Upgrade",
        description: `Redirecting to HubSpot to upgrade to ${planId} plan...`,
      });
      
      // Simulate redirect to HubSpot billing
      setTimeout(() => {
        window.open('https://app.hubspot.com/billing', '_blank');
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to process upgrade request",
        variant: "destructive",
      });
    }
  };

  const handleManageSubscription = () => {
    window.open('https://app.hubspot.com/billing', '_blank');
  };

  const handleUpdatePayment = () => {
    window.open('https://app.hubspot.com/billing/payment-methods', '_blank');
  };

  const handleViewBillingHistory = () => {
    window.open('https://app.hubspot.com/billing/invoices', '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Trial Banner */}
      {trialStatus?.isTrialActive && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-900">Free Trial Active</h3>
              <p className="text-blue-700">
                {trialStatus.trialDaysRemaining} days remaining in your trial
              </p>
            </div>
          </div>
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-lg"
            onClick={() => handleUpgrade('professional')}
          >
            Upgrade Now
          </Button>
        </div>
      )}

      {/* Your Subscription Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Your Subscription Overview
        </h2>
        <Card className="bg-gray-50 border-2 border-gray-200 rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Current Plan</p>
                <p className="text-xl font-bold text-gray-900">
                  {subscription?.planName || 'Starter Plan'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Price</p>
                <p className="text-xl font-bold text-gray-900">
                  ${subscription?.planId === 'professional' ? '49' : subscription?.planId === 'enterprise' ? '99' : '19'}/month
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Workflows Monitored</p>
                <p className="text-xl font-bold text-gray-900">
                  {usageStats?.workflows?.used || 0}/{usageStats?.workflows?.limit || 5}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Version History</p>
                <p className="text-xl font-bold text-gray-900">
                  {subscription?.planId === 'professional' ? '90' : subscription?.planId === 'enterprise' ? 'Unlimited' : '30'} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Explore Other Plans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Explore Other Plans
        </h2>
        <p className="text-gray-600 mb-6">
          Choose the perfect plan for your workflow protection needs
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <Card className="relative bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Starter</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">$19</span>
                  <span className="text-gray-600">/month</span>
                </div>
                {subscription?.planId === 'starter' && (
                  <p className="text-sm text-gray-600 mt-1">Current Plan</p>
                )}
              </div>
              <ul className="space-y-3 mb-6 flex-1">
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Up to 5 workflows
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Workflow Selection
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Dashboard Overview
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Basic Version History
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Manual Backups
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Basic Rollback
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Simple Comparison
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Email Support
                </li>
              </ul>
              <div className="mt-auto space-y-3">
                <p className="text-xs text-gray-500 text-center">
                  30 days version history, Basic comparison only
                </p>
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-gray-600 border-gray-300 hover:bg-gray-50"
                  disabled={subscription?.planId === 'starter'}
                  onClick={() => handleUpgrade('starter')}
                >
                  {subscription?.planId === 'starter' ? 'Current Plan' : 'Select Plan'}
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
            <CardContent className="p-6 flex flex-col h-full">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Professional</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">$49</span>
                  <span className="text-gray-600">/month</span>
                </div>
                {subscription?.planId === 'professional' && (
                  <p className="text-sm text-gray-600 mt-1">Current Plan</p>
                )}
              </div>
              <ul className="space-y-3 mb-6 flex-1">
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Up to 25 workflows
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Enhanced Dashboard
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Complete Version History
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Automated Backups
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Change Notifications
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Advanced Rollback
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Side-by-side Comparisons
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Compliance Reporting
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Audit Trails
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Team Management
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  API Access
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Priority Support
                </li>
              </ul>
              <div className="mt-auto space-y-3">
                <p className="text-xs text-gray-500 text-center">
                  90 days version history, Up to 5 team members
                </p>
                <Button 
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                  disabled={subscription?.planId === 'professional'}
                  onClick={() => handleUpgrade('professional')}
                >
                  {subscription?.planId === 'professional' ? 'Current Plan' : 'Select Plan'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="relative bg-white border-2 border-gray-300 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Enterprise</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">$99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                {subscription?.planId === 'enterprise' && (
                  <p className="text-sm text-gray-600 mt-1">Current Plan</p>
                )}
              </div>
              <ul className="space-y-3 mb-6 flex-1">
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Unlimited workflows
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Real-time Change Notifications
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Approval Workflows
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Advanced Compliance Reporting
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Complete Audit Trails
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Team Collaboration Features
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Custom Retention Policies
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Advanced Security Features
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Advanced Analytics
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Unlimited Team Members
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  White-label Options
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Dedicated Support
                </li>
              </ul>
              <div className="mt-auto space-y-3">
                <p className="text-xs text-gray-500 text-center">
                  1 year version history, All features unlocked
                </p>
                <Button 
                  variant="outline" 
                  className="w-full h-12 border-gray-300 text-gray-600 hover:bg-gray-50"
                  disabled={subscription?.planId === 'enterprise'}
                  onClick={() => handleUpgrade('enterprise')}
                >
                  {subscription?.planId === 'enterprise' ? 'Current Plan' : 'Select Plan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Manage Subscription */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Manage Your Subscription & Plan
        </h2>
        <p className="text-gray-600 mb-4">
          Your subscription is managed through HubSpot. To change your plan, update payment methods, 
          or manage your subscription details, you will be redirected to your HubSpot account billing section.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg"
            onClick={handleManageSubscription}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Manage Subscription in HubSpot
          </Button>
          <Button 
            variant="outline" 
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3"
            onClick={handleUpdatePayment}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Update Payment Methods
          </Button>
          <Button 
            variant="outline" 
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3"
            onClick={handleViewBillingHistory}
          >
            <History className="w-4 h-4 mr-2" />
            View Billing History
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanBillingTab;
