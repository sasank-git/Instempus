import { useState } from 'react';
import { useAppStore } from '../../services/store';
import { CampusIssue, IssueCategory } from '../../types';
import { X, Wrench, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CreateMaintenanceTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocation?: string;
  defaultAssetTag?: string;
}

export function CreateMaintenanceTicketModal({
  isOpen,
  onClose,
  defaultLocation = 'Hostel Block A, Room A-204',
  defaultAssetTag = '',
}: CreateMaintenanceTicketModalProps) {
  const { createIssue, currentUser } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('hostel');
  const [location, setLocation] = useState(defaultLocation);
  const [urgency, setUrgency] = useState<CampusIssue['urgency']>('medium');
  const [assetTag, setAssetTag] = useState(defaultAssetTag);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createIssue(
      title.trim(),
      description.trim(),
      category,
      location.trim() || 'Hostel Block A',
      urgency,
      assetTag.trim() || undefined
    );

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setTitle('');
      setDescription('');
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="bg-[#101010] border border-[#222] w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#1c1c1c] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Wrench size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Log Maintenance Request</h3>
              <p className="text-[10px] text-slate-400 font-mono">Estate & Facility Operations Desk</p>
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
              <span className="text-sm font-bold text-white">Maintenance Ticket Dispatched!</span>
              <p className="text-[11px] text-slate-400 font-mono">
                Assigned to the estate trade supervisor. Real-time status visible in your ticketing board.
              </p>
            </div>
          ) : (
            <>
              {/* Category / Trade */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                  Maintenance Department / Trade
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'hostel', label: 'Hostel Block' },
                    { id: 'mess', label: 'Mess & Dining' },
                    { id: 'infrastructure', label: 'Civil / RO' },
                    { id: 'labs', label: 'Computing & Labs' },
                    { id: 'academic', label: 'Academic Hall' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as IssueCategory)}
                      className={`py-1.5 px-2 rounded border text-center font-mono text-[10px] font-bold transition-all ${
                        category === cat.id
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-[#181818] border-[#252525] text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Urgency Level */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                  Severity / Urgency Priority
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'emergency', label: 'Emergency', color: 'bg-rose-600 text-white border-rose-500' },
                    { id: 'high', label: 'High', color: 'bg-amber-600 text-white border-amber-500' },
                    { id: 'medium', label: 'Medium', color: 'bg-indigo-600 text-white border-indigo-500' },
                    { id: 'low', label: 'Low', color: 'bg-[#333] text-white border-[#444]' },
                  ].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUrgency(u.id as CampusIssue['urgency'])}
                      className={`py-1.5 px-2 rounded border text-center font-mono text-[10px] font-bold uppercase transition-all ${
                        urgency === u.id
                          ? u.color
                          : 'bg-[#161616] border-[#252525] text-slate-500 hover:text-white'
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticket Title */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                  Problem Synopsis *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ceiling fan speed regulator sparking or Bathroom tap dripping"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#161616] border border-[#262626] rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              {/* Location & Asset Tag */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                    Room / Facility Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#161616] border border-[#262626] rounded-lg px-3 py-2 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                    Asset Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HST-A-FAN-204"
                    value={assetTag}
                    onChange={(e) => setAssetTag(e.target.value)}
                    className="w-full bg-[#161616] border border-[#262626] rounded-lg px-3 py-2 text-white placeholder-slate-600 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                  Detailed Issue Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe when the issue occurs, specific symptoms, or safety hazards..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#161616] border border-[#262626] rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs resize-none"
                />
              </div>

              <div className="p-2.5 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">Reporter:</span>
                <span className="text-white font-bold">
                  {currentUser.name} ({currentUser.rollNo || currentUser.employeeId})
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  <span>Submit Ticket to Estate Maintenance</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
