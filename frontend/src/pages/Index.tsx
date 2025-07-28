import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeModal from "@/components/WelcomeModal";
import ConnectHubSpotModal from "@/components/ConnectHubSpotModal";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showConnect, setShowConnect] = useState(false);

  const handleConnectHubSpot = () => {
    setShowWelcome(false);
    setShowConnect(true);
  };

  const handleConnect = () => {
    setShowConnect(false);
    navigate("/workflow-selection");
  };

  const handleCloseWelcome = () => {
    setShowWelcome(false);
  };

  const handleCloseConnect = () => {
    setShowConnect(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Welcome to WorkflowGuard
          </h1>
          <p className="text-gray-600">
            Click "Install" from the HubSpot App Marketplace to get started
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

      <Footer />
    </div>
  );
};

export default Index;
