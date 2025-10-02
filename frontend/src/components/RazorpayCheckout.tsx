import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import RazorpayService from '@/services/RazorpayService';
import { CreditCard, Shield, CheckCircle, AlertCircle } from 'lucide-react';

interface RazorpayCheckoutProps {
  planType: 'starter' | 'professional' | 'enterprise';
  planName: string;
  amount: number;
  currency?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  planType,
  planName,
  amount,
  currency = 'INR',
  onSuccess,
  onError,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscription = async () => {
    if (!user) {
      setError('Please log in to continue');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create Razorpay customer if needed
      const customerData = {
        name: user.name || user.email,
        email: user.email,
        contact: (user as any).phone || '',
        notes: {
          user_id: user.id,
          plan_type: planType,
        },
      };

      const customer = await RazorpayService.createCustomer(customerData);

      // Step 2: Get plan ID for the selected plan
      const planId = await getPlanId(planType, currency);

      // Step 3: Create subscription
      const subscriptionData = {
        planId,
        customerId: customer.id,
        customerNotify: true,
        notes: {
          user_id: user.id,
          plan_type: planType,
          plan_name: planName,
        },
      };

      const subscription = await RazorpayService.createSubscription(subscriptionData);

      // Step 4: Open Razorpay checkout
      await RazorpayService.openSubscriptionCheckout(subscription, {
        name: user.name || user.email,
        email: user.email,
        contact: (user as any).phone || '',
      });

      toast({
        title: 'Subscription Created',
        description: 'Your subscription has been created successfully!',
      });

      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create subscription';
      setError(errorMessage);
      onError?.(errorMessage);
      
      toast({
        title: 'Subscription Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOneTimePayment = async () => {
    if (!user) {
      setError('Please log in to continue');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create order for one-time payment
      const order = await RazorpayService.createOrder(amount, currency, {
        user_id: user.id,
        plan_type: planType,
        plan_name: planName,
      });

      // Open Razorpay checkout
      await RazorpayService.openOrderCheckout(order, {
        name: user.name || user.email,
        email: user.email,
        contact: (user as any).phone || '',
      });

      toast({
        title: 'Payment Initiated',
        description: 'Please complete your payment to activate the plan.',
      });

      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create payment';
      setError(errorMessage);
      onError?.(errorMessage);
      
      toast({
        title: 'Payment Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanId = async (planType: string, currency: string = 'INR'): Promise<string> => {
    try {
      const config = await RazorpayService.getConfig();
      const planId = config.planIds[planType]?.[currency];
      
      if (!planId) {
        // Fallback to INR if currency not found
        const fallbackPlanId = config.planIds[planType]?.['INR'];
        if (!fallbackPlanId) {
          throw new Error(`Plan ID not found for ${planType}`);
        }
        return fallbackPlanId;
      }
      
      return planId;
    } catch (error) {
      console.error('Failed to get plan ID:', error);
      throw new Error('Failed to get payment configuration');
    }
  };

  const getPlanFeatures = (planType: string): string[] => {
    const features = {
      starter: [
        'Up to 10 workflows',
        'Basic version history (30 days)',
        'Manual backups',
        'Email support',
      ],
      professional: [
        'Up to 35 workflows',
        'Complete version history (90 days)',
        'Automated backups',
        'Advanced rollback',
        'Priority support',
      ],
      enterprise: [
        'Unlimited workflows',
        'Complete version history (1 year)',
        'Advanced compliance reporting',
        'Custom retention policies',
        '24/7 support',
      ],
    };
    return features[planType as keyof typeof features] || features.starter;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CreditCard className="h-5 w-5" />
          {planName} Plan
        </CardTitle>
        <div className="text-3xl font-bold text-blue-600">
          {RazorpayService.formatAmount(amount)}
          <span className="text-sm font-normal text-gray-500">/month</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Plan Features:</h4>
          <ul className="space-y-1">
            {getPlanFeatures(planType).map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-3 w-3 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-700">Secure payment powered by Razorpay</span>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleSubscription}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Processing...' : 'Subscribe Now'}
          </Button>
          
          <Button
            onClick={handleOneTimePayment}
            disabled={loading}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {loading ? 'Processing...' : 'One-time Payment'}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            You can cancel anytime.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RazorpayCheckout;
