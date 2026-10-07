import { useState } from 'react';
import { useAppStore } from '../../services/store';
import { X, UserPlus, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

interface VisitorPassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VisitorPassModal({ isOpen, onClose }: VisitorPassModalProps) {
  const { requestVisitorPass, currentUser } = useAppStore();

  const [visitorName, setVisitorName] = useState('');
  const [relationship, setRelationship] = useState('Father');
  const [contactNo, setContactNo] = useState('+91 98610 11222');
  const [purpose, setPurpose] = useState('Personal family visit and academic consultation');
  const [visitDate, setVisitDate] = useState('2026-10-04');
  const [expectedArrivalTime, setExpectedArrivalTime] = useState('10:30 AM');
  const [expectedDepartureTime, setExpectedDepartureTime] = useState('17:00 PM');
  const [vehicleNumber, setVehicleNumber] = useState('OD-02-BA-4512');
  const [hostelEntryPermitted, setHostelEntryPermitted] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !contactNo.trim()) return;

    requestVisitorPass({
      visitorName: visitorName.trim(),
      relationship,
      contactNo: contactNo.trim(),
      purpose: purpose.trim(),
      visitDate,
      expectedArrivalTime,
      expectedDepartureTime,
      vehicleNumber: vehicleNumber.trim() || undefined,
      hostelEntryPermitted,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setVisitorName('');
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="bg-[#101010] border border-[#222] w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#1c1c1c] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserPlus size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Pre-Register Campus Visitor</h3>
              <p className="text-[10px] text-slate-400 font-mono">Main Gate Security Clearance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-[#222] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto no-scrollbar space-y-3.5 text-xs">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle2 size={40} className="text-emerald-400 animate-bounce" />
              <span className="text-sm font-bold text-white">Visitor Pass Generated!</span>
              <p className="text-[11px] text-slate-400 font-mono">
                Forwarded to Main Gate 1 and Chief Warden. The visitor can show this QR pass at the boom barrier.
              </p>
            </div>
          ) : (
            <>
              {/* Visitor Name & Relation */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                    Visitor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prabhat Pattnayak"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full bg-[#161616] border border-[#262626] rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                    Relationship *
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full bg-[#161616] border border-[#262626] rounded-lg px-3 py-2 text-white text-xs font-mono"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Local Guardian">Local Guardian</option>
                    <option value="Sibling / Relative">Sibling / Relative</option>
                    <option value="Official Guest">Official Guest</option>
                  </select>
                </div>
              </div>

              {/* Contact Number & Vehicle */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                    Visitor Phone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98610 11222"
                    value={contactNo}
                    onChange={(e) => setContactNo(e.target.value)}
                    className="w-full bg-[#161616] border border-[#262626] rounded-lg px-3 py-2 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                    Vehicle Reg Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. OD-02-BA-4512"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full bg-[#161616] border border-[#262626] rounded-lg px-3 py-2 text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                    Date of Visit
                  </label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full bg-[#161616] border border-[#262626] rounded px-2 py-1.5 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                    Arrival Time
                  </label>
                  <input
                    type="text"
                    value={expectedArrivalTime}
                    onChange={(e) => setExpectedArrivalTime(e.target.value)}
                    className="w-full bg-[#161616] border border-[#262626] rounded px-2 py-1.5 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                    Departure
                  </label>
                  <input
                    type="text"
                    value={expectedDepartureTime}
                    onChange={(e) => setExpectedDepartureTime(e.target.value)}
                    className="w-full bg-[#161616] border border-[#262626] rounded px-2 py-1.5 text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                  Purpose of Campus Visit *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bringing study materials and meeting course mentor"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-[#161616] border border-[#262626] rounded-lg px-3 py-2 text-white text-xs"
                />
              </div>

              {/* Hostel Entry Permit Checkbox */}
              <label className="flex items-center gap-2 p-2.5 bg-[#141414] rounded-lg border border-[#222] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hostelEntryPermitted}
                  onChange={(e) => setHostelEntryPermitted(e.target.checked)}
                  className="rounded bg-[#1a1a1a] border-[#333] text-emerald-500"
                />
                <div>
                  <span className="text-xs font-bold text-white block">Hostel Block A Room Access</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Permit guest to visit Room A-204 during designated visiting hours (10:00 - 18:00)
                  </span>
                </div>
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  <span>Issue Pre-Registered Gate Pass</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
