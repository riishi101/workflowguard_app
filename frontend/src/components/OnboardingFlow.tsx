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

  const handleWelcomeComplete = () => {
    setModalStep('connect');
  };

  const handleConnectHubSpot = () => {
    // The connectHubSpot function from AuthContext will handle the redirect.
    connectHubSpot();
  };

  const handleWorkflowSelectionComplete = () => {
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

  if (isAuthenticated) {
    return <WorkflowSelection onComplete={handleWorkflowSelectionComplete} />;
  }

  // If not authenticated, show the onboarding modals
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug: Force show a simple modal test */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold mb-4">Welcome to WorkflowGuard!</h2>
          <p className="mb-4">This is a test modal to see if modals work at all.</p>
          <p className="text-sm text-gray-600 mb-4">
            Debug: modalStep={modalStep}, isAuthenticated={String(isAuthenticated)}, loading={String(loading)}
          </p>
          <button 
            onClick={handleWelcomeComplete}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;