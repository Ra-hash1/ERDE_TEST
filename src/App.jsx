import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import LoginModal from "./components/LoginModal";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import VehicleAnalytics from "./components/VehicleAnalytics";
import ExcavatorParameters from "./components/ExcavatorParameters";
import LoaderParameters from "./components/LoaderParameters";
import axios from "axios";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Initial user from localStorage:", storedUser); // Debug log
    if (storedUser && !user) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setShowLogin(false);
      if (window.location.pathname === "/") {
        navigate("/dashboard");
        console.log("Navigating to /dashboard with user:", parsedUser); // Debug log
      }
    } else if (!storedUser) {
      setShowLogin(true);
      console.log("No user found, showing login"); // Debug log
    }
  }, [navigate, user]); // Added user to dependency array to prevent infinite loop

  const handleLogin = (role, name, token, email) => {
    const newUser = { role, name, token, email };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    console.log("Logged in:", { role, name, token, email }); // Debug log
    setShowLogin(false);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setShowLogin(true);
    navigate("/");
    console.log("Logged out, navigating to /"); // Debug log
  };

  useEffect(() => {
    console.log("User state updated:", user); // Debug log
    if (user?.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [user?.token]);

  return (
    <div className="min-h-screen">
      <Routes>
        <Route
          path="/"
          element={
            showLogin || !user ? (
              <LoginModal setShowLogin={setShowLogin} onSubmit={handleLogin} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <>
                <Header user={user} onLogout={handleLogout} />
                <Dashboard user={user} />
              </>
            ) : (
              <LoginModal setShowLogin={setShowLogin} onSubmit={handleLogin} />
            )
          }
        />
        <Route
          path="/vehicle-analytics"
          element={
            user ? (
              <>
                <Header user={user} onLogout={handleLogout} />
                <VehicleAnalytics user={user} />
              </>
            ) : (
              <LoginModal setShowLogin={setShowLogin} onSubmit={handleLogin} />
            )
          }
        />
        <Route
          path="/excavator-parameters"
          element={
            user ? (
              <>
                <Header user={user} onLogout={handleLogout} />
                <ExcavatorParameters user={user} />
              </>
            ) : (
              <LoginModal setShowLogin={setShowLogin} onSubmit={handleLogin} />
            )
          }
        />
        <Route
          path="/loader-parameters"
          element={
            user ? (
              <>
                <Header user={user} onLogout={handleLogout} />
                <LoaderParameters user={user} />
              </>
            ) : (
              <LoginModal setShowLogin={setShowLogin} onSubmit={handleLogin} />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}