import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  Pill, 
  Search, 
  MapPin, 
  LocateFixed, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Truck, 
  ShieldAlert, 
  ShoppingBag, 
  Star, 
  Tag, 
  Grid, 
  Map, 
  ArrowRight,
  TrendingDown,
  Building2,
  Store,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import MapView from './MapView';
import MedicineReservationModal from './MedicineReservationModal';

export default function MedicineUserPortal() {
  const { 
    medicines, 
    pharmacies, 
    userLocation, 
    requestLiveLocation, 
    reserveMedicineOrder 
  } = useHealth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxDistance, setMaxDistance] = useState(10); // km radius
  const [providerTypeFilter, setProviderTypeFilter] = useState('all'); // 'all' | 'Hospital Pharmacy' | 'Retail Pharmacy'
  const [inStockOnly, setInStockOnly] = useState(false);
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [open24x7Only, setOpen24x7Only] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  // Modal reservation target
  const [selectedReserveTarget, setSelectedReserveTarget] = useState(null); // { pharmacy, medicine, stockInfo }

  // Categories list
  const categories = [
    'all',
    'Antibiotics',
    'Painkiller & Fever',
    'Heart & Blood Pressure',
    'Diabetes Care',
    'Respiratory & Asthma',
    'Pediatric Care'
  ];

  // Helper to get pharmacy object with live distance
  const getPharmacyWithDistance = (pharmacyId) => {
    const ph = pharmacies.find(p => p.id === pharmacyId);
    if (!ph) return null;
    return ph;
  };

  // Process medicine catalog & filter nearby stocking pharmacies
  const processedMedicines = medicines.map(med => {
    // Get all stocking pharmacies for this medicine
    const availableStores = med.stocks
      .map(st => {
        const pharmacy = getPharmacyWithDistance(st.pharmacyId);
        if (!pharmacy) return null;
        return {
          pharmacy,
          stockInfo: st
        };
      })
      .filter(Boolean)
      .filter(item => {
        const ph = item.pharmacy;
        const matchesDistance = ph.distanceKm <= maxDistance;
        const matchesType = providerTypeFilter === 'all' || ph.type === providerTypeFilter;
        const matchesInStock = inStockOnly ? item.stockInfo.stockCount > 0 : true;
        const matchesDelivery = deliveryOnly ? ph.deliveryAvailable : true;
        const matches24x7 = open24x7Only ? ph.is24x7 : true;

        return matchesDistance && matchesType && matchesInStock && matchesDelivery && matches24x7;
      })
      // Sort stocking pharmacies by distance ascending!
      .sort((a, b) => a.pharmacy.distanceKm - b.pharmacy.distanceKm);

    // Find lowest price among stocking pharmacies
    const lowestPrice = availableStores.length > 0
      ? Math.min(...availableStores.map(s => s.stockInfo.price))
      : null;

    return {
      ...med,
      availableStores,
      lowestPrice
    };
  }).filter(med => {
    // Search filter
    const matchesSearch = searchTerm.trim() === '' ||
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.availableStores.some(s => s.pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || med.category === selectedCategory;

    // Only show medicine if it matches search & category, and has at least 1 matching store
    return matchesSearch && matchesCategory && med.availableStores.length > 0;
  });

  // Convert pharmacy list for Leaflet Map view
  const mapCenterPharmacies = pharmacies
    .filter(ph => ph.distanceKm <= maxDistance)
    .map(ph => ({
      id: ph.id,
      name: ph.name,
      type: ph.type,
      address: ph.address,
      coordinates: ph.coordinates,
      distanceKm: ph.distanceKm,
      erWaitTimeMinutes: 0,
      facilities: {
        icuBedsAvailable: ph.is24x7 ? 24 : 12,
        totalIcuBeds: 24,
        emergencyBedsAvailable: ph.deliveryAvailable ? 10 : 5,
        oxygenPressureBar: 4.8
      }
    }));

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20 flex items-center gap-1.5">
                <LocateFixed className="w-3.5 h-3.5 animate-pulse" />
                Live GPS Auto-Distance Active
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Patient Medicine Finder & Price Comparator
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Nearby Medicines & Pharmacy Inventory Radar
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Compare prices across hospital pharmacies and local chemists. Sorted by nearest distance from your live GPS location.
            </p>
          </div>

          {/* Grid vs Map Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Medicine Cards</span>
            </button>

            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'map' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Pharmacy Map</span>
            </button>
          </div>
        </div>

        {/* Search Bar & GPS Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          
          {/* Main Medicine Search Bar */}
          <div className="relative md:col-span-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search medicine name (e.g. Paracetamol, Amoxicillin, Insulin, Inhaler, Lipitor)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Live GPS Auto Badge */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 md:col-span-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <LocateFixed className="w-4 h-4 text-rose-500 animate-pulse shrink-0" />
              <div className="truncate">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Current Location</span>
                <span className="font-mono font-bold text-rose-400 text-[11px] truncate">{userLocation.label}</span>
              </div>
            </div>
            <button
              onClick={requestLiveLocation}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg shrink-0"
            >
              Refresh
            </button>
          </div>

          {/* Radius Quick Selector */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-1.5 md:col-span-3 flex items-center justify-around text-xs">
            <span className="text-[10px] font-bold text-slate-400">Radius:</span>
            {[2, 5, 10, 25].map(radius => (
              <button
                key={radius}
                onClick={() => setMaxDistance(radius)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  maxDistance === radius 
                    ? 'bg-teal-600 text-white shadow' 
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {radius}km
              </button>
            ))}
          </div>

        </div>

        {/* Category Pills & Filters */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-800/80 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white font-bold shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat === 'all' ? '💊 All Categories' : cat}
              </button>
            ))}
          </div>

          {/* Additional Toggles */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                inStockOnly
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              In Stock Only
            </button>

            <button
              onClick={() => setOpen24x7Only(!open24x7Only)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                open24x7Only
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              24/7 Open
            </button>

            <button
              onClick={() => setDeliveryOnly(!deliveryOnly)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                deliveryOnly
                  ? 'bg-teal-500/20 text-teal-400 border-teal-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              Home Delivery
            </button>
          </div>
        </div>

      </div>

      {/* Main View Display */}
      {viewMode === 'map' ? (
        <MapView 
          centers={mapCenterPharmacies} 
          onSelectFacility={() => setViewMode('grid')}
        />
      ) : (
        <div className="space-y-6">
          {processedMedicines.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <Pill className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-white">No Medicines Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No pharmacy or hospital within {maxDistance}km radius has medicine matching "{searchTerm}". Try expanding your radius or clearing category filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setMaxDistance(25);
                }}
                className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            processedMedicines.map((med) => (
              <div 
                key={med.id} 
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 hover:border-slate-700 transition-all"
              >
                
                {/* Medicine Top Title Row */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                        {med.category}
                      </span>
                      <span className="text-xs font-bold text-slate-300">
                        {med.dosageForm} • {med.strength}
                      </span>
                      {med.prescriptionRequired ? (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          Prescription Required (Rx)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          OTC / Non-Prescription
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-extrabold text-white">{med.name}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Generic: <strong className="text-slate-200">{med.genericName}</strong> • Manufacturer: {med.manufacturer}
                    </p>
                  </div>

                  {/* Price comparator summary badge */}
                  {med.lowestPrice && (
                    <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl px-4 py-2 text-right shrink-0">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase block flex items-center justify-end gap-1">
                        <TrendingDown className="w-3 h-3" />
                        Best Price in Area
                      </span>
                      <div className="text-xl font-black text-emerald-400">
                        ${med.lowestPrice.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Available at {med.availableStores.length} nearby store{med.availableStores.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stocking Pharmacies List (Sorted by GPS Distance) */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[11px] block">
                    📍 Nearby Pharmacies & Hospitals Stocking This Medicine (Sorted by Distance):
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {med.availableStores.map(({ pharmacy, stockInfo }) => {
                      const isLowestPrice = stockInfo.price === med.lowestPrice;
                      const discountPercent = stockInfo.mrp ? Math.round(((stockInfo.mrp - stockInfo.price) / stockInfo.mrp) * 100) : 0;

                      return (
                        <div
                          key={pharmacy.id}
                          className={`bg-slate-950 p-4 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                            isLowestPrice 
                              ? 'border-emerald-500/40 shadow-lg shadow-emerald-950/30' 
                              : 'border-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            {/* Pharmacy header */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    pharmacy.type === 'Hospital Pharmacy' 
                                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                      : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                                  }`}>
                                    {pharmacy.type}
                                  </span>
                                  {isLowestPrice && (
                                    <span className="text-[10px] font-bold bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded">
                                      Lowest Price
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-bold text-white mt-1">{pharmacy.name}</h4>
                                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                                  <span>{pharmacy.address}</span>
                                </p>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs font-mono font-extrabold text-teal-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg inline-block">
                                  📍 {pharmacy.distanceKm} km
                                </span>
                              </div>
                            </div>

                            {/* Store Features badges */}
                            <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400 pt-2 border-t border-slate-800/60 mt-2">
                              {pharmacy.is24x7 ? (
                                <span className="text-emerald-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Open 24/7
                                </span>
                              ) : (
                                <span>{pharmacy.openingHours}</span>
                              )}

                              {pharmacy.deliveryAvailable && (
                                <span className="text-teal-400 flex items-center gap-1">
                                  <Truck className="w-3 h-3" />
                                  Express Home Delivery
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Price & Stock Row */}
                          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-3">
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-black text-amber-400">
                                  ${stockInfo.price.toFixed(2)}
                                </span>
                                {stockInfo.mrp && stockInfo.mrp > stockInfo.price && (
                                  <span className="text-xs text-slate-500 line-through">
                                    ${stockInfo.mrp.toFixed(2)}
                                  </span>
                                )}
                              </div>
                              <span className={`text-[10px] font-bold block ${
                                stockInfo.stockCount > 15 ? 'text-emerald-400' : 'text-amber-400'
                              }`}>
                                {stockInfo.stockCount} units available ({stockInfo.status})
                              </span>
                            </div>

                            {/* Reserve / Order Button */}
                            <button
                              onClick={() => setSelectedReserveTarget({
                                pharmacy,
                                medicine: med,
                                stockInfo
                              })}
                              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              Reserve Medicine
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* --- MEDICINE RESERVATION MODAL TRIGGER --- */}
      {selectedReserveTarget && (
        <MedicineReservationModal
          pharmacy={selectedReserveTarget.pharmacy}
          medicine={selectedReserveTarget.medicine}
          stockInfo={selectedReserveTarget.stockInfo}
          onClose={() => setSelectedReserveTarget(null)}
        />
      )}

    </div>
  );
}
