import React, { useState } from 'react';
import { useAppStore } from '../../../services/store';
import { PassType } from '../../../types';
import {
  X,
  QrCode,
  Clock,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Compass,
  Hourglass,
  Sparkles,
} from 'lucide-react';

interface GatePassFormProps {
  isOpen: boolean;
  onClose: () => void;
}

type PurposeType = 'Home' | 'Medical' | 'Local Market' | 'Other';

export function GatePassForm({ isOpen, onClose }: GatePassFormProps) {
  const { requestGatePass, currentUser, roomRecord } = useAppStore();

  const [destination, setDestination] = useState('');
  const [purpose, setPurpose] = useState<PurposeType>('Local Market');
  const [departureTime, setDepartureTime] = useState('17:30');
  const [expectedReturn, setExpectedReturn] = useState('20:30');
  const [parentContact, setParentContact] = useState('+91 94370 12345');
  const [notes, setNotes] = useState('');

  // Success state with 'Pending Warden Approval' animation
  const [submittedPass, setSubmittedPass] = useState<{
    id: string;
    destination: string;
    purpose: string;
    departure: string;
    expectedReturn: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Map purpose to store passType
    let passType: PassType = 'day_out';
    if (purpose === 'Local Market') passType = 'market_pass';
    else if (purpose === 'Home') passType = 'night_out';
    else if (purpose === 'Medical') passType = 'emergency';

    const depFormatted = `Today, ${departureTime}`;
    const retFormatted = `Today, ${expectedReturn}`;
    const fullReason = `${purpose}: ${notes ? notes : destination}`;

    requestGatePass({
      passType,
      departureTime: depFormatted,
      expectedReturnTime: retFormatted,
      destination: destination.trim() || 'Patia Square / Campus Periphery',
      reason: fullReason,
      parentContact,
    });

    const mockId = `GP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setSubmittedPass({
      id: mockId,
      destination: destination.trim() || 'Patia Square / Campus Periphery',
      purpose,
      departure: depFormatted,
      expectedReturn: retFormatted,
    });
  };

  const handleResetAndClose = () => {
    setSubmittedPass(null);
    setDestination('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none font-sans animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-t-[32px] sm:rounded-3xl p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <QrCode size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Apply for Gate Pass
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Smart Outing Request • Block {roomRecord.hostelBlock}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {submittedPass ? (
          /* ------------------------------------------------------------- */
          /* SUCCESS SCREEN: PENDING WARDEN APPROVAL ANIMATION             */
          /* ------------------------------------------------------------- */
          <div className="py-6 space-y-6 text-center animate-in zoom-in-95 duration-300">
            {/* Animated Pulsing Shield Icon */}
            <div className="relative inline-block mx-auto">
              <div className="h-20 w-20 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-2xl shadow-amber-500/20">
                <Hourglass size={36} className="animate-spin text-amber-400" style={{ animationDuration: '4s' }} />
              </div>
              <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-indigo-600 ring-2 ring-zinc-950 flex items-center justify-center text-white">
                <Sparkles size={14} />
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 animate-pulse">
                Pending Warden Approval
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight pt-1">
                Outing Request Dispatched
              </h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Your request has been routed to <strong className="text-zinc-200">Mr. Niranjan Sahu (Chief Warden)</strong>. You will receive an instant notification once approved.
              </p>
            </div>

            {/* Pass Preview Card */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <span className="text-zinc-400">Pass Reference:</span>
                <span className="text-indigo-400 font-bold">{submittedPass.id}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-zinc-500 block uppercase">Destination</span>
                  <span className="text-white font-bold truncate block">{submittedPass.destination}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase">Purpose</span>
                  <span className="text-white font-bold">{submittedPass.purpose}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase">Departure</span>
                  <span className="text-white font-bold">{submittedPass.departure}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase">Curfew Limit</span>
                  <span className="text-amber-400 font-bold">{submittedPass.expectedReturn}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* SMART FORM FIELDS                                             */
          /* ------------------------------------------------------------- */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Destination */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Destination *</span>
                <span className="text-[10px] text-zinc-500 font-mono">Location / City</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Patia Local Market, Bhubaneswar"
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <Compass size={18} className="absolute right-3.5 top-3.5 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* Field 2: Purpose (Dropdown / Visual Selector) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Purpose of Outing *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Local Market', 'Home', 'Medical', 'Other'] as PurposeType[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPurpose(p)}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border text-center transition-all ${
                      purpose === p
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {p === 'Home' && '🏡 '}
                    {p === 'Medical' && '🏥 '}
                    {p === 'Local Market' && '🛍️ '}
                    {p === 'Other' && '📍 '}
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 3 & 4: Departure Time & Expected Return Time Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                  <Clock size={12} className="text-indigo-400" />
                  <span>Departure Time *</span>
                </label>
                <input
                  type="time"
                  required
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                  <Clock size={12} className="text-amber-400" />
                  <span>Expected Return *</span>
                </label>
                <input
                  type="time"
                  required
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                />
              </div>
            </div>

            {/* Quick Timing Hint */}
            <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between text-xs">
              <span className="text-[11px] text-indigo-300 font-mono">
                Hostel Curfew: <strong>21:30 hrs</strong>
              </span>
              <button
                type="button"
                onClick={() => setExpectedReturn('21:00')}
                className="text-[10px] text-indigo-400 underline font-mono hover:text-indigo-300"
              >
                Set to 21:00 hrs
              </button>
            </div>

            {/* Optional Specific Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Specific Reason / Items</span>
                <span className="text-[10px] text-zinc-500 font-mono">Optional</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Purchasing hardware components for semester robotics project"
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            {/* Large Prominent Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/35 active:scale-[0.98] transition-all"
              >
                <span>Generate Pass Request</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
