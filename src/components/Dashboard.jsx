import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gauge } from 'lucide-react';

function Dashboard({ user }) {
  const navigate = useNavigate();

  return (
    <div className="h-fit bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] max-w-2xl w-full flex flex-col items-center justify-center text-center">
          <div className="flex items-center space-x-3 mb-6">
            <Gauge className="w-10 h-10 text-blue-700" />
            <h3 className="text-3xl font-bold text-blue-800">Vehicle Analytics</h3>
          </div>
          <p className="text-gray-700 mb-8 text-lg">
            Gain insights into your fleet’s performance, track fuel efficiency, and stay on top of maintenance schedules—all in one place.
          </p>
          <button
            onClick={() => navigate('/vehicle-analytics')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium text-base"
          >
            View Details
          </button>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] max-w-2xl w-full flex flex-col items-center justify-center text-center">
          <div className="flex items-center space-x-3 mb-6">
            <Gauge className="w-10 h-10 text-blue-700" />
            <h3 className="text-3xl font-bold text-blue-800">Current Data</h3>
          </div>
          <p className="text-gray-700 mb-8 text-lg">
            View real-time vehicle data for device VCL000, including battery and motor parameters.
          </p>
          <button
            onClick={() => navigate('/vehicle-data')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium text-base"
          >
            View Data
          </button>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;