import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import RazorpayService, { BillingHistory as BillingHistoryType } from '@/services/RazorpayService';
import {
  CreditCard,
  Download,
  RefreshCw,
  Calendar,
  IndianRupee,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

const BillingHistory: React.FC = () => {
  const { toast } = useToast();
  const [billingData, setBillingData] = useState<BillingHistoryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingHistory();
  }, []);

  const fetchBillingHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RazorpayService.getBillingHistory();
      setBillingData(data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch billing history';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'captured':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const downloadInvoice = async (paymentId: string) => {
    try {
      // This would typically generate and download an invoice
      toast({
        title: 'Invoice Download',
        description: 'Invoice download functionality will be implemented.',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download invoice',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBillingHistory}
            className="ml-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!billingData || !billingData.subscription) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No active subscription found. Please subscribe to a plan to view billing history.
        </AlertDescription>
      </Alert>
    );
  }

  const { payments, subscription, localSubscription } = billingData;

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Plan</p>
              <p className="font-medium">{localSubscription?.planName || 'Unknown Plan'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge className={RazorpayService.getStatusColor(subscription.status)}>
                {subscription.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Next Billing</p>
              <p className="font-medium">
                {RazorpayService.formatDate(subscription.current_end)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Payment History
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBillingHistory}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payment history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    {getPaymentStatusIcon(payment.status)}
                    <div>
                      <p className="font-medium">
                        {RazorpayService.formatAmountFromPaise(payment.amount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.created_at * 1000).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={RazorpayService.getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                    {payment.status === 'captured' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadInvoice(payment.id)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Invoice
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Payment methods are managed through Razorpay during checkout</p>
            <p className="text-sm mt-2">
              Supported methods: Credit/Debit Cards, Net Banking, UPI, Wallets
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingHistory;
