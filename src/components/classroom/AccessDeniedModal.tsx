import { ShieldAlert, X, UserX, AlertTriangle, ArrowRight } from 'lucide-react';
import { Classroom, Role } from '../../types';
import { useAppStore } from '../../services/store';

interface AccessDeniedModalProps {
  classroom: Classroom | null;
  reason?: string;
  onClose: () => void;
}

export function AccessDeniedModal({ classroom, reason, onClose }: AccessDeniedModalProps) {
  const { currentUser } = useAppStore();

  if (!classroom) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="bg-[#121010] border border-rose-500/30 w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 bg-rose-950/40 border-b border-rose-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Access Restricted</h3>
              <p className="text-[10px] text-rose-300 font-mono">BPUT Section Security Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-[#222] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          <div className="p-3.5 bg-[#181112] border border-rose-500/20 rounded-xl space-y-2">
            <div className="flex items-start gap-2.5">
              <UserX size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white text-xs block">
                  {classroom.subjectCode} — {classroom.subjectName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                  Semester {classroom.semester} • Section {classroom.section} • {classroom.department}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-rose-200/90 leading-relaxed pt-1 border-t border-rose-900/30">
              {reason ||
                `Only students officially enrolled in Section ${classroom.section} and the assigned course faculty (${classroom.instructorName}) are authorized to enter this digital classroom.`}
            </p>
          </div>

          {/* Current Identity Info */}
          <div className="p-3 bg-[#141414] rounded-lg border border-[#222] space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">
              Your Current Authenticated Persona
            </span>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">{currentUser.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {currentUser.role.toUpperCase()} {currentUser.rollNo ? `• ${currentUser.rollNo}` : ''}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Unauthorized
              </span>
            </div>
          </div>

          {/* Row Level Security Enforcement Notice */}
          <div className="p-3 bg-[#0d0d0d] rounded-lg border border-[#1e1e1e] space-y-1.5 font-mono text-[10px]">
            <span className="text-zinc-400 uppercase font-bold flex items-center gap-1">
              <ShieldAlert size={12} className="text-rose-400" />
              Row-Level Security (RLS) Policy Active
            </span>
            <p className="text-zinc-400 leading-relaxed font-sans">
              Access permissions are cryptographically verified against your Supabase JWT session. To access this cohort, you must be enrolled in <strong className="text-zinc-200">student_enrollments</strong> or designated as the instructor.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#141414] border-t border-[#1c1c1c]">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-white font-bold text-xs transition-colors"
          >
            Dismiss & Return to My Classrooms
          </button>
        </div>
      </div>
    </div>
  );
}
