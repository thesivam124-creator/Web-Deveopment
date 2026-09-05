import React from 'react';
import { useHealth } from '../context/HealthContext';
import { MapPin, Navigation, Siren, Activity, LocateFixed } from 'lucide-react';

export default function MapView({ centers, onSelectFacility }) {
  const { userLocation, requestLiveLocation } = useHealth();

  return (
    <div className="relative w-full h-[400px] md:h-[480px] bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
      {/* Radar Map Grid Canvas Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>

      {/* Pulsing Radar Circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-rose-500/20 rounded-full animate-ping pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-slate-800 rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-slate-800/40 rounded-full pointer-events-none"></div>

      {/* Map Header Bar */}
      <div className="relative z-10 bg-slate-900/90 backdrop-blur-md p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
          <h3 className="font-bold text-white text-sm">Live Facility Radar & Proximity Vector</h3>
        </div>

        <button
          onClick={requestLiveLocation}
          className="flex items-center gap-1.5 px-3 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition-all"
        >
          <LocateFixed className="w-3.5 h-3.5" />
          <span>Update GPS Location</span>
        </button>
      </div>

      {/* Map Interactive Visual Canvas */}
      <div className="relative flex-1 w-full h-full p-6">
        
        {/* Central User Live Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
          <div className="relative">
            <div className="w-12 h-12 bg-rose-600/30 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-7 h-7 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-600/50">
                <Navigation className="w-4 h-4 fill-current" />
              </div>
            </div>
          </div>
          <span className="mt-1 text-[11px] font-bold text-white bg-slate-900/95 border border-slate-700 px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            You ({userLocation.lat.toFixed(3)}°, {userLocation.lng.toFixed(3)}°)
          </span>
        </div>

        {/* Dynamic Hospital Location Nodes */}
        {centers.map((facility, index) => {
          // Offsets for mock map positions relative to center
          const offsets = [
            { top: '25%', left: '30%' },
            { top: '35%', left: '72%' },
            { top: '75%', left: '28%' },
            { top: '70%', left: '68%' },
          ];
          const pos = offsets[index % offsets.length];

          const badgeColor = 
            facility.facilities.icuBedsAvailable > 5 ? 'bg-emerald-500' :
            facility.facilities.icuBedsAvailable > 1 ? 'bg-amber-500' : 'bg-rose-500';

          return (
            <div 
              key={facility.id}
              style={{ top: pos.top, left: pos.left }}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              onClick={() => onSelectFacility(facility)}
            >
              <div className="flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <div className={`w-8 h-8 rounded-full ${badgeColor} text-slate-950 flex items-center justify-center font-bold text-xs shadow-lg group-hover:scale-125 transition-transform`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-slate-950"></div>
                </div>

                {/* Popup Info Card */}
                <div className="mt-1 bg-slate-900/95 border border-slate-700 p-2.5 rounded-xl shadow-xl w-48 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-rose-400">{facility.distanceKm} km away</span>
                    <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                      ER {facility.erWaitTimeMinutes}m wait
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-white truncate">{facility.name}</h5>
                  <div className="text-[10px] text-slate-300 mt-1 flex items-center justify-between border-t border-slate-800 pt-1">
                    <span>ICU Beds: <strong className="text-emerald-400">{facility.facilities.icuBedsAvailable}</strong></span>
                    <span className="text-teal-400 font-medium">Click to view</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

      </div>

      {/* Map Bottom Legend Footer */}
      <div className="relative z-10 bg-slate-900/90 backdrop-blur-md p-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <LocateFixed className="w-3.5 h-3.5 text-rose-500" />
          <span>Live Location Vector Active</span>
        </span>
        <span className="text-rose-400 font-semibold">Distances Auto-Calculated via GPS</span>
      </div>
    </div>
  );
}
