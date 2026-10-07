import { useState } from 'react';
import { useAppStore } from '../../services/store';
import { Role, Language } from '../../types';
import {
  Printer,
  Calendar,
  Clock,
  PenTool,
  Check,
  Shield,
  Layers,
  ChevronDown,
  Settings,
} from 'lucide-react';
import { AndroidBottomSheet } from '../android/AndroidBottomSheet';
import { AccountSettingsSheet } from './AccountSettingsSheet';

export function RoleProfileScreen() {
  const {
    currentUser,
    currentRole,
    setRole,
    profiles,
    adminEditUserProfile,
    teacherClasses,
    toggleStudentAttendance,
    submitClassAttendance,
    saveTeacherDigitalSignature,
    applications,
    studentFees,
    approveApplication,
    gatePasses,
    language,
    setLanguage,
    toggleOffline,
    isOffline,
    auditLogs,
    setActiveTab,
    logout,
  } = useAppStore();

  const [activeTabLocal, setActiveTabLocal] = useState<'workflow' | 'id_card'>('workflow');
  const [isAdminEditOpen, setIsAdminEditOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [adminTargetRole, setAdminTargetRole] = useState<Role>('student');
  const [adminName, setAdminName] = useState(profiles.student.name);
  const [adminDept, setAdminDept] = useState(profiles.student.department);
  const [adminPhone, setAdminPhone] = useState(profiles.student.phone);

  // Attendance Date and Time Slot state for Instructor
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceSlot, setAttendanceSlot] = useState(
    'Period 2 (10:00 AM - 11:00 AM)'
  );

  const [signatureText, setSignatureText] = useState(
    currentUser.digitalSignature || `${currentUser.name} (Faculty Mentor, CSE)`
  );
  const [sigSaved, setSigSaved] = useState(false);

  const rolesList: { id: Role; label: string; desc: string }[] = [
    { id: 'student', label: 'Arya Pattnayak', desc: 'Scholar (2501CSE008)' },
    { id: 'teacher', label: 'Prof. Sneha Mohanty', desc: 'Faculty Mentor, CSE' },
    { id: 'hod', label: 'Dr. Rajesh Senapati', desc: 'HOD, Computer Science' },
    { id: 'warden', label: 'Mr. Niranjan Sahu', desc: 'Chief Warden, Block A' },
    { id: 'security', label: 'Pradeep Rout', desc: 'Security Officer, Gate 1' },
    { id: 'admin', label: 'Campus Administrator', desc: 'Dean Operations (God Mode)' },
  ];

  const handleAdminSave = (e: React.FormEvent) => {
    e.preventDefault();
    adminEditUserProfile(adminTargetRole, {
      name: adminName,
      department: adminDept,
      phone: adminPhone,
    });
    setIsAdminEditOpen(false);
  };

  const handleSaveSignature = () => {
    saveTeacherDigitalSignature(signatureText);
    setSigSaved(true);
    setTimeout(() => setSigSaved(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCommitAttendance = (classId: string) => {
    submitClassAttendance(classId, attendanceDate, attendanceSlot);
  };

  return (
    <div className="space-y-4 pb-20 select-none text-white">
      {/* ── PROFILE HEADER (Clean, Professional, Flat) ── */}
      <div className="bg-[#0c0c0c] p-4 space-y-3 border-b border-[#1c1c1c]">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="h-16 w-16 rounded-full object-cover border border-[#2b2b2b]"
            />
          </div>

          {/* Stats Row without Emojis */}
          <div className="flex items-center justify-around flex-1 text-center">
            <div>
              <span className="block text-sm font-bold text-white">
                {currentRole === 'student'
                  ? '94.2%'
                  : currentRole === 'teacher'
                  ? teacherClasses.length
                  : currentRole === 'hod'
                  ? '1'
                  : currentRole === 'warden'
                  ? '240'
                  : '1,250'}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-mono">
                {currentRole === 'student'
                  ? 'Attendance'
                  : currentRole === 'teacher'
                  ? 'Classes'
                  : currentRole === 'hod'
                  ? 'Department'
                  : currentRole === 'warden'
                  ? 'Residents'
                  : 'Users'}
              </span>
            </div>

            <div>
              <span className="block text-sm font-bold text-white">
                {currentRole === 'student'
                  ? gatePasses.length
                  : currentRole === 'teacher'
                  ? '90'
                  : currentRole === 'hod'
                  ? '18'
                  : currentRole === 'warden'
                  ? '20:30'
                  : '9'}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-mono">
                {currentRole === 'student'
                  ? 'Active Passes'
                  : currentRole === 'teacher'
                  ? 'Students'
                  : currentRole === 'hod'
                  ? 'Faculty'
                  : currentRole === 'warden'
                  ? 'Curfew'
                  : 'Roles'}
              </span>
            </div>

            <div>
              <span className="block text-sm font-bold text-white">
                {currentRole === 'student'
                  ? 'Clear'
                  : currentRole === 'teacher'
                  ? applications.filter((a) => a.status === 'pending_mentor').length
                  : currentRole === 'hod'
                  ? '1'
                  : currentRole === 'warden'
                  ? 'Active'
                  : '100%'}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-mono">
                {currentRole === 'student'
                  ? 'Dues'
                  : currentRole === 'teacher'
                  ? 'Pending'
                  : currentRole === 'hod'
                  ? 'Escalations'
                  : currentRole === 'warden'
                  ? 'Status'
                  : 'Uptime'}
              </span>
            </div>
          </div>
        </div>

        {/* Identity Information (Bio removed, details in Settings) */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-white">{currentUser.name}</h2>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-md bg-[#181818] hover:bg-[#222] text-slate-300 hover:text-white border border-[#262626] transition-colors flex items-center gap-1 text-[11px]"
              title="Account Details & Settings"
            >
              <Settings size={13} />
              <span>Settings</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-300 bg-[#1c1c1c] px-2 py-0.5 rounded-sm">
              {currentUser.role}
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              {currentUser.rollNo || currentUser.employeeId}
            </span>
          </div>
          <div className="pt-0.5 text-[10px] text-slate-400 font-mono">
            <span>Department: {currentUser.department}</span>
            {currentUser.roomNo && <span> • Location: {currentUser.roomNo}</span>}
          </div>
        </div>

        {/* Action Buttons (Subtle rounding on small buttons) */}
        <div className="flex items-center gap-2 pt-1">
          {currentRole === 'admin' ? (
            <button
              onClick={() => setIsAdminEditOpen(true)}
              className="flex-1 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition-colors"
            >
              God-Mode User Editor
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('services')}
              className="flex-1 py-1.5 rounded-md bg-[#181818] hover:bg-[#222] text-slate-200 font-semibold text-xs text-center border border-[#2b2b2b] transition-colors"
            >
              View Services & Passes
            </button>
          )}

          <button
            onClick={() => setActiveTab('messages')}
            className="flex-1 py-1.5 rounded-md bg-[#181818] hover:bg-[#222] text-slate-200 font-semibold text-xs text-center border border-[#2b2b2b] transition-colors"
          >
            Direct Messages
          </button>
        </div>
      </div>

      {/* ── PROFILE SEGMENT TABS ── */}
      <div className="flex items-center border-b border-[#1c1c1c]">
        <button
          onClick={() => setActiveTabLocal('workflow')}
          className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTabLocal === 'workflow'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-slate-500'
          }`}
        >
          Role Workflows & Management
        </button>

        <button
          onClick={() => setActiveTabLocal('id_card')}
          className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTabLocal === 'id_card'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-slate-500'
          }`}
        >
          Institutional ID & Credentials
        </button>
      </div>

      {/* ── TAB 1: ROLE WORKFLOWS ── */}
      {activeTabLocal === 'workflow' && (
        <div className="space-y-4 px-2">
          {/* TEACHER WORKFLOW */}
          {currentRole === 'teacher' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Assigned Teaching Classes & Roster
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">ERP SESSION 2026</span>
              </div>

              {/* DATE & TIME SLOT SELECTION BAR FOR ATTENDANCE */}
              <div className="bg-[#111111] p-3 space-y-2 border-b border-[#1c1c1c]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Select Attendance Date and Lecture Time Slot:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Lecture Date</label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="w-full bg-[#181818] border-b border-[#2b2b2b] px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Time Slot / Period</label>
                    <select
                      value={attendanceSlot}
                      onChange={(e) => setAttendanceSlot(e.target.value)}
                      className="w-full bg-[#181818] border-b border-[#2b2b2b] px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value="Period 1 (09:00 AM - 10:00 AM)">
                        Period 1 (09:00 AM - 10:00 AM)
                      </option>
                      <option value="Period 2 (10:00 AM - 11:00 AM)">
                        Period 2 (10:00 AM - 11:00 AM)
                      </option>
                      <option value="Period 3 (11:15 AM - 12:15 PM)">
                        Period 3 (11:15 AM - 12:15 PM)
                      </option>
                      <option value="Lab Slot (02:00 PM - 05:00 PM)">
                        Lab Slot (02:00 PM - 05:00 PM)
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Classes List */}
              {teacherClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-[#0f0f0f] p-3.5 space-y-3 border-b border-[#1c1c1c]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[9px] text-indigo-400 font-bold uppercase">
                        {cls.subjectCode} • Semester {cls.semester} (Section {cls.section})
                      </span>
                      <h4 className="text-xs font-bold text-white mt-0.5">{cls.subjectName}</h4>
                      <p className="text-[10px] text-slate-400">{cls.timeSlot} • {cls.room}</p>
                      {cls.lastAttendanceDate && (
                        <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                          Last Recorded: {cls.lastAttendanceDate} ({cls.lastAttendanceSlot || 'Period 2'})
                        </p>
                      )}
                    </div>

                    <span className="px-2 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                      {cls.attendanceRate}% Present
                    </span>
                  </div>

                  {/* Student Attendance Roll */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">
                      Roll Call for {attendanceDate} ({attendanceSlot}):
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {cls.students.map((st) => (
                        <button
                          key={st.rollNo}
                          onClick={() => toggleStudentAttendance(cls.id, st.rollNo)}
                          className={`flex items-center justify-between p-2 text-left text-xs transition-colors border-b ${
                            st.present
                              ? 'bg-[#101912] border-emerald-500/30 text-emerald-300'
                              : 'bg-[#1a1012] border-rose-500/30 text-rose-300'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-[11px] block">{st.name}</span>
                            <span className="font-mono text-[9px] text-slate-400">{st.rollNo}</span>
                          </div>
                          <span className="text-xs font-mono font-bold">
                            {st.present ? 'P' : 'A'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons with Print button */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a]">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#1a1a1a] hover:bg-[#252525] text-slate-300 text-xs font-semibold"
                    >
                      <Printer size={13} />
                      <span>Print Official Register</span>
                    </button>

                    <button
                      onClick={() => handleCommitAttendance(cls.id)}
                      className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
                    >
                      Commit Attendance ({cls.attendanceRate}%)
                    </button>
                  </div>
                </div>
              ))}

              {/* Digital Signature Settings for Mentor */}
              <div className="bg-[#0f0f0f] p-3 space-y-2 border-b border-[#1c1c1c]">
                <div className="flex items-center gap-2">
                  <PenTool size={14} className="text-indigo-400" />
                  <span className="text-xs font-bold text-white">Faculty Digital Signature</span>
                </div>
                <input
                  type="text"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  className="w-full bg-[#141414] border-b border-[#2b2b2b] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
                />
                <button
                  onClick={handleSaveSignature}
                  className="w-full py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Save Signature for Documents
                </button>
                {sigSaved && (
                  <p className="text-center text-[10px] text-emerald-400 font-semibold">
                    Digital signature updated and cached for document certification.
                  </p>
                )}
              </div>

              {/* Student Applications Queue */}
              <div className="space-y-2 pt-1">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Student Leave and Duty Applications Queue
                </h4>
                {applications
                  .filter((a) => a.status === 'pending_mentor')
                  .map((app) => (
                    <div
                      key={app.id}
                      className="bg-[#0f0f0f] p-3 space-y-2 border-b border-[#1c1c1c] text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-white">{app.title}</span>
                          <p className="text-[10px] text-slate-400">
                            Applicant: {app.studentName} ({app.rollNo})
                          </p>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5">
                          PENDING MENTOR
                        </span>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => approveApplication(app.id, 'Recommended by Faculty Mentor.')}
                          className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                          Sign and Endorse to HOD
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* HOD WORKFLOW */}
          {currentRole === 'hod' && (
            <div className="space-y-4">
              <div className="bg-[#0f0f0f] p-3 space-y-2 border-b border-[#1c1c1c] text-xs">
                <h3 className="font-bold text-white">Department of Computer Science Overview</h3>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <div className="bg-[#141414] p-2">
                    <span className="text-slate-400 block text-[10px]">Average Attendance:</span>
                    <span className="font-bold text-emerald-400 text-sm">93.8%</span>
                  </div>
                  <div className="bg-[#141414] p-2">
                    <span className="text-slate-400 block text-[10px]">Active Faculty:</span>
                    <span className="font-bold text-white text-sm">18 Faculty Members</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Escalated Leave Applications for HOD Seal
                </h4>
                {applications
                  .filter((a) => a.status === 'pending_hod' || a.status === 'approved')
                  .map((app) => (
                    <div
                      key={app.id}
                      className="bg-[#0f0f0f] p-3 space-y-2 border-b border-[#1c1c1c] text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-white">{app.title}</span>
                          <p className="text-[10px] text-slate-400">
                            {app.studentName} ({app.rollNo})
                          </p>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-purple-400 uppercase">
                          {app.status}
                        </span>
                      </div>

                      {app.status === 'pending_hod' && (
                        <button
                          onClick={() =>
                            approveApplication(
                              app.id,
                              'Final Departmental Clearance Approved by Dr. Rajesh Senapati, HOD.'
                            )
                          }
                          className="w-full py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                        >
                          Affix HOD Digital Seal and Approve
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* STUDENT WORKFLOW */}
          {currentRole === 'student' && (
            <div className="space-y-4">
              <div className="bg-[#0f0f0f] p-3 space-y-2 border-b border-[#1c1c1c] text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white">Subject-Wise Attendance Analysis</h4>
                  <span className="text-emerald-400 font-mono font-bold">94.2% Overall</span>
                </div>

                <div className="space-y-2 pt-1">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>CS601: Distributed Systems</span>
                      <span className="font-bold text-emerald-400 font-mono">96.0% (Eligible)</span>
                    </div>
                    <div className="w-full h-1 bg-[#1a1a1a] mt-1">
                      <div className="h-full bg-emerald-500 w-[96%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>CS602: Compiler Design Lab</span>
                      <span className="font-bold text-emerald-400 font-mono">92.5% (Eligible)</span>
                    </div>
                    <div className="w-full h-1 bg-[#1a1a1a] mt-1">
                      <div className="h-full bg-emerald-500 w-[92.5%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>CS603: Cloud Computing Infrastructure</span>
                      <span className="font-bold text-emerald-400 font-mono">94.0% (Eligible)</span>
                    </div>
                    <div className="w-full h-1 bg-[#1a1a1a] mt-1">
                      <div className="h-full bg-emerald-500 w-[94%]" />
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-[#08120a] border border-emerald-500/20 text-[10px] text-emerald-300 mt-2">
                  Institutional examination attendance requirement satisfied (&gt;75%).
                </div>
              </div>

              {/* Printable Official Certificates */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Approved Institutional Certificates
                </h4>
                {applications
                  .filter((a) => a.status === 'approved')
                  .map((app) => (
                    <div
                      key={app.id}
                      className="bg-[#0f0f0f] p-3 space-y-2 border-b border-indigo-500/30 text-xs"
                    >
                      <div className="flex justify-between">
                        <span className="font-bold text-white">{app.title}</span>
                        <span className="text-emerald-400 font-mono text-[10px] font-bold">
                          APPROVED &amp; SEALED
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Document verified with Mentor and HOD cryptographic signatures.
                      </p>
                      <button
                        onClick={handlePrint}
                        className="w-full py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                      >
                        <Printer size={13} />
                        <span>Print Official Certificate</span>
                      </button>
                    </div>
                  ))}
              </div>

              {/* Fees and Dues Status */}
              <div className="bg-[#0f0f0f] p-3 space-y-2 border-b border-[#1c1c1c] text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white">Semester Tuition & Hostel Dues Ledger</h4>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {studentFees.filter((f) => f.status === 'pending').length === 0
                      ? '100% Cleared'
                      : 'Pending Balance'}
                  </span>
                </div>
                <div className="space-y-1.5 pt-1 text-[11px]">
                  {studentFees.slice(0, 4).map((f) => (
                    <div key={f.id} className="flex justify-between items-center">
                      <span className="text-slate-400 truncate max-w-[200px]">{f.title}:</span>
                      <span
                        className={`font-mono text-[10px] font-bold ${
                          f.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {f.status === 'paid' ? `PAID (${f.receiptNo || '✓'})` : `₹${f.amount} PENDING`}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('services')}
                  className="w-full py-1.5 mt-1 rounded bg-[#181818] hover:bg-[#202020] text-indigo-400 font-mono text-[10px] font-bold transition-colors border border-[#252525]"
                >
                  Open Full Accounts Ledger & Receipts →
                </button>
              </div>
            </div>
          )}

          {/* WARDEN WORKFLOW */}
          {currentRole === 'warden' && (
            <div className="space-y-3">
              <div className="bg-[#0f0f0f] p-3 space-y-2 border-b border-[#1c1c1c] text-xs">
                <h4 className="font-bold text-white">Hostel Block A Curfew Ledger</h4>
                <p className="text-[11px] text-slate-400">
                  Total Scholars Allocated: 240 • Curfew Deadline: 20:30 hours
                </p>
                <div className="p-2 bg-[#120f08] border border-amber-500/20 text-[10px] text-amber-300">
                  Gate exit permits are logged continuously against Gate 1 optical sensors.
                </div>
              </div>
            </div>
          )}

          {/* ADMIN GOD-MODE WORKFLOW */}
          {currentRole === 'admin' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#110c14] border-b border-purple-500/30 space-y-2 text-xs">
                <span className="font-bold text-purple-300 block">
                  Institutional Master Controller Privileges Active
                </span>
                <p className="text-slate-300 text-[11px]">
                  Master authority to overwrite user credentials, reassign departments and rooms, and inspect systemic audit trails.
                </p>
                <button
                  onClick={() => setIsAdminEditOpen(true)}
                  className="w-full py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow"
                >
                  Edit Any User Profile (God Mode)
                </button>
              </div>

              {/* Audit Ledger Stream */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Central Institutional Security Audit Trail
                </h4>
                {auditLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="bg-[#0e0e0e] p-2.5 text-xs space-y-0.5 border-b border-[#1c1c1c]"
                  >
                    <div className="flex justify-between">
                      <span className="font-mono text-[9px] text-purple-400 font-bold">
                        {log.action}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-200 font-medium text-[11px]">{log.target}</p>
                    <p className="text-[10px] text-slate-400">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: DIGITAL ID & INSTITUTIONAL CREDENTIALS ── */}
      {activeTabLocal === 'id_card' && (
        <div className="space-y-4 px-2">
          {/* Institutional Smart Card */}
          <div className="bg-[#0d0d0d] p-4 space-y-3 border-b border-[#222]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="h-12 w-12 rounded-full object-cover border border-[#333]"
                />
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-indigo-400">
                    BPUT DIGITAL VERIFIED ID
                  </span>
                  <h2 className="text-sm font-bold text-white">{currentUser.name}</h2>
                  <p className="font-mono text-[10px] text-slate-300">
                    {currentUser.rollNo || currentUser.employeeId}
                  </p>
                </div>
              </div>

              <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-[#181818] text-slate-300">
                {currentUser.role}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-[11px]">
              <div className="bg-[#121212] p-2">
                <span className="text-[9px] text-slate-400 block">Department</span>
                <span className="font-semibold text-white">{currentUser.department}</span>
              </div>
              <div className="bg-[#121212] p-2">
                <span className="text-[9px] text-slate-400 block">Quarter / Room</span>
                <span className="font-semibold text-white">
                  {currentUser.hostelBlock || 'Faculty Quarters'}
                </span>
              </div>
            </div>

            {/* Barcode line */}
            <div className="pt-1 text-center">
              <div className="h-6 w-full max-w-[200px] mx-auto bg-white/90 flex items-center justify-around px-2">
                {[...Array(26)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-black h-4"
                    style={{ width: `${(i % 3) + 1}px` }}
                  />
                ))}
              </div>
              <span className="text-[8px] font-mono text-slate-400 mt-1 block">
                NFC OPTICAL VERIFICATION ENABLED
              </span>
            </div>
          </div>

          {/* Role Switcher for Evaluation */}
          <div className="bg-[#0d0d0d] p-3 space-y-2 border-b border-[#1c1c1c]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Switch Institutional Profile
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {rolesList.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`p-2 text-left text-xs transition-colors border-b ${
                    currentRole === r.id
                      ? 'bg-indigo-600/30 border-indigo-400 text-white font-semibold'
                      : 'bg-[#141414] border-[#222] text-slate-400'
                  }`}
                >
                  <div className="font-bold text-slate-200">{r.label}</div>
                  <div className="text-[9px] text-slate-400 truncate">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Language selector */}
          <div className="bg-[#0d0d0d] p-3 space-y-2 border-b border-[#1c1c1c]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              System Language
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'en', label: 'English' },
                { id: 'hi', label: 'Hindi' },
                { id: 'or', label: 'Odia' },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLanguage(l.id as Language)}
                  className={`py-1.5 text-center text-xs rounded-md ${
                    language === l.id
                      ? 'bg-white text-black font-bold'
                      : 'bg-[#141414] text-slate-400'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Offline Cache Simulator */}
          <div className="bg-[#0d0d0d] p-3 flex items-center justify-between border-b border-[#1c1c1c]">
            <div>
              <span className="text-xs font-bold text-white">Local Offline Cache</span>
              <p className="text-[10px] text-slate-400">Simulate IndexedDB offline state</p>
            </div>
            <button
              onClick={toggleOffline}
              className={`px-3 py-1 rounded-md text-xs font-bold ${
                isOffline ? 'bg-rose-500 text-white' : 'bg-[#1c1c1c] text-slate-300'
              }`}
            >
              {isOffline ? 'Offline Mode Active' : 'Go Offline'}
            </button>
          </div>
        </div>
      )}

      {/* ADMIN GOD-MODE BOTTOM SHEET */}
      <AndroidBottomSheet
        isOpen={isAdminEditOpen}
        onClose={() => setIsAdminEditOpen(false)}
        title="Admin God-Mode User Editor"
        subtitle="Edit any student, faculty, or staff record"
      >
        <form onSubmit={handleAdminSave} className="space-y-3 pt-1">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Select Target Role
            </label>
            <select
              value={adminTargetRole}
              onChange={(e) => {
                const r = e.target.value as Role;
                setAdminTargetRole(r);
                setAdminName(profiles[r].name);
                setAdminDept(profiles[r].department);
                setAdminPhone(profiles[r].phone);
              }}
              className="w-full bg-[#181818] border-b border-[#2b2b2b] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
            >
              {rolesList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label} ({r.desc})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Full Name</label>
            <input
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full bg-[#181818] border-b border-[#2b2b2b] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Department</label>
            <input
              type="text"
              value={adminDept}
              onChange={(e) => setAdminDept(e.target.value)}
              className="w-full bg-[#181818] border-b border-[#2b2b2b] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Phone</label>
            <input
              type="text"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              className="w-full bg-[#181818] border-b border-[#2b2b2b] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow mt-2"
          >
            Apply Record Updates
          </button>
        </form>
      </AndroidBottomSheet>

      {/* Account Settings Sheet (Houses User Details & Log Out) */}
      <AccountSettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
