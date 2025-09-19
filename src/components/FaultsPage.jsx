import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Cpu, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

function FaultsPage({ user }) {
  const selectedVehicle = window.location.pathname.split('/')[2] || 'VCL001';
  const [data, setData] = useState({ faults: {}, config: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [historicalFaults, setHistoricalFaults] = useState([]);
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchConfig = async () => {
    try {
      console.log('Fetching config with token:', user?.token);
      const response = await fetch(`${API_BASE_URL}/api/config?device_id=${selectedVehicle}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      console.log('Config response status:', response.status, response.statusText);
      if (!response.ok) throw new Error(`Failed to fetch config: ${response.status} ${response.statusText}`);
      const configData = await response.json();
      console.log('Config received:', configData);
      return configData;
    } catch (err) {
      console.error(`Config fetch error: ${err.message}`);
      return {
        canMappings: {
          faults: {
            faultCode: 'x401',
            faultDescription: 'x402',
            faultSeverity: 'x403',
            faultTimestamp: 'x404',
            faultStatus: 'x405',
          },
        },
      };
    }
  };

  const fetchFaults = async () => {
    try {
      console.log('Fetching faults with token:', user?.token);
      const response = await fetch(`${API_BASE_URL}/api/faults?device_id=${selectedVehicle}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      console.log('Faults response status:', response.status, response.statusText);
      if (!response.ok) throw new Error(`Failed to fetch faults: ${response.status} ${response.statusText}`);
      const faultsData = await response.json();
      console.log('Faults received:', faultsData);

      // Handle array response by selecting the latest fault based on timestamp
      if (Array.isArray(faultsData)) {
        if (faultsData.length === 0) {
          throw new Error('Faults data array is empty');
        }
        const latestFault = faultsData.reduce((latest, current) => {
          return (!latest.faultTimestamp || (current.faultTimestamp && current.faultTimestamp > latest.faultTimestamp)) ? current : latest;
        }, faultsData[0]);
        return { ...latestFault, faultTimestamp: latestFault.faultTimestamp || Date.now() };
      }
      return { ...faultsData, faultTimestamp: faultsData.faultTimestamp || Date.now() };
    } catch (err) {
      console.error(`Faults fetch error: ${err.message}`);
      return {
        faultCode: 'F000',
        faultDescription: 'No active faults',
        faultSeverity: 'Normal',
        faultTimestamp: Date.now(),
        faultStatus: 'Inactive',
      };
    }
  };

  const connectWebSocket = async () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log(`WebSocket already connected for ${selectedVehicle}`);
      return;
    }

    try {
      setLoading(true);
      const configData = await fetchConfig();
      const initialFaultsData = await fetchFaults();
      setData({ faults: initialFaultsData, config: configData });

      // Initialize historical faults with initial fetch
      setHistoricalFaults(prev => {
        const newData = [
          ...prev,
          {
            time: new Date(initialFaultsData.faultTimestamp || Date.now()).toLocaleTimeString(),
            severity: initialFaultsData.faultSeverity === 'Critical' ? 3 : initialFaultsData.faultSeverity === 'Warning' ? 2 : 1,
          },
        ];
        return newData.slice(-10);
      });

      const wsUrl = `ws://localhost:5000?device_id=${selectedVehicle}&token=${user?.token}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log(`WebSocket connected for ${selectedVehicle}`);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          const { faults } = message;
          if (faults) {
            // Handle single object or array
            const latestFault = Array.isArray(faults)
              ? faults.reduce((latest, current) => {
                  return (!latest.faultTimestamp || (current.faultTimestamp && current.faultTimestamp > latest.faultTimestamp)) ? current : latest;
                }, faults[0]) || faults[0]
              : faults;

            setData(prevData => ({
              faults: {
                ...latestFault,
                faultTimestamp: latestFault.faultTimestamp || Date.now(),
              },
              config: prevData.config,
            }));

            setHistoricalFaults(prev => {
              const newData = [
                ...prev,
                {
                  time: new Date(latestFault.faultTimestamp || Date.now()).toLocaleTimeString(),
                  severity: latestFault.faultSeverity === 'Critical' ? 3 : latestFault.faultSeverity === 'Warning' ? 2 : 1,
                },
              ];
              return newData.slice(-10);
            });

            if (isInitialLoad) {
              setIsInitialLoad(false);
              setLoading(false);
            }
          }
        } catch (err) {
          console.error(`Failed to parse WebSocket data: ${err.message}`);
          setError(`Failed to parse WebSocket data: ${err.message}`);
          if (isInitialLoad) {
            setLoading(false);
          }
        }
      };

      wsRef.current.onerror = (err) => {
        console.error(`WebSocket error for ${selectedVehicle}:`, err);
        setError(`WebSocket error: ${err.message || 'Connection failed'}`);
        setLoading(false);
      };

      wsRef.current.onclose = () => {
        console.log(`WebSocket closed for ${selectedVehicle}.`);
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
          console.log(`Reconnecting in ${delay}ms... Attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts}`);
          setTimeout(() => {
            reconnectAttempts.current += 1;
            connectWebSocket();
          }, delay);
        } else {
          setError('Max WebSocket reconnection attempts reached');
          setLoading(false);
        }
      };
    } catch (err) {
      console.error(`WebSocket connection error: ${err.message}`);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      console.log('useEffect triggered with token:', user?.token, 'vehicle:', selectedVehicle);
      connectWebSocket();
    } else {
      setError('No authentication token provided');
      setLoading(false);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
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
            Initializing Fault Diagnostics...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
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

  const getStatusColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'normal': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'normal': return <Activity className="w-6 h-6" />;
      case 'warning': return <AlertTriangle className="w-6 h-6" />;
      case 'critical': return <AlertTriangle className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-full">
          <div className="w-full h-full bg-gradient-to-b from-orange-400 via-red-400 to-purple-500 animate-pulse"></div>
        </div>
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
                Fault Diagnostics
              </h1>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
              <p className="text-gray-300 text-lg mt-2 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-400 animate-pulse" />
                {selectedVehicle} - System Health Monitor
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
                  LIVE • {new Date(data.faults.faultTimestamp || Date.now()).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <div
              className={`flex items-center space-x-3 bg-black/30 backdrop-blur-sm rounded-xl px-4 py-2 border transition-all duration-300 ${
                data.faults.faultSeverity === 'Normal' ? 'border-green-500/30' :
                data.faults.faultSeverity === 'Warning' ? 'border-yellow-500/30' : 'border-red-500/30'
              }`}
            >
              <div className="relative">
                {getStatusIcon(data.faults.faultSeverity)}
                <div
                  className={`absolute inset-0 rounded-full animate-ping ${getStatusColor(data.faults.faultSeverity).replace('text-', 'bg-')}`}
                ></div>
              </div>
              <span className={`font-bold text-xl ${getStatusColor(data.faults.faultSeverity)}`}>
                {data.faults.faultSeverity?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-orange-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
          <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl border-2 border-red-500/30 shadow-2xl p-6 backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-t-3xl"></div>

            <h3 className="text-white font-bold text-2xl flex items-center mb-6">
              <div className="relative mr-3">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <div className="absolute inset-0 w-8 h-8 border-2 border-red-400/30 rounded-full animate-pulse"></div>
              </div>
              Active Faults
            </h3>

            <div className="bg-black/40 rounded-2xl p-6 border border-red-500/20 hover:border-red-400/40 transition-all duration-300 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-xl ${
                      data.faults.faultSeverity === 'Normal' ? 'bg-green-500/20' :
                      data.faults.faultSeverity === 'Warning' ? 'bg-yellow-500/20' :
                      'bg-red-500/20'
                    }`}
                  >
                    {getStatusIcon(data.faults.faultSeverity)}
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">{data.faults.faultCode}</div>
                    <div className="text-gray-300 text-sm">{data.faults.faultDescription}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getStatusColor(data.faults.faultSeverity)}`}>{data.faults.faultSeverity}</div>
                  <div className="text-sm text-gray-400">{new Date(data.faults.faultTimestamp || Date.now()).toLocaleString()}</div>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out relative"
                  style={{
                    width: data.faults.faultSeverity === 'Critical' ? '100%' : data.faults.faultSeverity === 'Warning' ? '66%' : '33%',
                    background: data.faults.faultSeverity === 'Critical' ? '#ef4444' : data.faults.faultSeverity === 'Warning' ? '#f59e0b' : '#10b981',
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group mt-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
          <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl border-2 border-cyan-500/30 shadow-2xl p-6 backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-t-3xl"></div>

            <h3 className="text-white font-bold text-2xl flex items-center mb-6">
              <div className="relative mr-3">
                <Activity className="w-8 h-8 text-cyan-400" />
                <div className="absolute inset-0 w-8 h-8 border-2 border-cyan-400/30 rounded-full animate-pulse"></div>
              </div>
              Fault History
            </h3>

            {historicalFaults.length > 0 && (
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalFaults}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: '#fff',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Line type="monotone" dataKey="severity" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FaultsPage;
