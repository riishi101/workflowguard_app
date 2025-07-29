import { useNavigate } from "react-router-dom";
import WorkflowGuardLogo from "./WorkflowGuardLogo";
import { HelpCircle, Settings } from "lucide-react";

const SimpleTopNavigation = () => {
  const navigate = useNavigate();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex-shrink-0">
          <WorkflowGuardLogo />
        </div>

        {/* Navigation Items - Only Help and Settings */}
        <nav className="flex items-center space-x-6">
          <button
            onClick={() => navigate("/help")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            Help
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </nav>
      </div>
    </header>
  );
};

export default SimpleTopNavigation; 