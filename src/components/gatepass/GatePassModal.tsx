import React, { useState } from 'react';
import { useAppStore } from '../../services/store';
import { PassType } from '../../types';
import { X, QrCode, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface GatePassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GatePassModal({ isOpen, onClose }: GatePassModalProps) {
  const { requestGatePass } = useAppStore();

  const [passType, setPassType] = useState<PassType>('day_out');
  const [departureTime, setDepartureTime] = useState('Today, 17:30 PM');
  const [expectedReturnTime, setExpectedReturnTime] = useState('Today, 20:30 PM');
  const [destination, setDestination] = useState('Patia Market / Tech Mall');
  const [reason, setReason] = useState('Procuring electronics components for hardware project');
  const [parentContact, setParentContact] = useState('+91 94370 12345');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestGatePass({
      passType,
      departureTime,
      expectedReturnTime,
      destination,
      reason,
      parentContact,
    });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none font-sans animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-250">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <QrCode size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Generate Campus Gate Pass</h3>
              <span className="text-[10px] text-zinc-400 font-mono">BPUT Cryptographic Outing Token</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 size={40} className="text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-white">Outing Pass Submitted</h4>
            <p className="text-xs text-zinc-400">Routed to Warden for cryptographic sign-off.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
            {/* Pass Types */}
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Pass Type</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['day_out', 'market_pass', 'night_out', 'emergency'] as PassType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPassType(t)}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold capitalize transition-all ${
                      passType === t
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination */}
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Destination *</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Master Canteen, Bhubaneswar"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            {/* Timings */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Out Time *</label>
                <input
                  type="text"
                  required
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Return Before *</label>
                <input
                  type="text"
                  required
                  value={expectedReturnTime}
                  onChange={(e) => setExpectedReturnTime(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Purpose / Reason *</label>
              <textarea
                required
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 text-xs resize-none"
              />
            </div>

            {/* Parent Contact */}
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Emergency / Parent Contact *</label>
              <input
                type="text"
                required
                value={parentContact}
                onChange={(e) => setParentContact(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30"
              >
                Submit Gate Pass
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
