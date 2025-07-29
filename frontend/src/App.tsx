import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import WorkflowSelection from "./pages/WorkflowSelection";
import Dashboard from "./pages/Dashboard";
import WorkflowHistory from "./pages/WorkflowHistory";
import WorkflowHistoryDetail from "./pages/WorkflowHistoryDetail";
import CompareVersions from "./pages/CompareVersions";
import Settings from "./pages/Settings";
import HelpSupport from "./pages/HelpSupport";
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
            <Route path="/" element={<Index />} />
            <Route path="/workflow-selection" element={<ProtectedRoute><WorkflowSelection /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/workflow-history" element={<ProtectedRoute><WorkflowHistory /></ProtectedRoute>} />
            <Route
              path="/workflow-history/:workflowId"
              element={<ProtectedRoute><WorkflowHistoryDetail /></ProtectedRoute>}
            />
            <Route path="/compare-versions" element={<ProtectedRoute><CompareVersions /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/setup-guide" element={<ProtectedRoute><SetupGuide /></ProtectedRoute>} />
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
