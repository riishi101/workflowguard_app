import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import WorkflowGuardLogo from "./WorkflowGuardLogo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Menu, 
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: Shield },
    { label: "Workflow History", path: "/workflow-history", icon: Shield },
    { label: "Settings", path: "/settings", icon: Settings },
    { label: "Help & Support", path: "/help-support", icon: HelpCircle },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/";
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate("/");
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

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/dashboard">
            <WorkflowGuardLogo />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
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
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
              2
            </Badge>
          </Button>

          {/* User Profile - Desktop */}
          <div className="hidden md:block">
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
                  Billing
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {/* Mobile Navigation */}
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive(item.path)
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="border-t pt-4">
                  {/* Mobile User Info */}
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-sm bg-blue-100 text-blue-600">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{getUserName()}</p>
                      <p className="text-xs text-gray-500">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>

                  {/* Mobile User Actions */}
                  <div className="space-y-1 mt-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/settings");
                        setMobileMenuOpen(false);
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/manage-subscription");
                        setMobileMenuOpen(false);
                      }}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Billing
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/contact");
                        setMobileMenuOpen(false);
                      }}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
