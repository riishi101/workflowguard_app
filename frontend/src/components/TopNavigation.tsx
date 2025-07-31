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
    if (path === "/dashboard") return "Dashboard";
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
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/dashboard">
            <WorkflowGuardLogo />
          </Link>
        </div>

        {/* Breadcrumb */}
        {breadcrumb && (
          <div className="flex items-center text-sm text-gray-500">
            <span className="mx-2">/</span>
            <span className="font-medium">{breadcrumb}</span>
          </div>
        )}

        {/* Navigation */}
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
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                  2
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Workflow Protection Active</p>
                  <p className="text-xs text-gray-500">Your workflows are being monitored</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">New Feature Available</p>
                  <p className="text-xs text-gray-500">Check out our latest updates</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                View All Notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Quick Actions
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/workflow-selection")}>
                <Shield className="w-4 h-4 mr-2" />
                Add Workflow
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                <Shield className="w-4 h-4 mr-2" />
                View Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/workflow-history")}>
                <Shield className="w-4 h-4 mr-2" />
                Workflow History
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/help-support")}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Get Help
              </DropdownMenuItem>
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
