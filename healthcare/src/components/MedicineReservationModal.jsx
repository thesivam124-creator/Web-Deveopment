import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  Pill, 
  X, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldAlert, 
  QrCode, 
  Truck, 
  ShoppingBag, 
  FileText,
  DollarSign,
  AlertCircle,
  Share2
} from 'lucide-react';

export default function MedicineReservationModal({ pharmacy, medicine, stockInfo, onClose }) {
  const { 
    patientPass, 
    reserveMedicineOrder, 
    activeMedicineOrder, 
    setActiveMedicineOrder 
  } = useHealth();

  const [quantity, setQuantity] = useState(1);
  const [fulfillmentType, setFulfillmentType] = useState('Pickup'); // 'Pickup' | 'Express Delivery'
  const [rxNotes, setRxNotes] = useState('');
  const [rxUploaded, setRxUploaded] = useState(false);

  // Unit price and total price
  const unitPrice = stockInfo ? stockInfo.price : (activeMedicineOrder ? activeMedicineOrder.unitPrice : 0);
  const totalPrice = (unitPrice * quantity).toFixed(2);
  const mrp = stockInfo ? stockInfo.mrp : (activeMedicineOrder ? activeMedicineOrder.mrp : 0);
  const totalSavings = mrp ? ((mrp - unitPrice) * quantity).toFixed(2) : '0.00';

  const handleConfirmReservation = (e) => {
    e.preventDefault();
    if (medicine.prescriptionRequired && !rxUploaded && !rxNotes.trim()) {
      // Prompt acknowledgement for prescription requirement
      if (!window.confirm('This medicine requires a doctor prescription (Rx). Click OK to confirm you will present/upload your prescription upon pickup/delivery.')) {
        return;
      }
    }

    reserveMedicineOrder(pharmacy, medicine, stockInfo, quantity, fulfillmentType, rxNotes);
  };

  // If viewing an already confirmed reservation active order
  const displayOrder = activeMedicineOrder || null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-fade-in relative">
        
        {/* Close Button */}
        <button
          onClick={() => {
            if (activeMedicineOrder) setActiveMedicineOrder(null);
            onClose();
          }}
          className="absolute top-5 right-5 p-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* --- CASE A: CONFIRMED RESERVATION RECEIPT VOUCHER --- */}
        {displayOrder ? (
          <div className="space-y-6">
            <div className="text-center space-y-2 border-b border-slate-800 pb-4">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 animate-pulse" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block">
                Priority Medicine Reservation Confirmed
              </span>
              <h2 className="text-2xl font-black text-white">Digital Pickup Voucher</h2>
              <p className="text-xs text-slate-400">
                Token: <strong className="font-mono text-emerald-400 text-sm">{displayOrder.orderToken}</strong>
              </p>
            </div>

            {/* QR Code & Voucher Summary */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Reserved Item</span>
                  <h4 className="text-base font-extrabold text-white">{displayOrder.medicineName}</h4>
                  <span className="text-xs text-slate-300 font-medium">
                    Qty: {displayOrder.quantity} x ${displayOrder.unitPrice.toFixed(2)} = <strong className="text-emerald-400">${displayOrder.totalPrice.toFixed(2)}</strong>
                  </span>
                </div>

                <div className="w-16 h-16 bg-white p-1 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                  <QrCode className="w-14 h-14 text-slate-950" />
                </div>
              </div>

              {/* Store & Patient Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Pharmacy Store</span>
                  <span className="font-bold text-white block">{displayOrder.pharmacyName}</span>
                  <span className="text-slate-400 text-[11px] block">{displayOrder.pharmacyAddress}</span>
                  <span className="text-teal-400 text-[11px] font-semibold">{displayOrder.pharmacyPhone}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Patient Pass Holder</span>
                  <span className="font-bold text-white block">{displayOrder.patientPass.fullName}</span>
                  <span className="text-slate-400 text-[11px] block">Blood: {displayOrder.patientPass.bloodGroup}</span>
                  <span className="text-amber-400 text-[11px] font-semibold">{displayOrder.fulfillmentType}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(displayOrder.pharmacyAddress)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-teal-400" />
                Get Store Directions
              </a>

              <button
                onClick={() => {
                  setActiveMedicineOrder(null);
                  onClose();
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-lg"
              >
                Done / Close Voucher
              </button>
            </div>

          </div>
        ) : (

          /* --- CASE B: RESERVATION FORM --- */
          <form onSubmit={handleConfirmReservation} className="space-y-5">
            
            {/* Header info */}
            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded border border-teal-500/20">
                  {medicine.category}
                </span>
                {medicine.prescriptionRequired && (
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    Rx Required
                  </span>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-white">{medicine.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {medicine.genericName} • {medicine.strength}
              </p>
            </div>

            {/* Selected Pharmacy Store Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Selected Pharmacy Store:</span>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-white">{pharmacy.name}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {pharmacy.address}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-teal-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
                  📍 {pharmacy.distanceKm} km
                </span>
              </div>
            </div>

            {/* Quantity Selector & Fulfillment Choice */}
            <div className="grid grid-cols-2 gap-3">
              {/* Quantity */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Quantity (Packs)</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold hover:bg-slate-800"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-black text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(stockInfo.stockCount, quantity + 1))}
                    className="w-8 h-8 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold hover:bg-slate-800"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Fulfillment Type */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Fulfillment Option</label>
                <select
                  value={fulfillmentType}
                  onChange={(e) => setFulfillmentType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs font-bold text-white rounded-xl px-2 py-2 focus:outline-none focus:border-teal-500"
                >
                  <option value="Pickup">Express Store Pickup</option>
                  {pharmacy.deliveryAvailable && (
                    <option value="Express Delivery">Express Home Delivery</option>
                  )}
                </select>
              </div>
            </div>

            {/* Prescription Note / Upload field if Rx required */}
            {medicine.prescriptionRequired && (
              <div className="bg-rose-950/40 border border-rose-800/60 p-3.5 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Prescription Verification Needed (Rx)</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Doctor prescription will be verified upon store pickup or delivery handover.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <label className="flex-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
                    <FileText className="w-4 h-4 text-teal-400" />
                    <span>{rxUploaded ? '✅ Prescription Attached' : 'Attach Rx Image / File'}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={() => setRxUploaded(true)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Price & Savings Summary Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Unit Price ({quantity} x ${unitPrice.toFixed(2)})</span>
                <span className="font-bold text-white">${totalPrice}</span>
              </div>

              {Number(totalSavings) > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                  <span>Network Instant Savings</span>
                  <span>-${totalSavings} OFF</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
                <span>Total Reserved Amount:</span>
                <span className="text-lg text-emerald-400 font-black">${totalPrice}</span>
              </div>
            </div>

            {/* Confirm Submit Action */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-teal-600/30 flex items-center gap-2 transition-all hover:scale-105"
              >
                <ShoppingBag className="w-4 h-4" />
                Confirm & Reserve Ticket
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
