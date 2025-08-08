import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import HubSpotBillingService, { 
  BillingSummary, 
  BillingPlan, 
  BillingPayment 
} from '@/services/HubSpotBillingService';

interface BillingDashboardProps {
  onPlanChange?: (planId: string) => void;
}

export default function BillingDashboard({ onPlanChange }: BillingDashboardProps) {
  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  useEffect(() => {
    loadBillingSummary();
  }, []);

  const loadBillingSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await HubSpotBillingService.getBillingSummary();
      setBillingSummary(summary);
    } catch (err) {
      setError('Failed to load billing information');
      console.error('Billing dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      setProcessingAction(`upgrade-${planId}`);
      await HubSpotBillingService.upgradeSubscription(planId);
      await loadBillingSummary();
      onPlanChange?.(planId);
    } catch (err) {
      setError('Failed to upgrade subscription');
      console.error('Upgrade error:', err);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleDowngrade = async (planId: string) => {
    try {
      setProcessingAction(`downgrade-${planId}`);
      await HubSpotBillingService.downgradeSubscription(planId);
      await loadBillingSummary();
      onPlanChange?.(planId);
    } catch (err) {
      setError('Failed to downgrade subscription');
      console.error('Downgrade error:', err);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleCancel = async () => {
    try {
      setProcessingAction('cancel');
      await HubSpotBillingService.cancelSubscription();
      await loadBillingSummary();
    } catch (err) {
      setError('Failed to cancel subscription');
      console.error('Cancel error:', err);
    } finally {
      setProcessingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading billing information...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!billingSummary) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No billing information available</AlertDescription>
      </Alert>
    );
  }

  const { subscription, payments, totalPayments, totalAmount, availablePlans, currentPlan } = billingSummary;

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Manage your current plan and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{currentPlan?.name || 'Unknown Plan'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentPlan?.description}
                  </p>
                </div>
                <Badge 
                  variant={subscription.status === 'active' ? 'default' : 'secondary'}
                  className={HubSpotBillingService.getSubscriptionStatusColor(subscription.status)}
                >
                  {HubSpotBillingService.getSubscriptionStatusText(subscription.status)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Price:</span>
                  <p className="font-medium">
                    {HubSpotBillingService.formatCurrency(currentPlan?.price || 0)}/{currentPlan?.interval}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Next Billing:</span>
                  <p className="font-medium">
                    {HubSpotBillingService.formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>
              </div>

              {subscription.status === 'active' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={processingAction === 'cancel'}
                  >
                    {processingAction === 'cancel' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Cancel Subscription
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">No active subscription</p>
              <Button onClick={() => window.location.href = '/pricing'}>
                View Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Choose the plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {availablePlans.map((plan) => {
              const isCurrentPlan = currentPlan?.id === plan.id;
              const isUpgrade = currentPlan && plan.price > currentPlan.price;
              const isDowngrade = currentPlan && plan.price < currentPlan.price;

              return (
                <Card key={plan.id} className={isCurrentPlan ? 'ring-2 ring-primary' : ''}>
                  {isCurrentPlan ? (
                    <Badge className="absolute -top-3 right-4 bg-green-500">
                      Current Plan
                    </Badge>
                  ) : null}
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="text-2xl font-bold">
                      ${plan.price}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{plan.interval}
                      </span>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    {isCurrentPlan ? (
                      <Button disabled className="w-full">
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant={isUpgrade ? 'default' : 'outline'}
                        onClick={() => {
                          if (isUpgrade) {
                            handleUpgrade(plan.id);
                          } else if (isDowngrade) {
                            handleDowngrade(plan.id);
                          } else {
                            handleUpgrade(plan.id);
                          }
                        }}
                        disabled={processingAction === `upgrade-${plan.id}` || processingAction === `downgrade-${plan.id}`}
                      >
                        {processingAction === `upgrade-${plan.id}` || processingAction === `downgrade-${plan.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Select Plan'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            Your recent payments and billing activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Total Payments: {totalPayments}</span>
                <span>Total Amount: {HubSpotBillingService.formatCurrency(totalAmount)}</span>
              </div>
              
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {payment.status === 'succeeded' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : payment.status === 'failed' ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="font-medium">
                          {HubSpotBillingService.formatCurrency(payment.amount)}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {HubSpotBillingService.formatDate(payment.createdAt)}
                      </span>
                    </div>
                    <Badge 
                      variant="outline"
                      className={HubSpotBillingService.getPaymentStatusColor(payment.status)}
                    >
                      {HubSpotBillingService.getPaymentStatusText(payment.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payment history available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 