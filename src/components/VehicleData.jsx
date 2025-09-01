import React, { useState, useEffect, useRef } from 'react';

const VehicleData = ({ user }) => {
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState({});
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connectWebSocket = () => {
    const ws = new WebSocket('wss://o8mnr78vf0.execute-api.ap-south-1.amazonaws.com/production/');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttempts.current = 0;
      // Delay subscription to ensure connection stability
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: 'subscribe', device_id: 'VCL000' }));
          console.log('WebSocket subscribed to VCL000');
        }
      }, 100);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data).payload;
        const now = Date.now();
        const newParameters = [
          { id: 'State of Charge', value: message.message201?.soc ? (message.message201.soc / 100).toFixed(2) : 'N/A', unit: '%', serialNo: 'VCL000' },
          { id: 'Stack Voltage', value: message.message201?.stackVoltage ?? 'N/A', unit: 'V', serialNo: 'VCL000' },
          { id: 'Battery Status', value: message.message202?.batteryStatus ?? 'OFF', unit: 'N/A', serialNo: 'VCL000' },
          { id: 'Maximum Voltage', value: (!lastUpdate.maxVoltage || now - lastUpdate.maxVoltage > 5 * 60 * 1000)
            ? message.message203?.vmax ?? 'N/A' : parameters.find(p => p.id === 'Maximum Voltage')?.value ?? 'N/A', unit: 'V', serialNo: 'VCL000' },
          { id: 'Minimum Voltage', value: (!lastUpdate.minVoltage || now - lastUpdate.minVoltage > 5 * 60 * 1000)
            ? message.message203?.vmin ?? 'N/A' : parameters.find(p => p.id === 'Minimum Voltage')?.value ?? 'N/A', unit: 'V', serialNo: 'VCL000' },
          { id: 'Average Voltage', value: message.message203?.vavg ?? 'N/A', unit: 'V', serialNo: 'VCL000' },
          { id: 'Maximum Temperature', value: (!lastUpdate.maxTemp || now - lastUpdate.maxTemp > 5 * 60 * 1000)
            ? message.message204?.tempMax ?? 'N/A' : parameters.find(p => p.id === 'Maximum Temperature')?.value ?? 'N/A', unit: '°C', serialNo: 'VCL000' },
          { id: 'Minimum Temperature', value: (!lastUpdate.minTemp || now - lastUpdate.minTemp > 5 * 60 * 1000)
            ? message.message204?.tempMin ?? 'N/A' : parameters.find(p => p.id === 'Minimum Temperature')?.value ?? 'N/A', unit: '°C', serialNo: 'VCL000' },
          { id: 'Average Temperature', value: message.message204?.tempAvg ?? 'N/A', unit: '°C', serialNo: 'VCL000' },
          { id: 'Current', value: message.message262?.current ?? 'N/A', unit: 'A', serialNo: 'VCL000' },
          { id: 'Charger Current Demand', value: message.message263?.currentDemand ?? 'N/A', unit: 'A', serialNo: 'VCL000' },
          { id: 'Charger Voltage Demand', value: message.message264?.voltageDemand ?? 'N/A', unit: 'V', serialNo: 'VCL000' },
          { id: 'Module 1 Temperatures', value: (!lastUpdate.tempSensors || now - lastUpdate.tempSensors > 5 * 60 * 1000)
            ? message.message205?.temperatures?.join(', ') ?? 'N/A' : parameters.find(p => p.id === 'Module 1 Temperatures')?.value ?? 'N/A', unit: '°C', serialNo: 'VCL000' },
          { id: 'Torque Limit', value: message.message411?.N_motorTorqueLim ?? 'N/A', unit: 'Nm', serialNo: 'VCL000' },
          { id: 'Torque Value', value: message.message411?.N_motorTorque ?? 'N/A', unit: 'Nm', serialNo: 'VCL000' },
          { id: 'Motor Speed', value: message.message411?.N_motorSpeed ?? 'N/A', unit: 'RPM', serialNo: 'VCL000' },
          { id: 'Rotation Direction', value: message.message411?.St_motorDirection ? 'Forward' : 'Reverse', unit: 'N/A', serialNo: 'VCL000' },
          { id: 'Operation Mode', value: (!lastUpdate.operationMode || now - lastUpdate.operationMode > 5 * 60 * 1000)
            ? message.message411?.St_motorMode ?? 'N/A' : parameters.find(p => p.id === 'Operation Mode')?.value ?? 'N/A', unit: 'N/A', serialNo: 'VCL000' },
          { id: 'MCU Enable State', value: (!lastUpdate.mcuEnableState || now - lastUpdate.mcuEnableState > 5 * 60 * 1000)
            ? message.message411?.St_MCU_enable ?? 'N/A' : parameters.find(p => p.id === 'MCU Enable State')?.value ?? 'N/A', unit: 'N/A', serialNo: 'VCL000' },
          { id: 'MCU Drive Permit', value: message.message411?.St_MCUdriverPermit ?? 'N/A', unit: 'N/A', serialNo: 'VCL000' },
          { id: 'MCU Off Permit', value: message.message411?.St_MCUoffPermit ?? 'N/A', unit: 'N/A', serialNo: 'VCL000' },
          { id: 'Total Fault Status', value: message.message413?.totalHardwareFailure ?? 'N/A', unit: 'N/A', serialNo: 'VCL000' },
          { id: 'AC Current', value: (!lastUpdate.acCurrent || now - lastUpdate.acCurrent > 5 * 60 * 1000)
            ? message.message412?.N_MotorACCurrent ?? 'N/A' : parameters.find(p => p.id === 'AC Current')?.value ?? 'N/A', unit: 'A', serialNo: 'VCL000' },
          { id: 'AC Voltage', value: (!lastUpdate.acVoltage || now - lastUpdate.acVoltage > 5 * 60 * 1000)
            ? message.message412?.N_MotorACVoltage ?? 'N/A' : parameters.find(p => p.id === 'AC Voltage')?.value ?? 'N/A', unit: 'V', serialNo: 'VCL000' },
          { id: 'DC Voltage', value: (!lastUpdate.dcVoltage || now - lastUpdate.dcVoltage > 5 * 60 * 1000)
            ? message.message412?.N_MCUDCVoltage ?? 'N/A' : parameters.find(p => p.id === 'DC Voltage')?.value ?? 'N/A', unit: 'V', serialNo: 'VCL000' },
          { id: 'Motor Temperature', value: message.message412?.N_motorTemp ?? 'N/A', unit: '°C', serialNo: 'VCL000' },
          { id: 'MCU Temperature', value: message.message412?.N_MCUTemp ?? 'N/A', unit: '°C', serialNo: 'VCL000' },
          { id: 'Radiator Temperature', value: (!lastUpdate.radiatorTemp || now - lastUpdate.radiatorTemp > 5 * 60 * 1000)
            ? message.message413?.radTemp ?? 'N/A' : parameters.find(p => p.id === 'Radiator Temperature')?.value ?? 'N/A', unit: '°C', serialNo: 'VCL000' },
          { id: 'Number of Motors', value: message.message413?.motorQuantity ?? 'N/A', unit: 'N/A', serialNo: 'VCL000' },
          { id: 'Motor Number', value: message.message413?.motorNum ?? 'N/A', unit: 'N/A', serialNo: 'VCL000' },
          { id: 'MCU Manufacturer', value: message.message413?.mcuNumber ?? 'N/A', unit: 'N/A', serialNo: 'VCL000' },
          ...Object.entries(message.message413 || {}).filter(([key]) => key.includes('Fault') || key.includes('Failure') || key.includes('Warning')).map(([key, value]) => ({
            id: key, value: value ? 'Active' : 'Inactive', unit: 'N/A', serialNo: 'VCL000'
          })),
        ].filter(param => param.id !== 'radTemp');

        setParameters(newParameters);
        setLoading(false);
        setError(null);

        if (message.message203) setLastUpdate((prev) => ({ ...prev, maxVoltage: now, minVoltage: now }));
        if (message.message204) setLastUpdate((prev) => ({ ...prev, maxTemp: now, minTemp: now }));
        if (message.message205) setLastUpdate((prev) => ({ ...prev, tempSensors: now }));
        if (message.message411) setLastUpdate((prev) => ({ ...prev, operationMode: now, mcuEnableState: now }));
        if (message.message412) setLastUpdate((prev) => ({ ...prev, acCurrent: now, acVoltage: now, dcVoltage: now }));
        if (message.message413) setLastUpdate((prev) => ({ ...prev, radiatorTemp: now }));
      } catch (err) {
        setError('Failed to process WebSocket data');
        console.error('WebSocket message error:', err);
        setLoading(false);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      if (reconnectAttempts.current < maxReconnectAttempts) {
        console.log(`Reconnecting... Attempt ${reconnectAttempts.current + 1}`);
        setTimeout(() => {
          reconnectAttempts.current += 1;
          connectWebSocket();
        }, 5000);
      } else {
        setError('Max reconnection attempts reached. Please refresh the page.');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error');
      ws.close();
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="h-fit bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 max-w-4xl w-full">
          <h3 className="text-2xl font-bold text-blue-800 mb-6 text-center">Vehicle Data (VCL000)</h3>
          {loading ? (
            <p className="text-gray-600 text-center">Loading...</p>
          ) : error ? (
            <p className="text-red-600 text-center">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left text-gray-700" scope="col">Parameter</th>
                    <th className="border p-3 text-left text-gray-700" scope="col">Value</th>
                    <th className="border p-3 text-left text-gray-700" scope="col">Unit</th>
                    <th className="border p-3 text-left text-gray-700" scope="col">Serial No.</th>
                  </tr>
                </thead>
                <tbody>
                  {parameters.length > 0 ? (
                    parameters.map((param, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border p-3">{param.id}</td>
                        <td className="border p-3">{param.value}</td>
                        <td className="border p-3">{param.unit}</td>
                        <td className="border p-3">{param.serialNo}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="border p-3 text-center text-gray-600">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VehicleData;