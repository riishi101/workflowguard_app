import { HelpCircle, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ContentPageHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/dashboard')}
          tabIndex={0}
          role="button"
          aria-label="Go to Dashboard"
          onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/dashboard'); }}
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Ffae26f580f3f4b359fc5216711c44c53%2Fd39eaf7303fe479fa4c676102d347505?format=webp&width=800"
            alt="WorkflowGuard Logo"
            className="w-6 h-6"
          />
          <span className="font-semibold text-gray-900">WorkflowGuard</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/help")}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            Help
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>
    </header>
  );
};

export default ContentPageHeader;
