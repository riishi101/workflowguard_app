import { useLocation, Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import WorkflowGuardLogo from "./WorkflowGuardLogo";
import { cn } from "@/lib/utils";

const TopNavigation = () => {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Workflow History", path: "/workflow-history" },
    { label: "Settings", path: "/settings" },
    { label: "Help & Support", path: "/help" },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/";
    }
    return location.pathname === path;
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex-shrink-0">
          <WorkflowGuardLogo />
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors",
                isActive(item.path)
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-700 font-medium">John Smith</span>
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
              JS
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
