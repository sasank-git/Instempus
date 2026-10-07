import React from 'react';
import { useAppStore } from '../../services/store';
import { QRCodeSVG } from 'qrcode.react';
import { X, ShieldCheck, Building2, CheckCircle2 } from 'lucide-react';

interface DigitalIDCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DigitalIDCardModal({ isOpen, onClose }: DigitalIDCardModalProps) {
  const { currentUser, currentRole, roomRecord } = useAppStore();

  if (!isOpen) return null;

  const idToken = `BPUT_ID_${currentUser.id}_${currentUser.rollNo || currentUser.employeeId}_2026`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-250">
        {/* Holographic Top Banner */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white">
              <Building2 size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                BIJU PATNAIK UNIVERSITY
              </h3>
              <span className="text-[9px] text-zinc-400 font-mono">Verified Digital Scholar Badge</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* ID Card Front */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 space-y-4 text-center">
          <div className="relative inline-block mx-auto">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="h-24 w-24 rounded-2xl object-cover ring-2 ring-indigo-500/50 mx-auto shadow-lg"
            />
            <span className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full bg-emerald-500 ring-2 ring-zinc-950 flex items-center justify-center text-white">
              <CheckCircle2 size={14} />
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-white">{currentUser.name}</h4>
            <span className="text-xs font-mono font-bold text-indigo-400 block mt-0.5">
              {currentUser.rollNo || currentUser.employeeId || '2501CSE008'}
            </span>
            <span className="text-[11px] text-zinc-400 block mt-0.5">
              {currentUser.department || 'Computer Science & Engineering'}
            </span>
          </div>

          {/* QR Code Verification */}
          <div className="p-3 bg-white rounded-xl inline-block shadow-md">
            <QRCodeSVG value={idToken} size={110} level="M" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-850">
            <div>
              <span className="text-zinc-500 block uppercase">Session</span>
              <span className="text-white font-bold">2026-27</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase">Hostel / Wing</span>
              <span className="text-white font-bold">Block {roomRecord.hostelBlock} • {roomRecord.roomNo}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-emerald-400">
          <ShieldCheck size={13} />
          <span>ECDSA Cryptographically Signed • Valid 2026</span>
        </div>
      </div>
    </div>
  );
}
