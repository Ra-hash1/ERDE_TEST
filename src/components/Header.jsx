import React, { useState } from "react";
import { User, CreditCard, HelpCircle, LifeBuoy, Car, Settings, Gauge, Power } from "lucide-react";

function Header({ user, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    if (onLogout) onLogout();
    console.log("Logout triggered"); 
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`);
    setIsSidebarOpen(false);
  };

  const sidebarOptions = [
    { name: "User Profile", path: "/profile", icon: <User className="w-6 h-6" /> },
    { name: "Vehicle Settings", path: "/settings", icon: <Settings className="w-6 h-6" /> },
    { name: "Diagnostics", path: "/diagnostics", icon: <Gauge className="w-6 h-6" /> },
    { name: "Support Center", path: "/support", icon: <LifeBuoy className="w-6 h-6" /> },
  ];

  return (
    <>
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white shadow-2xl sticky top-0 z-20 border-b-2 border-orange-500/30">
        <div className="container mx-auto flex items-center p-4">
          {/* Menu Button */}
          <button
            onClick={toggleSidebar}
            className="p-3 rounded-xl bg-gray-800/50 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 border border-orange-500/20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>

          {/* Logo/Brand Section */}
          <div className="flex items-center space-x-4 ml-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
              <Car className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Vehicle Monitor
              </h1>
              <p className="text-gray-400 text-sm">Diagnostic System</p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="hidden md:flex items-center space-x-6 ml-8">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300 text-sm">System Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300 text-sm">Monitoring Active</span>
            </div>
          </div>

          {/* User Section */}
          {user && (
            <div className="ml-auto flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-white font-medium">{user.name || 'Driver'}</p>
                <p className="text-gray-400 text-sm">VCL001 Active</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl text-white font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Power className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Automotive Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-30 shadow-2xl border-r-2 border-orange-500/30`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Control Panel</h2>
              <p className="text-gray-400 text-xs">Vehicle Dashboard</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-300 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => {
                if (option.name === "User Profile") {
                  setShowProfileModal(true);
                } else {
                  handleNavigation(option.path);
                }
                setIsSidebarOpen(false);
              }}
              className="flex items-center w-full text-left px-4 py-4 text-white hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-red-500/20 active:from-orange-500/30 active:to-red-500/30 rounded-xl transition-all duration-300 group border border-transparent hover:border-orange-500/30"
            >
              <span className="mr-4 text-orange-400 group-hover:text-orange-300 transition-colors duration-300">
                {option.icon}
              </span>
              <div>
                <span className="font-medium group-hover:text-white transition-colors duration-300">
                  {option.name}
                </span>
              </div>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-orange-500/20">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300 text-sm">All Systems Normal</span>
            </div>
            <div className="text-xs text-gray-500">
              Last Check: Just now
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-20"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}

export default Header;