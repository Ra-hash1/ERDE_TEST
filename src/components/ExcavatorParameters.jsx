import React from 'react';
import {
  Battery,
  Thermometer,
  Cpu,
  Settings,
  Zap,
  BatteryCharging,
  Wind,
  Droplet,
  Car,
  Monitor,
  SwitchCamera,
  Smartphone,
  Gauge,
  Tag,
} from 'lucide-react';

function ExcavatorParameters({ user }) {
  const cards = [
    { title: 'HV Battery & BMS', icon: <Battery className="w-8 h-8 text-blue-600" />, gradient: 'from-blue-50 to-indigo-100', textColor: 'text-blue-800' },
    { title: 'BTMS', icon: <Thermometer className="w-8 h-8 text-indigo-600" />, gradient: 'from-indigo-50 to-blue-100', textColor: 'text-indigo-800' },
    { title: 'MCU', icon: <Cpu className="w-8 h-8 text-blue-600" />, gradient: 'from-blue-50 to-indigo-100', textColor: 'text-blue-800' },
    { title: 'Transmission System', icon: <Settings className="w-8 h-8 text-indigo-600" />, gradient: 'from-indigo-50 to-blue-100', textColor: 'text-indigo-800' },
    { title: 'DC-DC Converter', icon: <Zap className="w-8 h-8 text-blue-600" />, gradient: 'from-blue-50 to-indigo-100', textColor: 'text-blue-800' },
    { title: 'LV Battery', icon: <BatteryCharging className="w-8 h-8 text-indigo-600" />, gradient: 'from-indigo-50 to-blue-100', textColor: 'text-indigo-800' },
    { title: 'HVAC', icon: <Wind className="w-8 h-8 text-blue-600" />, gradient: 'from-blue-50 to-indigo-100', textColor: 'text-blue-800' },
    { title: 'Hydraulic System', icon: <Droplet className="w-8 h-8 text-indigo-600" />, gradient: 'from-indigo-50 to-blue-100', textColor: 'text-indigo-800' },
    { title: 'Axle Oil', icon: <Car className="w-8 h-8 text-blue-600" />, gradient: 'from-blue-50 to-indigo-100', textColor: 'text-blue-800' },
    { title: 'Vehicle Peripherals', icon: <Monitor className="w-8 h-8 text-indigo-600" />, gradient: 'from-indigo-50 to-blue-100', textColor: 'text-indigo-800' },
    { title: 'Operator Switch Board', icon: <SwitchCamera className="w-8 h-8 text-blue-600" />, gradient: 'from-blue-50 to-indigo-100', textColor: 'text-blue-800' },
    { title: 'Android Display', icon: <Smartphone className="w-8 h-8 text-indigo-600" />, gradient: 'from-indigo-50 to-blue-100', textColor: 'text-indigo-800' },
    { title: 'Vehicle Wide Parameters', icon: <Gauge className="w-8 h-8 text-blue-600" />, gradient: 'from-blue-50 to-indigo-100', textColor: 'text-blue-800' },
    { title: 'Machine Identification', icon: <Tag className="w-8 h-8 text-indigo-600" />, gradient: 'from-indigo-50 to-blue-100', textColor: 'text-indigo-800' },
  ];

  return (
    <div className="h-fit bg-gray-100">
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${card.gradient} p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-h-[250px] flex flex-col items-center justify-center`}
            >
              <div className="flex items-center justify-center space-x-3 mb-4">
                {card.icon}
                <h3 className={`text-xl font-semibold ${card.textColor} text-center`}>{card.title}</h3>
              </div>
              <p className="text-gray-600 mb-4 text-center text-sm">
                Monitor and analyze key metrics for optimal performance and maintenance.
              </p>
              <button className={`px-4 py-2 bg-${card.textColor.split('-')[1]}-600 text-white rounded-lg hover:bg-${card.textColor.split('-')[1]}-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-${card.textColor.split('-')[1]}-300`}>
                View Details
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default ExcavatorParameters;