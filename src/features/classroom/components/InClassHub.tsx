import React from 'react';
import { useAppStore } from '../../../services/store';
import { TeacherClassDashboard } from './TeacherClassDashboard';
import { StudentClassDashboard } from './StudentClassDashboard';
import { UserCheck, GraduationCap, ArrowLeftRight } from 'lucide-react';

export function InClassHub() {
  const { currentUser, currentRole, setRole } = useAppStore();

  // Role routing: Determine if user acts as Teacher/Faculty or Student/Scholar
  const isFaculty = ['teacher', 'hod', 'principal', 'admin'].includes(currentUser.role || currentRole);

  return (
    <div className="space-y-3">
      {/* Quick Role View Switcher for Live Demo & Testing */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-[10px] font-mono text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-zinc-300">
            Current Persona: {isFaculty ? 'Faculty Mentor' : 'Enrolled Scholar'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setRole(isFaculty ? 'student' : 'teacher')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-indigo-400 hover:text-indigo-300 font-bold border border-zinc-800 transition-all active:scale-95"
        >
          <ArrowLeftRight size={11} />
          <span>Switch to {isFaculty ? 'Student View' : 'Faculty View'}</span>
        </button>
      </div>

      {/* Dynamic Hub Render */}
      {isFaculty ? <TeacherClassDashboard /> : <StudentClassDashboard />}
    </div>
  );
}

export { TeacherClassDashboard, StudentClassDashboard };
