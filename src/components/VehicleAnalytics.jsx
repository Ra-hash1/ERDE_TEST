import React from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, Truck } from "lucide-react";

function VehicleAnalytics({ user }) {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    console.log(`Navigating to: ${path}`); // Debug log
    navigate(path);
  };

  return (
    <div className="h-fit bg-gray-100">
      <main className="container mx-auto p-6 flex flex-col items-center min-h-[calc(100vh-80px)]">
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8 relative animate-fade-in after:content-[''] after:block after:w-24 after:h-1 after:bg-gradient-to-r after:from-blue-600 after:to-indigo-600 after:mx-auto after:mt-2 after:rounded">
          Choose your machine type!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-10 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-h-[300px] flex flex-col items-center justify-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Wrench className="w-8 h-8 text-blue-600" />
              <h3 className="text-2xl font-semibold text-blue-800 text-center">
                Excavator
              </h3>
            </div>
            <p className="text-gray-600 mb-6 text-center text-base">
              Analyze performance and maintenance data for your excavators.
            </p>
            <button
              onClick={() => handleNavigate("/excavator-parameters")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Explore Excavator
            </button>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-blue-100 p-10 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-h-[300px] flex flex-col items-center justify-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Truck className="w-8 h-8 text-indigo-600" />
              <h3 className="text-2xl font-semibold text-indigo-800 text-center">
                Loader
              </h3>
            </div>
            <p className="text-gray-600 mb-6 text-center text-base">
              Track and optimize the performance of your loaders.
            </p>
            <button
              onClick={() => handleNavigate("/loader-parameters")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              Explore Loader
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default VehicleAnalytics;