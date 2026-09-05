import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  Siren, 
  Activity, 
  UserCheck, 
  Building2, 
  MapPin, 
  HeartPulse, 
  ShieldAlert, 
  Clock,
  Ticket,
  LocateFixed,
  Navigation,
  Pill,
  UploadCloud,
  Store
} from 'lucide-react';
import HealthPassModal from './HealthPassModal';

export default function Navbar() {
  const { 
    activeView, 
    setActiveView, 
    sosActive, 
    userLocation, 
    requestLiveLocation,
    patientPass,
    activeBooking,
    setActiveBooking,
    bookingsHistory 
  } = useHealth();

  const [showPassModal, setShowPassModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        {/* Top Emergency Ticker Banner */}
        {sosActive && (
          <div className="bg-rose-600 text-white px-4 py-1.5 font-bold text-xs flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <Siren className="w-4 h-4 animate-spin" />
              <span>EMERGENCY MODE ACTIVE: Filtering nearest Trauma & ICU centers relative to Live Location</span>
            </div>
            <span className="text-[11px] bg-rose-800 px-2 py-0.5 rounded">GPS Tracked</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand / Logo */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveView('sos')}
                className="flex items-center gap-2 group text-left focus:outline-none"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform">
                  <HeartPulse className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xl tracking-tight text-white">CarePulse</span>
                    <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-rose-500/30">Express</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Emergency Triage & Rapid Health Network</p>
                </div>
              </button>

              {/* User Live Location GPS Button */}
              <button
                onClick={requestLiveLocation}
                title="Click to refresh Live GPS Location"
                className="hidden xl:flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-3 py-1 rounded-full text-xs text-slate-200 transition-all hover:scale-105 group"
              >
                <LocateFixed className="w-3.5 h-3.5 text-rose-500 animate-pulse group-hover:rotate-45 transition-transform" />
                <span className="font-semibold text-rose-400">Live GPS:</span>
                <span className="font-mono text-[11px] text-slate-300">{userLocation.label}</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 overflow-x-auto">
              <button
                onClick={() => setActiveView('sos')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  activeView === 'sos'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Siren className="w-4 h-4" />
                <span>Emergency SOS</span>
              </button>

              <button
                onClick={() => setActiveView('radar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  activeView === 'radar'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Nearest Facilities</span>
              </button>

              {/* User Medicine Finder Tab */}
              <button
                onClick={() => setActiveView('medicines')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  activeView === 'medicines'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Pill className="w-4 h-4" />
                <span>Medicine Finder</span>
              </button>

              {/* Specialist Slots Tab */}
              <button
                onClick={() => setActiveView('specialists')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  activeView === 'specialists'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span className="hidden lg:inline">Specialist Slots</span>
                <span className="lg:hidden">Doctors</span>
              </button>

              {/* Hospital & Pharmacy Upload Portal Tab */}
              <button
                onClick={() => setActiveView('pharmacy-upload')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  activeView === 'pharmacy-upload'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-amber-400/90 hover:text-amber-300 hover:bg-slate-800/50'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Medicine Upload</span>
              </button>

              {/* Hospital Capacity Portal Tab */}
              <button
                onClick={() => setActiveView('portal')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  activeView === 'portal'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden lg:inline">Hospital Portal</span>
                <span className="lg:hidden">ER Beds</span>
              </button>
            </nav>


            {/* Action Items: GPS Trigger & Digital Health Pass */}
            <div className="flex items-center gap-2">
              {/* Mobile GPS Refresh Button */}
              <button
                onClick={requestLiveLocation}
                className="lg:hidden p-2 bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 rounded-xl transition-all"
                title="Refresh Live GPS"
              >
                <LocateFixed className="w-4 h-4" />
              </button>

              {/* History Ticket Badge */}
              {bookingsHistory.length > 0 && (
                <button
                  onClick={() => setActiveBooking(bookingsHistory[0])}
                  className="relative p-2 bg-slate-900 border border-slate-800 text-teal-400 hover:text-teal-300 rounded-xl transition-all hover:bg-slate-800 focus:outline-none"
                  title="View Active Priority Ticket"
                >
                  <Ticket className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-teal-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {bookingsHistory.length}
                  </span>
                </button>
              )}

              {/* Patient Health Pass Button */}
              <button
                onClick={() => setShowPassModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-rose-300 hover:text-white transition-all shadow-sm"
              >
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span className="hidden md:inline">Emergency Pass</span>
                <span className="md:hidden">Pass</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Emergency Medical Pass Modal */}
      {showPassModal && (
        <HealthPassModal onClose={() => setShowPassModal(false)} />
      )}
    </>
  );
}
