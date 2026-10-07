import React, { useState, useMemo } from 'react';
import { useAppStore, hasClassroomAccess } from '../../../services/store';
import { Classroom, ClassroomStudent } from '../../../types';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  XCircle,
  Megaphone,
  Calendar,
  Clock,
  Send,
  DoorOpen,
  Sparkles,
  BookOpen,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  Layers,
  ChevronRight,
  FolderOpen,
  FileText,
  File,
  ExternalLink,
  Download,
  Plus,
} from 'lucide-react';

export function TeacherClassDashboard() {
  const {
    classrooms,
    currentUser,
    currentRole,
    markClassroomAttendance,
    addClassroomAnnouncement,
    classResources,
    addClassResource,
  } = useAppStore();

  // Find classrooms assigned to this teacher (or fallback to all classrooms if admin/hod/testing)
  const teacherClasses = useMemo(() => {
    const assigned = classrooms.filter((cls) => {
      const access = hasClassroomAccess(currentUser, cls);
      return (
        access.roleInClass === 'teacher' ||
        cls.instructorId === currentUser.id ||
        cls.instructorName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]) ||
        ['admin', 'hod', 'principal'].includes(currentRole)
      );
    });

    return assigned.length > 0 ? assigned : classrooms;
  }, [classrooms, currentUser, currentRole]);

  // Selected Class ID (defaults to first available teacher class)
  const [selectedClassId, setSelectedClassId] = useState<string>(
    teacherClasses[0]?.id || classrooms[0]?.id || ''
  );

  // Active SectionSlot
  const currentClass = useMemo(() => {
    return classrooms.find((c) => c.id === selectedClassId) || teacherClasses[0] || classrooms[0];
  }, [classrooms, selectedClassId, teacherClasses]);

  // Hub Sub-Tab: 'attendance', 'notices', or 'resources'
  const [activeTab, setActiveTab] = useState<'attendance' | 'notices' | 'resources'>('attendance');

  // Resource Upload Modal State (Task 3)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceType, setResourceType] = useState<'PDF' | 'Link' | 'Document'>('PDF');
  const [resourceUrl, setResourceUrl] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUploadResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle.trim() || !currentClass) return;

    addClassResource({
      slotId: currentClass.id,
      title: resourceTitle.trim(),
      type: resourceType,
      url: resourceUrl.trim() || `https://bput.ac.in/materials/${resourceTitle.toLowerCase().replace(/\s+/g, '_')}`,
      fileSize: resourceType === 'Link' ? 'External Link' : '4.2 MB',
    });

    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setIsUploadModalOpen(false);
      setResourceTitle('');
      setResourceUrl('');
    }, 1200);
  };

  // -------------------------------------------------------------
  // ATTENDANCE STATE (Rapid-Fire Mobile Register)
  // -------------------------------------------------------------
  const [attendanceDate, setAttendanceDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [attendanceTimeSlot, setAttendanceTimeSlot] = useState(
    currentClass?.timeSlot || '10:00 AM - 11:30 AM'
  );
  const [lectureTopic, setLectureTopic] = useState('Dynamic Memory Allocation & Register Spilling');

  // Local student attendance map: { [rollNo]: boolean }
  const [studentAttendanceMap, setStudentAttendanceMap] = useState<Record<string, boolean>>(() => {
    const initialMap: Record<string, boolean> = {};
    if (currentClass?.enrolledStudents) {
      currentClass.enrolledStudents.forEach((st) => {
        initialMap[st.rollNo] = st.present !== false;
      });
    }
    return initialMap;
  });

  // Synchronize student attendance map when selected class changes
  React.useEffect(() => {
    if (currentClass?.enrolledStudents) {
      const initialMap: Record<string, boolean> = {};
      currentClass.enrolledStudents.forEach((st) => {
        initialMap[st.rollNo] = st.present !== false;
      });
      setStudentAttendanceMap(initialMap);
      setAttendanceTimeSlot(currentClass.timeSlot || '10:00 AM - 11:30 AM');
    }
  }, [currentClass?.id]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Rapid-fire toggle for a single scholar
  const handleToggleStudent = (rollNo: string) => {
    setStudentAttendanceMap((prev) => ({
      ...prev,
      [rollNo]: !prev[rollNo],
    }));
  };

  // Batch toggle: Mark all present
  const handleMarkAll = (present: boolean) => {
    if (!currentClass?.enrolledStudents) return;
    const newMap: Record<string, boolean> = {};
    currentClass.enrolledStudents.forEach((st) => {
      newMap[st.rollNo] = present;
    });
    setStudentAttendanceMap(newMap);
    showToast(present ? 'All scholars marked Present' : 'All scholars marked Absent');
  };

  // Submit Register
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClass) return;

    setIsSubmitting(true);

    const records = currentClass.enrolledStudents.map((st) => ({
      rollNo: st.rollNo,
      studentName: st.name,
      present: studentAttendanceMap[st.rollNo] !== false,
    }));

    setTimeout(() => {
      markClassroomAttendance(
        currentClass.id,
        attendanceDate,
        attendanceTimeSlot,
        lectureTopic.trim() || 'Scheduled Classroom Session',
        records
      );

      const presentCount = records.filter((r) => r.present).length;
      showToast(
        `Register Submitted: ${presentCount}/${records.length} scholars recorded for ${currentClass.subjectCode} (${currentClass.section})`
      );
      setIsSubmitting(false);
    }, 350);
  };

  // -------------------------------------------------------------
  // NOTICES STATE (SectionSlot Specific Announcement Composer)
  // -------------------------------------------------------------
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeIsImportant, setNoticeIsImportant] = useState(false);
  const [isPostingNotice, setIsPostingNotice] = useState(false);

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim() || !currentClass) return;

    setIsPostingNotice(true);
    setTimeout(() => {
      addClassroomAnnouncement(
        currentClass.id,
        noticeTitle.trim(),
        noticeContent.trim(),
        noticeIsImportant
      );

      showToast(`Notice broadcasted to SectionSlot ${currentClass.subjectCode} (${currentClass.section})`);
      setNoticeTitle('');
      setNoticeContent('');
      setNoticeIsImportant(false);
      setIsPostingNotice(false);
    }, 300);
  };

  // Metrics for current slot
  const enrolledStudents = currentClass?.enrolledStudents || [];
  const presentCount = enrolledStudents.filter(
    (st) => studentAttendanceMap[st.rollNo] !== false
  ).length;
  const absentCount = enrolledStudents.length - presentCount;
  const livePercent =
    enrolledStudents.length > 0
      ? Math.round((presentCount / enrolledStudents.length) * 100)
      : 0;

  return (
    <div className="space-y-4 pb-20 select-none font-sans animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-4 z-50 flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-900/95 text-white border border-emerald-500/50 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top duration-300">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-mono font-medium flex-1 text-emerald-100">
            {toastMessage}
          </span>
          <button onClick={() => setToastMessage(null)} className="text-zinc-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. FACULTY HEADER                                             */}
      {/* ------------------------------------------------------------- */}
      <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-indigo-500/40"
            />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                Faculty Hub
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Live Node</span>
            </div>
            <h2 className="text-sm font-bold text-white mt-0.5">{currentUser.name}</h2>
            <span className="text-[11px] text-zinc-400 font-mono block">
              {currentUser.department || 'Department of Computer Science'}
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. CLASS SELECTOR (Horizontal Scroll of Assigned Slots)       */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
            Assigned SectionSlots ({teacherClasses.length})
          </span>
          <span className="text-[9px] font-mono text-indigo-400">One-Handed Quick Select</span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
          {teacherClasses.map((cls) => {
            const isSelected = cls.id === currentClass?.id;
            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelectedClassId(cls.id)}
                className={`flex-shrink-0 text-left p-3 rounded-2xl border transition-all duration-150 min-w-[210px] max-w-[230px] ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                    : 'bg-zinc-900/60 hover:bg-zinc-900/90 border-zinc-800/80'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isSelected
                        ? 'bg-indigo-500 text-white shadow'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {cls.subjectCode}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Sec {cls.section}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white truncate">{cls.subjectName}</h4>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/60 text-[10px] font-mono text-zinc-400">
                  <span className="truncate">{cls.room.split(' ')[0]}</span>
                  <span className="font-semibold text-white">
                    {cls.enrolledStudents.length} Scholars
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. ACTIVE SECTIONSLOT BANNER & SEGMENT TABS                   */}
      {/* ------------------------------------------------------------- */}
      {currentClass && (
        <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-3">
          {/* Slot Metadata Pill */}
          <div className="flex items-start justify-between gap-2 border-b border-zinc-800/70 pb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {currentClass.subjectCode}
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  Section {currentClass.section}
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Sem {currentClass.semester}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5 leading-snug">
                {currentClass.subjectName}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1">
                  <DoorOpen size={11} className="text-zinc-500" />
                  {currentClass.room}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={11} className="text-zinc-500" />
                  {currentClass.timeSlot}
                </span>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-base font-bold text-white">{livePercent}%</span>
              <span className="text-[9px] text-zinc-400 block uppercase">Attendance</span>
            </div>
          </div>

          {/* Hub Segment Tabs: Attendance, Notices & Resources (Task 3) */}
          <div className="grid grid-cols-3 p-1 bg-zinc-950/80 rounded-xl border border-zinc-800/80 font-mono text-xs gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className={`py-2 px-1 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'attendance'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users size={13} />
              <span className="truncate">Attendance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notices')}
              className={`py-2 px-1 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'notices'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Megaphone size={13} />
              <span className="truncate">Notices ({currentClass.announcements?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('resources')}
              className={`py-2 px-1 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'resources'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FolderOpen size={13} />
              <span className="truncate">
                Resources ({classResources.filter((r) => r.slotId === currentClass.id).length})
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. TAB 1: ATTENDANCE TAB (Rapid-Fire Mobile Register)          */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'attendance' && currentClass && (
        <div className="space-y-3 font-mono">
          {/* Lecture Info & Quick Batch Buttons */}
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2.5 text-xs">
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                Lecture / Lab Topic:
              </label>
              <input
                type="text"
                value={lectureTopic}
                onChange={(e) => setLectureTopic(e.target.value)}
                placeholder="e.g. Quorum Systems, Paxos Consensus"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>

            {/* Batch Controls */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-zinc-400">
                Live: <strong className="text-emerald-400">{presentCount} Present</strong> /{' '}
                <strong className="text-rose-400">{absentCount} Absent</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleMarkAll(true)}
                  className="py-1 px-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-[10px] font-bold transition-all active:scale-95"
                >
                  All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll(false)}
                  className="py-1 px-2.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 text-[10px] font-bold transition-all active:scale-95"
                >
                  All Absent
                </button>
              </div>
            </div>
          </div>

          {/* Enrolled Scholars List (One-Handed Ergonomic Toggles) */}
          <div className="space-y-2">
            {enrolledStudents.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-500">
                No scholars currently enrolled in Section {currentClass.section}.
              </div>
            ) : (
              enrolledStudents.map((st) => {
                const isPresent = studentAttendanceMap[st.rollNo] !== false;

                return (
                  <div
                    key={st.rollNo}
                    onClick={() => handleToggleStudent(st.rollNo)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isPresent
                        ? 'bg-emerald-950/15 border-emerald-500/30 hover:border-emerald-500/50'
                        : 'bg-rose-950/15 border-rose-500/30 hover:border-rose-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isPresent
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {st.name.charAt(0)}
                      </div>

                      <div className="overflow-hidden">
                        <span className="text-xs font-semibold text-white block truncate">
                          {st.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono block">
                          {st.rollNo}
                        </span>
                      </div>
                    </div>

                    {/* Rapid-Fire Toggle Pill */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStudent(st.rollNo);
                      }}
                      className={`h-10 px-4 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                        isPresent
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                      }`}
                    >
                      {isPresent ? (
                        <>
                          <Check size={14} />
                          <span>PRESENT</span>
                        </>
                      ) : (
                        <>
                          <X size={14} />
                          <span>ABSENT</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Sticky Bottom Action: Submit Register */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitRegister}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              <span>
                {isSubmitting
                  ? 'Saving Register...'
                  : `Submit Register (${presentCount}/${enrolledStudents.length} Present)`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. TAB 2: NOTICES TAB (Tagged to this SectionSlot)            */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'notices' && currentClass && (
        <div className="space-y-4 font-mono">
          {/* Notice Composer */}
          <form
            onSubmit={handlePostNotice}
            className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-lg space-y-3 text-xs"
          >
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Megaphone size={14} />
              <span>Draft Section Notice</span>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                Notice Title *
              </label>
              <input
                type="text"
                required
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="e.g. Lab Report 3 Submission Window Extended"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                Notice Body / Instructions *
              </label>
              <textarea
                required
                rows={3}
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                placeholder="Write specific instructions for this SectionSlot scholars..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono text-xs leading-relaxed resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                <input
                  type="checkbox"
                  checked={noticeIsImportant}
                  onChange={(e) => setNoticeIsImportant(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
                <span className="text-[11px]">Flag as Priority / Urgent</span>
              </label>

              <button
                type="submit"
                disabled={isPostingNotice}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                <Send size={13} />
                <span>{isPostingNotice ? 'Broadcasting...' : 'Broadcast Notice'}</span>
              </button>
            </div>
          </form>

          {/* Timeline of Notices tagged to this SectionSlot */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Section Noticeboard ({currentClass.announcements?.length || 0})
              </span>
              <span className="text-[9px] text-zinc-500">
                Isolated to {currentClass.subjectCode} ({currentClass.section})
              </span>
            </div>

            {!currentClass.announcements || currentClass.announcements.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-500">
                No notices published for this SectionSlot yet.
              </div>
            ) : (
              currentClass.announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-1.5 ${
                    ann.isImportant
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-zinc-900/60 border-zinc-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white">{ann.title}</h4>
                    {ann.isImportant && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/30">
                        PRIORITY
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">{ann.content}</p>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500">
                    <span>{ann.authorName}</span>
                    <span>{ann.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. TAB 3: RESOURCES TAB (Study Material & Handouts)          */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'resources' && currentClass && (
        <div className="space-y-4 font-mono">
          {/* Header Action Row */}
          <div className="flex items-center justify-between px-1">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-white block">
                Classroom Courseware
              </span>
              <span className="text-[10px] text-zinc-400">
                Uploaded materials for {currentClass.subjectCode} ({currentClass.section})
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 active:scale-95 transition-all shrink-0"
            >
              <Plus size={14} />
              <span>+ Upload Material</span>
            </button>
          </div>

          {/* Resources List */}
          {(() => {
            const resources = classResources.filter((r) => r.slotId === currentClass.id);

            if (resources.length === 0) {
              return (
                <div className="p-8 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-500">
                  No materials uploaded for this SectionSlot yet. Tap '+ Upload Material' to share slides, syllabus, or lecture notes.
                </div>
              );
            }

            return (
              <div className="space-y-2.5">
                {resources.map((res) => {
                  const isPdf = res.type === 'PDF';
                  const isLink = res.type === 'Link';

                  return (
                    <div
                      key={res.id}
                      className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex items-center justify-between gap-3 shadow-md group"
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

                        {/* Details */}
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
                            By {res.uploaderName || 'Faculty Instructor'}
                          </span>
                        </div>
                      </div>

                      {/* View / Download Button */}
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3.5 rounded-xl bg-zinc-800 hover:bg-indigo-600 text-zinc-200 hover:text-white border border-zinc-700 hover:border-indigo-500 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 shadow-sm"
                      >
                        {isLink ? <ExternalLink size={13} /> : <Download size={13} />}
                        <span>{isLink ? 'Open' : 'Download'}</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Upload Material Modal for Teacher */}
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none font-sans animate-in fade-in duration-200">
              <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-t-[32px] sm:rounded-3xl p-6 space-y-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <FolderOpen size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Upload Class Material</h3>
                      <span className="text-xs text-zinc-400 font-mono">
                        {currentClass.subjectCode} • Section {currentClass.section}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>

                {uploadSuccess ? (
                  <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
                    <CheckCircle2 size={40} className="text-emerald-400 mx-auto animate-bounce" />
                    <h4 className="text-base font-bold text-white">Material Uploaded!</h4>
                    <p className="text-xs text-zinc-400 font-mono">
                      Scholars enrolled in this slot can now download it.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleUploadResource} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">Document Title *</label>
                      <input
                        type="text"
                        required
                        value={resourceTitle}
                        onChange={(e) => setResourceTitle(e.target.value)}
                        placeholder="e.g. Unit 3 Lecture Slides & Numerical Handouts"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">Resource Type *</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['PDF', 'Document', 'Link'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setResourceType(t)}
                            className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                              resourceType === t
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">Link or File Reference *</label>
                      <input
                        type="text"
                        required
                        value={resourceUrl}
                        onChange={(e) => setResourceUrl(e.target.value)}
                        placeholder="https://drive.google.com/... or /materials/notes.pdf"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      <span>Post to Course Resources</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
