import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import WelcomeModal from "./WelcomeModal";
import ConnectHubSpotModal from "./ConnectHubSpotModal";
import WorkflowSelection from "@/pages/WorkflowSelection";
import { useToast } from "@/hooks/use-toast";
import { WorkflowState } from "@/lib/workflowState";

const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'connect' | 'workflow-selection' | 'dashboard'>('welcome');
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [hasProcessedOAuth, setHasProcessedOAuth] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const { isAuthenticated, loading, user, connectHubSpot } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  // Don't render OnboardingFlow if user is on dashboard route
  if (location.pathname === '/dashboard') {
    console.log('OnboardingFlow - User is on dashboard, not rendering');
    return null;
  }

  // Timeout mechanism to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('OnboardingFlow - Timeout reached');
      setTimeoutReached(true);
      setHasProcessedOAuth(true);
      
      // If user is authenticated, go to workflow selection
      // If not authenticated, show connect modal
      if (isAuthenticated) {
        setCurrentStep('workflow-selection');
      } else {
        setCurrentStep('connect');
        setShowConnectModal(true);
      }
    }, 30000); // Reduced to 30 seconds timeout for backend processing

    return () => {
      clearTimeout(timeout);
    };
  }, [isAuthenticated]);

  // Handle timeout state changes
  useEffect(() => {
    if (timeoutReached && !isAuthenticated && currentStep !== 'connect') {
      console.log('OnboardingFlow - Timeout reached but user not authenticated, showing connect modal');
      setCurrentStep('connect');
      setShowConnectModal(true);
    }
    
    return () => {
      // Cleanup function to prevent memory leaks
    };
  }, [timeoutReached, isAuthenticated, currentStep]);

  useEffect(() => {
    if (loading || isInitialized) return; // Don't process while loading or if already initialized

    // Check if this is an OAuth success callback
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const token = urlParams.get('token');
    const error = urlParams.get('error');
    const forceConnect = urlParams.get('force_connect');

    console.log('OnboardingFlow - Processing:', { success, token: !!token, error, isAuthenticated, hasProcessedOAuth, timeoutReached });

    if (success === 'true' && token && !hasProcessedOAuth) {
      // OAuth was successful, clear URL and go to workflow selection
      console.log('OnboardingFlow - OAuth success, going to workflow selection');
      window.history.replaceState({}, document.title, window.location.pathname);
      setHasProcessedOAuth(true);
      setCurrentStep('workflow-selection');
      setIsInitialized(true);
      return;
    }

    if (error && !hasProcessedOAuth) {
      // OAuth failed, show error and stay on connect step
      console.log('OnboardingFlow - OAuth error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to HubSpot. Please try again.",
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      setHasProcessedOAuth(true);
      setCurrentStep('connect');
      setShowConnectModal(true);
      setIsInitialized(true);
      return;
    }

    // Check if user is already authenticated and hasn't processed OAuth
    if (isAuthenticated && !loading && user && !hasProcessedOAuth) {
      // If force_connect is requested, show connect modal instead
      if (forceConnect === 'true') {
        console.log('OnboardingFlow - Force connect requested, showing connect modal');
        setCurrentStep('connect');
        setShowConnectModal(true);
        setIsInitialized(true);
        return;
      }
      
      // User is authenticated, go directly to workflow selection
      console.log('OnboardingFlow - User already authenticated, going to workflow selection');
      setHasProcessedOAuth(true);
      
      // Add a small delay to ensure HubSpot connection is fully established
      setTimeout(() => {
        setCurrentStep('workflow-selection');
        setIsInitialized(true);
      }, 1000); // 1 second delay
      
      return;
    }

    // User is not authenticated and hasn't processed OAuth, show welcome modal
    if (!isAuthenticated && !loading && !hasProcessedOAuth) {
      console.log('OnboardingFlow - User not authenticated, showing welcome modal');
      setCurrentStep('welcome');
      setShowWelcomeModal(true);
      setIsInitialized(true);
    }
  }, [isAuthenticated, loading, user, hasProcessedOAuth, isInitialized, timeoutReached, toast]);

  const handleWelcomeComplete = () => {
    console.log('OnboardingFlow - Welcome complete, showing connect modal');
    setShowWelcomeModal(false);
    setShowConnectModal(true);
    setCurrentStep('connect');
  };

  const handleConnectHubSpot = () => {
    console.log('OnboardingFlow - Initiating HubSpot connection');
    // Use the connectHubSpot function from AuthContext
    connectHubSpot();
  };

  const handleWorkflowSelectionComplete = () => {
    console.log('OnboardingFlow - Workflow selection complete, going to dashboard');
    
    // Ensure workflow state is properly set
    if (!WorkflowState.hasSelectedWorkflows()) {
      console.log('OnboardingFlow - Warning: No workflow selection state found');
    }
    
    // Clear onboarding state completely
    setCurrentStep('dashboard');
    setHasProcessedOAuth(true);
    setIsInitialized(true);
    
    // Add a small delay to ensure state is properly set
    setTimeout(() => {
      console.log('OnboardingFlow - Navigating to dashboard');
      navigate('/dashboard');
      toast({
        title: "Setup Complete!",
        description: "Your workflows are now being monitored.",
      });
    }, 100);
  };

  // Show timeout message if loading for too long
  if (timeoutReached && loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Taking longer than expected...</p>
          <p className="mt-1 text-sm text-gray-500">
            {isAuthenticated ? "Redirecting to workflow selection" : "Redirecting to HubSpot connection"}
          </p>
        </div>
      </div>
    );
  }

  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show workflow selection if user is authenticated and on workflow-selection step
  if (isAuthenticated && currentStep === 'workflow-selection') {
    return <WorkflowSelection onComplete={handleWorkflowSelectionComplete} />;
  }

  // Force connect modal for authenticated users who need to reconnect
  if (isAuthenticated && currentStep === 'connect') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ConnectHubSpotModal
          open={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          onConnect={handleConnectHubSpot}
        />
      </div>
    );
  }

  // Show workflow selection if timeout reached AND user is authenticated
  if (timeoutReached && currentStep === 'workflow-selection' && isAuthenticated) {
    return <WorkflowSelection onComplete={handleWorkflowSelectionComplete} />;
  }

  // If timeout reached but user is not authenticated, show connect modal
  if (timeoutReached && !isAuthenticated && currentStep === 'connect') {
    console.log('OnboardingFlow - Timeout reached but user not authenticated, showing connect modal');
    return (
      <div className="min-h-screen bg-gray-50">
        <ConnectHubSpotModal
          open={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          onConnect={handleConnectHubSpot}
        />
      </div>
    );
  }

  // Show dashboard if user is authenticated and on dashboard step
  if (isAuthenticated && currentStep === 'dashboard') {
    return null; // Will be handled by navigation
  }

  // Only show modals if we're on welcome or connect steps
  if (currentStep === 'welcome' || currentStep === 'connect') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Welcome Modal */}
        <WelcomeModal 
          open={showWelcomeModal} 
          onClose={handleWelcomeComplete}
        />

        {/* Connect HubSpot Modal */}
        <ConnectHubSpotModal
          open={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          onConnect={handleConnectHubSpot}
        />
      </div>
    );
  }

  // Fallback: show loading
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Setting up...</p>
        
        {/* Debug Button */}
        <button
          onClick={() => {
            console.log('Manual OAuth trigger');
            connectHubSpot();
          }}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
        >
          Manual OAuth Trigger
        </button>
      </div>
    </div>
  );
};

export default OnboardingFlow; 