import { useState } from 'react';
import { useAppStore, hasClassroomAccess } from '../../services/store';
import { Classroom, ClassroomNote, Role } from '../../types';
import {
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Clock,
  FileText,
  Users,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  ShieldCheck,
  Megaphone,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { NoteViewerModal } from './NoteViewerModal';
import { UploadNoteModal } from './UploadNoteModal';
import { AccessDeniedModal } from './AccessDeniedModal';
import { InClassHub } from '../../features/classroom/components/InClassHub';

export function ClassroomScreen() {
  const {
    classrooms,
    activeClassroomId,
    setActiveClassroomId,
    currentUser,
    currentRole,
    setRole,
    markClassroomAttendance,
    toggleClassroomStudentAttendance,
    markAllClassroomAttendance,
    addClassroomNote,
    incrementNoteDownload,
    addClassroomAnnouncement,
  } = useAppStore();

  // Selected tab inside a classroom
  const [activeTab, setActiveClassroomTab] = useState<
    'attendance' | 'notes' | 'timetable' | 'announcements' | 'roster'
  >('attendance');

  // Modals state
  const [selectedNoteForView, setSelectedNoteForView] = useState<ClassroomNote | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deniedClassroom, setDeniedClassroom] = useState<Classroom | null>(null);
  const [deniedReason, setDeniedReason] = useState<string>('');

  // Attendance Form State (for faculty)
  const [attendanceDate, setAttendanceDate] = useState('2026-10-01');
  const [attendanceSlot, setAttendanceSlot] = useState('Period 2 (10:00 AM - 11:00 AM)');
  const [attendanceTopic, setAttendanceTopic] = useState('Vector Clocks & Raft Consensus Algorithm');
  const [attendanceSuccessToast, setAttendanceSuccessToast] = useState('');
  const [downloadToast, setDownloadToast] = useState('');

  // Notes Search & Filter
  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('All');

  // Timetable Selected Day
  const [selectedDay, setSelectedDay] = useState<
    'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
  >('Monday');

  // Directory filter: 'my' vs 'all'
  const [directoryFilter, setDirectoryFilter] = useState<'my' | 'all'>('my');

  // Announcement Form State
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnImportant, setNewAnnImportant] = useState(false);
  const [isPostingAnn, setIsPostingAnn] = useState(false);

  // Hub Mode: Defaults to In-Class Hub (Attendance & Notices)
  const [screenMode, setScreenMode] = useState<'in_class_hub' | 'repository'>('in_class_hub');

  // Active classroom reference
  const currentClassroom = classrooms.find((c) => c.id === activeClassroomId) || null;

  // Filter classrooms user is allowed to access
  const myClassrooms = classrooms.filter((cls) => {
    const access = hasClassroomAccess(currentUser, cls);
    return access.hasAccess;
  });

  const displayClassrooms = directoryFilter === 'my' ? myClassrooms : classrooms;

  // Non-academic role guard banner check
  const isAcademicRole = ['student', 'teacher', 'hod', 'admin', 'principal'].includes(currentRole);

  const handleSelectClassroom = (cls: Classroom) => {
    const access = hasClassroomAccess(currentUser, cls);
    if (!access.hasAccess) {
      setDeniedClassroom(cls);
      setDeniedReason(access.reason || 'Access denied: You do not belong to this classroom.');
      return;
    }
    setActiveClassroomId(cls.id);
  };

  const handleDownloadNote = (note: ClassroomNote) => {
    if (!currentClassroom) return;
    incrementNoteDownload(currentClassroom.id, note.id);
    setDownloadToast(`Downloaded: ${note.fileName}`);
    setTimeout(() => setDownloadToast(''), 3000);
  };

  const handleAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClassroom) return;

    const records = currentClassroom.enrolledStudents.map((st) => ({
      rollNo: st.rollNo,
      studentName: st.name,
      present: st.present ?? true,
    }));

    markClassroomAttendance(
      currentClassroom.id,
      attendanceDate,
      attendanceSlot,
      attendanceTopic,
      records
    );

    setAttendanceSuccessToast('Attendance submitted and digitally signed successfully!');
    setTimeout(() => setAttendanceSuccessToast(''), 3500);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClassroom || !newAnnTitle.trim() || !newAnnContent.trim()) return;

    addClassroomAnnouncement(
      currentClassroom.id,
      newAnnTitle.trim(),
      newAnnContent.trim(),
      newAnnImportant
    );

    setNewAnnTitle('');
    setNewAnnContent('');
    setNewAnnImportant(false);
    setIsPostingAnn(false);
  };

  // -------------------------------------------------------------
  // PRIMARY VIEW: IN-CLASS HUB (Attendance & Notices for Isolated SectionSlots)
  // -------------------------------------------------------------
  if (screenMode === 'in_class_hub') {
    return (
      <div className="space-y-4 pb-20 select-none text-white font-sans">
        {/* Header with Mode Switcher to Secondary Course Repos */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <GraduationCap size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                In-Class Hub
              </h2>
              <p className="text-[10px] text-zinc-400 font-mono">
                SectionSlot Attendance & Noticeboard
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setScreenMode('repository')}
            className="text-[10px] font-mono text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-800 transition-colors"
          >
            Notes & Syllabus →
          </button>
        </div>

        {/* Dynamic In-Class Hub routing (TeacherClassDashboard or StudentClassDashboard) */}
        <InClassHub />
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 1: CLASSROOM DIRECTORY (When in repository mode)
  // -------------------------------------------------------------
  if (!currentClassroom) {
    return (
      <div className="space-y-4 pb-20 select-none text-white">
        {/* Header with Back to In-Class Hub */}
        <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-2.5">
          <button
            type="button"
            onClick={() => setScreenMode('in_class_hub')}
            className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <ChevronLeft size={15} />
            <span>Back to In-Class Hub</span>
          </button>

          <span className="text-[9px] font-mono uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
            COURSE REPOSITORY
          </span>
        </div>

        {/* Non-Academic Role Warning */}
        {!isAcademicRole && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-amber-200 block">
                  Limited Classroom Access
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  You are logged in as{' '}
                  <span className="font-mono text-white font-bold">{currentRole}</span>.
                  Classroom sessions, attendance registers, and lecture notes are restricted to
                  enrolled students and teaching faculty.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setRole('student')}
                className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] font-mono transition-colors"
              >
                Switch to Student (Arya)
              </button>
              <button
                onClick={() => setRole('teacher')}
                className="px-2.5 py-1 rounded bg-[#222] hover:bg-[#333] text-slate-200 font-bold text-[10px] font-mono transition-colors"
              >
                Switch to Teacher (Prof. Sneha)
              </button>
            </div>
          </div>
        )}

        {/* Academic Role Performance Card */}
        {currentRole === 'student' && (
          <div className="p-3.5 bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">
                  Scholar Academic Standing
                </span>
                <h3 className="text-xs font-bold text-white">
                  {currentUser.name} ({currentUser.rollNo})
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                Safe (≥75% Criteria)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#1a1a1a]">
              <div className="bg-[#141414] p-2 rounded-lg border border-[#222]">
                <span className="text-[9px] text-slate-400 block font-mono">Enrolled Classes</span>
                <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                  {myClassrooms.length} Courses
                </span>
              </div>
              <div className="bg-[#141414] p-2 rounded-lg border border-[#222]">
                <span className="text-[9px] text-slate-400 block font-mono">Avg Attendance</span>
                <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
                  91.3%
                </span>
              </div>
              <div className="bg-[#141414] p-2 rounded-lg border border-[#222]">
                <span className="text-[9px] text-slate-400 block font-mono">Study Notes</span>
                <span className="text-sm font-bold text-indigo-400 font-mono mt-0.5 block">
                  {myClassrooms.reduce((acc, c) => acc + c.notes.length, 0)} Files
                </span>
              </div>
            </div>
          </div>
        )}

        {currentRole === 'teacher' && (
          <div className="p-3.5 bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-indigo-400 uppercase block font-bold">
                  Faculty Instruction Roster
                </span>
                <h3 className="text-xs font-bold text-white">
                  {currentUser.name} ({currentUser.employeeId})
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-500/30">
                {currentUser.department?.split(' ')[0]} Department
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#1a1a1a]">
              <div className="bg-[#141414] p-2 rounded-lg border border-[#222]">
                <span className="text-[9px] text-slate-400 block font-mono">Teaching Classes</span>
                <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                  {myClassrooms.length} Sections
                </span>
              </div>
              <div className="bg-[#141414] p-2 rounded-lg border border-[#222]">
                <span className="text-[9px] text-slate-400 block font-mono">Class Attendance</span>
                <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
                  93.0%
                </span>
              </div>
              <div className="bg-[#141414] p-2 rounded-lg border border-[#222]">
                <span className="text-[9px] text-slate-400 block font-mono">Shared Notes</span>
                <span className="text-sm font-bold text-indigo-400 font-mono mt-0.5 block">
                  {myClassrooms.reduce((acc, c) => acc + c.notes.length, 0)} Uploads
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Directory Toggle: My Classes vs All Classes */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 p-1 bg-[#121212] rounded-lg border border-[#222]">
            <button
              onClick={() => setDirectoryFilter('my')}
              className={`px-3 py-1 rounded text-xs font-bold font-mono transition-colors ${
                directoryFilter === 'my'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Enrolled / Assigned ({myClassrooms.length})
            </button>
            <button
              onClick={() => setDirectoryFilter('all')}
              className={`px-3 py-1 rounded text-xs font-bold font-mono transition-colors ${
                directoryFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All College Classes ({classrooms.length})
            </button>
          </div>

          <span className="text-[9px] font-mono text-slate-500">
            {directoryFilter === 'my' ? 'Filtered by enrollment' : 'Test access control'}
          </span>
        </div>

        {/* Classroom List */}
        <div className="space-y-3">
          {displayClassrooms.map((cls) => {
            const access = hasClassroomAccess(currentUser, cls);
            const isAuthorized = access.hasAccess;

            return (
              <div
                key={cls.id}
                onClick={() => handleSelectClassroom(cls)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isAuthorized
                    ? 'bg-[#101010] border-[#222] hover:border-indigo-500/50 hover:bg-[#141414]'
                    : 'bg-[#120d0e] border-rose-500/20 hover:border-rose-500/40 opacity-90'
                }`}
              >
                {/* Top badges */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {cls.subjectCode}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Sem {cls.semester} • Sec {cls.section}
                    </span>
                  </div>

                  {isAuthorized ? (
                    <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <Unlock size={11} />
                      {access.roleInClass === 'teacher'
                        ? 'Instructor'
                        : access.roleInClass === 'student'
                        ? 'Enrolled'
                        : 'Oversight'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      <Lock size={11} />
                      Restricted
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xs font-bold text-white mt-1.5 group-hover:text-indigo-300 transition-colors">
                  {cls.subjectName}
                </h3>

                {/* Info row */}
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                  <span className="truncate">{cls.room}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-300">{cls.timeSlot}</span>
                </div>

                {/* Instructor & Stats */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1c1c1c] text-[10px]">
                  <div className="flex items-center gap-2">
                    <img
                      src={cls.instructorAvatar}
                      alt={cls.instructorName}
                      className="h-5 w-5 rounded-full object-cover border border-[#333]"
                    />
                    <span className="text-slate-300 font-medium">{cls.instructorName}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400">
                      {cls.enrolledStudents.length} Students
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {cls.attendanceRate}% Att.
                    </span>
                    <ChevronRight size={14} className="text-slate-600 group-hover:text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Access Denied Modal */}
        <AccessDeniedModal
          classroom={deniedClassroom}
          reason={deniedReason}
          onClose={() => setDeniedClassroom(null)}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: ACTIVE CLASSROOM WORKSPACE
  // -------------------------------------------------------------
  const access = hasClassroomAccess(currentUser, currentClassroom);
  const isInstructor = access.roleInClass === 'teacher';
  const isStudent = access.roleInClass === 'student';

  // Compute student-specific attendance stats
  const studentSessions = currentClassroom.attendanceHistory.map((s) => {
    const studentRecord = s.records.find((r) => r.rollNo === currentUser.rollNo);
    return {
      ...s,
      studentPresent: studentRecord ? studentRecord.present : false,
    };
  });

  const studentAttendedCount = studentSessions.filter((s) => s.studentPresent).length;
  const studentTotalSessions = studentSessions.length;
  const studentAttendancePercent =
    studentTotalSessions > 0
      ? Math.round((studentAttendedCount / studentTotalSessions) * 1000) / 10
      : currentClassroom.attendanceRate;

  // Filter notes by search and unit
  const filteredNotes = currentClassroom.notes.filter((note) => {
    const matchesUnit =
      selectedUnitFilter === 'All' ||
      note.unit.toLowerCase().includes(selectedUnitFilter.toLowerCase());
    const matchesSearch =
      !noteSearchQuery ||
      note.title.toLowerCase().includes(noteSearchQuery.toLowerCase()) ||
      note.description.toLowerCase().includes(noteSearchQuery.toLowerCase()) ||
      note.tags.some((t) => t.toLowerCase().includes(noteSearchQuery.toLowerCase()));
    return matchesUnit && matchesSearch;
  });

  // Extract units for filter pills
  const availableUnits = [
    'All',
    ...Array.from(new Set(currentClassroom.notes.map((n) => n.unit.split(':')[0]))),
  ];

  // Filter timetable by day
  const daySchedule = currentClassroom.timetable.filter((slot) => slot.day === selectedDay);

  return (
    <div className="space-y-4 pb-24 select-none text-white animate-in fade-in duration-150">
      {/* Toast notifications */}
      {attendanceSuccessToast && (
        <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 shadow-lg animate-in slide-in-from-top duration-200">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{attendanceSuccessToast}</span>
        </div>
      )}

      {downloadToast && (
        <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/40 rounded-lg text-indigo-300 text-xs font-mono font-bold flex items-center gap-2 shadow-lg animate-in slide-in-from-top duration-200">
          <Download size={16} className="shrink-0" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Classroom Banner & Navigation */}
      <div className="bg-[#0e0e0e] border border-[#1e1e1e] rounded-xl p-3.5 space-y-3">
        {/* Back and Badges */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveClassroomId(null)}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white font-mono transition-colors"
          >
            <ChevronLeft size={16} />
            <span>All Classrooms</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase">
              {currentClassroom.subjectCode}
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
              {isInstructor ? 'Course Faculty' : isStudent ? 'Enrolled Scholar' : 'Supervision'}
            </span>
          </div>
        </div>

        {/* Title & Instructor */}
        <div>
          <h2 className="text-sm font-bold text-white leading-tight">
            {currentClassroom.subjectName}
          </h2>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Semester {currentClassroom.semester} • Section {currentClassroom.section} • {currentClassroom.room}
          </p>
        </div>

        {/* Instructor Card */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <img
              src={currentClassroom.instructorAvatar}
              alt={currentClassroom.instructorName}
              className="h-6 w-6 rounded-full object-cover border border-[#333]"
            />
            <div>
              <span className="text-[11px] font-bold text-slate-200 block">
                {currentClassroom.instructorName}
              </span>
              <span className="text-[9px] text-slate-400 font-mono block">
                {currentClassroom.instructorEmail}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-mono text-slate-400 uppercase block">Roster</span>
            <span className="text-xs font-mono font-bold text-white">
              {currentClassroom.enrolledStudents.length} Students
            </span>
          </div>
        </div>
      </div>

      {/* Classroom Navigation Tabs */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-[#121212] rounded-xl border border-[#222]">
        <button
          onClick={() => setActiveClassroomTab('attendance')}
          className={`py-1.5 rounded-lg text-center font-mono text-[10px] font-bold transition-all flex flex-col items-center gap-0.5 ${
            activeTab === 'attendance'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CalendarCheck size={14} />
          <span>Attendance</span>
        </button>

        <button
          onClick={() => setActiveClassroomTab('notes')}
          className={`py-1.5 rounded-lg text-center font-mono text-[10px] font-bold transition-all flex flex-col items-center gap-0.5 ${
            activeTab === 'notes'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText size={14} />
          <span>Notes ({currentClassroom.notes.length})</span>
        </button>

        <button
          onClick={() => setActiveClassroomTab('timetable')}
          className={`py-1.5 rounded-lg text-center font-mono text-[10px] font-bold transition-all flex flex-col items-center gap-0.5 ${
            activeTab === 'timetable'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock size={14} />
          <span>Timetable</span>
        </button>

        <button
          onClick={() => setActiveClassroomTab('announcements')}
          className={`py-1.5 rounded-lg text-center font-mono text-[10px] font-bold transition-all flex flex-col items-center gap-0.5 ${
            activeTab === 'announcements'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Megaphone size={14} />
          <span>Stream</span>
        </button>

        <button
          onClick={() => setActiveClassroomTab('roster')}
          className={`py-1.5 rounded-lg text-center font-mono text-[10px] font-bold transition-all flex flex-col items-center gap-0.5 ${
            activeTab === 'roster'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users size={14} />
          <span>Roster</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW A: ATTENDANCE TAB                                    */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* TEACHER ATTENDANCE MARKING INTERFACE */}
          {isInstructor ? (
            <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl p-3.5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-2">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Take Lecture Attendance
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Digital Roll Call Register & Verification
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px]">
                  {currentClassroom.attendanceRate}% Present
                </span>
              </div>

              {/* Form Controls */}
              <form onSubmit={handleAttendanceSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">
                      Session Date
                    </label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="w-full bg-[#161616] border border-[#2a2a2a] rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">
                      Time Slot
                    </label>
                    <select
                      value={attendanceSlot}
                      onChange={(e) => setAttendanceSlot(e.target.value)}
                      className="w-full bg-[#161616] border border-[#2a2a2a] rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Period 1 (09:00 AM - 10:00 AM)">Period 1 (09:00 - 10:00 AM)</option>
                      <option value="Period 2 (10:00 AM - 11:00 AM)">Period 2 (10:00 - 11:00 AM)</option>
                      <option value="Period 3 (11:15 AM - 12:15 PM)">Period 3 (11:15 - 12:15 PM)</option>
                      <option value="Lab Slot (02:00 PM - 05:00 PM)">Lab Slot (02:00 - 05:00 PM)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">
                    Lecture Syllabus Topic
                  </label>
                  <input
                    type="text"
                    value={attendanceTopic}
                    onChange={(e) => setAttendanceTopic(e.target.value)}
                    placeholder="e.g. Paxos Consensus & Quorum Slices"
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Quick actions for roll call */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-slate-400">
                    Roll Call ({currentClassroom.enrolledStudents.filter((s) => s.present).length}/
                    {currentClassroom.enrolledStudents.length} Present):
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => markAllClassroomAttendance(currentClassroom.id, true)}
                      className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors"
                    >
                      All Present
                    </button>
                    <button
                      type="button"
                      onClick={() => markAllClassroomAttendance(currentClassroom.id, false)}
                      className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition-colors"
                    >
                      All Absent
                    </button>
                  </div>
                </div>

                {/* Student roll grid */}
                <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto no-scrollbar pt-1">
                  {currentClassroom.enrolledStudents.map((st) => (
                    <button
                      type="button"
                      key={st.rollNo}
                      onClick={() => toggleClassroomStudentAttendance(currentClassroom.id, st.rollNo)}
                      className={`flex items-center justify-between p-2 rounded text-left transition-all border ${
                        st.present
                          ? 'bg-[#101912] border-emerald-500/30 text-emerald-300'
                          : 'bg-[#1a1012] border-rose-500/30 text-rose-300'
                      }`}
                    >
                      <div className="truncate pr-1">
                        <span className="font-mono text-[9px] block text-slate-400 font-bold">
                          {st.rollNo}
                        </span>
                        <span className="font-semibold text-white text-[11px] truncate block">
                          {st.name}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/40">
                        {st.present ? 'P' : 'A'}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Digital Faculty Stamp */}
                <div className="p-2.5 bg-[#141414] rounded-lg border border-[#222] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-indigo-400">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-mono font-bold">Digital Faculty Stamp</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 truncate max-w-[200px]">
                    {currentUser.digitalSignature || `${currentUser.name} (Faculty Mentor)`}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <CalendarCheck size={14} />
                  <span>Lock & Submit Attendance</span>
                </button>
              </form>
            </div>
          ) : (
            /* STUDENT ATTENDANCE DASHBOARD */
            <div className="space-y-3">
              {/* Personal Percentage Banner */}
              <div className="p-4 bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">
                    My Course Attendance
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      {studentAttendancePercent}%
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({studentAttendedCount} of {studentTotalSessions || 3} sessions attended)
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-mono mt-1 block">
                    ✓ BPUT 75% Criteria Met • Eligible for End-Term Examination
                  </span>
                </div>

                <div className="h-12 w-12 rounded-full border-2 border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
                  {studentAttendancePercent >= 75 ? 'SAFE' : 'ALERT'}
                </div>
              </div>
            </div>
          )}

          {/* ATTENDANCE HISTORY LEDGER (Visible to both Faculty & Students) */}
          <div className="bg-[#0c0c0c] border border-[#1c1c1c] rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-2">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                Session History Log
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {currentClassroom.attendanceHistory.length} Sessions Recorded
              </span>
            </div>

            <div className="space-y-2">
              {currentClassroom.attendanceHistory.map((sess) => {
                // If student, check if this student was present
                const myRecord = sess.records.find((r) => r.rollNo === currentUser.rollNo);
                const isStudentPresent = myRecord ? myRecord.present : false;

                return (
                  <div
                    key={sess.id}
                    className="p-3 bg-[#121212] rounded-lg border border-[#1e1e1e] space-y-1.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[9px] text-indigo-400 font-bold block">
                          {sess.date} • {sess.timeSlot}
                        </span>
                        <h4 className="text-xs font-bold text-white mt-0.5">
                          {sess.topic || 'Regular Lecture'}
                        </h4>
                      </div>

                      {isStudent ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            isStudentPresent
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {isStudentPresent ? 'PRESENT ✓' : 'ABSENT ✕'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {sess.presentCount}/{sess.totalStudents} ({Math.round((sess.presentCount / sess.totalStudents) * 100)}%)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1 border-t border-[#181818]">
                      <span>Faculty: {sess.facultyName}</span>
                      <span>Verified: {sess.facultySignature?.slice(0, 24)}...</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW B: NOTES SHARING TAB                                 */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'notes' && (
        <div className="space-y-3.5">
          {/* Top Actions: Search + Upload Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={noteSearchQuery}
                onChange={(e) => setNoteSearchQuery(e.target.value)}
                placeholder="Search lecture notes, modules, formulas..."
                className="w-full bg-[#121212] border border-[#222] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-colors shrink-0"
            >
              <Plus size={14} />
              <span>Share Note</span>
            </button>
          </div>

          {/* Unit / Module Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {availableUnits.map((u) => (
              <button
                key={u}
                onClick={() => setSelectedUnitFilter(u)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono whitespace-nowrap transition-colors border ${
                  selectedUnitFilter === u
                    ? 'bg-white text-black font-bold border-white'
                    : 'bg-[#121212] text-slate-400 border-[#222] hover:text-white'
                }`}
              >
                {u}
              </button>
            ))}
          </div>

          {/* Notes Cards List */}
          <div className="space-y-2.5">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center bg-[#0d0d0d] rounded-xl border border-[#1a1a1a] text-slate-500">
                <FileText size={28} className="mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-bold text-slate-300">No lecture notes found</p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  Try adjusting search or upload study material
                </p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3.5 bg-[#0e0e0e] hover:bg-[#121212] border border-[#1e1e1e] hover:border-indigo-500/30 rounded-xl transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                        <FileText size={16} />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase block">
                          {note.unit}
                        </span>
                        <h4 className="text-xs font-bold text-white mt-0.5 leading-snug">
                          {note.title}
                        </h4>
                      </div>
                    </div>

                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#181818] text-slate-400 border border-[#282828]">
                      {note.fileType}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {note.description}
                  </p>

                  {/* Metadata and actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a] text-[10px]">
                    <div className="text-slate-400 font-mono">
                      <span>{note.uploadedBy}</span>
                      <span className="mx-1">•</span>
                      <span>{note.fileSize}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedNoteForView(note)}
                        className="px-2 py-1 rounded bg-[#1c1c1c] hover:bg-[#252525] text-slate-300 font-mono text-[10px] flex items-center gap-1 transition-colors"
                      >
                        <Eye size={12} />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => handleDownloadNote(note)}
                        className="px-2.5 py-1 rounded bg-indigo-600/90 hover:bg-indigo-600 text-white font-mono font-bold text-[10px] flex items-center gap-1 transition-colors shadow"
                      >
                        <Download size={12} />
                        <span>{note.downloadsCount}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW C: TIMETABLE TAB                                     */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'timetable' && (
        <div className="space-y-3.5">
          {/* Day of Week Selector */}
          <div className="grid grid-cols-6 gap-1 p-1 bg-[#121212] rounded-xl border border-[#222]">
            {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const).map(
              (day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`py-1.5 rounded-lg text-center font-mono text-[10px] font-bold transition-colors ${
                    selectedDay === day
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              )
            )}
          </div>

          {/* Schedule for this day */}
          <div className="space-y-2.5">
            {daySchedule.length === 0 ? (
              <div className="p-8 text-center bg-[#0d0d0d] rounded-xl border border-[#1a1a1a] text-slate-500">
                <Clock size={28} className="mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-bold text-slate-300">No lectures scheduled for {selectedDay}</p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  Designated academic project consultation / lab preparation hours
                </p>
              </div>
            ) : (
              daySchedule.map((slot, idx) => {
                const isLive = idx === 0 && selectedDay === 'Monday'; // Highlight first slot for live demo

                return (
                  <div
                    key={slot.id}
                    className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                      isLive
                        ? 'bg-[#0f1712] border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                        : 'bg-[#0e0e0e] border-[#1e1e1e]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-white">
                            {slot.timeSlot}
                          </span>
                          {isLive && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold animate-pulse">
                              ● LIVE NOW
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-white mt-1">{slot.topic}</h4>
                      </div>

                      <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase bg-[#181818] text-slate-300 border border-[#282828]">
                        {slot.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-[#1a1a1a]">
                      <span>{slot.room}</span>
                      <span>Faculty: {slot.facultyName}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW D: ANNOUNCEMENTS STREAM TAB                          */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'announcements' && (
        <div className="space-y-3.5">
          {/* Post announcement toggle for instructors */}
          {isInstructor && (
            <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl p-3 space-y-2.5">
              {!isPostingAnn ? (
                <button
                  onClick={() => setIsPostingAnn(true)}
                  className="w-full py-2 px-3 rounded-lg bg-[#181818] hover:bg-[#202020] text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#282828]"
                >
                  <Plus size={14} />
                  <span>Broadcast Class Announcement</span>
                </button>
              ) : (
                <form onSubmit={handleCreateAnnouncement} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase font-mono">
                      New Class Notice
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsPostingAnn(false)}
                      className="text-[10px] text-slate-400 hover:text-white font-mono"
                    >
                      Cancel
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Announcement Title (e.g. Lab Viva Schedule)"
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    className="w-full bg-[#161616] border border-[#262626] rounded px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />

                  <textarea
                    rows={2}
                    required
                    placeholder="Provide details, instructions, or deadlines..."
                    value={newAnnContent}
                    onChange={(e) => setNewAnnContent(e.target.value)}
                    className="w-full bg-[#161616] border border-[#262626] rounded px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                  />

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAnnImportant}
                        onChange={(e) => setNewAnnImportant(e.target.checked)}
                        className="rounded bg-[#1a1a1a] border-[#333] text-indigo-600"
                      />
                      <span>Pin as Urgent / Exam Alert</span>
                    </label>

                    <button
                      type="submit"
                      className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-colors"
                    >
                      Publish
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Announcements List */}
          <div className="space-y-2.5">
            {currentClassroom.announcements.length === 0 ? (
              <div className="p-8 text-center bg-[#0d0d0d] rounded-xl border border-[#1a1a1a] text-slate-500">
                <Megaphone size={28} className="mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-bold text-slate-300">No active class announcements</p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  Course updates and assignment reminders will appear here
                </p>
              </div>
            ) : (
              currentClassroom.announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-3.5 rounded-xl border space-y-1.5 ${
                    ann.isImportant
                      ? 'bg-[#181112] border-rose-500/30'
                      : 'bg-[#0e0e0e] border-[#1e1e1e]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      {ann.isImportant && (
                        <span className="text-[9px] font-mono uppercase font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 mb-1 inline-block">
                          Urgent Notice
                        </span>
                      )}
                      <h4 className="text-xs font-bold text-white">{ann.title}</h4>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">{ann.timestamp}</span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">{ann.content}</p>

                  <div className="text-[9px] font-mono text-slate-500 pt-1 border-t border-[#181818]">
                    Posted by: {ann.authorName} ({ann.authorRole.toUpperCase()})
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW E: CLASS ROSTER                                      */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'roster' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl">
            <div>
              <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">
                Registered Scholars
              </span>
              <h3 className="text-xs font-bold text-white">
                Section {currentClassroom.section} Student Enrollment Directory
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[10px]">
              {currentClassroom.enrolledStudents.length} Enrolled
            </span>
          </div>

          <div className="space-y-1.5">
            {currentClassroom.enrolledStudents.map((st) => (
              <div
                key={st.rollNo}
                className="flex items-center justify-between p-2.5 bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg"
              >
                <div>
                  <span className="text-xs font-bold text-white block">{st.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{st.rollNo}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                    {st.present ? 'Present in Roster' : 'Absent'}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">{st.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      <NoteViewerModal
        note={selectedNoteForView}
        onClose={() => setSelectedNoteForView(null)}
        onDownload={handleDownloadNote}
      />

      <UploadNoteModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={(noteData) => addClassroomNote(currentClassroom.id, noteData)}
        subjectCode={currentClassroom.subjectCode}
      />
    </div>
  );
}
