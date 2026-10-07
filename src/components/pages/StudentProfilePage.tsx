import React, { useState } from 'react';
import { useAppStore } from '../../services/store';
import { Role } from '../../types';
import {
  User,
  ShieldCheck,
  QrCode,
  Settings,
  LogOut,
  GraduationCap,
  Sparkles,
  Building2,
  CalendarCheck,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { DigitalIDCardModal } from '../profile/DigitalIDCardModal';
import { AccountSettingsSheet } from '../profile/AccountSettingsSheet';

export function StudentProfilePage() {
  const {
    currentUser,
    currentRole,
    logout,
    roomRecord,
    classrooms,
  } = useAppStore();

  const [isIdModalOpen, setIsIdModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="space-y-6 pb-24 select-none font-sans max-w-lg mx-auto">
      {/* 1. TOP HEADER */}
      <div className="px-2 pt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Profile
        </h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* 2. INSTAGRAM / THREADS PROFILE CARD */}
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl space-y-5 px-1">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="h-18 w-18 rounded-full object-cover ring-2 ring-indigo-500/50"
            />
            <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-black" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white leading-tight">
              {currentUser.name}
            </h2>
            <span className="text-xs font-mono text-zinc-400 block">
              {currentUser.rollNo || currentUser.employeeId || currentUser.username}
            </span>
            <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              {currentRole.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Bio / Institutional Details */}
        <p className="text-xs text-zinc-300 font-normal leading-relaxed">
          {currentUser.department || 'B.Tech in Computer Science & Engineering'} • Biju Patnaik University of Technology
        </p>

        {/* Stats Row - Clean social style */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-center font-mono">
          <div className="p-2.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/60">
            <span className="text-base font-bold text-white block">
              {classrooms.length}
            </span>
            <span className="text-[10px] text-zinc-400 uppercase">Courses</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/60">
            <span className="text-base font-bold text-emerald-400 block">
              92.8%
            </span>
            <span className="text-[10px] text-zinc-400 uppercase">Attendance</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/60">
            <span className="text-base font-bold text-white block">
              B-{roomRecord.hostelBlock}
            </span>
            <span className="text-[10px] text-zinc-400 uppercase">Room {roomRecord.roomNo}</span>
          </div>
        </div>

        {/* Digital ID Button */}
        <button
          onClick={() => setIsIdModalOpen(true)}
          className="w-full py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
        >
          <QrCode size={16} />
          <span>View Verified Institutional ID Card</span>
        </button>
      </div>

      {/* 3. REAL SUPABASE AUTH & SECURITY CARD (Replaces Mock Persona Switcher) */}
      <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl space-y-3.5 px-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-300">
            <ShieldCheck size={16} className="text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
              Cryptographic Identity & Security
            </h3>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active Session
          </span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>Authentication Engine</span>
              <span className="text-white font-bold">Supabase PostgreSQL Auth</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>Verified Role</span>
              <span className="text-indigo-400 font-bold uppercase">{currentRole}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>Account UID</span>
              <span className="text-zinc-300 font-mono text-[10px] truncate max-w-[180px]">{currentUser.id}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>Registered Email</span>
              <span className="text-zinc-300 truncate max-w-[180px]">{currentUser.email || 'N/A'}</span>
            </div>
          </div>

          {/* Current JSONB Metadata Tags */}
          {currentUser.metadata && Object.keys(currentUser.metadata).length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
                Assigned Metadata Tags (profiles.metadata)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(currentUser.metadata).map(([key, val]) => (
                  <span
                    key={key}
                    className="px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-[10px] text-zinc-300"
                  >
                    <strong className="text-indigo-400">{key}:</strong>{' '}
                    <span>{Array.isArray(val) ? `[${val.length} slots]` : String(val)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. LOGOUT */}
      <div className="px-1">
        <button
          onClick={logout}
          className="w-full py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-rose-950/30 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <LogOut size={16} />
          <span>Sign Out of Account</span>
        </button>
      </div>

      {/* ID Card Modal */}
      {isIdModalOpen && (
        <DigitalIDCardModal isOpen={isIdModalOpen} onClose={() => setIsIdModalOpen(false)} />
      )}

      {/* Account Settings Sheet */}
      {isSettingsOpen && (
        <AccountSettingsSheet isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
}
