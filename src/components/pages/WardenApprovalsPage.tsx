import React, { useState } from 'react';
import { useAppStore } from '../../services/store';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Building2,
  User,
  Compass,
  Phone,
  FileCheck2,
  QrCode,
  Sparkles,
} from 'lucide-react';

export function WardenApprovalsPage() {
  const { gatePasses, approveGatePass, rejectGatePass, currentUser } = useAppStore();

  const [activeFilter, setActiveFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApprove = (passId: string, studentName: string) => {
    approveGatePass(passId);
    showToast(`✓ Outing pass for ${studentName} Approved & Signed.`);
  };

  const handleDecline = (passId: string, studentName: string) => {
    rejectGatePass(passId);
    showToast(`✕ Outing request for ${studentName} declined.`);
  };

  const pendingCount = gatePasses.filter((p) => p.status === 'pending').length;
  const approvedCount = gatePasses.filter((p) => p.status === 'approved').length;

  const filteredPasses = gatePasses.filter((p) => {
    if (activeFilter === 'pending') return p.status === 'pending';
    if (activeFilter === 'approved') return p.status === 'approved';
    return true;
  });

  // Scholar avatar fallback
  const getScholarAvatar = (roll: string) => {
    if (roll === '2501CSE008') {
      return 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80';
    }
    if (roll === '2501CSE001') {
      return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80';
    }
    return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80';
  };

  return (
    <div className="space-y-6 pb-28 select-none font-sans max-w-lg mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 inset-x-4 z-50 flex items-center gap-2.5 p-3.5 rounded-2xl bg-zinc-900/95 text-white border border-emerald-500/50 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top duration-300">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-mono font-medium flex-1 text-emerald-100">
            {toastMessage}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="px-2 pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Warden Approval Queue
          </h1>
          <p className="text-xs text-zinc-400 font-normal mt-0.5">
            Cryptographic Outing Pass Clearance Desk
          </p>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 flex items-center gap-1.5 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>{pendingCount} Pending</span>
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 px-1 text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveFilter('pending')}
          className={`py-2 px-3.5 rounded-2xl font-bold transition-all ${
            activeFilter === 'pending'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          Pending Outings ({pendingCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('approved')}
          className={`py-2 px-3.5 rounded-2xl font-bold transition-all ${
            activeFilter === 'approved'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          Approved Archive ({approvedCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`py-2 px-3.5 rounded-2xl font-bold transition-all ${
            activeFilter === 'all'
              ? 'bg-zinc-800 text-white shadow'
              : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          All ({gatePasses.length})
        </button>
      </div>

      {/* Outing Requests List */}
      <div className="space-y-4 px-1">
        {filteredPasses.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-500 font-mono">
            No gate passes currently in this category.
          </div>
        ) : (
          filteredPasses.map((pass) => {
            const isPending = pass.status === 'pending';
            const isApproved = pass.status === 'approved';
            const avatar = getScholarAvatar(pass.rollNo);

            return (
              <div
                key={pass.id}
                className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl space-y-4 transition-all"
              >
                {/* Scholar Info Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={avatar}
                      alt={pass.studentName}
                      className="h-12 w-12 rounded-2xl object-cover ring-2 ring-zinc-700 shadow"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-white leading-tight">
                          {pass.studentName}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {pass.rollNo}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono block mt-0.5">
                        Block {pass.hostelBlock} • Room {pass.roomNo}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${
                      isPending
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : isApproved
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {pass.status}
                  </span>
                </div>

                {/* Destination & Reason */}
                <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/60 space-y-2 text-xs font-mono">
                  <div className="flex items-start gap-2">
                    <Compass size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block font-semibold">
                        Destination
                      </span>
                      <span className="text-zinc-100 font-medium font-sans">
                        {pass.destination}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-zinc-850">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">
                      Reason / Purpose
                    </span>
                    <p className="text-zinc-300 font-sans text-xs mt-0.5 leading-relaxed">
                      {pass.reason}
                    </p>
                  </div>
                </div>

                {/* Timings & Guardian */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/50">
                    <span className="text-[10px] text-zinc-500 uppercase block">Out Time</span>
                    <span className="text-zinc-100 font-bold block">{pass.departureTime}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/50">
                    <span className="text-[10px] text-zinc-500 uppercase block">Return Time</span>
                    <span className="text-amber-400 font-bold block">{pass.expectedReturnTime}</span>
                  </div>
                </div>

                {/* Guardian Contact */}
                <div className="flex items-center justify-between px-1 text-[11px] font-mono text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Phone size={12} className="text-zinc-500" />
                    <span>Parent: <strong className="text-zinc-200">{pass.parentContact}</strong></span>
                  </div>
                  <span className="text-indigo-400 font-bold text-[10px]">Pass ID: {pass.id}</span>
                </div>

                {/* Approved Token Preview if Approved */}
                {isApproved && (
                  <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <QrCode size={16} />
                      <span>Token: <strong className="text-white">{pass.qrToken}</strong></span>
                    </div>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <ShieldCheck size={12} />
                      <span>Warden Signed</span>
                    </span>
                  </div>
                )}

                {/* Action Buttons for Pending Passes */}
                {isPending && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDecline(pass.id, pass.studentName)}
                      className="py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <XCircle size={15} />
                      <span>Decline</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(pass.id, pass.studentName)}
                      className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <FileCheck2 size={15} />
                      <span>Approve & Sign</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
