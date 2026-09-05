import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  Building2, 
  Bed, 
  Activity, 
  Wind, 
  Droplet, 
  Plus, 
  Save, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  UploadCloud,
  UserCheck,
  Shield,
  Siren,
  FileJson,
  DownloadCloud,
  Trash2,
  Edit3,
  Phone,
  MapPin,
  UserPlus,
  RefreshCw,
  Sliders,
  Check
} from 'lucide-react';

export default function FacilityPortal() {
  const { 
    healthCenters, 
    selectedFacilityId, 
    setSelectedFacilityId,
    updateFacilityResource,
    updateHospitalInfo,
    addHealthCenter,
    addSpecialist,
    deleteSpecialist,
    addSpecialistSlot,
    showToast,
    bookingsHistory,
    updateBookingStatus,
    bulkImportFacilityData,
    userLocation
  } = useHealth();

  const facility = healthCenters.find(f => f.id === selectedFacilityId) || healthCenters[0];

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'profile' | 'doctors' | 'bulk' | 'intake' | 'register'

  // Tab 2: Hospital Profile State
  const [profileForm, setProfileForm] = useState({
    name: facility.name,
    type: facility.type,
    address: facility.address,
    emergencyPhone: facility.emergencyPhone,
    lat: facility.coordinates?.lat || 28.6139,
    lng: facility.coordinates?.lng || 77.2090,
    status: facility.status || 'High Capacity Available',
    statusBadge: facility.statusBadge || 'green'
  });

  // Keep profile form synced when selected hospital changes
  React.useEffect(() => {
    if (facility) {
      setProfileForm({
        name: facility.name,
        type: facility.type,
        address: facility.address,
        emergencyPhone: facility.emergencyPhone,
        lat: facility.coordinates?.lat || 28.6139,
        lng: facility.coordinates?.lng || 77.2090,
        status: facility.status || 'High Capacity Available',
        statusBadge: facility.statusBadge || 'green'
      });
    }
  }, [facility.id]);

  // Tab 3: New Specialist Doctor State
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    discipline: 'Cardiology & Emergency Care',
    experienceYears: 10,
    consultationFee: 80,
    rating: 4.8,
    initialSlot: '19:30'
  });

  // Tab 3: Publish Slot State
  const [newSlotDoctorId, setNewSlotDoctorId] = useState(facility.specialists[0]?.id || '');
  const [newSlotTime, setNewSlotTime] = useState('21:30');

  // Tab 4: Bulk JSON Data State
  const [jsonInput, setJsonInput] = useState('');

  // Tab 6: Register New Hospital State
  const [newHospital, setNewHospital] = useState({
    name: '',
    type: 'Super Specialty Hospital',
    address: '',
    emergencyPhone: '+1 (800) 555-0100',
    erWaitTimeMinutes: 10,
    status: 'High Capacity Available',
    statusBadge: 'green',
    primaryDoctorName: '',
    primaryDiscipline: 'Emergency Medicine'
  });

  // Timestamp Formatter Helper
  const getFormattedTimeAgo = (isoString) => {
    if (!isoString) return 'Just now';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now (Seconds ago)';
    if (mins === 1) return '1 minute ago';
    if (mins < 60) return `${mins} minutes ago`;
    const hours = Math.floor(mins / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  // Resource handler with auto live sync
  const handleResourceChange = (fieldPath, value) => {
    updateFacilityResource(facility.id, fieldPath, value);
  };

  // Submit Profile Update
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateHospitalInfo(facility.id, {
      name: profileForm.name,
      type: profileForm.type,
      address: profileForm.address,
      emergencyPhone: profileForm.emergencyPhone,
      coordinates: { lat: Number(profileForm.lat), lng: Number(profileForm.lng) },
      status: profileForm.status,
      statusBadge: profileForm.statusBadge
    });
  };

  // Submit Doctor Creation
  const handleAddDoctorSubmit = (e) => {
    e.preventDefault();
    if (!newDoctor.name.trim()) {
      showToast('Doctor name is required', 'error');
      return;
    }
    addSpecialist(facility.id, {
      ...newDoctor,
      slots: [newDoctor.initialSlot]
    });
    setNewDoctor({
      name: '',
      discipline: 'Cardiology & Emergency Care',
      experienceYears: 10,
      consultationFee: 80,
      rating: 4.8,
      initialSlot: '19:30'
    });
  };

  // Submit Slot Publish
  const handleAddSlotSubmit = (e) => {
    e.preventDefault();
    const docId = newSlotDoctorId || facility.specialists[0]?.id;
    if (!docId || !newSlotTime) return;
    addSpecialistSlot(facility.id, docId, newSlotTime);
  };

  // Submit Bulk Data JSON
  const handleBulkImportSubmit = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonInput);
      bulkImportFacilityData(facility.id, parsed);
      setJsonInput('');
    } catch (err) {
      showToast('Invalid JSON format! Please verify syntax.', 'error');
    }
  };

  // Submit File Upload (JSON or CSV)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = JSON.parse(text);
        bulkImportFacilityData(facility.id, parsed);
      } catch (err) {
        showToast('Failed to parse uploaded file. Please ensure valid JSON.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Download Current Facility JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(facility, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${facility.id}_data_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Hospital JSON data file downloaded!', 'success');
  };

  // Submit New Hospital Registration
  const handleRegisterHospitalSubmit = (e) => {
    e.preventDefault();
    if (!newHospital.name.trim() || !newHospital.address.trim()) {
      showToast('Hospital name and address are required.', 'error');
      return;
    }
    addHealthCenter({
      ...newHospital,
      coordinates: { lat: userLocation.lat + (Math.random() - 0.5) * 0.02, lng: userLocation.lng + (Math.random() - 0.5) * 0.02 }
    });
    setNewHospital({
      name: '',
      type: 'Super Specialty Hospital',
      address: '',
      emergencyPhone: '+1 (800) 555-0100',
      erWaitTimeMinutes: 10,
      status: 'High Capacity Available',
      statusBadge: 'green',
      primaryDoctorName: '',
      primaryDiscipline: 'Emergency Medicine'
    });
    setActiveTab('inventory');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Portal Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Hospital Data Management Portal
              </span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                {getFormattedTimeAgo(facility.lastUpdated)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {facility.name}
            </h1>
            <p className="text-xs text-slate-400">
              Input and update real-time ICU capacities, ER wait times, oxygen pressure, blood inventory, specialist rosters, and patient intake data time to time.
            </p>
          </div>

          {/* Hospital Switcher & Register Action */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800 flex-1 md:w-64">
              <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
              <select
                value={facility.id}
                onChange={(e) => setSelectedFacilityId(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none w-full cursor-pointer"
              >
                {healthCenters.map(h => (
                  <option key={h.id} value={h.id} className="bg-slate-900 text-white">
                    {h.name} ({h.type})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setActiveTab('register')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shrink-0 transition-all shadow-md shadow-emerald-600/30"
              title="Register a new hospital facility"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Hospital</span>
            </button>
          </div>
        </div>

        {/* Portal Navigation Tabs Bar */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto text-xs scrollbar-none">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'inventory' 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Live Capacity & Resources</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'profile' 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Hospital Profile & Status</span>
          </button>

          <button
            onClick={() => setActiveTab('doctors')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'doctors' 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Specialist Doctor Roster ({facility.specialists.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'bulk' 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Bulk CSV / JSON Import</span>
          </button>

          <button
            onClick={() => setActiveTab('intake')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all relative ${
              activeTab === 'intake' 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Siren className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>Patient Intake Tracker</span>
            {bookingsHistory.length > 0 && (
              <span className="bg-rose-500 text-white font-black text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                {bookingsHistory.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'register' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Hospital</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE CAPACITY & INVENTORY INPUT */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* ICU & ER Beds */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Bed className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Emergency & ICU Bed Capacity</h3>
                    <p className="text-[11px] text-slate-400">Updates sync instantly to public patient radar</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Live Feed Broadcast
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ICU Beds Input */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-300 font-semibold">Available ICU Beds</label>
                    <span className="text-[11px] text-slate-400 font-mono">Total: {facility.facilities.totalIcuBeds}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max={facility.facilities.totalIcuBeds}
                      value={facility.facilities.icuBedsAvailable}
                      onChange={(e) => handleResourceChange('icuBedsAvailable', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => handleResourceChange('icuBedsAvailable', Math.min(facility.facilities.totalIcuBeds, facility.facilities.icuBedsAvailable + 1))}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shrink-0"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleResourceChange('icuBedsAvailable', Math.max(0, facility.facilities.icuBedsAvailable - 1))}
                      className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shrink-0"
                    >
                      -1
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-slate-400">Total ICU Bed Capacity:</label>
                    <input
                      type="number"
                      min="1"
                      value={facility.facilities.totalIcuBeds}
                      onChange={(e) => handleResourceChange('totalIcuBeds', e.target.value)}
                      className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 font-bold"
                    />
                  </div>
                </div>

                {/* ER Beds Input */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-300 font-semibold">Available ER Trauma Bays</label>
                    <span className="text-[11px] text-slate-400 font-mono">Total: {facility.facilities.totalEmergencyBeds}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max={facility.facilities.totalEmergencyBeds}
                      value={facility.facilities.emergencyBedsAvailable}
                      onChange={(e) => handleResourceChange('emergencyBedsAvailable', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => handleResourceChange('emergencyBedsAvailable', Math.min(facility.facilities.totalEmergencyBeds, facility.facilities.emergencyBedsAvailable + 1))}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shrink-0"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleResourceChange('emergencyBedsAvailable', Math.max(0, facility.facilities.emergencyBedsAvailable - 1))}
                      className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shrink-0"
                    >
                      -1
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-slate-400">Total ER Bays Capacity:</label>
                    <input
                      type="number"
                      min="1"
                      value={facility.facilities.totalEmergencyBeds}
                      onChange={(e) => handleResourceChange('totalEmergencyBeds', e.target.value)}
                      className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ER Wait Time & Medical Equipment */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">ER Wait Times & Medical Equipment Inputs</h3>
                  <p className="text-[11px] text-slate-400">Update medical gas pressure, ventilator count, and current triage wait time</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* ER Wait Time */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <label className="text-xs text-slate-300 font-semibold block">
                    Est. ER Wait Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={facility.erWaitTimeMinutes}
                    onChange={(e) => handleResourceChange('erWaitTimeMinutes', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-[10px] text-slate-500 block">Average queue delay</span>
                </div>

                {/* Oxygen Pressure */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <label className="text-xs text-slate-300 font-semibold block">
                    Oxygen Pressure (Bar)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={facility.facilities.oxygenPressureBar}
                    onChange={(e) => handleResourceChange('oxygenPressureBar', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-[10px] text-slate-500 block">Normal supply range: 4.0 - 5.5 Bar</span>
                </div>

                {/* Ventilators */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <label className="text-xs text-slate-300 font-semibold block">
                    Active Ventilators Available
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={facility.facilities.ventilatorsAvailable}
                    onChange={(e) => handleResourceChange('ventilatorsAvailable', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-[10px] text-slate-500 block">Immediate respiratory units</span>
                </div>
              </div>
            </div>

            {/* Blood Bank Inventory Manager */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Blood Bank Inventory Input Manager</h3>
                  <p className="text-[11px] text-slate-400">Directly input unit reserves for trauma and surgical intake</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(facility.facilities.bloodBank).map(([group, count]) => (
                  <div key={group} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center space-y-2">
                    <span className="text-xs font-black text-rose-400 block tracking-wider">
                      {group.replace('Positive', '+').replace('Negative', '-')}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={count}
                      onChange={(e) => handleResourceChange(`bloodBank.${group}`, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-1 text-center font-black text-white text-base focus:outline-none focus:border-rose-500"
                    />
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleResourceChange(`bloodBank.${group}`, count + 1)}
                        className="px-2 py-0.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded text-[10px] font-bold"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleResourceChange(`bloodBank.${group}`, Math.max(0, count - 1))}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
                      >
                        -1
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Publish Slot & Incoming Patients Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Publish Slot Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Publish Doctor Consultation Slot</h3>
                  <p className="text-[11px] text-slate-400">Add pre-booking slots for patient reservation</p>
                </div>
              </div>

              <form onSubmit={handleAddSlotSubmit} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Select Doctor</label>
                  <select
                    value={newSlotDoctorId}
                    onChange={(e) => setNewSlotDoctorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {facility.specialists.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.discipline})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">New Slot Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 21:30"
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Publish Slot
                </button>
              </form>
            </div>

            {/* Quick Live Hospital Status Overview */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Current Broadcast Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400">Hospital Status:</span>
                  <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {facility.status}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400">ICU Capacity:</span>
                  <span className="font-bold text-white">
                    {facility.facilities.icuBedsAvailable} / {facility.facilities.totalIcuBeds} Free
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400">ER Wait Time:</span>
                  <span className="font-bold text-amber-400">
                    {facility.erWaitTimeMinutes} mins
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400">Specialist Roster:</span>
                  <span className="font-bold text-teal-400">
                    {facility.specialists.length} Doctors Active
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: HOSPITAL PROFILE & STATUS UPDATE */}
      {activeTab === 'profile' && (
        <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              Update Hospital Profile & Operational Status
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Input and edit your health facility details, hotline numbers, GPS location coordinates, and operational capacity status.
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Hospital / Center Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Facility Classification Type</label>
                <select
                  value={profileForm.type}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
                >
                  <option value="Super Specialty Hospital">Super Specialty Hospital</option>
                  <option value="Emergency & Urgent Care">Emergency & Urgent Care</option>
                  <option value="Pediatric Specialty">Pediatric Specialty</option>
                  <option value="Trauma & Surgery Center">Trauma & Surgery Center</option>
                  <option value="Specialized Clinic">Specialized Clinic</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Full Physical Address</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Emergency Hotline Phone</label>
                <input
                  type="text"
                  value={profileForm.emergencyPhone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">GPS Latitude Coordinate</label>
                <input
                  type="number"
                  step="0.0001"
                  value={profileForm.lat}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, lat: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">GPS Longitude Coordinate</label>
                <input
                  type="number"
                  step="0.0001"
                  value={profileForm.lng}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, lng: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Operational Capacity Status</label>
                <select
                  value={profileForm.status}
                  onChange={(e) => {
                    const statusVal = e.target.value;
                    let badge = 'green';
                    if (statusVal.includes('Moderate')) badge = 'yellow';
                    if (statusVal.includes('Limited') || statusVal.includes('Full')) badge = 'red';
                    setProfileForm(prev => ({ ...prev, status: statusVal, statusBadge: badge }));
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
                >
                  <option value="High Capacity Available">High Capacity Available (Normal Operations)</option>
                  <option value="Moderate Capacity">Moderate Capacity (Busy)</option>
                  <option value="Limited Capacity">Limited Capacity (Near Max)</option>
                  <option value="Critical Diverting / Full">Critical Diverting / Full (Diverting non-critical)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Badge Indicator Theme</label>
                <select
                  value={profileForm.statusBadge}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, statusBadge: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
                >
                  <option value="green">Green (Normal / Open)</option>
                  <option value="yellow">Yellow (Caution / Busy)</option>
                  <option value="red">Red (Critical / Diverting)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-600/30 transition-all"
              >
                <Save className="w-4 h-4" />
                Save & Broadcast Profile Updates
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: SPECIALIST DOCTOR ROSTER & SLOTS */}
      {activeTab === 'doctors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add New Doctor Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Add New Specialist Doctor</h3>
                <p className="text-[11px] text-slate-400">Input doctor credentials into active roster</p>
              </div>
            </div>

            <form onSubmit={handleAddDoctorSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Arthur Pendelton, MD"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Medical Discipline</label>
                <select
                  value={newDoctor.discipline}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, discipline: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="Cardiology & Emergency Care">Cardiology & Emergency Care</option>
                  <option value="Trauma & General Surgery">Trauma & General Surgery</option>
                  <option value="Neurology & Stroke Unit">Neurology & Stroke Unit</option>
                  <option value="Pulmonology & Respiratory">Pulmonology & Respiratory</option>
                  <option value="Pediatrics & Pediatric Emergency">Pediatrics & Pediatric Emergency</option>
                  <option value="Orthopedics & Fracture Surgery">Orthopedics & Fracture Surgery</option>
                  <option value="Nephrology & Dialysis">Nephrology & Dialysis</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    min="1"
                    value={newDoctor.experienceYears}
                    onChange={(e) => setNewDoctor(prev => ({ ...prev, experienceYears: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Fee ($)</label>
                  <input
                    type="number"
                    min="10"
                    value={newDoctor.consultationFee}
                    onChange={(e) => setNewDoctor(prev => ({ ...prev, consultationFee: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">First Available Slot</label>
                <input
                  type="text"
                  placeholder="e.g. 19:30"
                  value={newDoctor.initialSlot}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, initialSlot: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Specialist to Hospital
              </button>
            </form>
          </div>

          {/* Active Doctor Roster List */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                Active Specialist Roster ({facility.specialists.length})
              </span>
              <span className="text-[10px] text-slate-400">Pre-Booking Direct Allocation</span>
            </h3>

            <div className="space-y-3">
              {facility.specialists.map(doc => (
                <div key={doc.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{doc.name}</span>
                      <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold px-2 py-0.5 rounded border border-teal-500/30">
                        ${doc.consultationFee} Fee
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{doc.discipline} • {doc.experienceYears} Years Exp.</p>
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 font-mono pt-1">
                      <span>Slots:</span>
                      {doc.slots.map(s => (
                        <span key={s} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => {
                        const newSlot = prompt(`Publish new slot for ${doc.name} (e.g. 20:45):`, '20:45');
                        if (newSlot) addSpecialistSlot(facility.id, doc.id, newSlot);
                      }}
                      className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white rounded-xl text-xs font-bold border border-amber-500/30 transition-all"
                    >
                      + Slot
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Remove ${doc.name} from hospital roster?`)) {
                          deleteSpecialist(facility.id, doc.id);
                        }
                      }}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl text-xs border border-rose-500/20 transition-all"
                      title="Delete doctor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: BULK CSV / JSON IMPORT & EXPORT */}
      {activeTab === 'bulk' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          
          {/* File Upload & Paste JSON */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Bulk Hospital Data File Uploader</h3>
                <p className="text-[11px] text-slate-400">Import hospital JSON or CSV datasets in bulk</p>
              </div>
            </div>

            {/* Drag & Drop File Input */}
            <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-6 text-center space-y-3 transition-colors bg-slate-950/60">
              <FileJson className="w-8 h-8 text-amber-400 mx-auto" />
              <div>
                <p className="text-xs font-bold text-white">Click or upload hospital JSON / CSV dataset file</p>
                <p className="text-[10px] text-slate-400">Instantly updates all capacity and blood bank fields</p>
              </div>
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="bulk-file-input"
              />
              <label
                htmlFor="bulk-file-input"
                className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                Choose File...
              </label>
            </div>

            {/* Direct JSON Code Editor */}
            <form onSubmit={handleBulkImportSubmit} className="space-y-3 pt-2">
              <label className="text-xs text-slate-300 font-semibold block">Or Paste Structured JSON Dataset</label>
              <textarea
                rows={6}
                placeholder={`{\n  "erWaitTimeMinutes": 10,\n  "facilities": {\n    "icuBedsAvailable": 12,\n    "totalIcuBeds": 20\n  }\n}`}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-emerald-400 font-mono focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                Apply Bulk Data Update
              </button>
            </form>
          </div>

          {/* Backup & Export Data */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <DownloadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Export & Backup Hospital Data</h3>
                  <p className="text-[11px] text-slate-400">Download current hospital parameters as JSON backup</p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-white">Current Export Data Preview:</div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <p><strong>Hospital ID:</strong> {facility.id}</p>
                  <p><strong>ICU Beds:</strong> {facility.facilities.icuBedsAvailable} / {facility.facilities.totalIcuBeds}</p>
                  <p><strong>Oxygen Level:</strong> {facility.facilities.oxygenPressureBar} Bar</p>
                  <p><strong>Last Updated:</strong> {facility.lastUpdated || 'Initial'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleExportJSON}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 transition-all mt-6"
            >
              <DownloadCloud className="w-4 h-4" />
              Download Hospital JSON Dataset
            </button>
          </div>

        </div>
      )}

      {/* TAB 5: PATIENT INTAKE & TRIAGE TRACKER */}
      {activeTab === 'intake' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Siren className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Incoming Emergency Patient Intake Tracker</h2>
                <p className="text-xs text-slate-400">View live priority bookings, emergency health passes, and update patient triage statuses</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Live Feed Active
            </span>
          </div>

          {bookingsHistory.length > 0 ? (
            <div className="space-y-4">
              {bookingsHistory.map(b => (
                <div key={b.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-teal-400 text-sm">{b.token}</span>
                      <span className="text-xs bg-slate-900 text-slate-300 font-bold px-2 py-0.5 rounded border border-slate-800">
                        Slot: {b.slotTime}
                      </span>
                      {b.isEmergency && (
                        <span className="text-[10px] bg-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded border border-rose-500/30 animate-pulse">
                          EMERGENCY SOS
                        </span>
                      )}
                    </div>

                    {/* Change Status Control */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-semibold">Status:</span>
                      <select
                        value={b.status || 'Pre-Booked & Guaranteed'}
                        onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="Pre-Booked & Guaranteed">Pre-Booked & Guaranteed</option>
                        <option value="Admitted to ER Bays">Admitted to ER Bays</option>
                        <option value="In ICU Triage">In ICU Triage</option>
                        <option value="Consultation Completed">Consultation Completed</option>
                        <option value="Discharged">Discharged</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Patient Info</span>
                      <span className="font-bold text-white text-sm">{b.patientPass?.fullName || 'Emergency Patient'}</span>
                      <p className="text-slate-400">Age: {b.patientPass?.age} • Gender: {b.patientPass?.gender}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Medical Profile</span>
                      <p className="text-rose-400 font-bold">Blood: {b.patientPass?.bloodGroup}</p>
                      <p className="text-slate-400">Allergies: {b.patientPass?.allergies || 'None'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Assigned Doctor</span>
                      <p className="text-white font-bold">{b.doctorName}</p>
                      <p className="text-slate-400">{b.discipline}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Shield className="w-12 h-12 mx-auto text-slate-600" />
              <h3 className="font-bold text-white text-sm">No Active Patient Intake Reservations</h3>
              <p className="text-xs text-slate-400">When patients pre-book slots or trigger emergency SOS, intake records will auto-display here.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: REGISTER NEW HOSPITAL FACILITY */}
      {activeTab === 'register' && (
        <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              Register New Hospital into Platform Network
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Onboard a new medical center into the CarePulse system so patients can search and pre-book resources in real-time.
            </p>
          </div>

          <form onSubmit={handleRegisterHospitalSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">New Hospital Name</label>
                <input
                  type="text"
                  placeholder="e.g. St. Thomas Heart & Trauma Center"
                  value={newHospital.name}
                  onChange={(e) => setNewHospital(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Facility Type</label>
                <select
                  value={newHospital.type}
                  onChange={(e) => setNewHospital(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Super Specialty Hospital">Super Specialty Hospital</option>
                  <option value="Emergency & Urgent Care">Emergency & Urgent Care</option>
                  <option value="Pediatric Specialty">Pediatric Specialty</option>
                  <option value="Trauma & Surgery Center">Trauma & Surgery Center</option>
                  <option value="Specialized Clinic">Specialized Clinic</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Full Physical Address</label>
              <input
                type="text"
                placeholder="e.g. 104 Emergency Parkway, Sector 4"
                value={newHospital.address}
                onChange={(e) => setNewHospital(prev => ({ ...prev, address: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Emergency Hotline Phone</label>
                <input
                  type="text"
                  placeholder="+1 (800) 555-0199"
                  value={newHospital.emergencyPhone}
                  onChange={(e) => setNewHospital(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Est. ER Wait Time (Mins)</label>
                <input
                  type="number"
                  min="0"
                  value={newHospital.erWaitTimeMinutes}
                  onChange={(e) => setNewHospital(prev => ({ ...prev, erWaitTimeMinutes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Primary Duty Doctor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Marcus Vance, MD"
                  value={newHospital.primaryDoctorName}
                  onChange={(e) => setNewHospital(prev => ({ ...prev, primaryDoctorName: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Doctor Discipline</label>
                <input
                  type="text"
                  placeholder="e.g. Emergency & Critical Care"
                  value={newHospital.primaryDiscipline}
                  onChange={(e) => setNewHospital(prev => ({ ...prev, primaryDiscipline: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Register Hospital to Network
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
