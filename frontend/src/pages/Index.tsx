import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import WelcomeModal from "@/components/WelcomeModal";
import ConnectHubSpotModal from "@/components/ConnectHubSpotModal";
import WorkflowSelection from "@/pages/WorkflowSelection";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'connect' | 'workflow-selection' | 'dashboard'>('welcome');
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [hasProcessedOAuth, setHasProcessedOAuth] = useState(false);
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return; // Don't process while loading

    // Check if this is an OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state && isAuthenticated && !hasProcessedOAuth) {
      // OAuth callback successful, show workflow selection
      setCurrentStep('workflow-selection');
      setHasProcessedOAuth(true);
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (isAuthenticated && !loading && user && !code && !state && !hasProcessedOAuth) {
      // User is already authenticated and not in OAuth callback, go to dashboard
      setCurrentStep('dashboard');
      setHasProcessedOAuth(true);
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, user, navigate, hasProcessedOAuth]);

  const handleWelcomeComplete = () => {
    setShowWelcomeModal(false);
    setShowConnectModal(true);
    setCurrentStep('connect');
  };

  const handleConnectHubSpot = () => {
    // Use the connectHubSpot function from AuthContext
    const { connectHubSpot } = useAuth();
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

export default Index;
