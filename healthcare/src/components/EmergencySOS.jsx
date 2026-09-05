import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { TRIAGE_CATEGORIES } from '../mock/healthData';
import { calculateEtaMinutes, sortFacilitiesByWaitTime } from '../utils/distance';
import { 
  Siren, 
  PhoneCall, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  Activity, 
  ChevronRight, 
  Bed, 
  Zap,
  CheckCircle2,
  Stethoscope
} from 'lucide-react';

export default function EmergencySOS() {
  const { 
    healthCenters, 
    sosActive, 
    setSosActive, 
    selectedTriage, 
    setSelectedTriage,
    bookSpecialistSlot,
    patientPass,
    setActiveView
  } = useHealth();

  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Filter facilities based on triage if selected
  let sortedCenters = sortFacilitiesByWaitTime(healthCenters);

  if (selectedTriage) {
    // Sort facilities that match the recommended discipline to top
    sortedCenters = [...sortedCenters].sort((a, b) => {
      const aHasDisc = a.specialists.some(d => d.discipline === selectedTriage.recommendedDiscipline);
      const bHasDisc = b.specialists.some(d => d.discipline === selectedTriage.recommendedDiscipline);
      if (aHasDisc && !bHasDisc) return -1;
      if (!aHasDisc && bHasDisc) return 1;
      return a.distanceKm - b.distanceKm;
    });
  }

  const handleTriggerSOS = () => {
    setSosActive(!sosActive);
  };

  const handleInstantEmergencyReserve = (facility) => {
    // Find emergency doctor or primary doctor
    const doctor = facility.specialists[0] || {
      id: 'doc-er-oncall',
      name: 'Duty Emergency Physician',
      discipline: selectedTriage ? selectedTriage.recommendedDiscipline : 'Trauma & Emergency',
      consultationFee: 50,
      slots: ['NOW']
    };

    const slotTime = 'IMMEDIATE ER INTAKE';
    bookSpecialistSlot(facility, doctor, slotTime, true);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Big Emergency Header & SOS Pulse Button */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-500 relative overflow-hidden ${
        sosActive 
          ? 'bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900/50 border-rose-600 shadow-2xl shadow-rose-900/50' 
          : 'bg-slate-900/80 border-slate-800'
      }`}>
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold text-rose-400">
              <Siren className="w-4 h-4 animate-bounce" />
              <span>Time-Critical Health Allocation Network</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Instant Emergency Triage & <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">Zero-Wait Intake</span>
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed">
              In case of medical emergency, tap SOS below to broadcast your profile, locate nearest available ICU beds, trauma bays, and reserve immediate emergency doctor consultation slots.
            </p>

            {/* Emergency Hotline Button */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <a
                href="tel:911"
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-rose-600/40 transition-all hover:scale-105"
              >
                <PhoneCall className="w-4 h-4 animate-pulse" />
                Call Emergency Hotline (911 / 102)
              </a>

              <button
                onClick={() => setActiveView('radar')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <Activity className="w-4 h-4 text-teal-400" />
                View Full Map Radar
              </button>
            </div>
          </div>

          {/* Large SOS Switcher */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <button
              onClick={handleTriggerSOS}
              className={`w-36 h-36 rounded-full flex flex-col items-center justify-center gap-1.5 font-black text-xl transition-all duration-500 shadow-2xl border-4 focus:outline-none ${
                sosActive
                  ? 'bg-rose-600 text-white border-rose-300 animate-pulse glow-red scale-105'
                  : 'bg-gradient-to-br from-rose-700 to-rose-900 text-rose-100 border-rose-600/60 hover:scale-105 hover:border-rose-400'
              }`}
            >
              <Siren className={`w-10 h-10 ${sosActive ? 'animate-spin' : ''}`} />
              <span>{sosActive ? 'SOS ACTIVE' : 'ACTIVATE SOS'}</span>
              <span className="text-[10px] font-medium text-rose-200 font-sans tracking-wide">
                {sosActive ? 'Tap to Stop' : '1-Tap Emergency'}
              </span>
            </button>
            <span className="text-[11px] text-slate-400 font-medium">GPS Auto-Location Enabled</span>
          </div>

        </div>
      </div>

      {/* Symptom Triage Category Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-rose-400" />
              Rapid Triage Symptom Checker
            </h2>
            <p className="text-xs text-slate-400">Select symptom type to prioritize matching emergency specialists</p>
          </div>
          {selectedTriage && (
            <button 
              onClick={() => setSelectedTriage(null)}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline"
            >
              Clear Triage Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {TRIAGE_CATEGORIES.map((cat) => {
            const isSelected = selectedTriage?.id === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedTriage(isSelected ? null : cat)}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-full ${
                  isSelected
                    ? 'bg-rose-950/80 border-rose-500 text-white shadow-lg shadow-rose-950/50 scale-[1.02]'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      cat.priority.includes('Critical') 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {cat.priority}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
                  </div>
                  <h3 className="font-bold text-sm text-white mb-1">{cat.name}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{cat.description}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-rose-400">
                  <span>Match Specialists</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nearest Emergency Facilities List (Time-Sorted) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Nearest Health Facilities (Sorted by Shortest Waiting & Travel Time)
            </h2>
            <p className="text-xs text-slate-400">Live data updated directly by health center emergency desks</p>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
            {sortedCenters.length} Health Facilities Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedCenters.map((facility) => {
            const etaMins = calculateEtaMinutes(facility.distanceKm);
            const totalEstimatedIntakeTime = etaMins + facility.erWaitTimeMinutes;

            return (
              <div 
                key={facility.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-xl transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge Row */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        {facility.type}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1">{facility.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {facility.address}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-xl">
                        {totalEstimatedIntakeTime} min ETA
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Travel: {etaMins}m | ER Wait: {facility.erWaitTimeMinutes}m
                      </span>
                    </div>
                  </div>

                  {/* Resource Counters Grid */}
                  <div className="grid grid-cols-3 gap-2 py-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 my-3 text-center">
                    <div className="p-2">
                      <span className="text-[10px] text-slate-400 font-medium block mb-0.5">ICU Beds</span>
                      <span className={`text-base font-black ${
                        facility.facilities.icuBedsAvailable > 0 ? 'text-emerald-400' : 'text-rose-500'
                      }`}>
                        {facility.facilities.icuBedsAvailable} / {facility.facilities.totalIcuBeds}
                      </span>
                    </div>

                    <div className="p-2 border-x border-slate-800/80">
                      <span className="text-[10px] text-slate-400 font-medium block mb-0.5">ER Bays</span>
                      <span className="text-base font-black text-amber-400">
                        {facility.facilities.emergencyBedsAvailable} Open
                      </span>
                    </div>

                    <div className="p-2">
                      <span className="text-[10px] text-slate-400 font-medium block mb-0.5">Oxygen</span>
                      <span className="text-xs font-bold text-teal-300">
                        {facility.facilities.oxygenPressureBar} Bar Normal
                      </span>
                    </div>
                  </div>

                  {/* Available Specialists Preview */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      On-Duty Specialist Doctors:
                    </span>
                    <div className="space-y-1">
                      {facility.specialists.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between text-xs bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-700/40">
                          <div>
                            <span className="font-semibold text-white">{doc.name}</span>
                            <span className="text-[11px] text-slate-400 block">{doc.discipline}</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            Next: {doc.nextSlot}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Instant Action Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <a
                    href={`tel:${facility.emergencyPhone}`}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                    Call ER
                  </a>

                  <button
                    onClick={() => handleInstantEmergencyReserve(facility)}
                    className="flex-2 w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.02]"
                  >
                    <Siren className="w-4 h-4" />
                    Reserve Zero-Wait ER Slot
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
