import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  UserCheck, 
  Search, 
  Clock, 
  MapPin, 
  Star, 
  Calendar, 
  Building2,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  LocateFixed,
  X
} from 'lucide-react';

export default function SpecialistSearch() {
  const { healthCenters, userLocation, requestLiveLocation, bookSpecialistSlot } = useHealth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('All');
  const [maxFee, setMaxFee] = useState(150);

  // Extract all specialists with facility context
  const allSpecialists = [];
  healthCenters.forEach(facility => {
    facility.specialists.forEach(doc => {
      allSpecialists.push({
        ...doc,
        facility
      });
    });
  });

  // Sort specialists by nearest distance relative to GPS by default
  allSpecialists.sort((a, b) => a.facility.distanceKm - b.facility.distanceKm);

  const disciplines = ['All', 'Cardiology & Emergency Care', 'Trauma & General Surgery', 'Neurology & Stroke Unit', 'Pulmonology & Respiratory', 'Pediatrics & Pediatric Emergency', 'Orthopedics & Fracture Surgery'];

  // Dual filter: Live location default + Text Search query
  const filteredSpecialists = allSpecialists.filter(item => {
    const matchesDiscipline = selectedDiscipline === 'All' || item.discipline.toLowerCase().includes(selectedDiscipline.toLowerCase());
    const matchesFee = item.consultationFee <= maxFee;
    const matchesSearch = searchTerm.trim() === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.discipline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.facility.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDiscipline && matchesFee && matchesSearch;
  });

  const handleBookSlot = (facility, doctor, slotTime) => {
    bookSpecialistSlot(facility, doctor, slotTime, false, 15);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20 flex items-center gap-1.5 w-fit">
            <LocateFixed className="w-3.5 h-3.5 animate-pulse" />
            Live GPS Default Active (Dual Search Enabled)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Specialist Pre-Booking & Queue Bypass
          </h1>
          <p className="text-xs text-slate-400">
            Specialists are auto-matched by live GPS location by default. You can also filter by typing doctor name, hospital, or discipline.
          </p>
        </div>

        {/* Dual Search Controls Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          
          {/* Text Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search doctor name, hospital, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Discipline Selector */}
          <select
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-2xl px-3 py-2 focus:outline-none focus:border-teal-500 font-medium"
          >
            {disciplines.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Max Fee Slider */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-1.5 flex flex-col justify-center">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <span>Max Consult Fee</span>
              <span className="text-teal-400 font-bold">${maxFee}</span>
            </div>
            <input
              type="range"
              min="30"
              max="200"
              value={maxFee}
              onChange={(e) => setMaxFee(Number(e.target.value))}
              className="w-full accent-teal-500 h-1 bg-slate-800 rounded-lg cursor-pointer mt-1"
            />
          </div>

        </div>

        {/* GPS Auto Badge & Quick Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <LocateFixed className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-400">Live GPS Location:</span>
            <span className="font-mono text-xs font-bold text-teal-400">{userLocation.label}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {disciplines.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDiscipline(d)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedDiscipline === d 
                    ? 'bg-teal-600 text-white shadow' 
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {d.split('&')[0]}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Specialist Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSpecialists.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-xl transition-all space-y-4 flex flex-col justify-between"
          >
            <div>
              
              {/* Doctor Info Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shrink-0">
                  {item.name.split(' ')[1]?.[0] || 'D'}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{item.rating}</span>
                    <span className="text-slate-500 font-normal">({item.experienceYears} yrs exp)</span>
                  </div>
                  <h3 className="font-extrabold text-white text-base mt-0.5">{item.name}</h3>
                  <span className="text-xs font-semibold text-teal-400 block">{item.discipline}</span>
                </div>
              </div>

              {/* Hospital Affiliation Card */}
              <div className="mt-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Building2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span className="truncate">{item.facility.name}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-rose-400 font-bold">📍 {item.facility.distanceKm} km from GPS</span>
                  <span className="text-emerald-400 font-semibold">Fee: ${item.consultationFee}</span>
                </div>
              </div>

              {/* Available Today Slots */}
              <div className="mt-4 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  Pre-Book Consultation Slots Today:
                </span>

                {item.slots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {item.slots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => handleBookSlot(item.facility, item, slot)}
                        className="px-3 py-2 bg-slate-950 hover:bg-teal-600 text-teal-300 hover:text-white rounded-xl text-xs font-bold border border-slate-800 hover:border-teal-500 transition-all flex items-center justify-between group"
                      >
                        <span>{slot}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-teal-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-rose-400 bg-rose-950/30 p-2.5 rounded-xl border border-rose-900/40 text-center font-medium">
                    No remaining slots today
                  </div>
                )}
              </div>

            </div>

            {/* Pre-Booking Action Button with Cancellation Terms */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => handleBookSlot(item.facility, item, item.slots[0] || '19:30')}
                disabled={item.slots.length === 0}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                Pre-Book Slot ({item.slots[0] || 'N/A'}) - $15 Holding Fee
              </button>

              <p className="text-[10px] text-slate-500 text-center">
                Free cancellation up to 2h before. $15 late charge within 2h.
              </p>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
