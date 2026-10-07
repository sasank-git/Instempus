import React, { useState } from 'react';
import { useAppStore } from '../../../services/store';
import {
  X,
  Wrench,
  Zap,
  Droplets,
  Armchair,
  Sparkles,
  CheckCircle2,
  Building2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface ReportIssueFormProps {
  isOpen: boolean;
  onClose: () => void;
}

type MaintenanceCategory = 'Electrical' | 'Plumbing' | 'Furniture' | 'Cleaning';

const CATEGORIES: { id: MaintenanceCategory; label: string; icon: string; desc: string }[] = [
  { id: 'Electrical', label: 'Electrical', icon: '💡', desc: 'Lights, sockets, fan, breaker' },
  { id: 'Plumbing', label: 'Plumbing', icon: '💧', desc: 'Tap, washroom, leakage, shower' },
  { id: 'Furniture', label: 'Furniture', icon: '🪑', desc: 'Study table, chair, cot, cupboard' },
  { id: 'Cleaning', label: 'Cleaning', icon: '🧹', desc: 'Room hygiene, corridor, pest control' },
];

export function ReportIssueForm({ isOpen, onClose }: ReportIssueFormProps) {
  const { createIssue, roomRecord, currentUser } = useAppStore();

  const [category, setCategory] = useState<MaintenanceCategory>('Electrical');
  const [roomNumber, setRoomNumber] = useState(
    `Block ${roomRecord.hostelBlock} - Room ${roomRecord.roomNo}`
  );
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');

  // Success state
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    category: string;
    location: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const title = `[${category}] Maintenance at ${roomNumber}`;
    const fullDesc = `${description.trim()} (Category: ${category})`;

    createIssue(
      title,
      fullDesc,
      'hostel',
      roomNumber,
      urgency,
      `ASSET-${category.toUpperCase().slice(0, 4)}`
    );

    const mockId = `TKT-${Math.floor(1050 + Math.random() * 500)}`;

    setSubmittedTicket({
      id: mockId,
      category,
      location: roomNumber,
    });
  };

  const handleResetAndClose = () => {
    setSubmittedTicket(null);
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none font-sans animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-t-[32px] sm:rounded-3xl p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Wrench size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Report Hostel Issue
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Maintenance Desk • Facility SLA 24h
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

        {submittedTicket ? (
          /* ------------------------------------------------------------- */
          /* SUCCESS SCREEN                                                */
          /* ------------------------------------------------------------- */
          <div className="py-6 space-y-6 text-center animate-in zoom-in-95 duration-300">
            <div className="h-20 w-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-2xl shadow-emerald-500/20">
              <CheckCircle2 size={40} className="text-emerald-400 animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Ticket Registered #{submittedTicket.id}
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight pt-1">
                Dispatched to Estate Maintenance
              </h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Technician Manoj Jena has been assigned. Resolution expected within 24-48 hours.
              </p>
            </div>

            {/* Ticket Card Preview */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Target Location</span>
                <span className="text-white font-bold">{submittedTicket.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Service Trade</span>
                <span className="text-amber-400 font-bold">{submittedTicket.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Resolution SLA</span>
                <span className="text-emerald-400 font-bold">Within 24 Hours</span>
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
          /* REPORT ISSUE FORM                                             */
          /* ------------------------------------------------------------- */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Category (Grid of visual icons) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Select Issue Category *
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                      category === cat.id
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{cat.icon}</span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block text-white leading-tight">
                        {cat.label}
                      </span>
                      <span className="text-[10px] text-zinc-400 block truncate mt-0.5">
                        {cat.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Field 2: Room Number (Auto-filled from store) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Room / Location *</span>
                <span className="text-[10px] text-emerald-400 font-mono">Auto-filled</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. Block A - Room 204"
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono transition-colors"
                />
                <Building2 size={18} className="absolute right-3.5 top-3.5 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* Field 3: Urgency Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setUrgency(lvl)}
                    className={`py-2 px-2 rounded-xl text-xs font-mono font-bold capitalize border transition-all ${
                      urgency === lvl
                        ? lvl === 'high'
                          ? 'bg-rose-600 text-white border-rose-500'
                          : 'bg-amber-600 text-white border-amber-500'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 4: Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Description of Complaint *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the issue (e.g. Ceiling fan regulator sparking; cold water tap leaking continuously)..."
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Large Prominent Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-600/35 active:scale-[0.98] transition-all"
              >
                <span>Submit Ticket</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
