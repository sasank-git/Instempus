import React, { useState } from 'react';
import { useAppStore } from '../../services/store';
import { InClassHub } from '../../features/classroom/components/InClassHub';
import {
  BookOpen,
  CalendarCheck,
  GraduationCap,
  Clock,
  DoorOpen,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Layers,
  MapPin,
  Calendar,
  Radio,
} from 'lucide-react';

const WEEKDAYS: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export function AcademicHubPage() {
  const { currentUser, currentRole, classrooms, scheduleBlocks, setActiveClassroomId } = useAppStore();

  const isTeacher = ['teacher', 'hod', 'principal', 'admin'].includes(
    currentUser.role || currentRole
  );

  // Compute current day of week (Monday-Friday, default to Monday on weekends)
  const getTodayWeekday = (): ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday') => {
    const day = new Date().getDay();
    if (day >= 1 && day <= 5) return WEEKDAYS[day - 1];
    return 'Monday';
  };

  const [selectedDay, setSelectedDay] = useState<
    'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
  >(getTodayWeekday());

  // Enrolled slot IDs for logged in student/teacher
  const enrolledSlotIds = new Set(
    classrooms
      .filter((cls) => {
        if (isTeacher) {
          return (
            cls.instructorId === currentUser.id ||
            cls.instructorName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0])
          );
        }
        return (cls.enrolledStudents || []).some(
          (s) => s.rollNo.trim().toUpperCase() === currentUser.rollNo?.trim().toUpperCase()
        );
      })
      .map((c) => c.id)
  );

  // Filter scheduleBlocks for selected day & enrolled slots
  const filteredBlocks = scheduleBlocks
    .filter((b) => b.dayOfWeek === selectedDay)
    .filter((b) => enrolledSlotIds.size === 0 || enrolledSlotIds.has(b.slotId))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const isSelectedDayToday = selectedDay === getTodayWeekday();

  return (
    <div className="space-y-6 pb-28 select-none font-sans max-w-lg mx-auto">
      {/* 1. TOP HEADER */}
      <div className="px-2 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Academic Hub
            </h1>
            <p className="text-xs text-zinc-400 font-normal mt-0.5">
              Master Timetable, Attendance & In-Class SectionSlots
            </p>
          </div>

          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {isTeacher ? 'Faculty Node' : 'Scholar Node'}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. THE MASTER TIMETABLE: HORIZONTAL 'TODAY'S SCHEDULE'         */}
      {/* ------------------------------------------------------------- */}
      <div className="px-1 space-y-3">
        {/* Section Title & Day Switcher */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <CalendarCheck size={16} className="text-indigo-400" />
            <h2 className="text-sm font-bold text-white font-sans">
              Master Timetable
            </h2>
            {isSelectedDayToday && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Today</span>
              </span>
            )}
          </div>

          <span className="text-[11px] font-mono text-zinc-400">
            {filteredBlocks.length} {filteredBlocks.length === 1 ? 'Lecture' : 'Lectures'}
          </span>
        </div>

        {/* Day Pills (Mon - Fri) */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-1 text-xs font-mono">
          {WEEKDAYS.map((d) => {
            const isToday = d === getTodayWeekday();
            const isSelected = d === selectedDay;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDay(d)}
                className={`py-1.5 px-3 rounded-xl font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800/80'
                }`}
              >
                <span>{d.slice(0, 3)}</span>
                {isToday && !isSelected && (
                  <span className="ml-1 text-[9px] text-emerald-400">•</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Horizontal Swipeable Timeline Cards */}
        {filteredBlocks.length === 0 ? (
          <div className="p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center text-xs text-zinc-500 font-mono">
            No lectures scheduled for {selectedDay}.
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 px-1">
            {filteredBlocks.map((block, idx) => {
              // Glowing 'Live/Next' indicator for upcoming lecture
              const isNextOrLive = isSelectedDayToday && idx === 0;

              return (
                <div
                  key={block.id}
                  onClick={() => setActiveClassroomId(block.slotId)}
                  className={`min-w-[270px] max-w-[290px] p-4 rounded-3xl border backdrop-blur-xl shadow-xl space-y-3 shrink-0 cursor-pointer active:scale-[0.99] transition-all group ${
                    isNextOrLive
                      ? 'bg-zinc-900/80 border-indigo-500/50 ring-1 ring-indigo-500/30'
                      : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  {/* Card Header: Time & Indicator */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-200">
                      <Clock size={13} className="text-indigo-400 shrink-0" />
                      <span>{block.startTime} - {block.endTime}</span>
                    </div>

                    {isNextOrLive ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 animate-pulse">
                        <Radio size={10} className="text-emerald-400" />
                        <span>NEXT LECTURE</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {block.subjectCode}
                      </span>
                    )}
                  </div>

                  {/* Subject Title */}
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 leading-snug">
                      {block.subjectName}
                    </h3>
                    <span className="text-xs text-zinc-400 block mt-0.5">
                      {block.teacherName}
                    </span>
                  </div>

                  {/* Room Location & Jump Pill */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <div className="flex items-center gap-1.5 truncate max-w-[190px]">
                      <MapPin size={12} className="text-zinc-500 shrink-0" />
                      <span className="truncate">{block.roomName}</span>
                    </div>

                    <div className="flex items-center text-indigo-400 font-bold shrink-0 text-[10px] gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <span>Open</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. IN-CLASS HUB INTERACTIVE COMPONENT                          */}
      {/* ------------------------------------------------------------- */}
      <div className="px-1">
        <InClassHub />
      </div>
    </div>
  );
}
