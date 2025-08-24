import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface TrialStatusCardProps {
  daysRemaining: number;
  totalTrialDays?: number;
  planName?: string;
  features?: string[];
  onUpgrade?: () => void;
  isTrialActive?: boolean;
}

const TrialStatusCard: React.FC<TrialStatusCardProps> = ({
  daysRemaining,
  totalTrialDays = 21,
  planName = 'Professional Plan',
  features = [],
  onUpgrade,
  isTrialActive = true
}) => {
  const progressPercentage = ((totalTrialDays - daysRemaining) / totalTrialDays) * 100;
  const isEndingSoon = daysRemaining <= 7;
  const isCritical = daysRemaining <= 3;

  const getStatusColor = () => {
    if (isCritical) return 'text-red-600';
    if (isEndingSoon) return 'text-orange-600';
    return 'text-blue-600';
  };

  const getProgressColor = () => {
    if (isCritical) return 'bg-red-500';
    if (isEndingSoon) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  if (!isTrialActive) {
    return (
      <Card className="w-full border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Active Subscription</h3>
              <p className="text-sm text-green-700">You're on the {planName}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            21-Day Free Trial
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                You are currently on a 21-day free trial with access to {planName} features!
              </p>
              <p className="text-sm text-muted-foreground">
                Trial ends in <span className="font-semibold">5 days</span>. Upgrade now to continue using WorkflowGuard.
              </p>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getStatusColor()}`}>
                {daysRemaining}
              </div>
              <div className={`text-sm ${getStatusColor()}`}>
                days remaining
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Trial Progress</span>
              <span>{Math.round(progressPercentage)}% used</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {onUpgrade && (
            <Button 
              onClick={onUpgrade}
              className="w-full"
              variant={isCritical ? "destructive" : "default"}
            >
              Upgrade Now
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Warning Alert */}
      {isEndingSoon && (
        <Alert className={`${isCritical ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
          <AlertTriangle className={`h-4 w-4 ${isCritical ? 'text-red-600' : 'text-orange-600'}`} />
          <AlertDescription className={isCritical ? 'text-red-800' : 'text-orange-800'}>
            <strong>{isCritical ? 'Trial Ending Very Soon:' : 'Trial Ending Soon:'}</strong> Your trial ends in {daysRemaining} days. 
            Upgrade now to continue enjoying {planName} features without interruption.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TrialStatusCard;
