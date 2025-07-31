import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import TrialAccessGuard from "@/components/TrialAccessGuard";
import OnboardingFlow from "@/components/OnboardingFlow";
import WorkflowSelection from "./pages/WorkflowSelection";
import Dashboard from "./pages/Dashboard";
import WorkflowHistory from "./pages/WorkflowHistory";
import WorkflowHistoryDetail from "./pages/WorkflowHistoryDetail";
import CompareVersions from "./pages/CompareVersions";
import Settings from "./pages/Settings";
import HelpSupport from "./pages/HelpSupport";
import ConnectHubSpotGuide from "./pages/help/ConnectHubSpotGuide";
import RestoreWorkflowGuide from "./pages/help/RestoreWorkflowGuide";
import UserPermissionsGuide from "./pages/help/UserPermissionsGuide";
import UserManual from "./pages/help/UserManual";
import FeatureSpotlights from "./pages/help/FeatureSpotlights";
import AdvancedUseCases from "./pages/help/AdvancedUseCases";
import Troubleshooting from "./pages/help/Troubleshooting";
import ApiDocs from "./pages/help/ApiDocs";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ContactUs from "./pages/ContactUs";
import SetupGuide from "./pages/SetupGuide";
import ManageSubscription from "./pages/ManageSubscription";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<OnboardingFlow />} />
            <Route path="/workflow-selection" element={<ProtectedRoute><TrialAccessGuard><WorkflowSelection /></TrialAccessGuard></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><TrialAccessGuard><Dashboard /></TrialAccessGuard></ProtectedRoute>} />
            <Route path="/workflow-history" element={<ProtectedRoute><TrialAccessGuard><WorkflowHistory /></TrialAccessGuard></ProtectedRoute>} />
            <Route
              path="/workflow-history/:workflowId"
              element={<ProtectedRoute><TrialAccessGuard><WorkflowHistoryDetail /></TrialAccessGuard></ProtectedRoute>}
            />
            <Route path="/compare-versions" element={<ProtectedRoute><TrialAccessGuard><CompareVersions /></TrialAccessGuard></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/help-support" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
            <Route path="/help/connect-hubspot" element={<ProtectedRoute><TrialAccessGuard><ConnectHubSpotGuide /></TrialAccessGuard></ProtectedRoute>} />
            <Route path="/help/restore-workflow" element={<ProtectedRoute><TrialAccessGuard><RestoreWorkflowGuide /></TrialAccessGuard></ProtectedRoute>} />
            <Route path="/help/user-permissions" element={<ProtectedRoute><TrialAccessGuard><UserPermissionsGuide /></TrialAccessGuard></ProtectedRoute>} />
            <Route path="/help/user-manual" element={<ProtectedRoute><TrialAccessGuard><UserManual /></TrialAccessGuard></ProtectedRoute>} />
            <Route path="/help/feature-spotlights" element={<ProtectedRoute><TrialAccessGuard><FeatureSpotlights /></TrialAccessGuard></ProtectedRoute>} />
            <Route path="/help/advanced-use-cases" element={<ProtectedRoute><TrialAccessGuard><AdvancedUseCases /></TrialAccessGuard></ProtectedRoute>} />
            <Route path="/help/troubleshooting" element={<ProtectedRoute><TrialAccessGuard><Troubleshooting /></TrialAccessGuard></ProtectedRoute>} />
            <Route path="/help/api-docs" element={<ProtectedRoute><TrialAccessGuard><ApiDocs /></TrialAccessGuard></ProtectedRoute>} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/setup-guide" element={<ProtectedRoute><TrialAccessGuard><SetupGuide /></TrialAccessGuard></ProtectedRoute>} />
            <Route path="/manage-subscription" element={<ProtectedRoute><ManageSubscription /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
