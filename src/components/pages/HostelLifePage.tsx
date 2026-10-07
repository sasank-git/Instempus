import React, { useState } from 'react';
import { useAppStore } from '../../services/store';
import {
  Building2,
  Utensils,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  Clock,
  DoorOpen,
  ChevronRight,
  Plus,
  CheckCircle2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { GatePassForm } from '../../features/create/components/GatePassForm';

export function HostelLifePage() {
  const {
    currentUser,
    canteenMenu,
    gatePasses,
    roomRecord,
    issues,
  } = useAppStore();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'gatepass' | 'mess'>('overview');
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  // Active pass for this user
  const activePass = gatePasses.find(
    (p) => p.status === 'approved' || p.status === 'pending'
  );

  return (
    <div className="space-y-6 pb-24 select-none font-sans max-w-lg mx-auto">
      {/* 1. TOP HEADER - Large, soft typography */}
      <div className="px-2 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Hostel Life
            </h1>
            <p className="text-xs text-zinc-400 font-normal mt-0.5">
              Residence, Mess Menu & Gate Pass Protocol
            </p>
          </div>

          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Block {roomRecord.hostelBlock} • Room {roomRecord.roomNo}
          </span>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION PILLS - Clean, airy pills */}
      <div className="flex items-center gap-2 px-1">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`py-2 px-4 rounded-2xl text-xs font-semibold transition-all ${
            activeSubTab === 'overview'
              ? 'bg-zinc-800 text-white shadow-md'
              : 'bg-zinc-900/60 text-zinc-400 hover:text-white'
          }`}
        >
          Residence Overview
        </button>
        <button
          onClick={() => setActiveSubTab('gatepass')}
          className={`py-2 px-4 rounded-2xl text-xs font-semibold transition-all ${
            activeSubTab === 'gatepass'
              ? 'bg-zinc-800 text-white shadow-md'
              : 'bg-zinc-900/60 text-zinc-400 hover:text-white'
          }`}
        >
          Gate Passes
        </button>
        <button
          onClick={() => setActiveSubTab('mess')}
          className={`py-2 px-4 rounded-2xl text-xs font-semibold transition-all ${
            activeSubTab === 'mess'
              ? 'bg-zinc-800 text-white shadow-md'
              : 'bg-zinc-900/60 text-zinc-400 hover:text-white'
          }`}
        >
          Mess Menu
        </button>
      </div>

      {/* 3. CONTENT PANELS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-5 px-1">
          {/* Residence Details Card */}
          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Brahmaputra Hall of Residence</h3>
                  <span className="text-xs text-zinc-400 font-mono">Senior Scholar Wing</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Active Resident
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/60 space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase block">Room Allocation</span>
                <span className="text-white font-bold text-sm block">Room {roomRecord.roomNo}</span>
                <span className="text-zinc-400 text-[10px]">Bed 2 • North Facing</span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/60 space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase block">Assigned Roommate</span>
                <span className="text-white font-bold text-sm block truncate">{roomRecord.roommateName}</span>
                <span className="text-zinc-400 text-[10px] font-mono">{roomRecord.roommateRoll}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-indigo-300">
                <Clock size={14} />
                <span>Hostel Curfew: <strong>21:30 hrs (9:30 PM)</strong></span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Strict Enforcement</span>
            </div>
          </div>

          {/* Today's Mess Highlight Card */}
          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Utensils size={18} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white">Today's Mess Menu</h3>
              </div>
              <button
                onClick={() => setActiveSubTab('mess')}
                className="text-xs text-indigo-400 font-semibold hover:underline"
              >
                Full Menu →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/60 flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Lunch (12:30 - 14:30)</span>
                  <span className="text-zinc-200 mt-0.5 block">{canteenMenu.lunch}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/60 flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block">Dinner (19:30 - 21:30)</span>
                  <span className="text-zinc-200 mt-0.5 block">{canteenMenu.dinner}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gate Pass Tab */}
      {activeSubTab === 'gatepass' && (
        <div className="space-y-4 px-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
              Hostel Outing Clearance
            </span>
            <button
              onClick={() => setIsPassModalOpen(true)}
              className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus size={14} />
              <span>Apply Gate Pass</span>
            </button>
          </div>

          {activePass ? (
            <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400">{activePass.id}</span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                    activePass.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {activePass.status}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white capitalize">{activePass.passType.replace('_', ' ')}</h4>
                <p className="text-xs text-zinc-300 mt-1">{activePass.reason}</p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-xs font-mono grid grid-cols-2 gap-2 text-zinc-400">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Out Time</span>
                  <span className="text-white font-bold">{activePass.departureTime}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Return Before</span>
                  <span className="text-white font-bold">{activePass.expectedReturnTime}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-3xl bg-zinc-900/40 border border-zinc-800/80 text-xs text-zinc-500 space-y-3">
              <QrCode size={32} className="text-zinc-600 mx-auto" />
              <p>No active gate passes found.</p>
              <button
                onClick={() => setIsPassModalOpen(true)}
                className="py-2 px-4 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs"
              >
                Create Gate Pass Request
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mess Menu Tab */}
      {activeSubTab === 'mess' && (
        <div className="space-y-4 px-1">
          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Daily Dining Menu</h3>
                <span className="text-xs text-zinc-400 font-mono">{canteenMenu.date}</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                {canteenMenu.isVegOnly ? 'Pure Veg Day' : 'Veg & Non-Veg'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Breakfast (07:30 - 09:15)</span>
                <p className="text-zinc-200">{canteenMenu.breakfast}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">Lunch (12:30 - 14:30)</span>
                <p className="text-zinc-200">{canteenMenu.lunch}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-orange-400 block">Evening Snacks (17:00 - 18:15)</span>
                <p className="text-zinc-200">{canteenMenu.snacks}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block">Dinner (19:30 - 21:30)</span>
                <p className="text-zinc-200">{canteenMenu.dinner}</p>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-zinc-500 font-mono">
              Managed by: {canteenMenu.postedBy} • {canteenMenu.lastUpdated}
            </div>
          </div>
        </div>
      )}

      {/* Gate Pass Form */}
      {isPassModalOpen && (
        <GatePassForm isOpen={isPassModalOpen} onClose={() => setIsPassModalOpen(false)} />
      )}
    </div>
  );
}
