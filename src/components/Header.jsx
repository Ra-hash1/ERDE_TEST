import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, CreditCard, HelpCircle, LifeBuoy } from "lucide-react";
import intuteLogo from "../assets/intuteAILogo.png";
// Placeholder for UserProfileModal (implement or remove if not ready)
import UserProfileModal from "./UserProfileModal";

function Header({ user, onLogout }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/");
    console.log("Logout triggered, navigating to /"); // Debug log
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    console.log("Sidebar toggled, state:", !isSidebarOpen); // Debug log
  };

  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`); // Debug log
    navigate(path);
    setIsSidebarOpen(false);
  };

  const sidebarOptions = [
    { name: "User Profile", path: "/profile", icon: <User className="w-6 h-6" /> },
    { name: "Subscription", path: "/subscription", icon: <CreditCard className="w-6 h-6" /> },
    { name: "FAQs", path: "/faqs", icon: <HelpCircle className="w-6 h-6" /> },
    { name: "Support", path: "/support", icon: <LifeBuoy className="w-6 h-6" /> },
  ];

  return (
    <header className="bg-gradient-to-r from-gray-100 via-blue-50 to-gray-200 text-gray-800 p-4 shadow-lg sticky top-0 z-20">
      <div className="container mx-auto flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-700 hover:bg-blue-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        <div className="flex items-center space-x-2 ml-2">
          <img src={intuteLogo} alt="Intute AI Logo" className="h-16" />
        </div>

        {user && (
          <button
            onClick={handleLogout}
            className="ml-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-base font-medium text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            Logout
          </button>
        )}
      </div>

      <div
        className={`fixed top-0 left-0 h-full w-56 bg-gray-100 text-gray-800 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-200 ease-in-out z-30 shadow-xl`}
      >
        <div className="flex items-center justify-end p-3 border-b border-gray-200">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Close sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col p-4 space-y-1">
          {sidebarOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => {
                if (option.name === "User Profile") {
                  setShowProfileModal(true);
                  console.log("Opening User Profile Modal"); // Debug log
                } else {
                  handleNavigation(option.path);
                }
                setIsSidebarOpen(false);
              }}
              className="flex items-center w-full text-left px-4 py-3 text-lg font-medium text-gray-800 hover:bg-indigo-100 hover:text-indigo-900 active:bg-indigo-200 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-300 border-b border-gray-200"
            >
              <span className="mr-3">{option.icon}</span>
              {option.name}
            </button>
          ))}
        </nav>
      </div>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-10"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      {showProfileModal && (
        <UserProfileModal
          user={user}
          onClose={() => {
            setShowProfileModal(false);
            console.log("User Profile Modal closed"); // Debug log
          }}
          onSave={(newPassword) => {
            console.log("New password submitted:", newPassword); // Debug log
            setShowProfileModal(false);
          }}
        />
      )}
    </header>
  );
}

export default Header;