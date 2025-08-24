import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Check, 
  CreditCard,
  ExternalLink, 
  Star, 
  Zap, 
  Shield,
  Clock,
  Users,
  FileText,
  Settings,
  History,
  Bell,
  List,
  Key,
  User
} from 'lucide-react';
import TrialStatusCard from '@/components/trial/TrialStatusCard';
import { useToast } from '@/hooks/use-toast';
import { ApiService } from '@/lib/api';
import ManageSubscriptionTab from './ManageSubscription';

const PlanBillingTab = () => {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<any>(null);
  const [trialStatus, setTrialStatus] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showManageSubscription, setShowManageSubscription] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const getWorkflowLimit = (planId: string) => {
    switch (planId) {
      case 'professional':
        return 35;
      case 'enterprise':
        return Infinity;
      case 'starter':
      default:
        return 10;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subscriptionRes, trialRes, usageRes] = await Promise.all([
        ApiService.getSubscription(),
        ApiService.getTrialStatus(),
        ApiService.getUsageStats()
      ]);

      const subData = subscriptionRes.data;
      const trialData = trialRes.data;
      const usageData = usageRes.data;

      // Calculate correct workflow limits based on plan
      const workflowLimit = getWorkflowLimit(subData?.planId || 'starter');
      
      // Merge usage stats with correct limits
      const updatedUsageStats = {
        ...usageData,
        workflows: {
          ...usageData?.workflows,
          limit: trialData?.isTrial ? 35 : workflowLimit
        }
      };

      setSubscription(subData);
      setTrialStatus(trialData);
      setUsageStats(updatedUsageStats);
    } catch (error: any) {
      console.error('Failed to fetch subscription data:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription information",
        variant: "destructive",
      });

      // Set default values on error
      setSubscription({
        planId: 'starter',
        planName: 'Starter Plan',
        price: 19
      });
      setTrialStatus({
        isTrial: false,
        trialDaysRemaining: 0
      });
      setUsageStats({
        workflows: {
          used: 0,
          limit: 10
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject('Failed to load Razorpay');
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (planId: string) => {
    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKeyId) {
      toast({
        title: 'Configuration Error',
        description: 'Razorpay is not configured. Please contact support.',
        variant: 'destructive',
      });
      return;
    }
    try {
      toast({ title: 'Processing...', description: 'Initiating plan upgrade...' });
      
      await loadRazorpayScript();
      const resp = await ApiService.createRazorpayOrder(planId);
      
      if (!resp.success || !resp.data?.id) {
        throw new Error(resp.message || 'Failed to create payment order');
      }

      const order = resp.data;
      
      const options = {
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: 'WorkflowGuard',
        description: `Upgrade to ${planId} plan`,
        order_id: order.id,
        handler: async function (paymentResult: any) {
          try {
            const confirmResponse = await ApiService.confirmRazorpayPayment({
              planId,
              paymentId: paymentResult.razorpay_payment_id,
              orderId: order.id,
              signature: paymentResult.razorpay_signature,
            });

            if (confirmResponse.success) {
              toast({
                title: 'Upgrade Successful!',
                description: `Successfully upgraded to ${planId} plan.`,
              });
              await fetchData();
            } else {
              throw new Error(confirmResponse.message || 'Payment confirmation failed');
            }
          } catch (error: any) {
            toast({
              title: 'Upgrade Failed',
              description: error.message || 'Payment confirmation failed. Please contact support.',
              variant: 'destructive',
            });
          }
        },
        prefill: {
          name: subscription?.customerName || '',
          email: subscription?.customerEmail || '',
        },
        theme: { color: '#2563eb' },
      };
      
            const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', () => {
        toast({
          title: 'Payment Failed',
          description: 'Your payment was not processed. Please try again.',
          variant: 'destructive',
        });
      });

    } catch (error: any) {
      console.error('Plan upgrade failed:', error);
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to process upgrade request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleManageSubscription = () => {
    setShowManageSubscription(true);
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

  // Show ManageSubscription component when requested
  if (showManageSubscription) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => setShowManageSubscription(false)}
            className="flex items-center gap-2"
          >
            ← Back to Plans
          </Button>
        </div>
        <ManageSubscriptionTab />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Trial Status Section */}
      <TrialStatusCard 
        daysRemaining={trialStatus?.trialDaysRemaining || 0}
        totalTrialDays={21}
        planName="Professional Plan"
        isTrialActive={trialStatus?.isTrial || false}
        onUpgrade={() => handleUpgrade('professional')}
      />

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
                  {(() => {
                    if (trialStatus?.isTrial) {
                      return 'Professional Plan (Trial)';
                    }
                    switch (subscription?.planId) {
                      case 'professional':
                        return 'Professional Plan';
                      case 'enterprise':
                        return 'Enterprise Plan';
                      case 'starter':
                      default:
                        return 'Starter Plan';
                    }
                  })()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Price</p>
                <p className="font-semibold text-gray-900">
                  {trialStatus?.isTrial ? (subscription?.price !== undefined ? 'Free (Trial)' : 'Free') : (subscription?.price !== undefined ? `$${subscription.price}/month` : `$19/month`)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Workflows Monitored
                </p>
                <p className="font-semibold text-gray-900">
                  {usageStats?.workflows?.used ?? subscription?.usage?.workflows ?? 0}/{usageStats?.workflows?.limit ?? subscription?.limits?.workflows ?? (trialStatus?.isTrial ? 35 : 10)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Version History
                </p>
                <p className="font-semibold text-gray-900">
                  {subscription?.limits?.versionHistory ? `${subscription.limits.versionHistory} days` : (trialStatus?.isTrial ? '90 days' : (subscription?.planId === 'professional' ? '90 days' : subscription?.planId === 'enterprise' ? 'Unlimited' : '30 days'))}
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
                  Up to 10 workflows
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
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1">
              <Badge className="bg-blue-600 text-white px-3 py-1 text-xs mb-1">
                Popular
              </Badge>
              <Badge className="bg-green-600 text-white px-3 py-1 text-xs flex items-center gap-1">
                21-day free trial
                <span title="After your free trial, you'll be billed $49/month unless you cancel or change your plan.">
                  <svg xmlns='http://www.w3.org/2000/svg' className='inline w-3 h-3 ml-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2'/><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 16v-4m0-4h.01'/></svg>
                </span>
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
                  Up to 35 workflows
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
                {/* Team Management and API Access removed as not available */}
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
                  90 days version history
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
                {/* Team Collaboration Features removed as not available */}
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Custom Retention Policies
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  Advanced Security Features
                </li>
                {/* Advanced Analytics removed as not available */}
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
          Manage your subscription, billing history, payment methods, and plan changes
          all in one place through our integrated subscription management system.
        </p>
        <div className="flex space-x-4">
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleManageSubscription}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Manage Subscription
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanBillingTab; 