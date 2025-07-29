import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl px-6 py-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          © 2024 WorkflowGuard. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/terms-of-service")}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Terms of Service
          </button>
          <button
            onClick={() => navigate("/privacy-policy")}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Contact Us
          </button>
          <button
            onClick={() => navigate("/setup-guide")}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Setup Guide
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
