import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ApiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard } from "lucide-react";

interface TrialAccessGuardProps {
  children: React.ReactNode;
}

const TrialAccessGuard = ({ children }: TrialAccessGuardProps) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [trialStatus, setTrialStatus] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);

  // Routes that are always accessible (billing and settings)
  const allowedRoutes = ['/settings', '/manage-subscription', '/contact-us', '/help-support'];

  useEffect(() => {
    const checkTrialAccess = async () => {
      if (!isAuthenticated || !user) {
        setIsChecking(false);
        return;
      }

      try {
        // Check if current route is allowed
        const isAllowedRoute = allowedRoutes.some(route => location.pathname.startsWith(route));
        
        if (isAllowedRoute) {
          setIsChecking(false);
          return;
        }

        // Check trial access
        const [trialResponse, usageResponse] = await Promise.all([
          ApiService.getTrialStatus(),
          ApiService.getUsageStats()
        ]);

        setTrialStatus(trialResponse);
        setUsageStats(usageResponse);

        // If trial has expired, redirect to settings
        if ((trialResponse as any).isTrialExpired) {
          toast({
            title: "Trial Expired",
            description: "Your trial has expired. Please upgrade to continue using WorkflowGuard.",
            variant: "destructive",
          });
          navigate('/settings');
          return;
        }

        setIsChecking(false);
      } catch (error: any) {
        console.error('Trial access check failed:', error);
        
        // Handle trial expiration from backend
        if (error.response?.status === 403 && error.response?.data?.message?.includes('Trial expired')) {
          toast({
            title: "Trial Expired",
            description: "Your trial has expired. Please upgrade to continue using WorkflowGuard.",
            variant: "destructive",
          });
          navigate('/settings');
          return;
        }
        
        if (error.response?.status === 402) {
          // Payment required - trial expired
          toast({
            title: "Trial Expired",
            description: "Your trial has expired. Please upgrade to continue using WorkflowGuard.",
            variant: "destructive",
          });
          navigate('/settings');
          return;
        }

        setIsChecking(false);
      }
    };

    checkTrialAccess();
  }, [isAuthenticated, user, location.pathname, navigate, toast]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking trial status...</p>
        </div>
      </div>
    );
  }

  // Show trial warning if trial is about to expire
  if (trialStatus && trialStatus.trialDaysRemaining <= 3 && trialStatus.trialDaysRemaining > 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Trial Ending Soon:</strong> Your trial ends in {trialStatus.trialDaysRemaining} days. 
              <Button 
                variant="link" 
                className="p-0 h-auto text-orange-800 underline ml-2"
                onClick={() => navigate('/settings')}
              >
                Upgrade now
              </Button>
            </AlertDescription>
          </Alert>
          {children}
        </div>
      </div>
    );
  }

  // Show usage warning if approaching limits
  if (usageStats && usageStats.usagePercentage >= 80) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <CreditCard className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Usage Warning:</strong> You're using {usageStats.usagePercentage}% of your plan limit. 
              <Button 
                variant="link" 
                className="p-0 h-auto text-yellow-800 underline ml-2"
                onClick={() => navigate('/settings')}
              >
                Upgrade plan
              </Button>
            </AlertDescription>
          </Alert>
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default TrialAccessGuard; 