// VehicleSelector.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Zap, Shield, MapPin, ChevronRight, Gauge, Route, Wrench } from "lucide-react";

function VehicleSelector({ user }) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const vehicles = [
    {
      id: "VCL001",
      name: "VCL001",
      model: "Main Vehicle",
      status: "Active",
      battery: 87,
      location: "Parking Bay A1",
      mileage: "45,230 km",
      lastService: "15 days ago",
    },
    {
      id: "VCL002",
      name: "VCL002",
      model: "Secondary Vehicle",
      status: "Charging",
      battery: 65,
      location: "Parking Bay B2",
      mileage: "32,150 km",
      lastService: "30 days ago",
    },
  ];

  const handleSelectVehicle = async (vehicleId) => {
    setSelectedVehicle(vehicleId);
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200)); // Simulate loading
    localStorage.setItem("selectedVehicle", vehicleId);
    navigate("/dashboard"); // Navigate to Dashboard route
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-full bg-gradient-to-b from-orange-400 to-transparent"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-full">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-16 bg-orange-400 mb-8"
              style={{ marginTop: i === 0 ? "0" : "32px" }}
            ></div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-700 to-transparent"></div>
        <div className="absolute top-1/4 right-10 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 left-10 w-3 h-3 bg-green-500 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-2000"></div>
      </div>
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 via-red-500 to-red-700 rounded-full mb-6 shadow-2xl border-4 border-orange-400/30">
              <Gauge className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-orange-300 bg-clip-text text-transparent mb-4">
              Vehicle Dashboard
            </h1>
            <p className="text-gray-300 text-xl">
              Select your vehicle to monitor performance and diagnostics
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="group relative">
                <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl border-2 border-orange-500/30 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"></div>
                  <button
                    onClick={() => handleSelectVehicle(vehicle.id)}
                    disabled={isLoading}
                    className="relative w-full p-8 text-left transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading && selectedVehicle === vehicle.id && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                          <span className="text-white font-medium text-lg">Starting Engine...</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Car className="w-10 h-10 text-white" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-3 border-white shadow-lg animate-pulse"></div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">{vehicle.name}</h3>
                          <p className="text-orange-200 text-lg">{vehicle.model}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-8 h-8 text-orange-400 group-hover:text-orange-300 group-hover:translate-x-2 transition-all duration-300" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-black/30 rounded-xl p-4 border border-orange-500/20">
                        <div className="flex items-center space-x-3 mb-2">
                          <Zap className="w-5 h-5 text-green-400" />
                          <span className="text-gray-300 text-sm">Battery</span>
                        </div>
                        <p className="text-white font-bold text-xl">{vehicle.battery}%</p>
                        <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                          <div
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${vehicle.battery}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="bg-black/30 rounded-xl p-4 border border-orange-500/20">
                        <div className="flex items-center space-x-3 mb-2">
                          <Shield className="w-5 h-5 text-orange-400" />
                          <span className="text-gray-300 text-sm">Status</span>
                        </div>
                        <p className="text-green-400 font-bold text-xl">{vehicle.status}</p>
                      </div>
                      <div className="bg-black/30 rounded-xl p-4 border border-orange-500/20">
                        <div className="flex items-center space-x-3 mb-2">
                          <Route className="w-5 h-5 text-blue-400" />
                          <span className="text-gray-300 text-sm">Mileage</span>
                        </div>
                        <p className="text-white font-bold text-lg">{vehicle.mileage}</p>
                      </div>
                      <div className="bg-black/30 rounded-xl p-4 border border-orange-500/20">
                        <div className="flex items-center space-x-3 mb-2">
                          <Wrench className="w-5 h-5 text-purple-400" />
                          <span className="text-gray-300 text-sm">Service</span>
                        </div>
                        <p className="text-white font-bold text-lg">{vehicle.lastService}</p>
                      </div>
                    </div>
                    <div className="bg-black/30 rounded-xl p-4 border border-orange-500/20">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-red-400" />
                        <div>
                          <p className="text-gray-300 text-sm">Current Location</p>
                          <p className="text-white font-semibold">{vehicle.location}</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VehicleSelector;