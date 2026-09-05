import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { X, Shield, Save, QrCode, Phone, AlertCircle, Heart, CheckCircle2 } from 'lucide-react';

export default function HealthPassModal({ onClose }) {
  const { patientPass, setPatientPass, showToast } = useHealth();
  const [formData, setFormData] = useState({ ...patientPass });
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setPatientPass(formData);
    setIsEditing(false);
    showToast('Emergency Medical Pass updated successfully!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-900/40 via-slate-900 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Emergency Medical Pass</h3>
              <p className="text-xs text-slate-400">Pre-intake medical profile auto-transmitted on booking</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {!isEditing ? (
            <div className="space-y-6">
              
              {/* QR Code & ID Badge */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Digital Patient Pass ID</span>
                  <div className="text-sm font-mono font-bold text-rose-400">{patientPass.qrCodeId}</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Medical Profile</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-white p-1 rounded-lg flex items-center justify-center shadow-md">
                  {/* Mock QR SVG */}
                  <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                    <rect x="2" y="2" width="6" height="6" />
                    <rect x="16" y="2" width="6" height="6" />
                    <rect x="2" y="16" width="6" height="6" />
                    <path d="M10 2h4M10 6h4M10 10h10M2 10h4M10 14h4M16 14h4M14 18h6" />
                  </svg>
                </div>
              </div>

              {/* Summary Fields Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400 block mb-1">Full Patient Name</span>
                  <span className="font-semibold text-white text-sm">{patientPass.fullName}</span>
                </div>

                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400 block mb-1">Blood Group</span>
                  <span className="font-bold text-rose-400 text-sm bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 inline-block">
                    {patientPass.bloodGroup}
                  </span>
                </div>

                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400 block mb-1">Age & Gender</span>
                  <span className="font-semibold text-white">{patientPass.age} yrs, {patientPass.gender}</span>
                </div>

                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400 block mb-1">Insurance Policy</span>
                  <span className="font-semibold text-slate-200">{patientPass.insuranceProvider}</span>
                </div>
              </div>

              {/* Critical Medical Info */}
              <div className="space-y-3">
                <div className="bg-rose-950/20 border border-rose-900/40 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Known Allergies & Sensitivities</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{patientPass.allergies || 'None reported'}</p>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
                    <Heart className="w-4 h-4" />
                    <span>Chronic Conditions / Medical Notes</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{patientPass.chronicConditions || 'None reported'}</p>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-xs mb-1">
                    <Phone className="w-4 h-4" />
                    <span>Primary Emergency Contact</span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono font-semibold">{patientPass.emergencyContact}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Edit Profile Data
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Age</label>
                  <input
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="O Negative">O Negative (Universal Donor)</option>
                    <option value="O Positive">O Positive</option>
                    <option value="A Positive">A Positive</option>
                    <option value="A Negative">A Negative</option>
                    <option value="B Positive">B Positive</option>
                    <option value="B Negative">B Negative</option>
                    <option value="AB Positive">AB Positive</option>
                    <option value="AB Negative">AB Negative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Emergency Contact</label>
                <input
                  type="text"
                  required
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Known Allergies</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  placeholder="e.g. Penicillin, Latex, Peanuts"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Chronic Conditions / History</label>
                <input
                  type="text"
                  value={formData.chronicConditions}
                  onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  placeholder="e.g. Diabetes Type 2, Asthma"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Insurance Details</label>
                <input
                  type="text"
                  value={formData.insuranceProvider}
                  onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
                >
                  <Save className="w-4 h-4" />
                  Save Pass
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
