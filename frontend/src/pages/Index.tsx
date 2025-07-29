import { useAuth } from "@/contexts/AuthContext";
import OnboardingFlow from "@/components/OnboardingFlow";
import LoginForm from "@/components/LoginForm";
import Footer from "@/components/Footer";

const Index = () => {
  const { isAuthenticated, loading } = useAuth();

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

  // If user is not authenticated, show login form
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // If user is authenticated, show onboarding flow
  return <OnboardingFlow />;
};

export default Index;
