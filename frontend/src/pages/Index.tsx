import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeModal from "@/components/WelcomeModal";
import ConnectHubSpotModal from "@/components/ConnectHubSpotModal";
import apiService from "@/services/api";
import { useAuth } from "@/components/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showConnect, setShowConnect] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleConnectHubSpot = () => {
    setShowWelcome(false);
    setShowConnect(true);
  };

  const handleConnect = () => {
    setShowConnect(false);
    apiService.initiateHubSpotOAuth();
  };

  const handleCloseWelcome = () => {
    setShowWelcome(false);
  };

  const handleCloseConnect = () => {
    setShowConnect(false);
  };

  // UI-ONLY DEVELOPMENT: Skip welcome and connect modals
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Welcome to WorkflowGuard (UI Mock Mode)
        </h1>
        <p className="text-gray-600">
          All features are available for UI testing. No backend or HubSpot connection required.
        </p>
        {/* You can add links or buttons to navigate to dashboard, workflows, etc. */}
      </div>
    </div>
  );
};

export default Index;
