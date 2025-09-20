import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gauge, Battery, Clock, Activity, Zap, TrendingUp, Cpu, ArrowLeft, BarChart3, CheckCircle, AlertTriangle } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function VehicleData({ user }) {
  const selectedVehicle = window.location.pathname.split('/')[2] || 'VCL001';
  const [data, setData] = useState({
    today: { runningHrs: 0, runningKms: 0, maxCurrent: 0, avgCurrent: 0, maxSpeed: 0, avgSpeed: 0, totalEnergy: 0, chargeCycles: 0 },
    week: { runningHrs: 0, runningKms: 0, maxCurrent: 0, avgCurrent: 0, maxSpeed: 0, avgSpeed: 0, totalEnergy: 0, chargeCycles: 0 },
    month: { runningHrs: 0, runningKms: 0, maxCurrent: 0, avgCurrent: 0, maxSpeed: 0, avgSpeed: 0, totalEnergy: 0, chargeCycles: 0 },
    total: { runningHrs: 0, runningKms: 0, maxCurrent: 0, avgCurrent: 0, maxSpeed: 0, avgSpeed: 0, totalEnergy: 0, chargeCycles: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [historicalData, setHistoricalData] = useState([]);
  const navigate = useNavigate();
  const updateIntervalRef = useRef(null);

  // Mock data generator
  const generateMockVehicleData = (period) => {
    const baseData = {
      runningHrs: Number((Math.random() * (period === 'today' ? 24 : period === 'week' ? 168 : period === 'month' ? 720 : 10000)).toFixed(2)),
      runningKms: Number((Math.random() * (period === 'today' ? 100 : period === 'week' ? 700 : period === 'month' ? 3000 : 50000)).toFixed(2)),
      maxCurrent: Math.floor(Math.random() * 101) + 50, // 50-150 A
      avgCurrent: Math.floor(Math.random() * 76) + 25, // 25-100 A
      maxSpeed: Math.floor(Math.random() * 81) + 20, // 20-100 km/h
      avgSpeed: Math.floor(Math.random() * 61) + 10, // 10-70 km/h
      totalEnergy: Number((Math.random() * (period === 'today' ? 50 : period === 'week' ? 350 : period === 'month' ? 1500 : 25000)).toFixed(2)),
      chargeCycles: Math.floor(Math.random() * (period === 'today' ? 2 : period === 'week' ? 14 : period === 'month' ? 60 : 1000)),
      timestamp: Date.now(),
    };
    console.log(`Generated mock ${period} data:`, baseData);
    return baseData;
  };

  // Mock fetch data
  const fetchData = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      }

      const periods = ['today', 'week', 'month', 'total'];
      const newData = periods.reduce((acc, period) => {
        acc[period] = generateMockVehicleData(period);
        return acc;
      }, { ...data });

      console.log('Mock fetched data:', JSON.stringify(newData, null, 2));
      setData(newData);

      // Generate mock recent data
      const recentData = Array.from({ length: 10 }, (_, index) => {
        const motorSpeed = Math.floor(Math.random() * 4001); // 0-4000 RPM
        const timeDelta = 5; // Simulate 5-second intervals
        return {
          time: new Date(Date.now() - (10 - index) * 5000).toLocaleTimeString(),
          runningHrs: motorSpeed > 0 ? timeDelta / 3600 : 0,
          runningKms: motorSpeed > 0 ? (motorSpeed * 0.001885) * (timeDelta / 3600) : 0,
          avgSpeed: motorSpeed * 0.001885 * 60,
          current: Math.floor(Math.random() * 76) + 25, // 25-100 A
          packState: Math.floor(Math.random() * 101), // 0-100%
        };
      });

      console.log('Mock historical data:', JSON.stringify(recentData, null, 2));
      setHistoricalData(recentData);

      if (isInitial) {
        setIsInitialLoad(false);
        setLoading(false);
      }
    } catch (err) {
      console.error(`Error generating mock data for ${selectedVehicle}: ${err.message}`);
      setError(`Failed to generate mock vehicle data for ${selectedVehicle}: ${err.message}`);
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchData(true);
      updateIntervalRef.current = setInterval(() => fetchData(false), 10000);
    } else {
      setError('No authentication token provided');
      setLoading(false);
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [user?.token, selectedVehicle]);

  if (loading && isInitialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 w-32 h-32 border-4 border-orange-500/20 rounded-full animate-pulse"></div>
          <div className="absolute inset-2 w-28 h-28 border-4 border-orange-400/40 rounded-full animate-spin"></div>
          <div className="absolute inset-4 w-24 h-24 border-4 border-orange-300/60 rounded-full animate-ping"></div>
          <div className="w-32 h-32 flex items-center justify-center">
            <Cpu className="w-12 h-12 text-orange-400 animate-pulse" />
          </div>
        </div>
        <div className="absolute mt-48">
          <span className="text-white font-medium text-xl bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Initializing Vehicle Systems...
          </span>
        </div>
      </div>
    );
  }

  if (error && Object.values(data).every(period => period.runningHrs === 0 && period.runningKms === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
            <div className="absolute inset-0 w-16 h-16 border-2 border-red-500/30 rounded-full animate-ping mx-auto"></div>
          </div>
          <p className="text-red-400 text-xl">{error}</p>
        </div>
      </div>
    );
  }

  const currentData = [
    { name: 'Max Current', value: data.today.maxCurrent || 0, unit: 'A', fill: '#3b82f6' },
    { name: 'Avg Current', value: data.today.avgCurrent || 0, unit: 'A', fill: '#f59e0b' },
  ];

  const speedData = [
    { name: 'Max Speed', value: data.today.maxSpeed || 0, unit: 'km/h', fill: '#10b981' },
    { name: 'Avg Speed', value: data.today.avgSpeed || 0, unit: 'km/h', fill: '#3b82f6' },
  ];

  const usageData = [
    { name: 'Running Hrs', value: data.today.runningHrs || 0, unit: 'hrs', fill: '#ef4444' },
    { name: 'Running Kms', value: data.today.runningKms || 0, unit: 'km', fill: '#f59e0b' },
  ];

  const energyData = [
    { name: 'Total Energy', value: data.today.totalEnergy || 0, unit: 'kWh', fill: '#3b82f6' },
    { name: 'Charge Cycles', value: data.today.chargeCycles || 0, unit: '', fill: '#10b981' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-full">
          <div className="w-full h-full bg-gradient-to-b from-orange-400 via-red-400 to-purple-500 animate-pulse"></div>
        </div>
        <div className="absolute top-0 right-1/4 w-24 h-full bg-gradient-to-b from-blue-400 to-transparent opacity-50"></div>
        <div className="absolute top-0 left-1/4 w-16 h-full bg-gradient-to-b from-green-400 to-transparent opacity-30"></div>
      </div>

      <div className="absolute inset-0 opacity-20">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full" 
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="relative p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-110 hover:rotate-3 shadow-2xl"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl opacity-0 hover:opacity-30 transition-opacity duration-300"></div>
            </button>
            <div className="relative">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-orange-300 bg-clip-text text-transparent animate-pulse">
                Vehicle Data Center
              </h1>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
              <p className="text-gray-300 text-lg mt-2 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400 animate-pulse" />
                {selectedVehicle} - Performance Metrics
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm rounded-xl px-4 py-2 border border-green-500/30">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <span className="text-green-400 font-medium">
                  LIVE • {new Date(data.today.timestamp || Date.now()).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl border-2 border-green-500/30 shadow-2xl p-6 backdrop-blur-sm">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-t-3xl"></div>
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-xl flex items-center">
                  <div className="relative mr-3">
                    <Clock className="w-7 h-7 text-green-400" />
                    <div className="absolute inset-0 w-7 h-7 border-2 border-green-400/50 rounded-full animate-pulse"></div>
                  </div>
                  Usage Metrics
                </h3>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Today</div>
                  <div className="text-lg font-bold text-green-400">{data.today.runningHrs || 0} hrs</div>
                </div>
              </div>

              <div className="relative h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={usageData}
                      innerRadius={60}
                      outerRadius={90}
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {usageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">{data.today.runningKms || 0}</div>
                    <div className="text-green-400 text-sm">km</div>
                    <div className="text-xs text-gray-400">Distance Today</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 rounded-xl p-3 border border-green-500/20">
                  <div className="text-sm text-gray-400">Running Hours</div>
                  <div className="text-lg font-bold text-green-400">{data.today.runningHrs || 0} hrs</div>
                </div>
                <div className="bg-black/40 rounded-xl p-3 border border-green-500/20">
                  <div className="text-sm text-gray-400">Distance</div>
                  <div className="text-lg font-bold text-green-400">{data.today.runningKms || 0} km</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl border-2 border-blue-500/30 shadow-2xl p-6 backdrop-blur-sm">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-t-3xl"></div>
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-xl flex items-center">
                  <div className="relative mr-3">
                    <Gauge className="w-7 h-7 text-blue-400" />
                    <div className="absolute inset-0 w-7 h-7 border-2 border-blue-400/50 rounded-full animate-pulse"></div>
                  </div>
                  Speed Metrics
                </h3>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Max Speed</div>
                  <div className="text-lg font-bold text-blue-400">{data.today.maxSpeed || 0} km/h</div>
                </div>
              </div>

              <div className="relative h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart data={speedData} innerRadius="60%" outerRadius="90%" startAngle={180} endAngle={0}>
                    <RadialBar
                      dataKey="value"
                      cornerRadius="10"
                      fill="#3b82f6"
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">{data.today.avgSpeed || 0}</div>
                    <div className="text-blue-400 text-sm">km/h</div>
                    <div className="text-xs text-gray-400">Average Speed</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 rounded-xl p-3 border border-blue-500/20">
                  <div className="text-sm text-gray-400">Max Speed</div>
                  <div className="text-lg font-bold text-blue-400">{data.today.maxSpeed || 0} km/h</div>
                </div>
                <div className="bg-black/40 rounded-xl p-3 border border-blue-500/20">
                  <div className="text-sm text-gray-400">Avg Speed</div>
                  <div className="text-lg font-bold text-blue-400">{data.today.avgSpeed || 0} km/h</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl border-2 border-yellow-500/30 shadow-2xl p-6 backdrop-blur-sm">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 rounded-t-3xl"></div>
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-xl flex items-center">
                  <div className="relative mr-3">
                    <Zap className="w-7 h-7 text-yellow-400" />
                    <div className="absolute inset-0 w-7 h-7 border-2 border-yellow-400/50 rounded-full animate-pulse"></div>
                  </div>
                  Current Metrics
                </h3>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Max Current</div>
                  <div className="text-lg font-bold text-yellow-400">{data.today.maxCurrent || 0} A</div>
                </div>
              </div>

              <div className="relative h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentData}
                      innerRadius={60}
                      outerRadius={90}
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {currentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">{data.today.avgCurrent || 0}</div>
                    <div className="text-yellow-400 text-sm">A</div>
                    <div className="text-xs text-gray-400">Average Current</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 rounded-xl p-3 border border-yellow-500/20">
                  <div className="text-sm text-gray-400">Max Current</div>
                  <div className="text-lg font-bold text-yellow-400">{data.today.maxCurrent || 0} A</div>
                </div>
                <div className="bg-black/40 rounded-xl p-3 border border-yellow-500/20">
                  <div className="text-sm text-gray-400">Avg Current</div>
                  <div className="text-lg font-bold text-yellow-400">{data.today.avgCurrent || 0} A</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-orange-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl border-2 border-red-500/30 shadow-2xl p-6 backdrop-blur-sm">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-t-3xl"></div>
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-xl flex items-center">
                  <div className="relative mr-3">
                    <Battery className="w-7 h-7 text-red-400" />
                    <div className="absolute inset-0 w-7 h-7 border-2 border-red-400/50 rounded-full animate-pulse"></div>
                  </div>
                  Energy Metrics
                </h3>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Total Energy</div>
                  <div className="text-lg font-bold text-red-400">{data.today.totalEnergy || 0} kWh</div>
                </div>
              </div>

              <div className="relative h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={energyData}
                      innerRadius={60}
                      outerRadius={90}
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {energyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">{data.today.chargeCycles || 0}</div>
                    <div className="text-red-400 text-sm">Cycles</div>
                    <div className="text-xs text-gray-400">Charge Cycles</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 rounded-xl p-3 border border-red-500/20">
                  <div className="text-sm text-gray-400">Total Energy</div>
                  <div className="text-lg font-bold text-red-400">{data.today.totalEnergy || 0} kWh</div>
                </div>
                <div className="bg-black/40 rounded-xl p-3 border border-red-500/20">
                  <div className="text-sm text-gray-400">Charge Cycles</div>
                  <div className="text-lg font-bold text-red-400">{data.today.chargeCycles || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
          <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl border-2 border-cyan-500/30 shadow-2xl p-6 backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-t-3xl"></div>
            
            <h3 className="text-white font-bold text-2xl flex items-center mb-6">
              <div className="relative mr-3">
                <TrendingUp className="w-8 h-8 text-cyan-400" />
                <div className="absolute inset-0 w-8 h-8 border-2 border-cyan-400/30 rounded-full animate-pulse"></div>
              </div>
              Performance Trends
              <div className="ml-auto text-sm text-gray-400">Real-time Analytics</div>
            </h3>

            {historicalData.length > 0 && (
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: '#fff',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line type="monotone" dataKey="runningHrs" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
                    <Line type="monotone" dataKey="runningKms" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
                    <Line type="monotone" dataKey="avgSpeed" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} />
                    <Line type="monotone" dataKey="current" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} />
                    <Line type="monotone" dataKey="packState" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Running Hrs', value: `${data.today.runningHrs || 0} hrs`, color: 'text-green-400', bg: 'bg-green-500/20' },
                { label: 'Distance', value: `${data.today.runningKms || 0} km`, color: 'text-blue-400', bg: 'bg-blue-500/20' },
                { label: 'Avg Speed', value: `${data.today.avgSpeed || 0} km/h`, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
              ].map((metric, index) => (
                <div key={index} className={`${metric.bg} rounded-xl p-3 border border-gray-600/30`}>
                  <div className="text-sm text-gray-400">{metric.label}</div>
                  <div className={`text-lg font-bold ${metric.color}`}>{metric.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
          <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl border-2 border-indigo-500/30 shadow-2xl p-6 backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl"></div>
            
            <h3 className="text-white font-bold text-2xl flex items-center mb-6">
              <div className="relative mr-3">
                <BarChart3 className="w-8 h-8 text-indigo-400" />
                <div className="absolute inset-0 w-8 h-8 border-2 border-indigo-400/30 rounded-full animate-pulse"></div>
              </div>
              Summary Statistics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {['today', 'week', 'month', 'total'].map((period, index) => (
                <div key={index} className="bg-black/40 rounded-2xl p-4 border border-indigo-500/20 hover:border-indigo-400/40 transition-all duration-300 backdrop-blur-sm">
                  <h4 className="text-indigo-400 font-semibold text-lg mb-2 capitalize">{period}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Running Hours</span>
                      <span className="text-white font-bold">{data[period].runningHrs || 0} hrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Distance</span>
                      <span className="text-white font-bold">{data[period].runningKms || 0} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Max Current</span>
                      <span className="text-white font-bold">{data[period].maxCurrent || 0} A</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Avg Current</span>
                      <span className="text-white font-bold">{data[period].avgCurrent || 0} A</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Max Speed</span>
                      <span className="text-white font-bold">{data[period].maxSpeed || 0} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Avg Speed</span>
                      <span className="text-white font-bold">{data[period].avgSpeed || 0} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Total Energy</span>
                      <span className="text-white font-bold">{data[period].totalEnergy || 0} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Charge Cycles</span>
                      <span className="text-white font-bold">{data[period].chargeCycles || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VehicleData;