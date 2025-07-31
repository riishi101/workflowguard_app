import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import WelcomeModal from "./WelcomeModal";
import ConnectHubSpotModal from "./ConnectHubSpotModal";
import WorkflowSelection from "@/pages/WorkflowSelection";
import { useToast } from "@/hooks/use-toast";

const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'connect' | 'workflow-selection' | 'dashboard'>('welcome');
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const { isAuthenticated, loading, user, connectHubSpot } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return; // Don't process while loading

    // Check if this is an OAuth success callback
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (success === 'true' && token) {
      // OAuth was successful, clear URL and go to workflow selection
      window.history.replaceState({}, document.title, window.location.pathname);
      setCurrentStep('workflow-selection');
      return;
    }

    if (error) {
      // OAuth failed, show error and stay on connect step
      toast({
        title: "Connection Failed",
        description: "Failed to connect to HubSpot. Please try again.",
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      setCurrentStep('connect');
      setShowConnectModal(true);
      return;
    }

    // Check if user is already authenticated and has workflows
    if (isAuthenticated && !loading && user) {
      // User is authenticated, check if they have workflows
      // For now, assume they need to go through workflow selection
      setCurrentStep('workflow-selection');
      return;
    }

    // User is not authenticated, show welcome modal
    if (!isAuthenticated && !loading) {
      setCurrentStep('welcome');
      setShowWelcomeModal(true);
    }
  }, [isAuthenticated, loading, user, navigate, toast]);

  const handleWelcomeComplete = () => {
    setShowWelcomeModal(false);
    setShowConnectModal(true);
    setCurrentStep('connect');
  };

  const handleConnectHubSpot = () => {
    // Use the connectHubSpot function from AuthContext
    connectHubSpot();
  };

  const handleWorkflowSelectionComplete = () => {
    setCurrentStep('dashboard');
    navigate('/dashboard');
    toast({
      title: "Setup Complete!",
      description: "Your workflows are now being monitored.",
    });
  };

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

  // Show workflow selection if user is authenticated but hasn't selected workflows
  if (isAuthenticated && currentStep === 'workflow-selection') {
    return <WorkflowSelection onComplete={handleWorkflowSelectionComplete} />;
  }

  // Show dashboard if user is authenticated and on dashboard step
  if (isAuthenticated && currentStep === 'dashboard') {
    return null; // Will be handled by navigation
  }

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
};

export default OnboardingFlow; 