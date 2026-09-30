import React from 'react';
import RoorkeeMap from '../../components/RoorkeeMap';
import { Map } from 'lucide-react';

const MayorMapView = () => {
  return (
    <div className="w-full space-y-6 animate-fade-in pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white border-2 border-green-600 rounded-3xl p-6 shadow-sm mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-green-800 flex items-center gap-2">
              <Map className="w-6 h-6" /> Live City Map (Mayor's View)
            </h2>
            <p className="text-sm text-gray-500 mt-1">Monitor all IoT Smart Bins and Manual Bins across Roorkee in real-time.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-green-700 uppercase tracking-widest">Live Feed Active</span>
          </div>
        </div>
      </div>
      
      <RoorkeeMap />
    </div>
  );
};

export default MayorMapView;
