import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Truck, Clock, Thermometer, Battery, Zap, ArrowLeft, Cpu, Download, AlertTriangle, AlertCircle, TrendingUp } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Mock vehicle master data
const vehicleMaster = {
  veh1: { name: 'Vehicle 1', batteryCapacity: 50 },
  veh2: { name: 'Vehicle 2', batteryCapacity: 60 },
  veh3: { name: 'Vehicle 3', batteryCapacity: 70 },
};

// Seeded random number generator
function seededRandom(seed) {
  let t = seed += 0x6D2B79F5;
  return function() {
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Generate list of dates in range
function getDatesInRange(startDate, endDate) {
  const dates = [];
  let current = new Date(startDate);
  const end = new Date(endDate || startDate);
  while (current <= end) {
    dates.push(new Date(current).toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// Generate random trip data
function generateRandomTrips(vehId, date) {
  const seedStr = date.replace(/-/g, '') + vehId.replace('veh', '');
  const seed = parseInt(seedStr, 10);
  const rand = seededRandom(seed);

  const numTrips = Math.max(1, Math.floor(rand() * 5) + 1); // Ensure 1-5 trips
  const trips = [];
  let currentTime = 8 + rand() * 4; // Start between 8:00 and 12:00
  let lastEndTime = null;

  for (let i = 0; i < numTrips; i++) {
    const duration = rand() * 3 + 1; // 1-4 hours
    const startHour = currentTime;
    const endHour = startHour + duration;
    if (endHour > 22) break; // Don't go past 22:00

    const startTime = `${Math.floor(startHour).toString().padStart(2, '0')}:${Math.floor((startHour % 1) * 60).toString().padStart(2, '0')}`;
    const endTime = `${Math.floor(endHour).toString().padStart(2, '0')}:${Math.floor((endHour % 1) * 60).toString().padStart(2, '0')}`;

    const idleTime = lastEndTime
      ? (startHour - lastEndTime) * 60 // Idle time in minutes
      : 0;
    lastEndTime = endHour;
    currentTime = endHour + rand() * 2; // Gap of 0-2 hours

    const ratedKw = rand() * 20 + 10; // 10-30 kW
    const avgKw = ratedKw * (rand() * 0.4 + 0.6); // 60-100% of rated
    const peakKw = ratedKw * (rand() * 0.4 + 1.0); // 100-140% of rated

    const startSoc = rand() * 40 + 60; // 60-100%
    let endSoc = startSoc - (rand() * 30 + 10); // Drop 10-40%
    if (endSoc < 20) endSoc = 20;

    const distance = duration * (rand() * 20 + 30); // 30-50 km/h average speed

    const tempBaseMin = 15 + rand() * 10; // Base min temp 15-25°C
    const tempSpread = 10 + rand() * 10; // Spread 10-20°C

    const temps = {
      motor: [tempBaseMin, tempBaseMin + tempSpread].map(t => t.toFixed(1)),
      mcu: [tempBaseMin - 2, tempBaseMin + tempSpread - 2].map(t => t.toFixed(1)),
      battery: [tempBaseMin + 5, tempBaseMin + tempSpread + 5].map(t => t.toFixed(1)),
      dcdc: [tempBaseMin, tempBaseMin + tempSpread].map(t => t.toFixed(1)),
      hydraulicOil: [tempBaseMin - 5, tempBaseMin + tempSpread - 5].map(t => t.toFixed(1)),
    };

    const kwhConsumed = (startSoc - endSoc) / 100 * vehicleMaster[vehId].batteryCapacity;
    const efficiencyScore = calculateEfficiencyScore(kwhConsumed, distance, temps, avgKw, ratedKw, startSoc, endSoc);

    trips.push({
      tripId: i + 1,
      date,
      startTime,
      endTime,
      avgKw: avgKw.toFixed(1),
      ratedKw: ratedKw.toFixed(0),
      peakKw: peakKw.toFixed(1),
      startSoc: Math.floor(startSoc),
      endSoc: Math.floor(endSoc),
      distance: distance.toFixed(1),
      idleTime,
      temps,
      efficiencyScore: efficiencyScore.toFixed(0),
    });
  }

  return trips;
}

// Calculate efficiency score
function calculateEfficiencyScore(kwhConsumed, distance, temps, avgKw, ratedKw, startSoc, endSoc) {
  const kwhPerKm = distance > 0 ? kwhConsumed / distance : 0;
  const kwhScore = kwhPerKm < 0.5 ? 30 : kwhPerKm < 1 ? 20 : 10;
  const maxTemps = Object.values(temps).map(t => parseFloat(t[1]));
  const tempScore = Math.max(...maxTemps) < 70 ? 30 : Math.max(...maxTemps) < 80 ? 20 : 10;
  const powerRatio = avgKw / ratedKw;
  const powerScore = powerRatio < 0.8 ? 20 : powerRatio < 1.0 ? 15 : 10;
  const socScore = startSoc - endSoc < 30 ? 20 : 15;
  return kwhScore + tempScore + powerScore + socScore; // Max 100
}

function DailyReportPage({ user }) {
  const navigate = useNavigate();
  const today = '2025-09-30';
  const reportRef = useRef(null);
  const [selectedVehicles, setSelectedVehicles] = useState(Object.keys(vehicleMaster)); // Default to all vehicles
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvColumns, setCsvColumns] = useState({
    vehicle: true,
    tripId: true,
    date: true,
    startTime: true,
    endTime: true,
    totalHours: true,
    avgKw: true,
    ratedKw: true,
    peakKw: true,
    startSoc: true,
    endSoc: true,
    kwhConsumed: true,
    avgKwh: true,
    motorTemp: true,
    mcuTemp: true,
    batteryTemp: true,
    dcdcTemp: true,
    hydraulicOilTemp: true,
    efficiencyScore: true,
  });

  useEffect(() => {
    // Generate initial report for today
    handleGenerateReport();
    setLoading(false);
    setIsInitialLoad(false);
  }, []);

  const handleGenerateReport = () => {
    if (!startDate) {
      setError('Please select a start date.');
      return;
    }
    if (endDate && new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be before start date.');
      return;
    }
    if (selectedVehicles.length === 0) {
      setError('Please select at least one vehicle.');
      return;
    }
    setError(null);
    const filteredData = {};
    selectedVehicles.forEach(vehId => {
      filteredData[vehId] = [];
      const dates = getDatesInRange(startDate, endDate);
      dates.forEach(date => {
        const trips = generateRandomTrips(vehId, date);
        filteredData[vehId].push(...trips);
      });
    });
    setReportData(filteredData);
  };

  const handleExportCSV = () => {
    let csv = Object.keys(csvColumns).filter(key => csvColumns[key]).map(key => key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')).join(',') + '\n';
    Object.entries(reportData).forEach(([vehId, trips]) => {
      const vehName = vehicleMaster[vehId].name;
      const batteryCapacity = vehicleMaster[vehId].batteryCapacity;
      trips.forEach(trip => {
        const start = new Date(`${trip.date}T${trip.startTime}`);
        const end = new Date(`${trip.date}T${trip.endTime}`);
        const totalHours = ((end - start) / (1000 * 60 * 60)).toFixed(2);
        const socDiff = trip.startSoc - trip.endSoc;
        const kwhConsumed = (socDiff / 100 * batteryCapacity).toFixed(2);
        const avgKwh = totalHours > 0 ? (kwhConsumed / totalHours).toFixed(2) : '0.00';
        const row = [];
        if (csvColumns.vehicle) row.push(vehName);
        if (csvColumns.tripId) row.push(trip.tripId);
        if (csvColumns.date) row.push(trip.date);
        if (csvColumns.startTime) row.push(trip.startTime);
        if (csvColumns.endTime) row.push(trip.endTime);
        if (csvColumns.totalHours) row.push(totalHours);
        if (csvColumns.avgKw) row.push(trip.avgKw);
        if (csvColumns.ratedKw) row.push(trip.ratedKw);
        if (csvColumns.peakKw) row.push(trip.peakKw);
        if (csvColumns.startSoc) row.push(trip.startSoc);
        if (csvColumns.endSoc) row.push(trip.endSoc);
        if (csvColumns.kwhConsumed) row.push(kwhConsumed);
        if (csvColumns.avgKwh) row.push(avgKwh);
        if (csvColumns.motorTemp) row.push(`${trip.temps.motor[0]} - ${trip.temps.motor[1]}`);
        if (csvColumns.mcuTemp) row.push(`${trip.temps.mcu[0]} - ${trip.temps.mcu[1]}`);
        if (csvColumns.batteryTemp) row.push(`${trip.temps.battery[0]} - ${trip.temps.battery[1]}`);
        if (csvColumns.dcdcTemp) row.push(`${trip.temps.dcdc[0]} - ${trip.temps.dcdc[1]}`);
        if (csvColumns.hydraulicOilTemp) row.push(`${trip.temps.hydraulicOil[0]} - ${trip.temps.hydraulicOil[1]}`);
        if (csvColumns.efficiencyScore) row.push(trip.efficiencyScore);
        csv += row.join(',') + '\n';
      });
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `daily_report_${startDate}${endDate ? '_to_' + endDate : ''}.csv`;
    link.click();
    setShowCsvModal(false);
  };

  const handleExportPDF = async () => {
    const pdf = new jsPDF('l', 'mm', 'a4');
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 280;
    const pageHeight = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`daily_report_${startDate}${endDate ? '_to_' + endDate : ''}.pdf`);
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    if (newStartDate <= today) {
      setStartDate(newStartDate);
      if (endDate && newStartDate > endDate) {
        setEndDate('');
      }
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    if (newEndDate <= today && (!startDate || newEndDate >= startDate)) {
      setEndDate(newEndDate);
    }
  };

  const handlePresetDate = (preset) => {
    const todayDate = new Date(today);
    let newStartDate = today;
    let newEndDate = '';
    switch (preset) {
      case 'today':
        newStartDate = today;
        newEndDate = '';
        break;
      case 'yesterday':
        const yesterday = new Date(todayDate);
        yesterday.setDate(todayDate.getDate() - 1);
        newStartDate = yesterday.toISOString().split('T')[0];
        newEndDate = '';
        break;
      case 'last7days':
        const last7 = new Date(todayDate);
        last7.setDate(todayDate.getDate() - 6);
        newStartDate = last7.toISOString().split('T')[0];
        newEndDate = today;
        break;
      case 'last30days':
        const last30 = new Date(todayDate);
        last30.setDate(todayDate.getDate() - 29);
        newStartDate = last30.toISOString().split('T')[0];
        newEndDate = today;
        break;
      case 'thisMonth':
        const firstDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
        newStartDate = firstDay.toISOString().split('T')[0];
        newEndDate = today;
        break;
      default:
        break;
    }
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setTimeout(() => handleGenerateReport(), 0);
  };

  const sortData = (key, trips) => {
    const sorted = [...trips].sort((a, b) => {
      let aValue = a[key], bValue = b[key];
      if (key === 'totalHours' || key === 'kwhConsumed' || key === 'avgKwh' || key === 'efficiencyScore') {
        aValue = parseFloat(a[key] || 0);
        bValue = parseFloat(b[key] || 0);
      } else if (key.includes('Temp')) {
        aValue = parseFloat(a.temps[key.replace('Temp', '').toLowerCase()][1]);
        bValue = parseFloat(b.temps[key.replace('Temp', '').toLowerCase()][1]);
      }
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
    return sorted;
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const filterTrips = (trips, vehId) => {
    return trips.filter(trip => {
      const searchMatch = !searchQuery || 
        trip.date.includes(searchQuery) || 
        trip.tripId.toString() === searchQuery;
      return searchMatch;
    });
  };

  const getSummaryStats = () => {
    let totalTrips = 0;
    let totalKwh = 0;
    let totalHours = 0;
    let totalDistance = 0;
    let totalOperationalTime = 0;
    Object.entries(reportData).forEach(([vehId, trips]) => {
      const batteryCapacity = vehicleMaster[vehId].batteryCapacity;
      trips.forEach(trip => {
        totalTrips++;
        const start = new Date(`${trip.date}T${trip.startTime}`);
        const end = new Date(`${trip.date}T${trip.endTime}`);
        const hours = (end - start) / (1000 * 60 * 60);
        totalHours += hours;
        totalKwh += (trip.startSoc - trip.endSoc) / 100 * batteryCapacity;
        totalDistance += parseFloat(trip.distance);
        totalOperationalTime += hours;
      });
    });
    const avgEfficiency = totalDistance > 0 ? (totalKwh / totalDistance).toFixed(2) : '0.00';
    const fleetUtilization = totalHours > 0 ? ((totalOperationalTime / (24 * getDatesInRange(startDate, endDate).length * Object.keys(vehicleMaster).length)) * 100).toFixed(1) : '0.0';
    return { totalTrips, totalKwh: totalKwh.toFixed(2), avgEfficiency, totalHours: totalHours.toFixed(2), fleetUtilization };
  };

  const comparisonChartData = () => {
    const data = Object.keys(reportData).map(vehId => {
      const trips = reportData[vehId] || [];
      const totalKwh = trips.reduce((sum, trip) => sum + (trip.startSoc - trip.endSoc) / 100 * vehicleMaster[vehId].batteryCapacity, 0);
      const totalDistance = trips.reduce((sum, trip) => sum + parseFloat(trip.distance), 0);
      const avgEfficiency = totalDistance > 0 ? (totalKwh / totalDistance).toFixed(2) : '0.00';
      return { name: vehicleMaster[vehId].name, kwhConsumed: totalKwh.toFixed(2), avgEfficiency };
    });
    return data;
  };

  const timeSeriesData = (vehId) => {
    const dates = getDatesInRange(startDate, endDate);
    return dates.map(date => {
      const trips = (reportData[vehId] || []).filter(trip => trip.date === date);
      const totalKwh = trips.reduce((sum, trip) => sum + (trip.startSoc - trip.endSoc) / 100 * vehicleMaster[vehId].batteryCapacity, 0);
      return { date, kwhConsumed: totalKwh.toFixed(2) };
    });
  };

  const tempTrendData = (vehId) => {
    const dates = getDatesInRange(startDate, endDate);
    return dates.map(date => {
      const trips = (reportData[vehId] || []).filter(trip => trip.date === date);
      const avgTemps = trips.reduce(
        (acc, trip) => ({
          motor: acc.motor + parseFloat(trip.temps.motor[1]) / trips.length,
          battery: acc.battery + parseFloat(trip.temps.battery[1]) / trips.length,
        }),
        { motor: 0, battery: 0 }
      );
      return { date, motorTemp: avgTemps.motor.toFixed(1), batteryTemp: avgTemps.battery.toFixed(1) };
    });
  };

  const socUsageData = (vehId) => {
    const trips = reportData[vehId] || [];
    const lowSoc = trips.filter(trip => trip.endSoc < 25).length;
    const medSoc = trips.filter(trip => trip.endSoc >= 25 && trip.endSoc < 50).length;
    const highSoc = trips.filter(trip => trip.endSoc >= 50).length;
    return [
      { name: 'Low (<25%)', value: lowSoc, color: '#ef4444' },
      { name: 'Medium (25-50%)', value: medSoc, color: '#f59e0b' },
      { name: 'High (>50%)', value: highSoc, color: '#10b981' },
    ].filter(d => d.value > 0);
  };

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
            Generating Reports...
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

  const summaryStats = getSummaryStats();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black relative overflow-hidden">
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

      <div className="relative z-10 p-6" ref={reportRef}>
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
                Daily Reports
              </h1>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
              <p className="text-gray-300 text-lg mt-2 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-yellow-400 animate-pulse" />
                Trip-wise Vehicle Analytics
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowCsvModal(true)}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg px-4 py-2 hover:from-green-600 hover:to-teal-600 transition-all duration-300 flex items-center"
              disabled={Object.keys(reportData).length === 0}
            >
              <Download className="w-5 h-5 mr-2" />
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg px-4 py-2 hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 flex items-center"
              disabled={Object.keys(reportData).length === 0}
            >
              <Download className="w-5 h-5 mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        {/* CSV Export Modal */}
        {showCsvModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl p-6 border-2 border-teal-500/30 shadow-2xl max-w-lg w-full">
              <h3 className="text-white font-bold text-xl flex items-center mb-4">
                <Download className="w-7 h-7 text-teal-400 mr-3" />
                Select CSV Columns
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {Object.keys(csvColumns).map(key => (
                  <div key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={csvColumns[key]}
                      onChange={() => setCsvColumns(prev => ({ ...prev, [key]: !prev[key] }))}
                      className="mr-2"
                    />
                    <label className="text-gray-300 text-sm">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</label>
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCsvModal(false)}
                  className="bg-gray-600 text-white rounded-lg px-4 py-2 hover:bg-gray-500 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExportCSV}
                  className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg px-4 py-2 hover:from-green-600 hover:to-teal-600 transition-all duration-300"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 p-4 rounded-2xl border-2 border-blue-500/30">
            <h3 className="text-white text-lg font-semibold">Total Trips</h3>
            <p className="text-2xl text-blue-300">{summaryStats.totalTrips}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 p-4 rounded-2xl border-2 border-green-500/30">
            <h3 className="text-white text-lg font-semibold">Total kWh</h3>
            <p className="text-2xl text-green-300">{summaryStats.totalKwh}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 p-4 rounded-2xl border-2 border-yellow-500/30">
            <h3 className="text-white text-lg font-semibold">Avg Efficiency (kWh/km)</h3>
            <p className="text-2xl text-yellow-300">{summaryStats.avgEfficiency}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 p-4 rounded-2xl border-2 border-orange-500/30">
            <h3 className="text-white text-lg font-semibold">Total Hours</h3>
            <p className="text-2xl text-orange-300">{summaryStats.totalHours}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-violet-600/20 p-4 rounded-2xl border-2 border-purple-500/30">
            <h3 className="text-white text-lg font-semibold">Fleet Utilization (%)</h3>
            <p className="text-2xl text-purple-300">{summaryStats.fleetUtilization}</p>
          </div>
        </div>

        {/* Report Filters */}
        <div className="relative group mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl border-2 border-blue-500/30 shadow-2xl p-6 backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-t-3xl"></div>
            <h3 className="text-white font-bold text-xl flex items-center mb-4">
              <Calendar className="w-7 h-7 text-blue-400 mr-3" />
              Report Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Select Vehicles</label>
                <select
                  multiple
                  value={selectedVehicles}
                  onChange={(e) => setSelectedVehicles(Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full bg-gray-700 text-white rounded-lg p-2 border border-gray-600 focus:border-blue-400"
                >
                  {Object.entries(vehicleMaster).map(([id, veh]) => (
                    <option key={id} value={id}>{veh.name} (Battery: {veh.batteryCapacity} kWh)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  max={today}
                  className="w-full bg-gray-700 text-white rounded-lg p-2 border border-gray-600 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm mb-2 block">End Date (Optional)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  max={today}
                  min={startDate}
                  className="w-full bg-gray-700 text-white rounded-lg p-2 border border-gray-600 focus:border-blue-400"
                />
              </div>
            </div>
            <div className="flex justify-center flex-wrap gap-2 mb-4">
              {['today', 'yesterday', 'last7days', 'last30days', 'thisMonth'].map(preset => (
                <button
                  key={preset}
                  onClick={() => handlePresetDate(preset)}
                  className="bg-gray-600 text-white rounded-lg px-3 py-1 hover:bg-gray-500 transition-all duration-300"
                >
                  {preset.charAt(0).toUpperCase() + preset.slice(1).replace(/([A-Z])/g, ' $1')}
                </button>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleGenerateReport}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg px-8 py-3 text-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Vehicle Comparison View */}
        {Object.keys(reportData).length > 0 && (
          <div className="relative group mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl border-2 border-purple-500/30 shadow-2xl p-6 backdrop-blur-sm">
              <h3 className="text-white font-bold text-xl flex items-center mb-4">
                <TrendingUp className="w-7 h-7 text-purple-400 mr-3" />
                Vehicle Comparison
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {Object.keys(reportData).map(vehId => {
                  const trips = reportData[vehId] || [];
                  const totalKwh = trips.reduce((sum, trip) => sum + (trip.startSoc - trip.endSoc) / 100 * vehicleMaster[vehId].batteryCapacity, 0);
                  const totalDistance = trips.reduce((sum, trip) => sum + parseFloat(trip.distance), 0);
                  const avgEfficiency = totalDistance > 0 ? (totalKwh / totalDistance).toFixed(2) : '0.00';
                  const totalHours = trips.reduce((sum, trip) => {
                    const start = new Date(`${trip.date}T${trip.startTime}`);
                    const end = new Date(`${trip.date}T${trip.endTime}`);
                    return sum + (end - start) / (1000 * 60 * 60);
                  }, 0);
                  const maxTemps = trips.reduce((acc, trip) => ({
                    motor: Math.max(acc.motor, parseFloat(trip.temps.motor[1])),
                    battery: Math.max(acc.battery, parseFloat(trip.temps.battery[1])),
                  }), { motor: 0, battery: 0 });
                  return (
                    <div key={vehId} className="bg-gray-700/50 p-4 rounded-lg">
                      <h4 className="text-white font-semibold">{vehicleMaster[vehId].name}</h4>
                      <p className="text-gray-300">Avg kWh/Trip: {(totalKwh / (trips.length || 1)).toFixed(2)}</p>
                      <p className="text-gray-300">Avg Efficiency: {avgEfficiency} kWh/km</p>
                      <p className="text-gray-300">Utilization: {(totalHours / (24 * getDatesInRange(startDate, endDate).length) * 100).toFixed(1)}%</p>
                      <p className="text-gray-300">Max Motor Temp: {maxTemps.motor.toFixed(1)}°C</p>
                      <p className="text-gray-300">Max Battery Temp: {maxTemps.battery.toFixed(1)}°C</p>
                    </div>
                  );
                })}
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="kwhConsumed" fill="#10b981" name="kWh Consumed" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgEfficiency" fill="#3b82f6" name="Avg Efficiency (kWh/km)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Trip Data */}
        {Object.entries(reportData).map(([vehId, trips]) => {
          const filteredTrips = filterTrips(trips, vehId);
          const sortedTrips = sortConfig.key ? sortData(sortConfig.key, filteredTrips) : filteredTrips;
          return (
            <div key={vehId} className="relative group mb-8">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-cyan-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl border-2 border-green-500/30 shadow-2xl p-6 backdrop-blur-sm">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 rounded-t-3xl"></div>
                <h3 className="text-white font-bold text-2xl flex items-center mb-6">
                  <Truck className="w-8 h-8 text-green-400 mr-3" />
                  {vehicleMaster[vehId].name} (Battery: {vehicleMaster[vehId].batteryCapacity} kWh)
                </h3>

                {sortedTrips.length === 0 ? (
                  <p className="text-gray-400">No trips found for the selected date range or search query. Try adjusting the search or generating a new report.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div>
                        <h4 className="text-white font-semibold mb-2">kWh Consumption Over Time</h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timeSeriesData(vehId)}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                              <YAxis stroke="#9ca3af" fontSize={12} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#111827',
                                  border: '1px solid #374151',
                                  borderRadius: '12px',
                                  color: '#fff',
                                }}
                              />
                              <Line type="monotone" dataKey="kwhConsumed" stroke="#10b981" name="kWh Consumed" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-2">Temperature Trends</h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={tempTrendData(vehId)}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                              <YAxis stroke="#9ca3af" fontSize={12} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#111827',
                                  border: '1px solid #374151',
                                  borderRadius: '12px',
                                  color: '#fff',
                                }}
                              />
                              <Line type="monotone" dataKey="motorTemp" stroke="#ef4444" name="Motor Temp" />
                              <Line type="monotone" dataKey="batteryTemp" stroke="#3b82f6" name="Battery Temp" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-2">Trip kWh Consumption</h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sortedTrips.map(trip => ({
                              tripId: trip.tripId,
                              kwhConsumed: ((trip.startSoc - trip.endSoc) / 100 * vehicleMaster[vehId].batteryCapacity).toFixed(2),
                              avgKw: trip.avgKw,
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                              <XAxis dataKey="tripId" stroke="#9ca3af" fontSize={12} label={{ value: 'Trip ID', position: 'insideBottom', offset: -5, fill: '#9ca3af' }} />
                              <YAxis stroke="#9ca3af" fontSize={12} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#111827',
                                  border: '1px solid #374151',
                                  borderRadius: '12px',
                                  color: '#fff',
                                }}
                              />
                              <Bar dataKey="kwhConsumed" fill="#10b981" name="kWh Consumed" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="avgKw" fill="#3b82f6" name="Avg kW" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-2">SOC Usage Patterns</h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={socUsageData(vehId)}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                              >
                                {socUsageData(vehId).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#111827',
                                  border: '1px solid #374151',
                                  borderRadius: '12px',
                                  color: '#fff',
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-700/50">
                            <th className="p-3 text-gray-300 cursor-pointer" onClick={() => handleSort('tripId')}>Trip ID {sortConfig.key === 'tripId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th className="p-3 text-gray-300 cursor-pointer" onClick={() => handleSort('date')}>Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th className="p-3 text-gray-300 cursor-pointer" onClick={() => handleSort('startTime')}>Start Time {sortConfig.key === 'startTime' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th className="p-3 text-gray-300 cursor-pointer" onClick={() => handleSort('endTime')}>End Time {sortConfig.key === 'endTime' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th className="p-3 text-gray-300 cursor-pointer" onClick={() => handleSort('totalHours')}>Total Hours {sortConfig.key === 'totalHours' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th className="p-3 text-gray-300 cursor-pointer" onClick={() => handleSort('avgKw')}>Avg kW {sortConfig.key === 'avgKw' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th className="p-3 text-gray-300 cursor-pointer" onClick={() => handleSort('ratedKw')}>Rated kW {sortConfig.key === 'ratedKw' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th className="p-3 text-gray-300 cursor-pointer" onClick={() => handleSort('peakKw')}>Peak kW {sortConfig.key === 'peakKw' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th className="p-3 text-gray-300 cursor-pointer" onClick={() => handleSort('startSoc')}>Start SOC% {sortConfig.key === 'startSoc' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th className="p-3 text-gray-300 cursor-pointer" onClick={() => handleSort('endSoc')}>End SOC% {sortConfig.key === 'endSoc' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th className="p-3 text-gray-300 cursor-pointer" onClick={() => handleSort('kwhConsumed')}>kWh Consumed {sortConfig.key === 'kwhConsumed' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th className="p-3 text-gray-300 cursor-pointer" onClick={() => handleSort('avgKwh')}>Avg kWh {sortConfig.key === 'avgKwh' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th className="p-3 text-gray-300 cursor-pointer" onClick={() => handleSort('motorTemp')}>Motor Temp (°C) {sortConfig.key === 'motorTemp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th className="p-3 text-gray-300 cursor-pointer" onClick={() => handleSort('mcuTemp')}>MCU Temp (°C) {sortConfig.key === 'mcuTemp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th className="p-3 text-gray-300 cursor-pointer" onClick={() => handleSort('batteryTemp')}>Battery Temp (°C) {sortConfig.key === 'batteryTemp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th className="p-3 text-gray-300 cursor-pointer" onClick={() => handleSort('dcdcTemp')}>DCDC Temp (°C) {sortConfig.key === 'dcdcTemp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th className="p-3 text-gray-300 cursor-pointer" onClick={() => handleSort('hydraulicOilTemp')}>Hydraulic Oil (°C) {sortConfig.key === 'hydraulicOilTemp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th className="p-3 text-gray-300 cursor-pointer" onClick={() => handleSort('efficiencyScore')}>Efficiency Score {sortConfig.key === 'efficiencyScore' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th className="p-3 text-gray-300">Alerts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedTrips.map(trip => {
                            const start = new Date(`${trip.date}T${trip.startTime}`);
                            const end = new Date(`${trip.date}T${trip.endTime}`);
                            const totalHours = ((end - start) / (1000 * 60 * 60)).toFixed(2);
                            const socDiff = trip.startSoc - trip.endSoc;
                            const kwhConsumed = (socDiff / 100 * vehicleMaster[vehId].batteryCapacity).toFixed(2);
                            const avgKwh = totalHours > 0 ? (kwhConsumed / totalHours).toFixed(2) : '0.00';
                            const alerts = [];
                            if (trip.endSoc < 25) alerts.push(<AlertCircle className="w-5 h-5 text-red-500" title="Low SOC (<25%)" />);
                            if (Object.values(trip.temps).some(t => parseFloat(t[1]) > 75)) alerts.push(<Thermometer className="w-5 h-5 text-orange-500" title="High Temp (>75°C)" />);
                            if (parseFloat(trip.peakKw) / parseFloat(trip.ratedKw) > 1.2) alerts.push(<Zap className="w-5 h-5 text-yellow-500" title="High Peak kW (>120% Rated)" />);
                            if (trip.idleTime > 60) alerts.push(<Clock className="w-5 h-5 text-amber-500" title="Long Idle Time (>1h)" />);

                            return (
                              <tr key={`${trip.date}-${trip.tripId}`} className="border-t border-gray-600/30 hover:bg-gray-700/20">
                                <td className="p-3 text-white">{trip.tripId}</td>
                                <td className="p-3 text-white">{trip.date}</td>
                                <td className="p-3 text-white">{trip.startTime}</td>
                                <td className="p-3 text-white">{trip.endTime}</td>
                                <td className="p-3 text-white">{totalHours}</td>
                                <td className="p-3 text-white">{trip.avgKw}</td>
                                <td className="p-3 text-white">{trip.ratedKw}</td>
                                <td className="p-3 text-white">{trip.peakKw}</td>
                                <td className="p-3 text-white">{trip.startSoc}</td>
                                <td className="p-3 text-white">{trip.endSoc}</td>
                                <td className="p-3 text-white">{kwhConsumed}</td>
                                <td className="p-3 text-white">{avgKwh}</td>
                                <td className="p-3 text-white">{trip.temps.motor[0]} - {trip.temps.motor[1]}</td>
                                <td className="p-3 text-white">{trip.temps.mcu[0]} - {trip.temps.mcu[1]}</td>
                                <td className="p-3 text-white">{trip.temps.battery[0]} - {trip.temps.battery[1]}</td>
                                <td className="p-3 text-white">{trip.temps.dcdc[0]} - {trip.temps.dcdc[1]}</td>
                                <td className="p-3 text-white">{trip.temps.hydraulicOil[0]} - {trip.temps.hydraulicOil[1]}</td>
                                <td className="p-3 text-white">{trip.efficiencyScore}</td>
                                <td className="p-3 flex space-x-2">
                                  {alerts.length > 0 ? alerts : <span className="text-gray-500">-</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DailyReportPage;