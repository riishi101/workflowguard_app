import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NextBillingCardProps {
  nextBillingDate?: string;
  amount: number;
  currency?: string;
  planName?: string;
  onUpdateBillingCycle?: () => void;
}

const NextBillingCard: React.FC<NextBillingCardProps> = ({
  nextBillingDate,
  amount,
  currency = 'USD',
  planName,
  onUpdateBillingCycle
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    const symbol = currency === 'USD' ? '$' : currency === 'INR' ? '₹' : currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Next Billing
        </CardTitle>
        {onUpdateBillingCycle && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onUpdateBillingCycle}
            className="text-sm"
          >
            Update Billing Cycle
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Your next payment of <span className="font-semibold text-foreground">{formatAmount(amount, currency)}</span> will be charged on
            </p>
            <p className="text-lg font-semibold text-blue-600">
              {formatDate(nextBillingDate)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span className="text-sm">{planName || 'Current Plan'}</span>
          </div>
        </div>
        
        {nextBillingDate && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Billing frequency</span>
              <span>Monthly</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NextBillingCard;
