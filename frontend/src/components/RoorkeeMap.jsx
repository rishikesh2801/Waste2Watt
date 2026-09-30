import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Battery, Wifi, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// Custom icons using standard HTML/CSS so we don't need external image assets
const createCustomIcon = (color, typeText, iconClass = 'MapPin') => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="transform: rotate(45deg); color: white; font-size: 14px; font-weight: bold;">
          ${typeText}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36], // Point of the teardrop
    popupAnchor: [0, -36]
  });
};

const icons = {
  iot: createCustomIcon('#ef4444', 'IoT'), // Red for IoT (important)
  single: createCustomIcon('#3b82f6', '1x'), // Blue for single bins
  dual: createCustomIcon('#10b981', '2x')   // Green for dual bins (Dry/Wet)
};

// IoT Bins (Fixed 4 bins matching IoT Dashboard)
const iotBins = [
  { id: 'IOT-BN-01', location: 'Sector 4, Main Market', lat: 29.8650, lng: 77.8960, fill: 95, battery: 98, status: 'Full' },
  { id: 'IOT-BN-02', location: 'Station Road, Lane 2', lat: 29.8510, lng: 77.8820, fill: 45, battery: 95, status: 'Normal' },
  { id: 'IOT-BN-03', location: 'Civil Lines, Park Avenue', lat: 29.8600, lng: 77.8890, fill: 20, battery: 90, status: 'Empty' },
  { id: 'IOT-BN-04', location: 'IIT Roorkee Main Gate', lat: 29.8640, lng: 77.8965, fill: 80, battery: 99, status: 'Normal' }
];

// Single Bins (Randomly scattered around Roorkee)
const singleBins = [
  { id: 'S-1', location: 'Ramnagar', lat: 29.8700, lng: 77.8800 },
  { id: 'S-2', location: 'Ganeshpur', lat: 29.8450, lng: 77.8900 },
  { id: 'S-3', location: 'Avas Vikas', lat: 29.8550, lng: 77.9000 },
  { id: 'S-4', location: 'Solani Park', lat: 29.8750, lng: 77.8950 },
  { id: 'S-5', location: 'Bus Stand', lat: 29.8520, lng: 77.8850 },
  { id: 'S-6', location: 'Railway Station', lat: 29.8480, lng: 77.8780 },
];

// Dual Bins (Dry/Wet)
const dualBins = [
  { id: 'D-1', location: 'Nehru Stadium', lat: 29.8580, lng: 77.8920 },
  { id: 'D-2', location: 'Civil Hospital', lat: 29.8540, lng: 77.8830 },
  { id: 'D-3', location: 'Municipal Corporation Office', lat: 29.8570, lng: 77.8860 },
  { id: 'D-4', location: 'Century Gate, IITR', lat: 29.8680, lng: 77.9000 },
];

const center = [29.8543, 77.8880]; // Roorkee Center

const RoorkeeMap = () => {
  const [filter, setFilter] = useState('all');

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-black text-[#1a3a6b]">Roorkee Dustbin Map</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Live tracking of IoT and manual bins across the city</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-[#1a3a6b] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All Bins
          </button>
          <button 
            onClick={() => setFilter('iot')}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all ${filter === 'iot' ? 'bg-red-500 text-white shadow-md shadow-red-500/30' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
            IoT Smart Bins
          </button>
          <button 
            onClick={() => setFilter('dual')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'dual' ? 'bg-green-500 text-white shadow-md shadow-green-500/30' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
          >
            Dual (Dry/Wet)
          </button>
          <button 
            onClick={() => setFilter('single')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'single' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
          >
            Single Bins
          </button>
        </div>
      </div>

      <div className="h-[600px] w-full rounded-2xl overflow-hidden border-4 border-white shadow-lg relative z-0">
        <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* IoT Bins */}
          {(filter === 'all' || filter === 'iot') && iotBins.map((bin) => (
            <Marker key={bin.id} position={[bin.lat, bin.lng]} icon={icons.iot}>
              <Tooltip direction="top" offset={[0, -36]} opacity={1}>
                <div className="font-bold">{bin.id}</div>
              </Tooltip>
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md uppercase tracking-wider">IoT Smart Bin</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${bin.fill >= 90 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {bin.status}
                    </span>
                  </div>
                  <h3 className="font-black text-gray-800 text-sm mb-1">{bin.location}</h3>
                  <div className="space-y-1.5 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-1"><Battery className="w-3 h-3"/> Battery</span>
                      <span className="font-bold text-gray-700">{bin.battery}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-1"><Info className="w-3 h-3"/> Fill Level</span>
                      <span className={`font-bold ${bin.fill >= 90 ? 'text-red-600' : 'text-gray-700'}`}>{bin.fill}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full ${bin.fill >= 90 ? 'bg-red-500' : bin.fill > 50 ? 'bg-amber-500' : 'bg-green-500'}`} 
                      style={{ width: `${bin.fill}%` }}
                    />
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Dual Bins */}
          {(filter === 'all' || filter === 'dual') && dualBins.map((bin) => (
            <Marker key={bin.id} position={[bin.lat, bin.lng]} icon={icons.dual}>
              <Tooltip direction="top" offset={[0, -36]} opacity={1}>
                <div className="font-bold">{bin.id}</div>
              </Tooltip>
              <Popup>
                <div className="p-1">
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md uppercase tracking-wider mb-2 inline-block">Dual Bin (Dry/Wet)</span>
                  <h3 className="font-black text-gray-800 text-sm">{bin.location}</h3>
                  <p className="text-xs text-gray-500 mt-1">Manual collection schedule: Daily 8:00 AM</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Single Bins */}
          {(filter === 'all' || filter === 'single') && singleBins.map((bin) => (
            <Marker key={bin.id} position={[bin.lat, bin.lng]} icon={icons.single}>
              <Tooltip direction="top" offset={[0, -36]} opacity={1}>
                <div className="font-bold">{bin.id}</div>
              </Tooltip>
              <Popup>
                <div className="p-1">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider mb-2 inline-block">Single Bin (Mixed)</span>
                  <h3 className="font-black text-gray-800 text-sm">{bin.location}</h3>
                  <p className="text-xs text-gray-500 mt-1">Manual collection schedule: Daily 9:30 AM</p>
                </div>
              </Popup>
            </Marker>
          ))}

        </MapContainer>
      </div>
    </div>
  );
};

export default RoorkeeMap;
