import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import LoginModal from "./components/LoginModal";
import Header from "./components/Header";
import VehicleSelector from "./components/VehicleSelector";
import Dashboard from "./components/Dashboard";
import BatteryPage from "./components/BatteryPage";
import MotorPage from "./components/MotorPage";
import FaultsPage from "./components/FaultsPage";
import VehicleData from "./components/VehicleData";
import axios from "axios";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(() => {
    // Initialize user from localStorage to avoid null state
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      console.error("Error parsing user from localStorage:", err.message);
      return null;
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Initial user from localStorage:", localStorage.getItem("user"));
    if (user) {
      setShowLogin(false);
      if (!localStorage.getItem("selectedVehicle")) {
        navigate("/vehicle-select");
        console.log("Navigating to /vehicle-select with user:", user);
      } else if (window.location.pathname === "/") {
        navigate("/dashboard");
        console.log("Navigating to /dashboard with user:", user);
      }
    } else {
      setShowLogin(true);
      console.log("No user found, showing login");
    }
  }, [navigate, user]);

  const handleLogin = (role, name, token, email) => {
    const newUser = { role, name, token, email };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    console.log("Logged in:", { role, name, token, email });
    setShowLogin(false);
    navigate("/vehicle-select");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("selectedVehicle");
    setShowLogin(true);
    navigate("/");
    console.log("Logged out, navigating to /");
  };

  useEffect(() => {
    console.log("User state updated:", user);
    if (user?.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
      console.log("Set Authorization header with token:", user.token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      console.log("Cleared Authorization header");
    }
  }, [user]);

  return (
    <div className="min-h-screen">
      <Routes>
        <Route
          path="/"
          element={
            showLogin || !user ? (
              <LoginModal setShowLogin={setShowLogin} onSubmit={handleLogin} />
            ) : (
              <Navigate to="/vehicle-select" replace />
            )
          }
        />
        <Route
          path="/vehicle-select"
          element={
            user ? (
              <>
                <Header user={user} onLogout={handleLogout} />
                <VehicleSelector user={user} />
              </>
            ) : (
              <LoginModal setShowLogin={setShowLogin} onSubmit={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            user && localStorage.getItem("selectedVehicle") ? (
              <>
                <Header user={user} onLogout={handleLogout} />
                <Dashboard user={user} />
              </>
            ) : (
              <Navigate to="/vehicle-select" replace />
            )
          }
        />
        <Route
          path="/battery/:vehicleId"
          element={
            user ? (
              <>
                <Header user={user} onLogout={handleLogout} />
                <BatteryPage user={user} />
              </>
            ) : (
              <LoginModal setShowLogin={setShowLogin} onSubmit={handleLogin} />
            )
          }
        />
        <Route
          path="/motor/:vehicleId"
          element={
            user ? (
              <>
                <Header user={user} onLogout={handleLogout} />
                <MotorPage user={user} />
              </>
            ) : (
              <LoginModal setShowLogin={setShowLogin} onSubmit={handleLogin} />
            )
          }
        />
        <Route
          path="/faults/:vehicleId"
          element={
            user ? (
              <>
                <Header user={user} onLogout={handleLogout} />
                <FaultsPage user={user} />
              </>
            ) : (
              <LoginModal setShowLogin={setShowLogin} onSubmit={handleLogin} />
            )
          }
        />
        <Route
          path="/vehicle-data/:vehicleId"
          element={
            user ? (
              <>
                <Header user={user} onLogout={handleLogout} />
                <VehicleData user={user} />
              </>
            ) : (
              <LoginModal setShowLogin={setShowLogin} onSubmit={handleLogin} />
            )
          }
        />
        <Route
          path="*"
          element={<Navigate to={user ? "/vehicle-select" : "/"} replace />}
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