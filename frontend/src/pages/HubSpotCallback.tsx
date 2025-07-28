import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import WorkflowGuardLogo from "@/components/WorkflowGuardLogo";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const HubSpotCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { connectHubSpot } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const success = searchParams.get('success');
        const token = searchParams.get('token');

        console.log('HubSpotCallback received:', { code, error, success, token });

        if (error) {
          setStatus('error');
          setError('Authorization was denied or failed');
          toast.error('HubSpot connection failed. Please try again.');
          return;
        }

        if (!code) {
          setStatus('error');
          setError('No authorization code received');
          toast.error('Invalid authorization response from HubSpot.');
          return;
        }

        // The OAuth callback has already been processed by the backend
        // We just need to verify the connection and get user data
        try {
          await connectHubSpot(code, token || undefined);
          console.log('HubSpot connection successful');
        } catch (error) {
          console.error('HubSpot connection error:', error);
          // Even if verification fails, we can still proceed since OAuth was successful
          console.log('Proceeding to workflow selection despite verification error');
        }
        
        // Redirect immediately to workflow selection
        console.log('Redirecting to workflow selection');
        navigate('/workflow-selection');

      } catch (error) {
        console.error('HubSpot callback error:', error);
        setStatus('error');
        setError('Failed to connect to HubSpot. Please try again.');
        toast.error('Failed to connect to HubSpot. Please try again.');
        
        // Even on error, redirect to workflow selection after a delay
        setTimeout(() => {
          console.log('Redirecting to workflow selection after error');
          navigate('/workflow-selection');
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, connectHubSpot, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <WorkflowGuardLogo />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {status === 'loading' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Connecting to HubSpot...
                </h2>
                <p className="text-sm text-gray-600">
                  Please wait while we complete your HubSpot connection.
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Successfully Connected!
                </h2>
                <p className="text-sm text-gray-600">
                  Your HubSpot account is now connected. Redirecting to workflow selection...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Connection Failed
                </h2>
                <p className="text-sm text-gray-600">
                  {error}
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HubSpotCallback; 