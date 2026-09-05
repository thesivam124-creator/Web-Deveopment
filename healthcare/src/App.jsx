import React from 'react';
import { HealthProvider, useHealth } from './context/HealthContext';
import Navbar from './components/Navbar';
import EmergencySOS from './components/EmergencySOS';
import FacilityRadar from './components/FacilityRadar';
import SpecialistSearch from './components/SpecialistSearch';
import FacilityPortal from './components/FacilityPortal';
import MedicineUserPortal from './components/MedicineUserPortal';
import PharmacyUploadPortal from './components/PharmacyUploadPortal';
import BookingReceiptModal from './components/BookingReceiptModal';
import MedicineReservationModal from './components/MedicineReservationModal';
import { CheckCircle2, AlertCircle, HeartPulse, Siren } from 'lucide-react';

function MainAppContent() {
  const { 
    activeView, 
    activeBooking, 
    setActiveBooking, 
    activeMedicineOrder,
    setActiveMedicineOrder,
    toastMessage 
  } = useHealth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-rose-500 selection:text-white">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-bold ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 text-emerald-400 border-emerald-500/50 shadow-emerald-950/50'
              : 'bg-slate-900 text-rose-400 border-rose-500/50 shadow-rose-950/50'
          }`}>
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeView === 'sos' && <EmergencySOS />}
        {activeView === 'radar' && <FacilityRadar />}
        {activeView === 'medicines' && <MedicineUserPortal />}
        {activeView === 'specialists' && <SpecialistSearch />}
        {activeView === 'pharmacy-upload' && <PharmacyUploadPortal />}
        {activeView === 'portal' && <FacilityPortal />}
      </main>

      {/* Priority Booking Receipt Modal */}
      {activeBooking && (
        <BookingReceiptModal 
          booking={activeBooking} 
          onClose={() => setActiveBooking(null)} 
        />
      )}

      {/* Active Medicine Reservation Order Receipt Modal */}
      {activeMedicineOrder && (
        <MedicineReservationModal
          pharmacy={{
            id: activeMedicineOrder.pharmacyId,
            name: activeMedicineOrder.pharmacyName,
            address: activeMedicineOrder.pharmacyAddress,
            phone: activeMedicineOrder.pharmacyPhone,
            type: activeMedicineOrder.pharmacyType,
            distanceKm: 1.2
          }}
          medicine={{
            id: activeMedicineOrder.medicineId,
            name: activeMedicineOrder.medicineName,
            genericName: activeMedicineOrder.genericName,
            category: activeMedicineOrder.category,
            dosageForm: activeMedicineOrder.dosageForm,
            strength: activeMedicineOrder.strength,
            prescriptionRequired: activeMedicineOrder.prescriptionRequired
          }}
          stockInfo={{
            price: activeMedicineOrder.unitPrice,
            mrp: activeMedicineOrder.mrp
          }}
          onClose={() => setActiveMedicineOrder(null)}
        />
      )}


      {/* Modern Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 mt-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            <span className="font-bold text-white text-sm">CarePulse Express</span>
            <span className="text-slate-500">• Time-Saving Emergency & Health Treatment Allocation Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Facility Feeds Online
            </span>
            <span>Emergency Hotline: 911 / 102</span>
            <span>© 2026 CarePulse Health</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <HealthProvider>
      <MainAppContent />
    </HealthProvider>
  );
}
