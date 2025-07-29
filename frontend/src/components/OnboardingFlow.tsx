import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import WelcomeModal from "@/components/WelcomeModal";
import ConnectHubSpotModal from "@/components/ConnectHubSpotModal";
import { useToast } from "@/hooks/use-toast";

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loading, login } = useAuth();
  const { toast } = useToast();
  
  // Modal states
  const [showWelcome, setShowWelcome] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  
  // Check if user is new (no auth token)
  const isNewUser = !localStorage.getItem('authToken');

  useEffect(() => {
    // Check for OAuth callback parameters
    const success = searchParams.get('success');
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    console.log('OnboardingFlow - URL params:', { success, token: token ? 'present' : 'missing', error });

    if (success === 'true' && token) {
      // OAuth successful - store token and redirect to workflow selection
      console.log('OAuth successful, storing token and redirecting');
      localStorage.setItem('authToken', token);
      toast({
        title: "Success!",
        description: "Your HubSpot account has been connected successfully.",
      });
      navigate('/workflow-selection');
      return;
    }

    if (error) {
      // OAuth failed
      console.log('OAuth failed with error:', error);
      toast({
        title: "Connection Failed",
        description: `Failed to connect HubSpot account: ${error}`,
        variant: "destructive",
      });
      return;
    }

    // For new users, start the onboarding flow
    if (isNewUser && !loading) {
      console.log('Starting onboarding flow for new user');
      setShowWelcome(true);
    }
  }, [searchParams, isNewUser, loading, navigate, toast]);

  const handleConnectHubSpot = () => {
    setShowWelcome(false);
    setShowConnect(true);
  };

  const handleConnect = async () => {
    try {
      // Get the HubSpot OAuth URL from backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/hubspot/url`);
      const data = await response.json();
      
      if (data.url) {
        // Redirect to HubSpot OAuth
        window.location.href = data.url;
      } else {
        throw new Error('Failed to get OAuth URL');
      }
    } catch (error) {
      console.error('Error initiating HubSpot OAuth:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to HubSpot. Please try again.",
        variant: "destructive",
      });
      setShowConnect(false);
    }
  };

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    // If user closes welcome modal, redirect to dashboard or workflow selection
    if (isAuthenticated) {
      navigate('/workflow-selection');
    }
  };

  const handleCloseConnect = () => {
    setShowConnect(false);
    // If user closes connect modal, redirect to dashboard or workflow selection
    if (isAuthenticated) {
      navigate('/workflow-selection');
    }
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect to workflow selection
  if (isAuthenticated) {
    navigate('/workflow-selection');
    return null;
  }

  // Show onboarding modals
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Welcome to WorkflowGuard
          </h1>
          <p className="text-gray-600">
            Setting up your account...
          </p>
        </div>
      </div>

      <WelcomeModal
        open={showWelcome}
        onClose={handleCloseWelcome}
        onConnectHubSpot={handleConnectHubSpot}
      />

      <ConnectHubSpotModal
        open={showConnect}
        onClose={handleCloseConnect}
        onConnect={handleConnect}
      />
    </div>
  );
};

export default OnboardingFlow; 