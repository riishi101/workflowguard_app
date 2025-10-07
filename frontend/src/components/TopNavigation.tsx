import { useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
  ChevronDown
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
  isRead: boolean;
}

const TopNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Workflow Protection Active",
      message: "Your workflows are being monitored and protected. All 16 workflows are now under active protection.",
      type: "success",
      timestamp: "2m ago",
      isRead: false
    },
    {
      id: "2", 
      title: "Rollback Feature Available",
      message: "Advanced workflow versioning and rollback functionality is now live. You can now revert workflows to previous versions.",
      type: "info",
      timestamp: "1h ago", 
      isRead: false
    }
  ]);

  // Load notifications from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  // Save notifications to localStorage on change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Risk Assessment", path: "/risk-assessment" },
    { label: "Workflow History", path: "/workflow-history" },
    { label: "Settings", path: "/settings" },
    { label: "Help & Support", path: "/help-support" },
  ];

  // Check if user has workflows to determine if Workflow History should be active
  const hasWorkflows = user;

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
      localStorage.removeItem('token');
      navigate("/");
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const name = user.name || user.email || "";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserName = () => {
    if (!user) return "User";
    return user.name || user.email?.split("@")[0] || "User";
  };

  const getSubscriptionStatus = () => {
    return null;
  };

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo - Left side */}
        <div className="flex-shrink-0">
          <div
            onClick={() => navigate('/dashboard')}
            style={{ cursor: 'pointer' }}
            aria-label="Go to Dashboard"
            tabIndex={0}
            role="button"
            onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/dashboard'); }}
          >
            <WorkflowGuardLogo size="sm" />
          </div>
        </div>

        {/* Navigation - Centered */}
        <nav className="flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors duration-200",
                isActive(item.path)
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Side - Notifications & User */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative p-2 hover:bg-gray-100 transition-colors duration-200 rounded-lg"
              >
                <Bell className="w-5 h-5 text-gray-600 hover:text-gray-800 transition-colors duration-200" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white border-2 border-white shadow-sm flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 shadow-lg border-0 rounded-lg overflow-hidden">
              <div className="bg-white rounded-lg border border-gray-200 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
                
                {/* Notification Items */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={cn(
                          "p-4 border-b border-gray-50 cursor-pointer transition-colors duration-150",
                          notification.isRead 
                            ? "bg-white hover:bg-gray-50" 
                            : "bg-blue-50 hover:bg-blue-100"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                            notification.isRead ? "bg-gray-300" : "bg-blue-500"
                          )}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={cn(
                                "text-sm font-medium",
                                notification.isRead ? "text-gray-600" : "text-gray-900"
                              )}>
                                {notification.title}
                              </p>
                              <span className="text-xs text-gray-400">{notification.timestamp}</span>
                            </div>
                            <p className={cn(
                              "text-xs mt-1 leading-relaxed",
                              notification.isRead ? "text-gray-500" : "text-gray-600"
                            )}>
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
              <Button variant="ghost" className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors duration-200 rounded-lg">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-700 font-medium">
                  {getUserName()}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-500" />
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
