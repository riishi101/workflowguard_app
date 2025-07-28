import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/workflow-selection" element={<WorkflowSelection />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workflow-history" element={<WorkflowHistory />} />
            <Route
              path="/workflow-history/:workflowId"
              element={<WorkflowHistoryDetail />}
            />
            <Route path="/compare-versions" element={<CompareVersions />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<HelpSupport />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/setup-guide" element={<SetupGuide />} />
            <Route path="/manage-subscription" element={<ManageSubscription />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
