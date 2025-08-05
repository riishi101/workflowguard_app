import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  History,
  Bell,
  List,
  Key,
  User
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
      {/* Trial Status Section */}
      {trialStatus?.isTrial && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🎉 Your Free Trial
          </h2>
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">
                    Professional Trial Active
                  </h3>
                  <p className="text-blue-700 mb-4">
                    You're currently enjoying all Professional Plan features during your 21-day free trial!
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {trialStatus.trialDaysRemaining}
                  </div>
                  <div className="text-sm text-blue-600">
                    days remaining
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-sm text-gray-600">Trial End Date</div>
                  <div className="font-semibold text-gray-900">
                    {trialStatus.trialEndDate ? new Date(trialStatus.trialEndDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-sm text-gray-600">Current Features</div>
                  <div className="font-semibold text-gray-900">Professional Plan</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-sm text-gray-600">After Trial</div>
                  <div className="font-semibold text-gray-900">$49/month</div>
                </div>
              </div>

              {trialStatus.trialDaysRemaining <= 7 && (
                <Alert className="border-orange-200 bg-orange-50 mb-4">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Trial Ending Soon:</strong> Your trial ends in {trialStatus.trialDaysRemaining} days. 
                    Upgrade now to continue enjoying Professional features without interruption.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current Subscription Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Your Subscription Overview
        </h2>
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-8">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                <p className="font-semibold text-gray-900">
                  {trialStatus?.isTrial ? 'Professional Trial' : (subscription?.planName || 'Starter Plan')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Price</p>
                <p className="font-semibold text-gray-900">
                  {trialStatus?.isTrial ? 'Free' : `$${subscription?.planId === 'professional' ? '49' : subscription?.planId === 'enterprise' ? '99' : '19'}/month`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Workflows Monitored
                </p>
                <p className="font-semibold text-gray-900">
                  {usageStats?.workflows?.used || 0}/{usageStats?.workflows?.limit || 5}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Version History
                </p>
                <p className="font-semibold text-gray-900">
                  {trialStatus?.isTrial ? '90' : (subscription?.planId === 'professional' ? '90' : subscription?.planId === 'enterprise' ? 'Unlimited' : '30')} days
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
          <Card className="relative">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Starter
                </h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">
                    $19
                  </span>
                  <span className="text-gray-600">/month</span>
                </div>
                {subscription?.planId === 'starter' && (
                  <p className="text-sm text-gray-600 mt-1">Current Plan</p>
                )}
              </div>
              <ul className="space-y-3 mb-6">
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
              <div className="mt-auto">
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={subscription?.planId === 'starter'}
                  onClick={() => handleUpgrade('starter')}
                >
                  {subscription?.planId === 'starter' ? 'Current Plan' : 'Select Plan'}
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  30 days version history, Basic comparison only
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Professional Plan */}
          <Card className="relative border-blue-500 shadow-md">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-600 text-white px-3 py-1 text-xs">
                Popular
              </Badge>
            </div>
            <CardContent className="p-6 flex flex-col h-full">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Professional
                </h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">
                    $49
                  </span>
                  <span className="text-gray-600">/month</span>
                </div>
                {(subscription?.planId === 'professional' || trialStatus?.isTrial) && (
                  <p className="text-sm text-gray-600 mt-1">Current Plan</p>
                )}
              </div>
              <ul className="space-y-3 mb-6">
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
                  Priority WhatsApp Support
                </li>
              </ul>
              <div className="mt-auto">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={subscription?.planId === 'professional' || trialStatus?.isTrial}
                  onClick={() => handleUpgrade('professional')}
                >
                  {(subscription?.planId === 'professional' || trialStatus?.isTrial) ? 'Current Plan' : 'Select Plan'}
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  90 days version history, Up to 5 team members
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="relative">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Enterprise
                </h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">
                    $99
                  </span>
                  <span className="text-gray-600">/month</span>
                </div>
                {subscription?.planId === 'enterprise' && (
                  <p className="text-sm text-gray-600 mt-1">Current Plan</p>
                )}
              </div>
              <ul className="space-y-3 mb-6">
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
                  24/7 WhatsApp Support
                </li>
              </ul>
              <div className="mt-auto">
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={subscription?.planId === 'enterprise'}
                  onClick={() => handleUpgrade('enterprise')}
                >
                  {subscription?.planId === 'enterprise' ? 'Current Plan' : 'Select Plan'}
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  1 year version history, All features unlocked
                </p>
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
          Your subscription is managed through HubSpot. To change your
          plan, update payment methods, or manage your subscription
          details, you will be redirected to your HubSpot account billing
          section.
        </p>
        <div className="flex space-x-4">
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleManageSubscription}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Manage Subscription in HubSpot
          </Button>
          <Button 
            variant="outline"
            onClick={handleUpdatePayment}
          >
            Update Payment Methods
          </Button>
          <Button 
            variant="outline"
            onClick={handleViewBillingHistory}
          >
            View Billing History
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanBillingTab; 