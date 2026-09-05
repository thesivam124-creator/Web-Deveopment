import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { sortFacilitiesByDistance } from '../utils/distance';
import MapView from './MapView';
import { 
  Building2, 
  MapPin, 
  Bed, 
  Activity, 
  Grid, 
  Map, 
  Search,
  Droplet, 
  Wind, 
  LocateFixed, 
  CalendarCheck,
  CreditCard,
  RefreshCw,
  X
} from 'lucide-react';

export default function FacilityRadar() {
  const { 
    healthCenters, 
    userLocation, 
    requestLiveLocation, 
    setActiveView, 
    setSelectedFacilityId, 
    bookSpecialistSlot 
  } = useHealth();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [searchTerm, setSearchTerm] = useState(''); // Text search input
  const [maxDistance, setMaxDistance] = useState(10); // km radius filter
  const [filterBloodGroup, setFilterBloodGroup] = useState('all');
  const [requireIcu, setRequireIcu] = useState(false);

  // Default sorting by Live GPS distance + text search filter if user types
  let filtered = healthCenters.filter(fc => {
    const matchesDistance = fc.distanceKm <= maxDistance;
    const matchesSearch = searchTerm.trim() === '' || 
      fc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      fc.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fc.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIcu = requireIcu ? fc.facilities.icuBedsAvailable > 0 : true;
    const matchesBlood = filterBloodGroup === 'all' ? true : (fc.facilities.bloodBank[filterBloodGroup] > 0);

    return matchesDistance && matchesSearch && matchesIcu && matchesBlood;
  });

  const sortedFacilities = sortFacilitiesByDistance(filtered);

  const handlePreBookEmergencyFacility = (facility) => {
    const doctor = facility.specialists[0] || {
      id: 'doc-er-oncall',
      name: 'Duty ER Specialist',
      discipline: 'Trauma & Emergency',
      consultationFee: 75,
      slots: ['IMMEDIATE PRE-BOOK']
    };

    bookSpecialistSlot(facility, doctor, 'IMMEDIATE PRE-BOOK INTAKE', true, 15);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Auto-GPS Location Detection Banner Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 flex items-center gap-1.5">
                <LocateFixed className="w-3.5 h-3.5 animate-pulse" />
                Live GPS Location Default Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Nearest Health Facilities & Pre-Booking Board
            </h1>

            <p className="text-xs text-slate-400">
              Services are auto-sorted by live GPS location by default. You can also search specific health center names, services, or locations below.
            </p>
          </div>

          {/* Map vs Grid Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Grid View</span>
            </button>

            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'map' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Radar Map</span>
            </button>
          </div>
        </div>

        {/* Search Bar + GPS Location Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          
          {/* Dual Search Input Bar */}
          <div className="relative md:col-span-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hospital name, specialty, address, or leave empty for auto GPS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* GPS Auto-Detector Badge & Refresh */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 md:col-span-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <LocateFixed className="w-4 h-4 text-rose-500 animate-pulse shrink-0" />
              <div className="truncate">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Default GPS</span>
                <span className="font-mono font-bold text-rose-400 text-[11px] truncate">{userLocation.label}</span>
              </div>
            </div>
            <button
              onClick={requestLiveLocation}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold rounded-lg shrink-0 ml-1"
            >
              GPS
            </button>
          </div>

          {/* Distance Radius Quick Pills */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-1.5 md:col-span-3 flex items-center justify-around text-xs">
            <span className="text-[10px] font-semibold text-slate-400">Radius:</span>
            {[2, 5, 10, 25].map(radius => (
              <button
                key={radius}
                onClick={() => setMaxDistance(radius)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  maxDistance === radius 
                    ? 'bg-rose-600 text-white shadow' 
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {radius}k
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Main Content View */}
      {viewMode === 'map' ? (
        <MapView 
          centers={sortedFacilities} 
          onSelectFacility={(facility) => {
            setViewMode('grid');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedFacilities.map((facility) => (
            <div
              key={facility.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        {facility.type}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        📍 {facility.distanceKm} km from GPS
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                        Updated {facility.lastUpdated ? `${Math.max(1, Math.floor((Date.now() - new Date(facility.lastUpdated).getTime()) / 60000))}m ago` : 'Live'}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-white mt-1">{facility.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      {facility.address}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-xl inline-block">
                      ER Wait: {facility.erWaitTimeMinutes}m
                    </span>
                    <span className="block text-[10px] text-emerald-400 font-bold mt-1">
                      Pre-Booking Guaranteed
                    </span>
                  </div>
                </div>

                {/* Resource Stats Grid */}
                <div className="grid grid-cols-3 gap-3 py-4">
                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-1">
                      <Bed className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ICU Beds</span>
                    </div>
                    <div className="text-lg font-black text-emerald-400">
                      {facility.facilities.icuBedsAvailable} <span className="text-xs text-slate-500 font-normal">/ {facility.facilities.totalIcuBeds}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-1">
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      <span>ER Bays</span>
                    </div>
                    <div className="text-lg font-black text-amber-400">
                      {facility.facilities.emergencyBedsAvailable} Open
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-1">
                      <Wind className="w-3.5 h-3.5 text-teal-400" />
                      <span>Oxygen</span>
                    </div>
                    <div className="text-xs font-bold text-teal-300 mt-1">
                      {facility.facilities.oxygenPressureBar} Bar Normal
                    </div>
                  </div>
                </div>

                {/* Pre-Booking Slot Options */}
                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5 text-teal-400">
                      <CalendarCheck className="w-4 h-4" />
                      Specialist Pre-Booking Slots Today
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">$15 Holding Fee</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {facility.specialists.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => {
                          setActiveView('specialists');
                        }}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2 rounded-xl text-left transition-all"
                      >
                        <span className="text-xs font-bold text-white block truncate">{doc.name}</span>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                          <span>{doc.discipline.split('&')[0]}</span>
                          <span className="text-emerald-400 font-bold">Slot: {doc.nextSlot}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Pre-Booking Actions with Cancellation Term Notes */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <a
                    href={`https://maps.google.com/?q=${facility.coordinates.lat},${facility.coordinates.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    Directions
                  </a>

                  <button
                    onClick={() => handlePreBookEmergencyFacility(facility)}
                    className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.02]"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    Pre-Book ER Intake ($15 Deposit)
                  </button>
                </div>

                <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
                  <CreditCard className="w-3 h-3 text-slate-400" />
                  <span>Full refund on cancellation up to 2h before slot. $15 late fee applies within 2h.</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
