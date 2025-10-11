import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import WelcomeModal from "./WelcomeModal";
import ConnectHubSpotModal from "./ConnectHubSpotModal";
import WorkflowSelection from "@/pages/WorkflowSelection";
import { useToast } from "@/hooks/use-toast";

const OnboardingFlow = () => {
  const [modalStep, setModalStep] = useState<'welcome' | 'connect'>('welcome');
  const { isAuthenticated, loading, connectHubSpot } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  console.log('OnboardingFlow rendering:', { modalStep, isAuthenticated, loading });

  const handleWelcomeComplete = () => {
    console.log('Welcome modal completed');
    setModalStep('connect');
  };

  const handleConnectHubSpot = () => {
    console.log('Connecting to HubSpot...');
    // The connectHubSpot function from AuthContext will handle the redirect.
    connectHubSpot();
  };

  const handleWorkflowSelectionComplete = () => {
    console.log('Workflow selection completed');
    navigate('/dashboard');
    toast({
      title: "Setup Complete!",
      description: "Your workflows are now being monitored.",
    });
  };

  if (loading) {
    console.log('Showing loading state');
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    console.log('User is authenticated, showing WorkflowSelection');
    return <WorkflowSelection onComplete={handleWorkflowSelectionComplete} />;
  }

  // If not authenticated, show the onboarding modals
  console.log('User not authenticated, showing onboarding modals');
  return (
    <div className="min-h-screen bg-gray-50">
      <WelcomeModal
        open={modalStep === 'welcome'}
        onClose={handleWelcomeComplete}
      />
      <ConnectHubSpotModal
        open={modalStep === 'connect'}
        onClose={() => setModalStep('connect')} // Keep it open if they close it
        onConnect={handleConnectHubSpot}
      />
    </div>
  );
};

export default OnboardingFlow;