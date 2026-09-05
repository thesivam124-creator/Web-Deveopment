import React, { useState, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Download, 
  AlertTriangle,
  CreditCard,
  Ban,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BookingReceiptModal({ booking, onClose }) {
  const { cancelPreBooking, showToast } = useHealth();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    try {
      if (booking?.status !== 'Cancelled') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (e) {
      // ignore
    }
  }, [booking]);

  if (!booking) return null;

  const isCancelled = booking.status === 'Cancelled';

  const handleConfirmCancel = () => {
    cancelPreBooking(booking.id);
    setShowCancelConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        
        {/* Ticket Top Banner */}
        <div className={`p-6 text-white text-center relative ${
          isCancelled
            ? 'bg-gradient-to-r from-rose-900 via-slate-900 to-rose-950'
            : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-brand-600'
        }`}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-3 backdrop-blur-sm">
            {isCancelled ? (
              <Ban className="w-8 h-8 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-white" />
            )}
          </div>

          <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
            isCancelled ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40' : 'bg-white/20 text-white'
          }`}>
            {isCancelled ? 'Pre-Booking Cancelled' : (booking.isEmergency ? 'Emergency Pre-Booking Guaranteed' : 'Pre-Booked Specialist Slot')}
          </span>

          <h2 className="text-2xl font-black mt-2 tracking-tight">
            {isCancelled ? 'Booking Released' : 'Zero-Wait Priority Ticket'}
          </h2>
          <p className="text-xs text-teal-100 mt-1">
            {isCancelled ? 'Slot returned to hospital inventory' : 'Present token at reception desk to bypass queue'}
          </p>
        </div>

        {/* Priority Token Badge Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Priority Token ID</span>
            <span className={`font-mono text-lg font-extrabold tracking-wider ${
              isCancelled ? 'text-rose-400 line-through' : 'text-teal-400'
            }`}>{booking.token}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Holding Deposit</span>
            <span className="font-bold text-white text-base flex items-center justify-end gap-1">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              ${booking.preBookingDeposit || 15} Paid
            </span>
          </div>
        </div>

        {/* Ticket Details Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          
          {/* Hospital & Doctor Details */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 space-y-3">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block">Health Facility</span>
              <h4 className="font-bold text-white text-base">{booking.facilityName}</h4>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                {booking.facilityAddress}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Assigned Doctor / Specialist</span>
                <span className="font-semibold text-teal-300 text-sm">{booking.doctorName}</span>
                <span className="text-xs text-slate-400 block">{booking.discipline}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 font-semibold block">Slot Time</span>
                <span className="font-bold text-white text-sm flex items-center justify-end gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {booking.slotTime}
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Status or Terms Box */}
          {isCancelled ? (
            <div className="bg-rose-950/30 border border-rose-800/60 p-4 rounded-2xl space-y-1 text-xs">
              <span className="font-bold text-rose-400 block">Cancellation Processed</span>
              <p className="text-slate-300">
                Cancellation Fee Charged: <strong className="text-white">${booking.cancellationFee}</strong>
              </p>
              <p className="text-slate-300">
                Refund Amount Credited: <strong className="text-emerald-400">${booking.refundAmount}</strong>
              </p>
            </div>
          ) : (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  Cancellation & Refund Policy
                </span>
                <span className="text-[10px] text-emerald-400">Policy Terms</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                • <strong>Free Cancellation:</strong> 100% refund of deposit if cancelled more than 2 hours before slot time.<br />
                • <strong>Late Cancellation Charge:</strong> $15 fee charged if cancelled within 2 hours of slot time to protect hospital readiness.
              </p>
            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          {!isCancelled && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="py-2.5 px-4 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Ban className="w-4 h-4" />
              Cancel Booking
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 transition-all"
          >
            Done
          </button>
        </div>

        {/* Cancel Confirmation Sub-Modal */}
        {showCancelConfirm && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md p-6 flex flex-col justify-between z-50 animate-fade-in">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Cancel Pre-Booking & Process Fee?</h3>
              
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs space-y-2">
                <p className="text-slate-300">
                  Are you sure you want to cancel your pre-booked slot at <strong>{booking.facilityName}</strong>?
                </p>
                <div className="border-t border-slate-800 pt-2 text-slate-400">
                  <p>• Holding Deposit Paid: <strong>${booking.preBookingDeposit || 15}</strong></p>
                  <p>• Late Cancellation Charge (if within 2h): <strong>$15</strong></p>
                  <p>• Eligible Refund: <strong>Full or Partial based on time policy</strong></p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Keep Booking
              </button>

              <button
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                Confirm Cancellation & Process Fee
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
