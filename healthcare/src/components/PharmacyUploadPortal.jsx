import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  Building2, 
  Plus, 
  Pill, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Search, 
  Save, 
  Store, 
  Clock, 
  Phone, 
  Truck, 
  ShieldCheck, 
  Package,
  Layers,
  Sparkles
} from 'lucide-react';

export default function PharmacyUploadPortal() {
  const { 
    pharmacies, 
    medicines, 
    selectedPharmacyId, 
    setSelectedPharmacyId,
    addOrUpdateMedicineRecord,
    updateMedicinePriceAndStock,
    deleteMedicineStock,
    addPharmacyStore,
    showToast 
  } = useHealth();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'single-add'
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Single Medicine Form State
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'Painkiller & Fever',
    dosageForm: 'Tablet',
    strength: '500mg (10 Tablets)',
    price: '',
    mrp: '',
    stockCount: '100',
    prescriptionRequired: false,
    manufacturer: '',
    description: ''
  });

  // New Pharmacy Store Form State
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [newStoreData, setNewStoreData] = useState({
    name: '',
    type: 'Retail Pharmacy',
    address: '',
    phone: '',
    is24x7: true,
    deliveryAvailable: true,
    openingHours: 'Open 24/7'
  });

  // Inline edit state for inventory table
  const [editingMedId, setEditingMedId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

  // Selected Pharmacy Object
  const currentPharmacy = pharmacies.find(p => p.id === selectedPharmacyId) || pharmacies[0];

  // Get medicines currently stocked by selected pharmacy
  const pharmacyInventory = medicines.filter(med => 
    med.stocks.some(s => s.pharmacyId === currentPharmacy.id)
  ).map(med => {
    const stockInfo = med.stocks.find(s => s.pharmacyId === currentPharmacy.id);
    return {
      ...med,
      price: stockInfo.price,
      mrp: stockInfo.mrp,
      stockCount: stockInfo.stockCount,
      status: stockInfo.status
    };
  });

  // Filtered inventory
  const filteredInventory = pharmacyInventory.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          med.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          med.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || med.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle single item submit
  const handleSingleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      showToast('Please provide a valid medicine name and price.', 'error');
      return;
    }

    addOrUpdateMedicineRecord(currentPharmacy.id, formData);

    // Reset form
    setFormData({
      name: '',
      genericName: '',
      category: 'Painkiller & Fever',
      dosageForm: 'Tablet',
      strength: '500mg (10 Tablets)',
      price: '',
      mrp: '',
      stockCount: '100',
      prescriptionRequired: false,
      manufacturer: '',
      description: ''
    });

    setActiveTab('inventory');
  };

  const handleAddPharmacyStoreSubmit = (e) => {
    e.preventDefault();
    if (!newStoreData.name.trim()) return;
    addPharmacyStore(newStoreData);
    setShowAddStoreModal(false);
    setNewStoreData({
      name: '',
      type: 'Retail Pharmacy',
      address: '',
      phone: '',
      is24x7: true,
      deliveryAvailable: true,
      openingHours: 'Open 24/7'
    });
  };

  const startInlineEdit = (med) => {
    setEditingMedId(med.id);
    setEditPrice(med.price.toString());
    setEditStock(med.stockCount.toString());
  };

  const saveInlineEdit = (medId) => {
    updateMedicinePriceAndStock(currentPharmacy.id, medId, editPrice, editStock);
    setEditingMedId(null);
  };

  // Inventory stats
  const lowStockCount = pharmacyInventory.filter(m => m.stockCount <= 15).length;
  const totalStockUnits = pharmacyInventory.reduce((acc, m) => acc + m.stockCount, 0);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Header Banner & Provider Switcher */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" />
                Hospital & Pharmacy Medicine Upload Portal
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Live Data Stocking Feed
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Medicine Inventory & Pricing Upload Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Add medicine availability, prices, discounts, and stock levels for real-time patient visibility across the emergency network.
            </p>
          </div>

          {/* Store Switcher + Add Store Button */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Select Facility / Store:</label>
              <select
                value={selectedPharmacyId}
                onChange={(e) => setSelectedPharmacyId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
              >
                {pharmacies.map((ph) => (
                  <option key={ph.id} value={ph.id}>
                    {ph.name} ({ph.type})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowAddStoreModal(true)}
              className="mt-4 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700/80 flex items-center gap-1.5 shrink-0 transition-all"
              title="Register new hospital pharmacy or retail chemist"
            >
              <Plus className="w-4 h-4" />
              <span>New Store</span>
            </button>
          </div>
        </div>

        {/* Selected Store Status Bar */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Catalog Items</span>
              <span className="text-lg font-black text-white">{pharmacyInventory.length} Medicines</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Low Stock Alerts</span>
              <span className={`text-lg font-black ${lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {lowStockCount} Items
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Stock Units</span>
              <span className="text-lg font-black text-teal-400">{totalStockUnits} Units</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Operating Hours</span>
              <span className="text-xs font-bold text-emerald-400">{currentPharmacy.openingHours || 'Open 24/7'}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'inventory'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Manage Inventory ({pharmacyInventory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('single-add')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'single-add'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>

      </div>

      {/* --- TAB 1: MANAGE INVENTORY DASHBOARD --- */}
      {activeTab === 'inventory' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search input */}
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search item name, ingredient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category selector */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Categories</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="Painkiller & Fever">Painkiller & Fever</option>
                <option value="Heart & Blood Pressure">Heart & Blood Pressure</option>
                <option value="Diabetes Care">Diabetes Care</option>
                <option value="Respiratory & Asthma">Respiratory & Asthma</option>
              </select>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Click <strong className="text-amber-400">Edit Price/Stock</strong> to update live values instantly</span>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Medicine & Generic Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Dosage / Form</th>
                  <th className="p-3 text-right">Price ($)</th>
                  <th className="p-3 text-right">MRP ($)</th>
                  <th className="p-3 text-center">Stock Count</th>
                  <th className="p-3 text-center">Rx Required</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-500">
                      No medicines found in this inventory. Use the tab above to add medicine data.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((med) => {
                    const isEditing = editingMedId === med.id;
                    const discountPercent = med.mrp ? Math.round(((med.mrp - med.price) / med.mrp) * 100) : 0;

                    return (
                      <tr key={med.id} className="hover:bg-slate-950/50 transition-colors">
                        
                        {/* Name & Generic */}
                        <td className="p-3 font-bold text-white">
                          <div>{med.name}</div>
                          <span className="text-[10px] font-normal text-slate-400 block">{med.genericName}</span>
                        </td>

                        {/* Category */}
                        <td className="p-3">
                          <span className="bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-semibold text-[11px]">
                            {med.category}
                          </span>
                        </td>

                        {/* Dosage */}
                        <td className="p-3 text-slate-300">
                          <div>{med.dosageForm}</div>
                          <span className="text-[10px] text-slate-500">{med.strength}</span>
                        </td>

                        {/* Price */}
                        <td className="p-3 text-right font-black text-amber-400">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-20 bg-slate-950 border border-amber-500 text-right font-bold text-white px-2 py-1 rounded text-xs"
                            />
                          ) : (
                            <div>
                              ${Number(med.price).toFixed(2)}
                              {discountPercent > 0 && (
                                <span className="block text-[9px] text-emerald-400 font-bold">{discountPercent}% OFF</span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* MRP */}
                        <td className="p-3 text-right text-slate-500 line-through">
                          ${Number(med.mrp || med.price * 1.2).toFixed(2)}
                        </td>

                        {/* Stock Count */}
                        <td className="p-3 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                              className="w-20 bg-slate-950 border border-amber-500 text-center font-bold text-white px-2 py-1 rounded text-xs"
                            />
                          ) : (
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                              med.stockCount > 15
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : (med.stockCount > 0
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20')
                            }`}>
                              {med.stockCount} in stock
                            </span>
                          )}
                        </td>

                        {/* Rx Required */}
                        <td className="p-3 text-center">
                          {med.prescriptionRequired ? (
                            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                              Rx Required
                            </span>
                          ) : (
                            <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-semibold">
                              OTC / Free
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isEditing ? (
                              <button
                                onClick={() => saveInlineEdit(med.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg flex items-center gap-1"
                              >
                                <Save className="w-3 h-3" />
                                Save
                              </button>
                            ) : (
                              <button
                                onClick={() => startInlineEdit(med)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors"
                                title="Quick Edit Price & Stock"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => deleteMedicineStock(currentPharmacy.id, med.id)}
                              className="p-1.5 bg-slate-800 hover:bg-rose-950/60 text-rose-400 rounded-lg transition-colors"
                              title="Delete from Inventory"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* --- TAB 2: SINGLE MEDICINE ADD FORM --- */}
      {activeTab === 'single-add' && (
        <form onSubmit={handleSingleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              Add Medicine to Store Inventory
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Add individual medicine pricing, stock count, and prescription requirements for <strong>{currentPharmacy.name}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Medicine Brand Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amoxicillin 500mg, Lipitor 20mg"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Generic / Active Ingredient Name</label>
              <input
                type="text"
                placeholder="e.g. Acetaminophen, Atorvastatin Calcium"
                value={formData.genericName}
                onChange={(e) => setFormData(prev => ({ ...prev, genericName: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Therapeutic Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Antibiotics">Antibiotics</option>
                <option value="Painkiller & Fever">Painkiller & Fever</option>
                <option value="Heart & Blood Pressure">Heart & Blood Pressure</option>
                <option value="Diabetes Care">Diabetes Care</option>
                <option value="Respiratory & Asthma">Respiratory & Asthma</option>
                <option value="Pediatric Care">Pediatric Care</option>
                <option value="Allergy & Cold">Allergy & Cold</option>
                <option value="Vitamins & Supplements">Vitamins & Supplements</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Dosage Form</label>
              <select
                value={formData.dosageForm}
                onChange={(e) => setFormData(prev => ({ ...prev, dosageForm: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup / Liquid</option>
                <option value="Injection">Injection / Pen</option>
                <option value="Inhaler">Inhaler</option>
                <option value="Ointment">Ointment / Cream</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Retail Selling Price ($ / Pack) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 12.50"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Maximum Retail Price (MRP $)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 18.00"
                value={formData.mrp}
                onChange={(e) => setFormData(prev => ({ ...prev, mrp: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Stock Quantity Available *</label>
              <input
                type="number"
                required
                placeholder="e.g. 150"
                value={formData.stockCount}
                onChange={(e) => setFormData(prev => ({ ...prev, stockCount: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Manufacturer / Pharma Brand</label>
              <input
                type="text"
                placeholder="e.g. Pfizer, GSK, Novartis"
                value={formData.manufacturer}
                onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Prescription Requirement Checkbox */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Prescription Required (Rx Only)</span>
              <span className="text-[11px] text-slate-400">Patients must upload or present doctor prescription for pickup/delivery</span>
            </div>
            <input
              type="checkbox"
              checked={formData.prescriptionRequired}
              onChange={(e) => setFormData(prev => ({ ...prev, prescriptionRequired: e.target.checked }))}
              className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-600/30"
            >
              <Save className="w-4 h-4" />
              Save Medicine Stock
            </button>
          </div>

        </form>
      )}

      {/* --- ADD NEW PHARMACY STORE MODAL --- */}
      {showAddStoreModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-400" />
                Register New Pharmacy / Hospital Unit
              </h3>
              <p className="text-xs text-slate-400">
                Create a new pharmacy store profile to manage medicine stock and pricing.
              </p>
            </div>

            <form onSubmit={handleAddPharmacyStoreSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Pharmacy / Hospital Unit Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Hospital Pharmacy #2"
                  value={newStoreData.name}
                  onChange={(e) => setNewStoreData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Store Type</label>
                <select
                  value={newStoreData.type}
                  onChange={(e) => setNewStoreData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Hospital Pharmacy">Hospital In-House Pharmacy</option>
                  <option value="Retail Pharmacy">Standalone Retail Pharmacy / Chemist</option>
                  <option value="Emergency Dispensary">24/7 Emergency Dispensary</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Address / Street Location</label>
                <input
                  type="text"
                  placeholder="e.g. 55 Health Avenue, Block B"
                  value={newStoreData.address}
                  onChange={(e) => setNewStoreData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="e.g. +1 (800) 555-0900"
                  value={newStoreData.phone}
                  onChange={(e) => setNewStoreData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <label className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span>24/7 Open</span>
                  <input
                    type="checkbox"
                    checked={newStoreData.is24x7}
                    onChange={(e) => setNewStoreData(prev => ({ ...prev, is24x7: e.target.checked }))}
                    className="w-4 h-4 accent-amber-500"
                  />
                </label>

                <label className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span>Home Delivery</span>
                  <input
                    type="checkbox"
                    checked={newStoreData.deliveryAvailable}
                    onChange={(e) => setNewStoreData(prev => ({ ...prev, deliveryAvailable: e.target.checked }))}
                    className="w-4 h-4 accent-amber-500"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddStoreModal(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl"
                >
                  Create Pharmacy Store Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
