import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { AuthContext } from "@/App";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import Contacts from "@/components/pages/Contacts";
import Pipeline from "@/components/pages/Pipeline";
import Button from "@/components/atoms/Button";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const { user } = useSelector((state) => state.user);

const navigationItems = [
    { name: "Dashboard", path: "/", icon: "LayoutDashboard" },
{ name: "Pipeline", path: "/pipeline", icon: "GitBranch" },
    { name: "Deals", path: "/deals", icon: "Briefcase" },
    { name: "Contacts", path: "/contacts", icon: "Users" },
    { name: "Companies", path: "/companies", icon: "Building2" },
    { name: "Leads", path: "/leads", icon: "UserPlus" },
    { name: "Tasks", path: "/tasks", icon: "CheckSquare" },
    { name: "Activities", path: "/activities", icon: "Activity" }
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <ApperIcon name="GitBranch" size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Pipeline Pro
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? "text-primary bg-primary/10 border-b-2 border-primary"
                    : "text-gray-700 hover:text-primary hover:bg-primary/5"
                }`}
              >
                <ApperIcon name={item.icon} size={16} />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
{/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar
              placeholder="Search deals, contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">{user?.emailAddress}</p>
              </div>
{user?.profilePicture && (
                <img 
                  src={user.profilePicture} 
                  alt={user.firstName}
                  className="w-8 h-8 rounded-full"
                />
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-700 hover:text-red-600"
            >
              <ApperIcon name="LogOut" size={16} className="mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700"
            >
              <ApperIcon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? "text-primary bg-primary/10"
                      : "text-gray-700 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <ApperIcon name={item.icon} size={16} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
<div className="mt-4 px-3">
              <SearchBar
                placeholder="Search deals, contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="mt-4 px-3 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="w-full text-left justify-start text-gray-700 hover:text-red-600"
              >
                <ApperIcon name="LogOut" size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;