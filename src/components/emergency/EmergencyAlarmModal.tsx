import { useEffect } from 'react';
import { useAppStore } from '../../services/store';
import { playEmergencySiren, stopEmergencySiren } from '../../services/audioAlarm';
import { AlertTriangle, PhoneCall, ShieldAlert, X } from 'lucide-react';

export function EmergencyAlarmModal() {
  const { emergencyAlert, dismissEmergencyAlert, currentRole } = useAppStore();

  useEffect(() => {
    if (emergencyAlert.active) {
      playEmergencySiren();
    } else {
      stopEmergencySiren();
    }
    return () => {
      stopEmergencySiren();
    };
  }, [emergencyAlert.active]);

  if (!emergencyAlert.active) return null;

  const canDismiss = ['admin', 'security', 'warden', 'principal'].includes(currentRole);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-md select-none text-white animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-black border-2 border-red-500 p-5 space-y-4 shadow-2xl">
        {/* Flashing Alert Header */}
        <div className="flex items-center justify-between border-b border-red-900 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-red-500 animate-ping" />
            <h2 className="text-sm font-black uppercase tracking-wider text-red-400">
              CAMPUS EMERGENCY ALERT
            </h2>
          </div>

          <span className="text-[10px] font-mono text-red-300 bg-red-950 px-2 py-0.5 border border-red-800">
            SIREN SOUNDING
          </span>
        </div>

        {/* Alert Type & Message */}
        <div className="space-y-2">
          <div className="p-3 bg-red-950/40 border border-red-700 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-red-400">
              {emergencyAlert.type.toUpperCase()} HAZARD WARNING
            </span>
            <h3 className="text-base font-bold text-white">{emergencyAlert.title}</h3>
            <p className="text-xs text-red-200 leading-relaxed">{emergencyAlert.message}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 bg-[#121212] border border-[#2a2a2a]">
              <span className="text-[9px] text-slate-400 block">Designated Muster Point:</span>
              <span className="font-bold text-white text-[11px]">
                {emergencyAlert.musterPoint}
              </span>
            </div>
            <div className="p-2 bg-[#121212] border border-[#2a2a2a]">
              <span className="text-[9px] text-slate-400 block">Issued By:</span>
              <span className="font-bold text-white text-[11px] truncate block">
                {emergencyAlert.issuedBy}
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Hotline Buttons */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">
            Immediate Response Contacts:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:112"
              className="py-2 px-3 rounded-md bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <PhoneCall size={14} />
              <span>National SOS (112)</span>
            </a>
            <a
              href={`tel:${emergencyAlert.emergencyPhone}`}
              className="py-2 px-3 rounded-md bg-[#222] hover:bg-[#2c2c2c] text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#333]"
            >
              <PhoneCall size={14} />
              <span>Control Room</span>
            </a>
          </div>
        </div>

        {/* Dismissal / Silence controls */}
        <div className="pt-2 border-t border-[#1f1f1f] flex items-center justify-between">
          <button
            onClick={() => stopEmergencySiren()}
            className="text-[11px] text-slate-400 hover:text-white underline font-mono"
          >
            Mute Siren Audio
          </button>

          {canDismiss ? (
            <button
              onClick={dismissEmergencyAlert}
              className="py-1.5 px-3 rounded-md bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
            >
              Clear Emergency (All Safe)
            </button>
          ) : (
            <button
              onClick={dismissEmergencyAlert}
              className="py-1 px-3 rounded-md bg-[#222] text-slate-300 text-xs font-medium"
            >
              Acknowledge & Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
