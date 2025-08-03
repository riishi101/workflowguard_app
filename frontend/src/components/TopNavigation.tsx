import { useLocation, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import WorkflowGuardLogo from "./WorkflowGuardLogo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  HelpCircle, 
  CreditCard,
  Shield,
  ChevronDown
} from "lucide-react";

const TopNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();


  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: Shield },
    { label: "Workflow History", path: "/workflow-history", icon: Shield },
    { label: "Settings", path: "/settings", icon: Settings },
    { label: "Help & Support", path: "/help-support", icon: HelpCircle },
  ];

  // Check if user has workflows to determine if Workflow History should be active
  const hasWorkflows = user && user.subscription;

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/";
    }
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      localStorage.removeItem('authToken');
    navigate("/");
    }
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getUserName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  const getSubscriptionStatus = () => {
    if (!user?.subscription) return null;
    return {
      plan: user.subscription.plan,
      status: user.subscription.status,
      isActive: user.subscription.status === 'active'
    };
  };

  const subscriptionStatus = getSubscriptionStatus();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.startsWith("/workflow-history")) return "Workflow History";
    if (path === "/settings") return "Settings";
    if (path === "/help-support") return "Help & Support";
    if (path === "/manage-subscription") return "Billing & Subscription";
    if (path === "/contact") return "Contact Support";
    return "";
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo - Consistent placement */}
        <div className="flex-shrink-0">
          <Link to="/dashboard">
            <WorkflowGuardLogo />
          </Link>
        </div>

        {/* Navigation - Centered */}
        <nav className="flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors flex items-center gap-2",
                isActive(item.path)
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900",
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Side - Notifications & User */}
        <div className="flex items-center space-x-3">
          {/* Plan Status */}
          {subscriptionStatus && (
            <div className="flex items-center gap-2">
              <Badge 
                variant={subscriptionStatus.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {subscriptionStatus.plan}
              </Badge>
            </div>
          )}
          
          {/* Enhanced Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative p-2 hover:bg-gray-100 transition-colors duration-200 group"
              >
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 hover:bg-red-600 border-2 border-white shadow-sm animate-pulse">
                  2
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 shadow-lg border-0">
              <div className="bg-white rounded-lg border border-gray-200 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-gray-900">Notifications</span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border border-blue-200">
                    2 new
                  </Badge>
                </div>
                
                {/* Notification Items */}
                <div className="max-h-80 overflow-y-auto">
                  {/* Notification 1 */}
                  <div className="p-4 hover:bg-blue-50 transition-colors duration-150 border-b border-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">Workflow Protection Active</p>
                          <span className="text-xs text-gray-400">2m ago</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          Your workflows are being monitored and protected. All 16 workflows are now under active protection.
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                          <span className="text-xs text-gray-500">16 workflows protected</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Notification 2 */}
                  <div className="p-4 hover:bg-green-50 transition-colors duration-150 border-b border-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">Rollback Feature Available</p>
                          <span className="text-xs text-gray-400">1h ago</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          Advanced workflow versioning and rollback functionality is now live. You can now revert workflows to previous versions.
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            New Feature
                          </Badge>
                          <span className="text-xs text-gray-500">Version control enabled</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                  >
                    View All Notifications
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-700 font-medium">
                  {getUserName()}
                </span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{getUserName()}</p>
                  <p className="text-xs text-gray-500">
                    {user?.email || "user@example.com"}
                  </p>
                  {subscriptionStatus && (
                    <div className="flex items-center gap-1 mt-1">
                      <Badge 
                        variant={subscriptionStatus.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {subscriptionStatus.plan}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {subscriptionStatus.status}
                      </span>
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/manage-subscription")}>
                <CreditCard className="w-4 h-4 mr-2" />
                Billing & Subscription
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/help-support")}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/contact")}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Contact Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
