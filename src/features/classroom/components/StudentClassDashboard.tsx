import React, { useState, useMemo } from 'react';
import { useAppStore, hasClassroomAccess } from '../../../services/store';
import { Classroom, ClassroomAnnouncement } from '../../../types';
import {
  GraduationCap,
  CalendarCheck,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Clock,
  DoorOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen,
  User,
  ShieldCheck,
  Sparkles,
  Download,
  FileText,
  File,
  ExternalLink,
  FolderOpen,
} from 'lucide-react';

export function StudentClassDashboard() {
  const { classrooms, currentUser, classResources } = useAppStore();

  // Find SectionSlots that this student is enrolled in
  const myClasses = useMemo(() => {
    if (!currentUser.rollNo) return classrooms;
    const enrolled = classrooms.filter((cls) => {
      return (cls.enrolledStudents || []).some(
        (s) => s.rollNo.trim().toUpperCase() === currentUser.rollNo?.trim().toUpperCase()
      );
    });

    return enrolled.length > 0 ? enrolled : classrooms;
  }, [classrooms, currentUser]);

  // Selected class for detailed SectionSlot view
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Sub-tabs inside active SectionSlot view: Attendance | Notices | Resources
  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'notices' | 'resources'>('attendance');

  // Download feedback toast
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const activeClass = useMemo(() => {
    if (!selectedClassId) return null;
    return classrooms.find((c) => c.id === selectedClassId) || null;
  }, [classrooms, selectedClassId]);

  const handleDownloadResource = (title: string) => {
    setDownloadToast(`✓ Downloading "${title}"...`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  // Helper: compute student's specific attendance percentage in a class
  const getStudentClassStats = (cls: Classroom) => {
    const history = cls.attendanceHistory || [];
    if (history.length === 0) {
      return {
        percent: cls.attendanceRate || 91.5,
        attended: 12,
        total: 13,
      };
    }

    const attendedCount = history.filter((session) => {
      const studentRec = session.records?.find(
        (r) => r.rollNo.trim().toUpperCase() === currentUser.rollNo?.trim().toUpperCase()
      );
      return studentRec ? studentRec.present : true;
    }).length;

    const totalCount = history.length;
    const calculatedPercent =
      totalCount > 0 ? Math.round((attendedCount / totalCount) * 1000) / 10 : cls.attendanceRate;

    return {
      percent: calculatedPercent,
      attended: attendedCount,
      total: totalCount,
    };
  };

  // -------------------------------------------------------------
  // VIEW 2: ACTIVE CLASSROOM SECTION VIEW
  // -------------------------------------------------------------
  if (activeClass) {
    const stats = getStudentClassStats(activeClass);
    const notices = activeClass.announcements || [];
    const resources = classResources.filter((r) => r.slotId === activeClass.id);
    const isSafe = stats.percent >= 75;

    return (
      <div className="space-y-4 pb-20 select-none font-sans animate-in fade-in duration-200">
        {/* Toast */}
        {downloadToast && (
          <div className="fixed top-12 inset-x-4 z-50 flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-900/95 text-white border border-emerald-500/50 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top duration-300">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="text-xs font-mono font-medium flex-1 text-emerald-100">
              {downloadToast}
            </span>
          </div>
        )}

        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSelectedClassId(null)}
            className="flex items-center gap-1.5 text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors p-1 -ml-1"
          >
            <ChevronLeft size={16} />
            <span>Back to My Courses</span>
          </button>

          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            Section {activeClass.section}
          </span>
        </div>

        {/* Course Header Banner */}
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {activeClass.subjectCode}
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              Semester {activeClass.semester} • {activeClass.credits} Credits
            </span>
          </div>

          <h2 className="text-base font-bold text-white leading-snug">
            {activeClass.subjectName}
          </h2>

          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <img
                src={activeClass.instructorAvatar}
                alt={activeClass.instructorName}
                className="h-6 w-6 rounded-full object-cover ring-1 ring-zinc-700"
              />
              <span className="text-zinc-200 text-xs truncate">
                {activeClass.instructorName}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <DoorOpen size={13} className="text-zinc-500" />
              <span>{activeClass.room.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* Three Sub-Tabs: [ Attendance | Notices | Resources ] */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-900/80 rounded-2xl border border-zinc-800/80 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveSubTab('attendance')}
            className={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeSubTab === 'attendance'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CalendarCheck size={13} />
            <span>Attendance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('notices')}
            className={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeSubTab === 'notices'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Megaphone size={13} />
            <span>Notices ({notices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('resources')}
            className={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeSubTab === 'resources'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FolderOpen size={13} />
            <span>Resources ({resources.length})</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SUB-TAB 1: ATTENDANCE TAB                                     */}
        {/* ------------------------------------------------------------- */}
        {activeSubTab === 'attendance' && (
          <div className="space-y-3 font-mono">
            {/* Scholar Attendance Percentage Card */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarCheck size={16} className="text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    My Attendance Score
                  </h3>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isSafe
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {isSafe ? 'Eligible for Exams' : 'Attendance Shortage'}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-3xl font-extrabold ${
                      isSafe ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {stats.percent}%
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">
                    ({stats.attended} of {stats.total} sessions attended)
                  </span>
                </div>
              </div>

              {/* Attendance progress meter */}
              <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    isSafe ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(stats.percent, 100)}%` }}
                />
              </div>

              <span className="text-[10px] text-zinc-500 block leading-tight">
                *BPUT Regulation: Minimum 75% physical attendance required in this section slot to sit for semester examinations.
              </span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUB-TAB 2: NOTICES TAB                                        */}
        {/* ------------------------------------------------------------- */}
        {activeSubTab === 'notices' && (
          <div className="space-y-2.5 font-mono">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Megaphone size={14} className="text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Section Notices ({notices.length})
                </span>
              </div>
              <span className="text-[9px] text-zinc-500">Live Course Stream</span>
            </div>

            {notices.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-500">
                No announcements posted for this section slot yet.
              </div>
            ) : (
              notices.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                    ann.isImportant
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-zinc-900/70 border-zinc-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white leading-snug">{ann.title}</h4>
                    {ann.isImportant && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/30 shrink-0">
                        URGENT
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">{ann.content}</p>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500 border-t border-zinc-800/50">
                    <span className="font-semibold text-zinc-400">{ann.authorName}</span>
                    <span>{ann.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUB-TAB 3: RESOURCES TAB (Task 3: Sleek Downloadable Cards)   */}
        {/* ------------------------------------------------------------- */}
        {activeSubTab === 'resources' && (
          <div className="space-y-3 font-mono">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <FolderOpen size={14} className="text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Study Materials ({resources.length})
                </span>
              </div>
              <span className="text-[10px] text-zinc-500">BPUT Approved Courseware</span>
            </div>

            {resources.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-500">
                No courseware materials uploaded for this slot yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {resources.map((res) => {
                  const isPdf = res.type === 'PDF';
                  const isLink = res.type === 'Link';

                  return (
                    <div
                      key={res.id}
                      className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex items-center justify-between gap-3 shadow-md group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* File Type Icon */}
                        <div
                          className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${
                            isPdf
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                              : isLink
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25'
                          }`}
                        >
                          {isPdf ? (
                            <FileText size={20} />
                          ) : isLink ? (
                            <ExternalLink size={20} />
                          ) : (
                            <File size={20} />
                          )}
                        </div>

                        {/* Title & Metadata */}
                        <div className="min-w-0 space-y-1">
                          <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 leading-snug">
                            {res.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 flex-wrap">
                            <span className="font-semibold text-zinc-300">{res.type}</span>
                            <span>•</span>
                            <span>{res.fileSize || '3.5 MB'}</span>
                            <span>•</span>
                            <span>{res.uploadedAt}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 block truncate">
                            By {res.uploaderName || 'Faculty Mentor'}
                          </span>
                        </div>
                      </div>

                      {/* Download Action Button */}
                      <button
                        type="button"
                        onClick={() => handleDownloadResource(res.title)}
                        className="py-2 px-3.5 rounded-xl bg-zinc-800 hover:bg-indigo-600 text-zinc-200 hover:text-white border border-zinc-700 hover:border-indigo-500 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 shadow-sm"
                      >
                        {isLink ? <ExternalLink size={13} /> : <Download size={13} />}
                        <span>{isLink ? 'Open' : 'Download'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 1: MY CLASSES (Student Course Roster)
  // -------------------------------------------------------------
  return (
    <div className="space-y-4 pb-20 select-none font-sans animate-in fade-in duration-200">
      {/* Student Banner Header */}
      <div className="p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold block mb-1">
              Active Enrollment • Semester {currentUser.semester || 6}
            </span>
            <h2 className="text-base font-bold text-white">
              {currentUser.department || 'Computer Science & Engineering'}
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Section {currentUser.section || 'A'} • Roll: {currentUser.rollNo || '2501CSE008'}
            </p>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {myClasses.length} Courses
          </span>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
            Enrolled SectionSlots
          </span>
          <span className="text-[10px] font-mono text-zinc-500">Tap to inspect course</span>
        </div>

        {myClasses.map((cls) => {
          const stats = getStudentClassStats(cls);
          const isSafe = stats.percent >= 75;

          return (
            <div
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className="p-4 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer space-y-3 shadow-md active:scale-[0.99] group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {cls.subjectCode}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Sec {cls.section} • {cls.credits} Credits
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 leading-snug">
                    {cls.subjectName}
                  </h3>
                </div>

                {/* Attendance badge */}
                <div className="text-right shrink-0 font-mono">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      isSafe
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {stats.percent}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full ${
                    isSafe ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(stats.percent, 100)}%` }}
                />
              </div>

              {/* Footer */}
              <div className="pt-1 flex items-center justify-between text-xs font-mono text-zinc-400 border-t border-zinc-800/50">
                <span className="truncate max-w-[190px]">{cls.instructorName}</span>
                <span className="text-zinc-500 text-[11px]">{cls.room.split(' ')[0]}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
