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
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if this is an OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state && isAuthenticated && !loading) {
      // OAuth callback successful, show workflow selection
      setCurrentStep('workflow-selection');
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (isAuthenticated && !loading && user && !code && !state) {
      // User is already authenticated and not in OAuth callback, go to dashboard
      setCurrentStep('dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, user, navigate]);

  const handleWelcomeComplete = () => {
    setShowWelcomeModal(false);
    setShowConnectModal(true);
    setCurrentStep('connect');
  };

  const handleConnectHubSpot = () => {
    // Redirect to HubSpot OAuth URL - use the API base URL without adding /api
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    // Remove /api from the end if it exists
    const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
    const hubspotAuthUrl = `${cleanBaseUrl}/api/auth/hubspot/url`;
    window.location.href = hubspotAuthUrl;
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
