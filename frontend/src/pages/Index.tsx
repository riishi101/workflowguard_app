import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import WelcomeModal from "@/components/WelcomeModal";
import ConnectHubSpotModal from "@/components/ConnectHubSpotModal";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showConnect, setShowConnect] = useState(false);

  useEffect(() => {
    // Check for error parameters in URL
    const error = searchParams.get('error');
    const code = searchParams.get('code');
    const success = searchParams.get('success');

    if (error) {
      // Handle OAuth errors
      setShowWelcome(false);
      setShowConnect(false);
      
      switch (error) {
        case 'user_error':
          toast.error('Failed to get user information from HubSpot. Please try again.');
          break;
        case 'token_error':
          toast.error('Failed to authenticate with HubSpot. Please try again.');
          break;
        case 'config_error':
          toast.error('HubSpot configuration error. Please contact support.');
          break;
        case 'oauth_failed':
          toast.error('OAuth process failed. Please try again.');
          break;
        default:
          toast.error('An error occurred during HubSpot connection.');
      }
      
      // Redirect to workflow selection after error
      setTimeout(() => {
        navigate("/workflow-selection");
      }, 2000);
    } else if (code && success) {
      // Successful OAuth callback
      setShowWelcome(false);
      setShowConnect(false);
      
      // Redirect to workflow selection
      navigate("/workflow-selection");
    }
  }, [searchParams, navigate]);

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
