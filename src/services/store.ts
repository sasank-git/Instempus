import { create } from 'zustand';
import { supabase } from './supabase';
import {
  UserProfile,
  Role,
  GatePass,
  NoticePost,
  CampusIssue,
  ServiceApplication,
  ChatMessage,
  ChatThread,
  AuditLogItem,
  Language,
  TeacherClass,
  CanteenDailyMenu,
  EmergencyAlert,
  Classroom,
  ClassroomStudent,
  ClassroomNote,
  ClassroomTimetableSlot,
  AttendanceRecord,
  ClassroomAnnouncement,
  StudentFeeItem,
  ApplicationType,
  RoomAssetItem,
  StudentRoomRecord,
  MessFeedbackItem,
  VisitorPass,
  GateLogEntry,
  FeedItem,
  FeedNoticeItem,
  FeedIssueItem,
  FeedPollItem,
  PollOption,
  ScheduleBlock,
  ClassResource,
} from '../types';

export function mapSupabaseProfileToUser(
  supabaseUser: { id: string; email?: string; user_metadata?: Record<string, any> },
  dbProfile?: { id?: string; full_name?: string; role?: string; email?: string; metadata?: Record<string, any> } | null
): UserProfile {
  const role: Role = (dbProfile?.role as Role) || (supabaseUser?.user_metadata?.role as Role) || 'student';
  const name: string =
    dbProfile?.full_name ||
    supabaseUser?.user_metadata?.full_name ||
    supabaseUser?.email?.split('@')[0] ||
    'Campus User';
  const email: string = dbProfile?.email || supabaseUser?.email || '';
  const username: string = email ? email.split('@')[0] : `user_${supabaseUser?.id?.slice(0, 8)}`;
  const metadata = dbProfile?.metadata || supabaseUser?.user_metadata?.metadata || {};

  return {
    id: supabaseUser.id,
    name,
    username,
    role,
    department:
      metadata.department ||
      (role === 'student'
        ? 'Computer Science and Engineering'
        : 'Departmental Faculty'),
    rollNo:
      metadata.rollNo ||
      (role === 'student'
        ? `2601CSE${supabaseUser.id.replace(/\D/g, '').slice(0, 3) || '008'}`
        : undefined),
    employeeId:
      metadata.employeeId ||
      (role !== 'student'
        ? `EMP-${role.toUpperCase().slice(0, 3)}-${supabaseUser.id.replace(/\D/g, '').slice(0, 3) || '042'}`
        : undefined),
    phone: metadata.phone || '+91 98610 54321',
    email,
    avatarUrl:
      metadata.avatarUrl ||
      `https://images.unsplash.com/photo-${
        role === 'student' ? '1534528741775-53994a69daeb' : '1573496359142-b8d87734a5a2'
      }?auto=format&fit=crop&w=300&q=80`,
    semester: metadata.semester || (role === 'student' ? 6 : undefined),
    year: metadata.year || (role === 'student' ? 3 : undefined),
    hostelBlock: metadata.hostelBlock || 'Hostel Block A',
    roomNo: metadata.roomNo || 'Room A-204',
    languagePref: 'en',
    isActive: true,
    metadata,
  };
}

export const DEMO_PROFILES: Record<Role, UserProfile> = {
  student: {
    id: 'usr_student_01',
    name: 'Arya Pattnayak',
    username: 'arya_pattnayak',
    role: 'student',
    rollNo: '2501CSE008',
    department: 'Computer Science and Engineering',
    year: 3,
    semester: 6,
    section: 'A',
    hostelBlock: 'Hostel Block A (Bhabha Bhawan)',
    roomNo: 'Room A-204',
    phone: '+91 98610 54321',
    email: 'arya.pattnayak@bput.ac.in',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    thoughtNote: 'Mid-semester laboratory practical preparation in progress',
    languagePref: 'en',
    isActive: true,
    password: 'bput@2026',
    metadata: {
      department: 'CSE',
      assigned_slots: ['cls_cs601', 'cls_cs602'],
      hackathon_finalist: true,
      hostel_block: 'Block A',
      clearance_status: 'cleared',
    },
  },
  teacher: {
    id: 'usr_teacher_01',
    name: 'Prof. Sneha Mohanty',
    username: 'prof_sneha_cse',
    role: 'teacher',
    employeeId: 'EMP-CSE-042',
    department: 'Computer Science and Engineering',
    phone: '+91 94371 88990',
    email: 'sneha.mohanty@bput.ac.in',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    thoughtNote: 'Consultation hours: 15:00 to 17:00 at Aryabhatta Hall 304',
    languagePref: 'en',
    digitalSignature: 'Prof. Sneha Mohanty (Faculty Mentor, CSE)',
    isActive: true,
    password: 'bput@2026',
  },
  hod: {
    id: 'usr_hod_01',
    name: 'Dr. Rajesh Senapati',
    username: 'hod_cse_official',
    role: 'hod',
    employeeId: 'EMP-HOD-007',
    department: 'Computer Science and Engineering',
    phone: '+91 94370 12345',
    email: 'hod.cse@bput.ac.in',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    thoughtNote: 'Departmental Academic Council meeting scheduled for 10:00 AM',
    languagePref: 'en',
    digitalSignature: 'Dr. Rajesh Senapati, Ph.D. — Head of Department, CSE',
    isActive: true,
    password: 'bput@2026',
  },
  warden: {
    id: 'usr_warden_01',
    name: 'Mr. Niranjan Sahu',
    username: 'warden_block_a',
    role: 'warden',
    employeeId: 'EMP-WRD-012',
    department: 'Hostel Administration',
    hostelBlock: 'Hostel Block A (Bhabha Bhawan)',
    phone: '+91 99372 90123',
    email: 'warden.blocka@bput.ac.in',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    thoughtNote: 'Curfew deadline strictly enforced at 20:30 hours',
    languagePref: 'en',
    digitalSignature: 'Mr. Niranjan Sahu — Chief Warden, Hostel Block A',
    isActive: true,
    password: 'bput@2026',
  },
  security: {
    id: 'usr_sec_01',
    name: 'Pradeep Rout',
    username: 'security_gate_1',
    role: 'security',
    employeeId: 'SEC-GATE-01',
    department: 'Campus Security Services',
    phone: '+91 98533 11223',
    email: 'security.gate1@bput.ac.in',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    thoughtNote: 'Main Gate 1 optical scanners calibrated',
    languagePref: 'en',
    isActive: true,
    password: 'bput@2026',
  },
  admin: {
    id: 'usr_admin_01',
    name: 'System Administrator',
    username: 'instempus_admin',
    role: 'admin',
    employeeId: 'ADMIN-SYS-01',
    department: 'Central IT & Institutional Administration',
    phone: '+91 94370 99887',
    email: 'admin@bput.ac.in',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    thoughtNote: 'Campus systems operational at normal capacity',
    languagePref: 'en',
    digitalSignature: 'System Administrator — Central Administrative Seal',
    isActive: true,
    password: 'bput@2026',
  },
  canteen: {
    id: 'usr_canteen_01',
    name: 'Gopal Sahoo',
    username: 'central_mess_02',
    role: 'canteen',
    employeeId: 'CNT-MESS-02',
    department: 'Canteen and Mess Board',
    phone: '+91 99380 44556',
    email: 'mess.manager@bput.ac.in',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    languagePref: 'en',
    isActive: true,
    password: 'bput@2026',
  },
  accounts: {
    id: 'usr_acc_01',
    name: 'Sasmita Mishra',
    username: 'accounts_bput',
    role: 'accounts',
    employeeId: 'ACC-FIN-09',
    department: 'Finance and Student Accounts',
    phone: '+91 94378 22334',
    email: 'accounts.officer@bput.ac.in',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    languagePref: 'en',
    isActive: true,
    password: 'bput@2026',
  },
  principal: {
    id: 'usr_prin_01',
    name: 'Prof. (Dr.) B. C. Panda',
    username: 'principal_director',
    role: 'principal',
    employeeId: 'DIR-PRIN-01',
    department: 'Office of the Director / Principal',
    phone: '+91 94370 00001',
    email: 'principal@bput.ac.in',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    languagePref: 'en',
    digitalSignature: 'Prof. (Dr.) B. C. Panda — Principal and Director',
    isActive: true,
    password: 'bput@2026',
  },
};

const INITIAL_CANTEEN_MENU: CanteenDailyMenu = {
  date: 'Today (October 1, 2026)',
  breakfast: 'Idli, Sambar, Coconut Chutney & Tea / Milk',
  lunch: 'Steamed Rice, Dalma, Paneer Butter Masala, Papad & Salad',
  snacks: 'Vegetable Samosa with Green Chutney & Coffee',
  dinner: 'Tandoori Roti, Kadai Paneer / Egg Curry, Jeera Rice & Kheer',
  specialDish: 'Odisha Special Dalma & Kheer',
  isVegOnly: false,
  postedBy: 'Gopal Sahoo (Canteen Manager)',
  lastUpdated: '07:15 AM today',
};

const INITIAL_EMERGENCY_ALERT: EmergencyAlert = {
  active: false,
  type: 'fire',
  title: 'Campus Emergency Protocol',
  message: 'Evacuate academic buildings immediately via designated fire exit staircases.',
  issuedAt: '',
  issuedBy: '',
  musterPoint: 'Central Convocation Sports Field Ground',
  emergencyPhone: '+91 98533 11223',
};

const INITIAL_TEACHER_CLASSES: TeacherClass[] = [
  {
    id: 'cls_01',
    subjectCode: 'CS601',
    subjectName: 'Distributed Systems & Cloud Computing',
    semester: 6,
    section: 'A',
    totalStudents: 60,
    timeSlot: '10:00 AM - 11:00 AM',
    room: 'Aryabhatta Block - Hall 301',
    lastAttendanceDate: '2026-10-01',
    lastAttendanceSlot: 'Period 2 (10:00 AM - 11:00 AM)',
    attendanceRate: 94.2,
    students: [
      { rollNo: '2501CSE001', name: 'Aarav Sharma', present: true },
      { rollNo: '2501CSE002', name: 'Aditi Mohapatra', present: true },
      { rollNo: '2501CSE003', name: 'Ananya Dash', present: true },
      { rollNo: '2501CSE004', name: 'Priya Nayak', present: true },
      { rollNo: '2501CSE008', name: 'Arya Pattnayak', present: true },
      { rollNo: '2501CSE015', name: 'Rohan Verma', present: false },
      { rollNo: '2501CSE018', name: 'Subham Biswal', present: true },
    ],
  },
  {
    id: 'cls_02',
    subjectCode: 'CS602',
    subjectName: 'Compiler Design Lab',
    semester: 6,
    section: 'A',
    totalStudents: 30,
    timeSlot: '02:00 PM - 05:00 PM',
    room: 'Advanced Software Lab 4',
    lastAttendanceDate: '2026-09-30',
    lastAttendanceSlot: 'Lab Slot (02:00 PM - 05:00 PM)',
    attendanceRate: 91.8,
    students: [
      { rollNo: '2501CSE001', name: 'Aarav Sharma', present: true },
      { rollNo: '2501CSE004', name: 'Priya Nayak', present: true },
      { rollNo: '2501CSE008', name: 'Arya Pattnayak', present: true },
      { rollNo: '2501CSE015', name: 'Rohan Verma', present: true },
    ],
  },
];

export function hasClassroomAccess(user: UserProfile, classroom: Classroom): {
  hasAccess: boolean;
  roleInClass: 'teacher' | 'student' | 'observer' | 'none';
  reason?: string;
} {
  // 1. Course Instructor Match
  if (
    user.role === 'teacher' &&
    (classroom.instructorId === user.id ||
      (user.email && classroom.instructorEmail?.toLowerCase() === user.email.toLowerCase()) ||
      classroom.instructorName.toLowerCase().includes(user.name.toLowerCase().split(' ')[0]))
  ) {
    return { hasAccess: true, roleInClass: 'teacher' };
  }

  // 2. Enrolled Student Match
  if (user.role === 'student' && user.rollNo) {
    const isEnrolled = classroom.enrolledStudents.some(
      (s) => s.rollNo.trim().toUpperCase() === user.rollNo?.trim().toUpperCase()
    );
    if (isEnrolled) {
      return { hasAccess: true, roleInClass: 'student' };
    }
    return {
      hasAccess: false,
      roleInClass: 'none',
      reason: `Access restricted. You are not enrolled in ${classroom.subjectCode} (${classroom.subjectName}). Only registered students of Section ${classroom.section} and course faculty have access.`,
    };
  }

  // 3. Academic Oversight (HOD / Admin / Principal)
  if (['hod', 'admin', 'principal'].includes(user.role)) {
    return { hasAccess: true, roleInClass: 'observer' };
  }

  // 4. Other Roles (Security, Canteen, Warden, Accounts, or unassigned faculty)
  return {
    hasAccess: false,
    roleInClass: 'none',
    reason: `Classroom access is strictly limited to enrolled scholars and course faculty (${classroom.instructorName}).`,
  };
}

export const INITIAL_CLASSROOMS: Classroom[] = [
  {
    id: 'cls_cs601',
    subjectCode: 'CS601',
    subjectName: 'Distributed Systems & Cloud Computing',
    department: 'Computer Science and Engineering',
    semester: 6,
    section: 'A',
    credits: 4,
    room: 'Aryabhatta Block - Hall 301',
    instructorId: 'usr_teacher_01',
    instructorName: 'Prof. Sneha Mohanty',
    instructorEmail: 'sneha.mohanty@bput.ac.in',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    timeSlot: '10:00 AM - 11:00 AM',
    attendanceRate: 94.2,
    enrolledStudents: [
      { rollNo: '2501CSE008', name: 'Arya Pattnayak', email: 'arya.pattnayak@bput.ac.in', present: true },
      { rollNo: '2501CSE001', name: 'Aarav Sharma', email: 'aarav.sharma@bput.ac.in', present: true },
      { rollNo: '2501CSE002', name: 'Aditi Mohapatra', email: 'aditi.m@bput.ac.in', present: true },
      { rollNo: '2501CSE003', name: 'Ananya Dash', email: 'ananya.dash@bput.ac.in', present: true },
      { rollNo: '2501CSE004', name: 'Priya Nayak', email: 'priya.nayak@bput.ac.in', present: true },
      { rollNo: '2501CSE015', name: 'Rohan Verma', email: 'rohan.v@bput.ac.in', present: false },
      { rollNo: '2501CSE018', name: 'Subham Biswal', email: 'subham.b@bput.ac.in', present: true },
    ],
    attendanceHistory: [
      {
        id: 'att_cs601_01',
        date: '2026-10-01',
        timeSlot: 'Period 2 (10:00 AM - 11:00 AM)',
        topic: 'Vector Clocks, Lamport Timestamps & Total Order Multicast',
        facultyName: 'Prof. Sneha Mohanty',
        facultySignature: 'Prof. Sneha Mohanty (Faculty Mentor, CSE)',
        presentCount: 6,
        totalStudents: 7,
        records: [
          { rollNo: '2501CSE008', studentName: 'Arya Pattnayak', present: true },
          { rollNo: '2501CSE001', studentName: 'Aarav Sharma', present: true },
          { rollNo: '2501CSE002', studentName: 'Aditi Mohapatra', present: true },
          { rollNo: '2501CSE003', studentName: 'Ananya Dash', present: true },
          { rollNo: '2501CSE004', studentName: 'Priya Nayak', present: true },
          { rollNo: '2501CSE015', studentName: 'Rohan Verma', present: false },
          { rollNo: '2501CSE018', studentName: 'Subham Biswal', present: true },
        ],
      },
      {
        id: 'att_cs601_02',
        date: '2026-09-29',
        timeSlot: 'Period 2 (10:00 AM - 11:00 AM)',
        topic: 'Byzantine Fault Tolerance, Paxos Consensus & Quorum Slices',
        facultyName: 'Prof. Sneha Mohanty',
        facultySignature: 'Prof. Sneha Mohanty (Faculty Mentor, CSE)',
        presentCount: 7,
        totalStudents: 7,
        records: [
          { rollNo: '2501CSE008', studentName: 'Arya Pattnayak', present: true },
          { rollNo: '2501CSE001', studentName: 'Aarav Sharma', present: true },
          { rollNo: '2501CSE002', studentName: 'Aditi Mohapatra', present: true },
          { rollNo: '2501CSE003', studentName: 'Ananya Dash', present: true },
          { rollNo: '2501CSE004', studentName: 'Priya Nayak', present: true },
          { rollNo: '2501CSE015', studentName: 'Rohan Verma', present: true },
          { rollNo: '2501CSE018', studentName: 'Subham Biswal', present: true },
        ],
      },
      {
        id: 'att_cs601_03',
        date: '2026-09-26',
        timeSlot: 'Period 2 (10:00 AM - 11:00 AM)',
        topic: 'Remote Procedure Calls (gRPC), Protocol Buffers & IDL',
        facultyName: 'Prof. Sneha Mohanty',
        facultySignature: 'Prof. Sneha Mohanty (Faculty Mentor, CSE)',
        presentCount: 6,
        totalStudents: 7,
        records: [
          { rollNo: '2501CSE008', studentName: 'Arya Pattnayak', present: true },
          { rollNo: '2501CSE001', studentName: 'Aarav Sharma', present: true },
          { rollNo: '2501CSE002', studentName: 'Aditi Mohapatra', present: true },
          { rollNo: '2501CSE003', studentName: 'Ananya Dash', present: false },
          { rollNo: '2501CSE004', studentName: 'Priya Nayak', present: true },
          { rollNo: '2501CSE015', studentName: 'Rohan Verma', present: true },
          { rollNo: '2501CSE018', studentName: 'Subham Biswal', present: true },
        ],
      },
    ],
    notes: [
      {
        id: 'note_cs601_01',
        classId: 'cls_cs601',
        title: 'Module 1: Distributed Systems Core Foundations & Architectural Models',
        unit: 'Unit 1: Architectures & IPC',
        description: 'Comprehensive lecture slides covering client-server, peer-to-peer, hybrid topologies, synchronous vs asynchronous networks, and network virtualization.',
        fileName: 'CS601_Unit1_Foundations_Slides.pdf',
        fileSize: '4.2 MB',
        fileType: 'pdf',
        uploadedBy: 'Prof. Sneha Mohanty',
        uploaderRole: 'teacher',
        uploaderRollNoOrEmpId: 'EMP-CSE-042',
        uploadDate: '2026-09-18',
        tags: ['#DistributedSystems', '#Unit1', '#Architecture', '#IPC'],
        downloadsCount: 48,
        contentSnippet: 'Summary: Systems characterized by autonomous nodes communicating via message passing. No shared memory or universal physical clock. Focus on transparency (access, location, migration, replication, concurrency, failure).',
      },
      {
        id: 'note_cs601_02',
        classId: 'cls_cs601',
        title: 'Module 2: Consensus Protocols Deep-Dive (Paxos, Raft, Zab)',
        unit: 'Unit 2: Consensus & Fault Tolerance',
        description: 'Handcrafted faculty lecture notes with step-by-step state machine transition diagrams, leader election phases, log compaction, and split-brain recovery.',
        fileName: 'CS601_Unit2_Consensus_Raft_Paxos.pdf',
        fileSize: '5.8 MB',
        fileType: 'pdf',
        uploadedBy: 'Prof. Sneha Mohanty',
        uploaderRole: 'teacher',
        uploaderRollNoOrEmpId: 'EMP-CSE-042',
        uploadDate: '2026-09-27',
        tags: ['#Raft', '#Paxos', '#FaultTolerance', '#BPUT-Syllabus'],
        downloadsCount: 52,
        contentSnippet: 'Summary: Raft decomposes consensus into Leader Election, Log Replication, and Safety. Heartbeat timeout triggers election with randomized timers. Majority quorum (N/2 + 1) guarantees overlapping voters.',
      },
      {
        id: 'note_cs601_03',
        classId: 'cls_cs601',
        title: 'Module 3: Cloud Virtualization, Hypervisors (Type 1 vs 2) & K8s Pod Networking',
        unit: 'Unit 3: Cloud & Containers',
        description: 'Reference slides on KVM, Xen, Docker cgroups/namespaces, CNI plugins (Calico, Flannel), and container orchestration.',
        fileName: 'CS601_Unit3_Cloud_K8s_Networking.pdf',
        fileSize: '7.1 MB',
        fileType: 'slides',
        uploadedBy: 'Prof. Sneha Mohanty',
        uploaderRole: 'teacher',
        uploaderRollNoOrEmpId: 'EMP-CSE-042',
        uploadDate: '2026-09-30',
        tags: ['#CloudComputing', '#K8s', '#Virtualization', '#Docker'],
        downloadsCount: 39,
        contentSnippet: 'Summary: Hardware-assisted virtualization using Intel VT-x / AMD-V. OS-level virtualization vs bare-metal hypervisors. Container networking model: every Pod receives its own IP address.',
      },
      {
        id: 'note_cs601_04',
        classId: 'cls_cs601',
        title: 'Student Summary: Vector Clocks & Lamport Timestamps Solved Numericals',
        unit: 'Unit 1: Logical Time & Clocks',
        description: 'Handwritten notes solving previous 5 BPUT semester numericals on calculating causal ordering with vector timestamps.',
        fileName: 'Arya_VectorClocks_SolvedNumericals.pdf',
        fileSize: '2.1 MB',
        fileType: 'notes',
        uploadedBy: 'Arya Pattnayak',
        uploaderRole: 'student',
        uploaderRollNoOrEmpId: '2501CSE008',
        uploadDate: '2026-10-01',
        tags: ['#PeerNotes', '#VectorClocks', '#ExamPrep'],
        downloadsCount: 31,
        contentSnippet: 'Summary: Vector Clock rule: Vi[i] = Vi[i] + 1 before sending message. On receiving m with timestamp Vm, Vi[j] = max(Vi[j], Vm[j]) for all j, and increment Vi[i].',
      },
    ],
    timetable: [
      { id: 'tt_cs601_1', day: 'Monday', timeSlot: '10:00 AM - 11:00 AM', startTime: '10:00', endTime: '11:00', room: 'Hall 301, Aryabhatta Block', type: 'Lecture', topic: 'Vector Clocks & Logical Timestamps', facultyName: 'Prof. Sneha Mohanty' },
      { id: 'tt_cs601_2', day: 'Wednesday', timeSlot: '10:00 AM - 11:00 AM', startTime: '10:00', endTime: '11:00', room: 'Hall 301, Aryabhatta Block', type: 'Lecture', topic: 'Consensus & Raft State Replication', facultyName: 'Prof. Sneha Mohanty' },
      { id: 'tt_cs601_3', day: 'Friday', timeSlot: '10:00 AM - 11:00 AM', startTime: '10:00', endTime: '11:00', room: 'Hall 301, Aryabhatta Block', type: 'Lecture', topic: 'Cloud Virtualization & Container Pods', facultyName: 'Prof. Sneha Mohanty' },
      { id: 'tt_cs601_4', day: 'Saturday', timeSlot: '02:00 PM - 04:00 PM', startTime: '14:00', endTime: '16:00', room: 'Cloud Sim Lab, Raman Block', type: 'Lab', topic: 'Cluster Simulation with Minikube', facultyName: 'Prof. Sneha Mohanty' },
    ],
    announcements: [
      {
        id: 'ann_cs601_1',
        classId: 'cls_cs601',
        authorName: 'Prof. Sneha Mohanty',
        authorRole: 'teacher',
        title: 'Assignment 2 on Raft State Machine due Sunday',
        content: 'Submit your GitHub repository links with the Raft leader election algorithm test suite by Sunday 23:59 IST. Late submissions will attract a 10% penalty per day.',
        timestamp: 'Yesterday at 17:30',
        isImportant: true,
      },
      {
        id: 'ann_cs601_2',
        classId: 'cls_cs601',
        authorName: 'Prof. Sneha Mohanty',
        authorRole: 'teacher',
        title: 'Industrial Guest Lecture: Cloud Native Scalability',
        content: 'On Friday, Senior DevOps Engineer from AWS will conduct an interactive masterclass during our regular lecture slot in Hall 301.',
        timestamp: '2 days ago',
        isImportant: false,
      },
    ],
  },
  {
    id: 'cls_cs602',
    subjectCode: 'CS602',
    subjectName: 'Compiler Design & AST Lab',
    department: 'Computer Science and Engineering',
    semester: 6,
    section: 'A',
    credits: 2,
    room: 'Advanced Software Lab 4',
    instructorId: 'usr_teacher_01',
    instructorName: 'Prof. Sneha Mohanty',
    instructorEmail: 'sneha.mohanty@bput.ac.in',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    timeSlot: '02:00 PM - 05:00 PM',
    attendanceRate: 91.8,
    enrolledStudents: [
      { rollNo: '2501CSE008', name: 'Arya Pattnayak', email: 'arya.pattnayak@bput.ac.in', present: true },
      { rollNo: '2501CSE001', name: 'Aarav Sharma', email: 'aarav.sharma@bput.ac.in', present: true },
      { rollNo: '2501CSE004', name: 'Priya Nayak', email: 'priya.nayak@bput.ac.in', present: true },
      { rollNo: '2501CSE015', name: 'Rohan Verma', email: 'rohan.v@bput.ac.in', present: true },
    ],
    attendanceHistory: [
      {
        id: 'att_cs602_01',
        date: '2026-09-30',
        timeSlot: 'Lab Slot (02:00 PM - 05:00 PM)',
        topic: 'Lexical Analysis with Flex & Token Generation in C++',
        facultyName: 'Prof. Sneha Mohanty',
        facultySignature: 'Prof. Sneha Mohanty (Faculty Mentor, CSE)',
        presentCount: 4,
        totalStudents: 4,
        records: [
          { rollNo: '2501CSE008', studentName: 'Arya Pattnayak', present: true },
          { rollNo: '2501CSE001', studentName: 'Aarav Sharma', present: true },
          { rollNo: '2501CSE004', studentName: 'Priya Nayak', present: true },
          { rollNo: '2501CSE015', studentName: 'Rohan Verma', present: true },
        ],
      },
    ],
    notes: [
      {
        id: 'note_cs602_01',
        classId: 'cls_cs602',
        title: 'Compiler Lab Manual: Flex & Bison Lexer/Parser Integration',
        unit: 'Lab Module 1',
        description: 'Complete hands-on laboratory manual with boilerplate starter codes and Makefile for tokenization and parsing.',
        fileName: 'CS602_LabManual_Flex_Bison.pdf',
        fileSize: '3.6 MB',
        fileType: 'pdf',
        uploadedBy: 'Prof. Sneha Mohanty',
        uploaderRole: 'teacher',
        uploaderRollNoOrEmpId: 'EMP-CSE-042',
        uploadDate: '2026-09-22',
        tags: ['#LabManual', '#Flex', '#Bison', '#AST'],
        downloadsCount: 29,
        contentSnippet: 'Summary: Setup guide for GNU Flex 2.6 and Bison 3.8. Defining regular expressions for C subset keywords, identifiers, and floating-point literals.',
      },
    ],
    timetable: [
      { id: 'tt_cs602_1', day: 'Tuesday', timeSlot: '02:00 PM - 05:00 PM', startTime: '14:00', endTime: '17:00', room: 'Advanced Software Lab 4', type: 'Lab', topic: 'Lexical Analysis & Syntax Trees', facultyName: 'Prof. Sneha Mohanty' },
      { id: 'tt_cs602_2', day: 'Thursday', timeSlot: '02:00 PM - 05:00 PM', startTime: '14:00', endTime: '17:00', room: 'Advanced Software Lab 4', type: 'Lab', topic: 'Three-Address Code Generation', facultyName: 'Prof. Sneha Mohanty' },
    ],
    announcements: [
      {
        id: 'ann_cs602_1',
        classId: 'cls_cs602',
        authorName: 'Prof. Sneha Mohanty',
        authorRole: 'teacher',
        title: 'Lab Record Verification for Experiments 1 to 4',
        content: 'Please bring your signed spiral hardcopy lab notebooks for experiment verification this Thursday during the first 30 minutes of lab.',
        timestamp: '3 days ago',
        isImportant: true,
      },
    ],
  },
  {
    id: 'cls_cs605',
    subjectCode: 'CS605',
    subjectName: 'Machine Learning & Deep Neural Nets',
    department: 'Computer Science and Engineering',
    semester: 6,
    section: 'A',
    credits: 3,
    room: 'Kalam Block - Lecture Hall 202',
    instructorId: 'usr_teacher_02',
    instructorName: 'Dr. B. K. Panda',
    instructorEmail: 'bk.panda@bput.ac.in',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    timeSlot: '11:15 AM - 12:15 PM',
    attendanceRate: 88.0,
    enrolledStudents: [
      { rollNo: '2501CSE008', name: 'Arya Pattnayak', email: 'arya.pattnayak@bput.ac.in', present: true },
      { rollNo: '2501CSE001', name: 'Aarav Sharma', email: 'aarav.sharma@bput.ac.in', present: true },
      { rollNo: '2501CSE002', name: 'Aditi Mohapatra', email: 'aditi.m@bput.ac.in', present: true },
      { rollNo: '2501CSE003', name: 'Ananya Dash', email: 'ananya.dash@bput.ac.in', present: true },
      { rollNo: '2501CSE004', name: 'Priya Nayak', email: 'priya.nayak@bput.ac.in', present: true },
      { rollNo: '2501CSE015', name: 'Rohan Verma', email: 'rohan.v@bput.ac.in', present: true },
      { rollNo: '2501CSE018', name: 'Subham Biswal', email: 'subham.b@bput.ac.in', present: false },
    ],
    attendanceHistory: [
      {
        id: 'att_cs605_01',
        date: '2026-10-01',
        timeSlot: 'Period 3 (11:15 AM - 12:15 PM)',
        topic: 'Backpropagation Gradient Derivation & Adam Optimizer',
        facultyName: 'Dr. B. K. Panda',
        facultySignature: 'Dr. B. K. Panda (Assoc. Prof, CSE)',
        presentCount: 6,
        totalStudents: 7,
        records: [
          { rollNo: '2501CSE008', studentName: 'Arya Pattnayak', present: true },
          { rollNo: '2501CSE001', studentName: 'Aarav Sharma', present: true },
          { rollNo: '2501CSE002', studentName: 'Aditi Mohapatra', present: true },
          { rollNo: '2501CSE003', studentName: 'Ananya Dash', present: true },
          { rollNo: '2501CSE004', studentName: 'Priya Nayak', present: true },
          { rollNo: '2501CSE015', studentName: 'Rohan Verma', present: true },
          { rollNo: '2501CSE018', studentName: 'Subham Biswal', present: false },
        ],
      },
    ],
    notes: [
      {
        id: 'note_cs605_01',
        classId: 'cls_cs605',
        title: 'Mathematical Foundations of Neural Networks & Loss Surfaces',
        unit: 'Unit 2: Deep Learning',
        description: 'Detailed derivations of chain rule backprop, cross-entropy loss, and exploding/vanishing gradient remedies.',
        fileName: 'CS605_Unit2_Backprop_Math.pdf',
        fileSize: '5.2 MB',
        fileType: 'pdf',
        uploadedBy: 'Dr. B. K. Panda',
        uploaderRole: 'teacher',
        uploaderRollNoOrEmpId: 'EMP-CSE-019',
        uploadDate: '2026-09-28',
        tags: ['#NeuralNetworks', '#Backprop', '#Math'],
        downloadsCount: 42,
        contentSnippet: 'Summary: Computing partial derivative of cost with respect to layer weights using error vector delta. Activation function non-linearities: ReLU, GELU, Sigmoid.',
      },
    ],
    timetable: [
      { id: 'tt_cs605_1', day: 'Monday', timeSlot: '11:15 AM - 12:15 PM', startTime: '11:15', endTime: '12:15', room: 'Kalam Block - Lecture Hall 202', type: 'Lecture', topic: 'Optimization & Regularization', facultyName: 'Dr. B. K. Panda' },
      { id: 'tt_cs605_2', day: 'Thursday', timeSlot: '11:15 AM - 12:15 PM', startTime: '11:15', endTime: '12:15', room: 'Kalam Block - Lecture Hall 202', type: 'Lecture', topic: 'Convolutional Feature Maps', facultyName: 'Dr. B. K. Panda' },
    ],
    announcements: [
      {
        id: 'ann_cs605_1',
        classId: 'cls_cs605',
        authorName: 'Dr. B. K. Panda',
        authorRole: 'teacher',
        title: 'PyTorch Workshop this Saturday',
        content: 'Optional hands-on PyTorch training session for Semester 6 CSE scholars will be held on Saturday morning 09:30 AM in Computer Center Lab 1.',
        timestamp: '4 days ago',
        isImportant: false,
      },
    ],
  },
  {
    id: 'cls_ec601',
    subjectCode: 'EC601',
    subjectName: 'VLSI System Architecture & Verilog HDL',
    department: 'Electronics & Communication Engineering',
    semester: 6,
    section: 'B',
    credits: 4,
    room: 'Raman Block - Embedded Systems Hall 104',
    instructorId: 'usr_teacher_03',
    instructorName: 'Prof. Amitav Tripathy',
    instructorEmail: 'amitav.tripathy@bput.ac.in',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    timeSlot: '09:00 AM - 10:00 AM',
    attendanceRate: 90.5,
    enrolledStudents: [
      { rollNo: '2501ECE001', name: 'Manish Tripathy', email: 'manish.t@bput.ac.in', present: true },
      { rollNo: '2501ECE012', name: 'Debashis Rout', email: 'debashis.r@bput.ac.in', present: true },
      { rollNo: '2501ECE024', name: 'Lipsa Pradhan', email: 'lipsa.p@bput.ac.in', present: true },
      { rollNo: '2501ECE039', name: 'Alok Ranjan', email: 'alok.r@bput.ac.in', present: true },
    ],
    attendanceHistory: [
      {
        id: 'att_ec601_01',
        date: '2026-10-01',
        timeSlot: 'Period 1 (09:00 AM - 10:00 AM)',
        topic: 'CMOS Inverter Propagation Delay & Power Dissipation',
        facultyName: 'Prof. Amitav Tripathy',
        facultySignature: 'Prof. Amitav Tripathy (Faculty Mentor, ECE)',
        presentCount: 4,
        totalStudents: 4,
        records: [
          { rollNo: '2501ECE001', studentName: 'Manish Tripathy', present: true },
          { rollNo: '2501ECE012', studentName: 'Debashis Rout', present: true },
          { rollNo: '2501ECE024', studentName: 'Lipsa Pradhan', present: true },
          { rollNo: '2501ECE039', studentName: 'Alok Ranjan', present: true },
        ],
      },
    ],
    notes: [
      {
        id: 'note_ec601_01',
        classId: 'cls_ec601',
        title: 'CMOS Layout Design Rules & Lambda Scaling (MOSIS)',
        unit: 'Unit 1: Fabrication & Layout',
        description: 'Standard lambda-based design rules, stick diagrams, and well proximity effect considerations in nanoscale nodes.',
        fileName: 'EC601_Unit1_CMOS_Layout.pdf',
        fileSize: '4.7 MB',
        fileType: 'pdf',
        uploadedBy: 'Prof. Amitav Tripathy',
        uploaderRole: 'teacher',
        uploaderRollNoOrEmpId: 'EMP-ECE-031',
        uploadDate: '2026-09-24',
        tags: ['#VLSI', '#CMOS', '#Layout', '#ECE'],
        downloadsCount: 18,
        contentSnippet: 'Summary: Design rules classify geometric constraints into width, spacing, and overlap rules. Lambda metric allows scalable fabrication independent of absolute dimensions.',
      },
    ],
    timetable: [
      { id: 'tt_ec601_1', day: 'Monday', timeSlot: '09:00 AM - 10:00 AM', startTime: '09:00', endTime: '10:00', room: 'Raman Block - Hall 104', type: 'Lecture', topic: 'CMOS Inverters', facultyName: 'Prof. Amitav Tripathy' },
      { id: 'tt_ec601_2', day: 'Wednesday', timeSlot: '09:00 AM - 10:00 AM', startTime: '09:00', endTime: '10:00', room: 'Raman Block - Hall 104', type: 'Lecture', topic: 'Combinational Logic Gates', facultyName: 'Prof. Amitav Tripathy' },
    ],
    announcements: [
      {
        id: 'ann_ec601_1',
        classId: 'cls_ec601',
        authorName: 'Prof. Amitav Tripathy',
        authorRole: 'teacher',
        title: 'FPGA Vivado Board Kits Issued',
        content: 'Section B scholars can collect their Digilent Basys 3 FPGA evaluation boards from the ECE VLSI lab technician after submitting security deposits.',
        timestamp: '1 day ago',
        isImportant: true,
      },
    ],
  },
];

export const INITIAL_SCHEDULE_BLOCKS: ScheduleBlock[] = [
  // Monday
  {
    id: 'sb_mon_01',
    slotId: 'cls_cs601',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    roomName: 'Aryabhatta Block - Hall 301',
    subjectName: 'Distributed Systems & Cloud Computing',
    subjectCode: 'CS601',
    teacherName: 'Prof. Sneha Mohanty',
  },
  {
    id: 'sb_mon_02',
    slotId: 'cls_cs605',
    dayOfWeek: 'Monday',
    startTime: '10:15',
    endTime: '11:15',
    roomName: 'Kalam Block - Room 202',
    subjectName: 'Machine Learning & Deep Neural Nets',
    subjectCode: 'CS605',
    teacherName: 'Dr. B. K. Panda',
  },
  {
    id: 'sb_mon_03',
    slotId: 'cls_cs602',
    dayOfWeek: 'Monday',
    startTime: '14:00',
    endTime: '17:00',
    roomName: 'Advanced Software Lab 4',
    subjectName: 'Compiler Design & AST Lab',
    subjectCode: 'CS602',
    teacherName: 'Prof. Sneha Mohanty',
  },
  // Tuesday
  {
    id: 'sb_tue_01',
    slotId: 'cls_cs605',
    dayOfWeek: 'Tuesday',
    startTime: '09:30',
    endTime: '10:30',
    roomName: 'Kalam Block - Room 202',
    subjectName: 'Machine Learning & Deep Neural Nets',
    subjectCode: 'CS605',
    teacherName: 'Dr. B. K. Panda',
  },
  {
    id: 'sb_tue_02',
    slotId: 'cls_cs601',
    dayOfWeek: 'Tuesday',
    startTime: '11:00',
    endTime: '12:00',
    roomName: 'Aryabhatta Block - Hall 301',
    subjectName: 'Distributed Systems & Cloud Computing',
    subjectCode: 'CS601',
    teacherName: 'Prof. Sneha Mohanty',
  },
  // Wednesday
  {
    id: 'sb_wed_01',
    slotId: 'cls_cs601',
    dayOfWeek: 'Wednesday',
    startTime: '10:00',
    endTime: '11:00',
    roomName: 'Aryabhatta Block - Hall 301',
    subjectName: 'Distributed Systems & Cloud Computing',
    subjectCode: 'CS601',
    teacherName: 'Prof. Sneha Mohanty',
  },
  {
    id: 'sb_wed_02',
    slotId: 'cls_cs605',
    dayOfWeek: 'Wednesday',
    startTime: '11:30',
    endTime: '12:30',
    roomName: 'Kalam Block - Room 202',
    subjectName: 'Machine Learning & Deep Neural Nets',
    subjectCode: 'CS605',
    teacherName: 'Dr. B. K. Panda',
  },
  // Thursday
  {
    id: 'sb_thu_01',
    slotId: 'cls_cs602',
    dayOfWeek: 'Thursday',
    startTime: '09:00',
    endTime: '11:00',
    roomName: 'Advanced Software Lab 4',
    subjectName: 'Compiler Design & AST Lab',
    subjectCode: 'CS602',
    teacherName: 'Prof. Sneha Mohanty',
  },
  {
    id: 'sb_thu_02',
    slotId: 'cls_cs601',
    dayOfWeek: 'Thursday',
    startTime: '11:15',
    endTime: '12:15',
    roomName: 'Aryabhatta Block - Hall 301',
    subjectName: 'Distributed Systems & Cloud Computing',
    subjectCode: 'CS601',
    teacherName: 'Prof. Sneha Mohanty',
  },
  // Friday
  {
    id: 'sb_fri_01',
    slotId: 'cls_cs601',
    dayOfWeek: 'Friday',
    startTime: '10:00',
    endTime: '11:00',
    roomName: 'Aryabhatta Block - Hall 301',
    subjectName: 'Distributed Systems & Cloud Computing',
    subjectCode: 'CS601',
    teacherName: 'Prof. Sneha Mohanty',
  },
  {
    id: 'sb_fri_02',
    slotId: 'cls_cs605',
    dayOfWeek: 'Friday',
    startTime: '14:00',
    endTime: '15:30',
    roomName: 'Kalam Block - Room 202',
    subjectName: 'Machine Learning & Deep Neural Nets',
    subjectCode: 'CS605',
    teacherName: 'Dr. B. K. Panda',
  },
];

export const INITIAL_CLASS_RESOURCES: ClassResource[] = [
  {
    id: 'res_cs601_01',
    slotId: 'cls_cs601',
    title: 'Unit 2: Consensus, Raft State Replication & Byzantine Quorums',
    type: 'PDF',
    url: 'https://example.com/materials/CS601_Unit2_Consensus_Raft_Paxos.pdf',
    uploadedAt: 'Sep 27, 2026',
    uploaderId: 'usr_teacher_01',
    uploaderName: 'Prof. Sneha Mohanty',
    fileSize: '5.8 MB',
  },
  {
    id: 'res_cs601_02',
    slotId: 'cls_cs601',
    title: 'Unit 3: Cloud Virtualization, Hypervisors & K8s Pod Architecture',
    type: 'PDF',
    url: 'https://example.com/materials/CS601_Unit3_Cloud_Virtualization.pdf',
    uploadedAt: 'Sep 30, 2026',
    uploaderId: 'usr_teacher_01',
    uploaderName: 'Prof. Sneha Mohanty',
    fileSize: '7.1 MB',
  },
  {
    id: 'res_cs601_03',
    slotId: 'cls_cs601',
    title: 'BPUT Digital Syllabus & Course Outcomes Reference',
    type: 'Link',
    url: 'https://bput.ac.in/syllabus/cs601-distributed-systems',
    uploadedAt: 'Sep 15, 2026',
    uploaderId: 'usr_teacher_01',
    uploaderName: 'Prof. Sneha Mohanty',
    fileSize: 'External Link',
  },
  {
    id: 'res_cs602_01',
    slotId: 'cls_cs602',
    title: 'Lab Manual: Flex & Bison Lexer/Parser Integration Starter Kit',
    type: 'PDF',
    url: 'https://example.com/materials/CS602_Flex_Bison_Manual.pdf',
    uploadedAt: 'Oct 01, 2026',
    uploaderId: 'usr_teacher_01',
    uploaderName: 'Prof. Sneha Mohanty',
    fileSize: '3.4 MB',
  },
  {
    id: 'res_cs605_01',
    slotId: 'cls_cs605',
    title: 'Lecture Slides: Backpropagation & Deep Neural Architectures',
    type: 'Document',
    url: 'https://example.com/materials/CS605_Backpropagation_Notes.docx',
    uploadedAt: 'Oct 02, 2026',
    uploaderId: 'usr_teacher_02',
    uploaderName: 'Dr. B. K. Panda',
    fileSize: '4.2 MB',
  },
];

const INITIAL_GATE_PASSES: GatePass[] = [
  {
    id: 'GP-2026-8812',
    studentId: 'usr_stud_01',
    studentName: 'Arya Pattnayak',
    rollNo: '2501CSE008',
    department: 'Computer Science and Engineering',
    hostelBlock: 'A',
    roomNo: '204',
    passType: 'market_pass',
    departureTime: 'Today, 17:30',
    expectedReturnTime: 'Today, 20:30',
    reason: 'Procuring Arduino components for semester robotics project',
    destination: 'Patia Electronics Market, Bhubaneswar',
    parentContact: '+91 94370 12345',
    approvedBy: '',
    approvedAt: '',
    qrToken: 'PASS-88120',
    status: 'pending',
  },
  {
    id: 'GP-2026-9421',
    studentId: 'usr_stud_02',
    studentName: 'Aarav Sharma',
    rollNo: '2501CSE001',
    department: 'Computer Science and Engineering',
    hostelBlock: 'A',
    roomNo: '208',
    passType: 'day_out',
    departureTime: 'Today, 18:00',
    expectedReturnTime: 'Today, 21:00',
    reason: 'Family dinner and medical prescription refill',
    destination: 'Apollo Pharmacy & Saheed Nagar',
    parentContact: '+91 98610 98765',
    approvedBy: '',
    approvedAt: '',
    qrToken: 'PASS-94210',
    status: 'pending',
  },
  {
    id: 'GP-2026-1049',
    studentId: 'usr_stud_04',
    studentName: 'Priya Nayak',
    rollNo: '2501CSE004',
    department: 'Computer Science and Engineering',
    hostelBlock: 'B',
    roomNo: '112',
    passType: 'day_out',
    departureTime: 'Today, 16:00',
    expectedReturnTime: 'Today, 20:00',
    reason: 'Attending regional inter-college tech symposium',
    destination: 'Utkal University Auditorium',
    parentContact: '+91 94371 44556',
    approvedBy: 'Mr. Niranjan Sahu (Chief Warden)',
    approvedAt: 'Today, 14:15',
    qrToken: 'PASS-12345',
    status: 'approved',
  },
];

const INITIAL_NOTICES: NoticePost[] = [
  {
    id: 'notif_001',
    authorName: 'Prof. Sneha Mohanty',
    authorRole: 'Faculty Mentor (CSE)',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    authorTitle: 'Department of Computer Science & Engineering',
    title: 'Compiler Design Lab Session Rescheduled',
    content: 'Notice for 6th Semester Section A: Today\'s scheduled Compiler Design Lab (14:00 - 17:00 hrs) in Software Lab 4 is cancelled due to departmental NBA accreditation reviews. The make-up session is scheduled for this Thursday. Please test your Flex lexer tokens independently.',
    groupName: 'Computer Science 6th Semester',
    targetGroup: 'Computer Science 6th Semester',
    targetAudience: 'All CSE 3rd Year Scholars (Sec A)',
    tags: ['#academic', '#lab-update', '#compiler-design'],
    timestamp: '25 mins ago',
    isUrgent: true,
    gotItCount: 42,
    userGotIt: false,
    commentsCount: 8,
    acknowledgedBy: ['usr_teacher_01', 'usr_stud_02', 'usr_stud_03'],
  },
  {
    id: 'notif_002',
    authorName: 'Sasmita Mishra',
    authorRole: 'Finance & Student Accounts',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    authorTitle: 'Central Finance and Administrative Node',
    title: 'Autumn 2026 Examination Fee Clearance Deadline',
    content: 'Official Administrative Advisory: The final deadline for Autumn 2026 End-Semester Examination fee clearance without late surcharge is October 15, 2026. Hall tickets will not be generated for scholars with unverified account dues. Verify transaction receipts through the student portal.',
    groupName: 'University Central Noticeboard',
    targetGroup: 'University Central Noticeboard',
    targetAudience: 'All Enrolled Students (B.Tech / MCA / M.Tech)',
    tags: ['#fees', '#deadline', '#accounts', '#exam-clearance'],
    timestamp: '1 hour ago',
    isUrgent: false,
    gotItCount: 156,
    userGotIt: false,
    commentsCount: 14,
    acknowledgedBy: ['usr_stud_02', 'usr_stud_05'],
  },
  {
    id: 'notif_003',
    authorName: 'Dr. Rajesh Senapati',
    authorRole: 'Head of Department (CSE)',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    authorTitle: 'Head of Department, CSE',
    title: 'High Performance Computing Lab 4 Allocation for Regional Finals',
    content: 'All shortlisted teams for the Regional Hackathon Finals (TechSangam 2026): Central High Performance Software Lab 4 has been pre-allocated with 1Gbps dedicated optical backhaul lines. Overnight pass permissions have been dispatched to Chief Warden and Security Gate 1.',
    groupName: 'Computer Science 6th Semester',
    targetGroup: 'Computer Science 6th Semester',
    targetAudience: 'CSE & Allied Branches',
    tags: ['#cse-dept', '#hackathon', '#bput2026', '#labs'],
    timestamp: '3 hours ago',
    isUrgent: true,
    gotItCount: 89,
    userGotIt: false,
    commentsCount: 22,
    acknowledgedBy: ['usr_stud_01', 'usr_stud_03'],
  },
  {
    id: 'notif_004',
    authorName: 'Mr. Niranjan Sahu',
    authorRole: 'Chief Hostel Warden',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    authorTitle: 'Chief Warden, Brahmaputra & Mahanadi Halls',
    title: 'Night Gate Curfew & Optical Scanners Compliance',
    content: 'All resident scholars: Main Gate optical scanners will enforce night closure promptly at 21:30 hrs. Day-outing scholars must scan biometric QR passes prior to this threshold. Unregistered entries past 21:30 hrs trigger automated SMS notifications to registered guardians.',
    groupName: 'Hostel Residents Central',
    targetGroup: 'Hostel Residents Central',
    targetAudience: 'Hostel Residents (Blocks A, B & C)',
    tags: ['#hostel', '#gatepass', '#curfew', '#security'],
    timestamp: 'Yesterday',
    isUrgent: false,
    gotItCount: 248,
    userGotIt: false,
    commentsCount: 19,
    acknowledgedBy: ['usr_stud_01', 'usr_stud_02', 'usr_stud_04', 'usr_stud_05'],
  },
];

const INITIAL_FEED_ITEMS: FeedItem[] = [
  // 1. Notice from Prof. Sneha
  {
    id: 'feed_notif_001',
    type: 'notice',
    authorName: 'Prof. Sneha Mohanty',
    authorRole: 'Faculty Mentor (CSE)',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    authorTitle: 'Department of Computer Science & Engineering',
    title: 'Compiler Design Lab Session Rescheduled',
    content: 'Notice for 6th Semester Section A: Today\'s scheduled Compiler Design Lab (14:00 - 17:00 hrs) in Software Lab 4 is cancelled due to departmental NBA accreditation reviews. The make-up session is scheduled for this Thursday. Please test your Flex lexer tokens independently.',
    groupName: 'Computer Science 6th Semester',
    targetGroup: 'Computer Science 6th Semester',
    targetAudience: 'All CSE 3rd Year Scholars (Sec A)',
    tags: ['#academic', '#lab-update', '#compiler-design'],
    timestamp: '25 mins ago',
    isUrgent: true,
    gotItCount: 42,
    userGotIt: false,
    commentsCount: 8,
    acknowledgedBy: ['usr_teacher_01', 'usr_stud_02', 'usr_stud_03'],
  },
  // 2. Highly Upvoted Community Issue (Task Step 1)
  {
    id: 'feed_issue_001',
    type: 'issue',
    authorName: 'Arya Pattnayak',
    authorRollNo: '2501CSE008',
    authorRole: 'Student (CSE 6th Sem)',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    title: 'Central Library 2nd Floor High-Speed Wi-Fi Down',
    description: 'The BPUT-Academic-5G optical access points in the 2nd Floor Silent Reading Hall have been showing "Connected, No Internet" since 09:30 AM today. Scholars preparing for gate papers and lab submissions cannot access research repositories or submit assignments.',
    category: 'Campus Infrastructure & Wi-Fi',
    location: 'Central Library, 2nd Floor Silent Reading Hall',
    status: 'in-progress',
    upvotedBy: [
      'usr_student_01', 'usr_stud_02', 'usr_stud_03', 'usr_stud_04', 'usr_stud_05',
      'usr_stud_06', 'usr_stud_07', 'usr_stud_08', 'usr_stud_09', 'usr_stud_10',
      'usr_stud_11', 'usr_stud_12', 'usr_stud_13', 'usr_stud_14', 'usr_stud_15',
      'usr_stud_16', 'usr_stud_17', 'usr_stud_18', 'usr_stud_19', 'usr_stud_20',
      'usr_stud_21', 'usr_stud_22', 'usr_stud_23', 'usr_stud_24', 'usr_stud_25',
      'usr_stud_26', 'usr_stud_27', 'usr_stud_28', 'usr_stud_29', 'usr_stud_30',
      'usr_stud_31', 'usr_stud_32', 'usr_stud_33', 'usr_stud_34', 'usr_stud_35',
      'usr_stud_36', 'usr_stud_37', 'usr_stud_38', 'usr_stud_39', 'usr_stud_40',
      'usr_stud_41', 'usr_stud_42', 'usr_stud_43', 'usr_stud_44', 'usr_stud_45',
      'usr_stud_46', 'usr_stud_47', 'usr_stud_48'
    ],
    timestamp: '1 hour ago',
    targetAudience: 'All Library Patrons & Scholars',
  },
  // 3. Issue with Image Attachment (Task 2)
  {
    id: 'feed_issue_002',
    type: 'issue',
    authorName: 'Rohan Verma',
    authorRollNo: '2501CSE042',
    authorRole: 'Student (Hostel Resident)',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    title: 'Block B Ground Floor RO Water Cooler Leaking Severely',
    description: 'The commercial RO drinking water dispenser in Block B ground floor corridor has a burst inlet valve. Water is pooling across the main hallway creating slip hazards. Needs immediate plumbing attention.',
    category: 'Plumbing & Facilities',
    location: 'Hostel Block B, Ground Floor Water Station',
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    upvotedBy: [
      'usr_student_01', 'usr_stud_02', 'usr_stud_03', 'usr_stud_04', 'usr_stud_05',
      'usr_stud_06', 'usr_stud_07', 'usr_stud_08', 'usr_stud_09', 'usr_stud_10',
      'usr_stud_11', 'usr_stud_12', 'usr_stud_13', 'usr_stud_14', 'usr_stud_15'
    ],
    timestamp: '35 mins ago',
    targetAudience: 'Hostel Block B Residents',
  },
  // 4. Interactive Poll (Task Step 1)
  {
    id: 'feed_poll_001',
    type: 'poll',
    authorName: 'Canteen & Dining Board',
    authorRole: 'Student Mess Committee',
    authorAvatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    question: 'Sunday Gala Dinner Special: Which regional specialty menu should be served this weekend?',
    options: [
      {
        id: 'opt_1',
        text: 'Hyderabadi Chicken Dum Biryani & Paneer Biryani',
        votedBy: [
          'usr_stud_02', 'usr_stud_03', 'usr_stud_04', 'usr_stud_05', 'usr_stud_06',
          'usr_stud_07', 'usr_stud_08', 'usr_stud_09', 'usr_stud_10', 'usr_stud_11',
          'usr_stud_12', 'usr_stud_13', 'usr_stud_14', 'usr_stud_15', 'usr_stud_16',
          'usr_stud_17', 'usr_stud_18', 'usr_stud_19', 'usr_stud_20', 'usr_stud_21',
          'usr_stud_22', 'usr_stud_23', 'usr_stud_24', 'usr_stud_25', 'usr_stud_26',
          'usr_stud_27', 'usr_stud_28', 'usr_stud_29', 'usr_stud_30', 'usr_stud_31',
          'usr_stud_32', 'usr_stud_33', 'usr_stud_34', 'usr_stud_35', 'usr_stud_36',
          'usr_stud_37', 'usr_stud_38', 'usr_stud_39', 'usr_stud_40', 'usr_stud_41',
          'usr_stud_42', 'usr_stud_43', 'usr_stud_44', 'usr_stud_45', 'usr_stud_46',
          'usr_stud_47', 'usr_stud_48', 'usr_stud_49', 'usr_stud_50', 'usr_stud_51'
        ],
      },
      {
        id: 'opt_2',
        text: 'Amritsari Kulcha with Chhole & Butter Tossed Dal Makhani',
        votedBy: [
          'usr_stud_55', 'usr_stud_56', 'usr_stud_57', 'usr_stud_58', 'usr_stud_59',
          'usr_stud_60', 'usr_stud_61', 'usr_stud_62', 'usr_stud_63', 'usr_stud_64',
          'usr_stud_65', 'usr_stud_66', 'usr_stud_67', 'usr_stud_68', 'usr_stud_69'
        ],
      },
      {
        id: 'opt_3',
        text: 'Odia Dalma Feast with Crispy Potol Bhaja & Kheeri',
        votedBy: [
          'usr_stud_76', 'usr_stud_77', 'usr_stud_78', 'usr_stud_79', 'usr_stud_80',
          'usr_stud_81', 'usr_stud_82', 'usr_stud_83', 'usr_stud_84', 'usr_stud_85',
          'usr_stud_86', 'usr_stud_87', 'usr_stud_88', 'usr_stud_89', 'usr_stud_90',
          'usr_stud_91', 'usr_stud_92', 'usr_stud_93', 'usr_stud_94', 'usr_stud_95',
          'usr_stud_96', 'usr_stud_97', 'usr_stud_98', 'usr_stud_99', 'usr_stud_100',
          'usr_stud_101', 'usr_stud_102', 'usr_stud_103', 'usr_stud_104', 'usr_stud_105',
          'usr_stud_106', 'usr_stud_107', 'usr_stud_108', 'usr_stud_109'
        ],
      },
      {
        id: 'opt_4',
        text: 'South Indian Crispy Masala Dosa Platter & Vada',
        votedBy: [
          'usr_stud_110', 'usr_stud_111', 'usr_stud_112', 'usr_stud_113', 'usr_stud_114',
          'usr_stud_115', 'usr_stud_116', 'usr_stud_117'
        ],
      },
    ],
    timestamp: '2 hours ago',
    expiresAt: 'Closes tonight at 23:59 hrs',
    targetAudience: 'Hostel Resident Scholars',
    tags: ['#mess', '#sunday-special', '#student-poll'],
  },
  // 4. Notice from Sasmita Mishra
  {
    id: 'feed_notif_002',
    type: 'notice',
    authorName: 'Sasmita Mishra',
    authorRole: 'Finance & Student Accounts',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    authorTitle: 'Central Finance and Administrative Node',
    title: 'Autumn 2026 Examination Fee Clearance Deadline',
    content: 'Official Administrative Advisory: The final deadline for Autumn 2026 End-Semester Examination fee clearance without late surcharge is October 15, 2026. Hall tickets will not be generated for scholars with unverified account dues. Verify transaction receipts through the student portal.',
    groupName: 'University Central Noticeboard',
    targetGroup: 'University Central Noticeboard',
    targetAudience: 'All Enrolled Students (B.Tech / MCA / M.Tech)',
    tags: ['#fees', '#deadline', '#accounts', '#exam-clearance'],
    timestamp: '1 hour ago',
    isUrgent: false,
    gotItCount: 156,
    userGotIt: false,
    commentsCount: 14,
    acknowledgedBy: ['usr_stud_02', 'usr_stud_05'],
  },
  // 5. Notice from Dr. Rajesh Senapati
  {
    id: 'feed_notif_003',
    type: 'notice',
    authorName: 'Dr. Rajesh Senapati',
    authorRole: 'Head of Department (CSE)',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    authorTitle: 'Head of Department, CSE',
    title: 'High Performance Computing Lab 4 Allocation for Regional Finals',
    content: 'All shortlisted teams for the Regional Hackathon Finals (TechSangam 2026): Central High Performance Software Lab 4 has been pre-allocated with 1Gbps dedicated optical backhaul lines. Overnight pass permissions have been dispatched to Chief Warden and Security Gate 1.',
    groupName: 'Computer Science 6th Semester',
    targetGroup: 'Computer Science 6th Semester',
    targetAudience: 'CSE & Allied Branches',
    tags: ['#cse-dept', '#hackathon', '#bput2026', '#labs'],
    timestamp: '3 hours ago',
    isUrgent: true,
    gotItCount: 89,
    userGotIt: false,
    commentsCount: 22,
    acknowledgedBy: ['usr_student_01', 'usr_stud_03'],
  },
  // 6. Notice from Chief Warden Niranjan Sahu
  {
    id: 'feed_notif_004',
    type: 'notice',
    authorName: 'Mr. Niranjan Sahu',
    authorRole: 'Chief Hostel Warden',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    authorTitle: 'Chief Warden, Brahmaputra & Mahanadi Halls',
    title: 'Night Gate Curfew & Optical Scanners Compliance',
    content: 'All resident scholars: Main Gate optical scanners will enforce night closure promptly at 21:30 hrs. Day-outing scholars must scan biometric QR passes prior to this threshold. Unregistered entries past 21:30 hrs trigger automated SMS notifications to registered guardians.',
    groupName: 'Hostel Residents Central',
    targetGroup: 'Hostel Residents Central',
    targetAudience: 'Hostel Residents (Blocks A, B & C)',
    tags: ['#hostel', '#gatepass', '#curfew', '#security'],
    timestamp: 'Yesterday',
    isUrgent: false,
    gotItCount: 248,
    userGotIt: false,
    commentsCount: 19,
    acknowledgedBy: ['usr_student_01', 'usr_stud_02', 'usr_stud_04', 'usr_stud_05'],
  },
];

const INITIAL_ISSUES: CampusIssue[] = [
  {
    id: 'TKT-1042',
    title: 'East wing corridor circuit breaker tripping during morning hours',
    description: 'Between 06:30 and 07:15 hours, activating the east wing water heating line trips circuit breaker DB-2 on the second floor distribution board.',
    category: 'hostel',
    location: 'Hostel Block A, 2nd Floor East Wing',
    authorName: 'Arya Pattnayak',
    authorRollNo: '2501CSE008',
    createdAt: 'Today, 08:30 AM',
    upvotes: 24,
    userUpvoted: true,
    status: 'in_progress',
    statusUpdateNote: 'Electrician assigned by Warden Niranjan Sahu. Inspection scheduled for 16:30 hours today.',
    assignedTo: 'Estate Electrical Maintenance',
    urgency: 'high',
    assignedTechnician: {
      name: 'Manoj Jena',
      trade: 'Senior Electrical Engineer',
      contact: '+91 94370 12345',
    },
    scheduledResolution: 'Today, 16:30 hours',
    assetTag: 'HST-A-DB2-ELECTRICAL',
  },
  {
    id: 'TKT-1045',
    title: 'Room A-204 High-Speed LAN Port 1 socket physical pin loose',
    description: 'The RJ45 ethernet keystone socket pin 3 is bent, causing intermittent link drops down to 10 Mbps instead of 1 Gbps gigabit speed.',
    category: 'hostel',
    location: 'Hostel Block A, Room A-204 (Bed 1 Desk)',
    authorName: 'Arya Pattnayak',
    authorRollNo: '2501CSE008',
    createdAt: 'Yesterday, 14:00 PM',
    upvotes: 2,
    userUpvoted: false,
    status: 'assigned',
    statusUpdateNote: 'Computer Center network engineer assigned for crimping and punchdown tool replacement.',
    assignedTo: 'Campus Networking Division',
    urgency: 'medium',
    assignedTechnician: {
      name: 'Soumya Ranjan Das',
      trade: 'Network Field Technician',
      contact: '+91 98610 98765',
    },
    scheduledResolution: 'Tomorrow, 11:00 AM',
    assetTag: 'HST-A-LAN-204-1',
  },
  {
    id: 'TKT-1039',
    title: 'Floor 2 Water Cooler RO cartridge replacement and TDS audit',
    description: 'Output TDS reading from the central water purifier is at 280 ppm. Requested scheduled sediment and carbon filter cartridge replacement.',
    category: 'hostel',
    location: 'Hostel Block A, Floor 2 Water Dispensary',
    authorName: 'Rohan Mishra',
    authorRollNo: '2501CSE012',
    createdAt: '2 days ago',
    upvotes: 38,
    userUpvoted: true,
    status: 'resolved',
    statusUpdateNote: 'Completed: New 10-micron spun filter and reverse osmosis membrane installed. Post-filtration TDS verified at 75 ppm.',
    assignedTo: 'Water Sanitation Services',
    urgency: 'medium',
    assignedTechnician: {
      name: 'Pabitra Behera',
      trade: 'RO & Water Systems Specialist',
      contact: '+91 94381 22334',
    },
    scheduledResolution: 'Yesterday, 17:00 hours',
    assetTag: 'HST-A-RO-DISP-02',
  },
  {
    id: 'TKT-1048',
    title: 'Dining Hall exhaust blower 2 vibration and squeaking noise',
    description: 'The grease filter on central exhaust duct blower 2 in the mess kitchen requires lubricating and belt alignment.',
    category: 'mess',
    location: 'Central Dining Hall Kitchen',
    authorName: 'Debabrata Nayak',
    authorRollNo: '2501CSE019',
    createdAt: 'Today, 10:15 AM',
    upvotes: 14,
    userUpvoted: false,
    status: 'reported',
    statusUpdateNote: 'Logged in Central Maintenance register. Awaiting Warden approval for HVAC contractor visit.',
    assignedTo: 'HVAC Services',
    urgency: 'low',
    scheduledResolution: 'Oct 3, 2026',
    assetTag: 'MSS-HVAC-EXHAUST-02',
  },
];

const INITIAL_ROOM_RECORD: StudentRoomRecord = {
  hostelBlock: 'Hostel Block A (Bhabha Bhawan)',
  roomNo: 'A-204',
  floor: 2,
  bedNo: 'Bed 01 (Window Side)',
  occupancyType: 'Double Seater Scholar Suite',
  roommateName: 'Rohan Mishra',
  roommateRoll: '2501CSE012',
  allocatedDate: '15 July 2025',
  cleanlinessRating: 4.8,
  inspectionStatus: 'Certified Clean & Operational',
  lastInspectionDate: '28 Sep 2026 by Warden Niranjan Sahu',
  assets: [
    {
      id: 'ast_1',
      name: 'Solid Teak Study Table with Bookshelf',
      assetTag: 'HST-A-TBL-204-1',
      condition: 'Excellent',
      lastInspected: '28 Sep 2026',
      remarks: 'No scratches, drawer lock functional',
    },
    {
      id: 'ast_2',
      name: 'Ergonomic Mesh Study Chair',
      assetTag: 'HST-A-CHR-204-1',
      condition: 'Good',
      lastInspected: '28 Sep 2026',
      remarks: 'Height gas-lift cylinder operational',
    },
    {
      id: 'ast_3',
      name: 'Steel Almirah with Locker (Godrej 2-Door)',
      assetTag: 'HST-A-ALM-204-1',
      condition: 'Excellent',
      lastInspected: '28 Sep 2026',
      remarks: 'Dual keys verified and stamped',
    },
    {
      id: 'ast_4',
      name: 'Single Bed Frame with Storage Box',
      assetTag: 'HST-A-BED-204-1',
      condition: 'Good',
      lastInspected: '28 Sep 2026',
      remarks: 'Standard 6x3 ft mattress slot',
    },
    {
      id: 'ast_5',
      name: 'Gigabit LAN Keystone Port & Cat6 Patch',
      assetTag: 'HST-A-LAN-204-1',
      condition: 'Needs Repair',
      lastInspected: 'Today',
      remarks: 'Ticket TKT-1045 active for pin re-crimping',
    },
    {
      id: 'ast_6',
      name: 'Ceiling Fan (Havells 1200mm) & Electronic Stepped Regulator',
      assetTag: 'HST-A-FAN-204',
      condition: 'Good',
      lastInspected: '28 Sep 2026',
      remarks: 'Speed steps 1 to 5 balanced',
    },
  ],
};

const INITIAL_MESS_FEEDBACK: MessFeedbackItem[] = [
  {
    id: 'MFB-101',
    date: 'Today, 13:45 PM',
    mealType: 'Lunch',
    authorName: 'Arya Pattnayak',
    authorRoll: '2501CSE008',
    rating: 5,
    comment: 'Paneer Butter Masala was very fresh today and the steamed Basmati rice quality was excellent! Great job by the kitchen team.',
    dishesEvaluated: ['Paneer Butter Masala', 'Yellow Dal Tadka', 'Basmati Rice', 'Cucumber Salad'],
    upvotes: 42,
    userUpvoted: true,
    canteenResponse: 'Thank you Arya! We procured organic cottage cheese from the OMFED dairy depot this morning.',
    respondedAt: 'Today, 14:15 PM',
  },
  {
    id: 'MFB-102',
    date: 'Today, 09:10 AM',
    mealType: 'Breakfast',
    authorName: 'Suman Mohapatra',
    authorRoll: '2501CSE034',
    rating: 4,
    comment: 'Puri Sabji was hot and crispy. Would appreciate adding boiled eggs or sprout salad as protein alternative on weekday mornings.',
    dishesEvaluated: ['Puri Sabji', 'Chana Dal', 'Spiced Tea'],
    upvotes: 28,
    userUpvoted: false,
    canteenResponse: 'Noted for the Hostel Dining Committee meeting this Friday. We will add boiled eggs option.',
    respondedAt: 'Today, 10:00 AM',
  },
  {
    id: 'MFB-103',
    date: 'Yesterday, 20:30 PM',
    mealType: 'Dinner',
    authorName: 'Rohan Mishra',
    authorRoll: '2501CSE012',
    rating: 4,
    comment: 'Dal Makhani and warm Rotis were served on time without long queues. Sanitizer dispensers at the entrance were also refilled.',
    dishesEvaluated: ['Dal Makhani', 'Tawa Roti', 'Jeera Pulao', 'Gulab Jamun'],
    upvotes: 19,
    userUpvoted: false,
  },
];

const INITIAL_VISITOR_PASSES: VisitorPass[] = [
  {
    id: 'VIS-901',
    visitorName: 'Prabhat Pattnayak',
    relationship: 'Father',
    contactNo: '+91 98610 11222',
    studentName: 'Arya Pattnayak',
    studentRoll: '2501CSE008',
    hostelBlock: 'Hostel Block A',
    roomNo: 'A-204',
    purpose: 'Academic consultation with HOD and personal hostel room visit',
    visitDate: '2026-10-04',
    expectedArrivalTime: '10:30 AM',
    expectedDepartureTime: '17:00 PM',
    vehicleNumber: 'OD-02-BA-4512',
    hostelEntryPermitted: true,
    status: 'approved',
    approvedBy: 'Mr. Niranjan Sahu (Chief Warden)',
    qrToken: 'BPUT-VIS-PRABHAT-20261004',
  },
];

const INITIAL_GATE_LOGS: GateLogEntry[] = [
  {
    id: 'GLOG-7801',
    timestamp: 'Today, 17:35:12',
    personName: 'Arya Pattnayak',
    identifier: '2501CSE008',
    roleType: 'student',
    direction: 'EXIT',
    gateLocation: 'Main Gate 1 Optical Turnstile',
    passReference: 'PASS-7891 (Day Out)',
    verifiedByGuard: 'Guard Pradeep Rout',
    status: 'Authorized',
  },
  {
    id: 'GLOG-7800',
    timestamp: 'Today, 17:15:40',
    personName: 'Prof. Sneha Mohanty',
    identifier: 'EMP-CSE-042',
    roleType: 'faculty',
    direction: 'EXIT',
    gateLocation: 'Main Gate 1 RFID Boom Barrier',
    verifiedByGuard: 'Guard Pradeep Rout',
    status: 'Authorized',
  },
  {
    id: 'GLOG-7799',
    timestamp: 'Today, 16:42:05',
    personName: 'Rohan Mishra',
    identifier: '2501CSE012',
    roleType: 'student',
    direction: 'ENTRY',
    gateLocation: 'Main Gate 1 Optical Turnstile',
    passReference: 'PASS-7888 (Market Pass)',
    verifiedByGuard: 'Guard Pradeep Rout',
    status: 'Authorized',
  },
  {
    id: 'GLOG-7798',
    timestamp: 'Today, 14:10:19',
    personName: 'Manoj Jena (Electrician)',
    identifier: 'VND-EST-019',
    roleType: 'staff',
    direction: 'ENTRY',
    gateLocation: 'Hostel Block A Security Gate',
    passReference: 'TKT-1042 Maintenance Service',
    verifiedByGuard: 'Guard Kalia Sethi',
    status: 'Authorized',
  },
  {
    id: 'GLOG-7797',
    timestamp: 'Today, 11:20:55',
    personName: 'Dr. Rajesh Senapati',
    identifier: 'EMP-CSE-001',
    roleType: 'faculty',
    direction: 'ENTRY',
    gateLocation: 'Main Gate 1 RFID Boom Barrier',
    verifiedByGuard: 'Guard Pradeep Rout',
    status: 'Authorized',
  },
];

const INITIAL_STUDENT_FEES: StudentFeeItem[] = [
  {
    id: 'fee_01',
    category: 'Tuition',
    title: '6th Semester Academic Tuition & Laboratory Fee',
    semester: 6,
    amount: 48500,
    status: 'paid',
    receiptNo: 'BPUT-REC-9910',
    paidAt: '2026-07-15',
    dueDate: '2026-07-30',
    paymentMode: 'HDFC Net Banking / UPI',
  },
  {
    id: 'fee_02',
    category: 'Hostel',
    title: 'Hostel Block A (Bhabha Bhawan) 2-Seater Room Rent',
    semester: 6,
    amount: 18000,
    status: 'paid',
    receiptNo: 'HST-2026-442',
    paidAt: '2026-07-20',
    dueDate: '2026-07-31',
    paymentMode: 'SBI Collect Portal',
  },
  {
    id: 'fee_03',
    category: 'Mess',
    title: 'Central Mess Food & Dining Advance Deposit',
    semester: 6,
    amount: 14000,
    status: 'paid',
    receiptNo: 'MSS-2026-108',
    paidAt: '2026-07-20',
    dueDate: '2026-08-05',
    paymentMode: 'Online Transfer',
  },
  {
    id: 'fee_04',
    category: 'Exam',
    title: 'BPUT Even Semester End-Term Examination & Admit Fee',
    semester: 6,
    amount: 2400,
    status: 'paid',
    receiptNo: 'EXM-2026-891',
    paidAt: '2026-09-01',
    dueDate: '2026-09-15',
    paymentMode: 'UPI Gateway',
  },
  {
    id: 'fee_05',
    category: 'Library',
    title: 'IEEE Xplore & Central Digital Library Access',
    semester: 6,
    amount: 1500,
    status: 'paid',
    receiptNo: 'LIB-2026-302',
    paidAt: '2026-07-22',
    dueDate: '2026-08-10',
    paymentMode: 'Campus Card',
  },
  {
    id: 'fee_06',
    category: 'Convocation',
    title: 'Graduation Cap & Provisional Degree Dispatch Advance',
    semester: 6,
    amount: 1800,
    status: 'pending',
    dueDate: '2026-11-30',
  },
];

const INITIAL_APPLICATIONS: ServiceApplication[] = [
  {
    id: 'APP-9921',
    type: 'bonafide',
    title: 'Bonafide Certificate for National Scholarship Portal Verification',
    studentName: 'Arya Pattnayak',
    rollNo: '2501CSE008',
    submittedAt: 'Yesterday, 11:30 AM',
    status: 'approved',
    currentApproverRole: 'admin',
    details: {
      Purpose: 'Post-Matric Scholarship Scheme Verification',
      Semester: '6th Semester (CSE)',
      AcademicYear: '2025-2026',
      FatherName: 'Prabhat Pattnayak',
      EnrollmentStatus: 'Regular Full-Time B.Tech',
      ValidUntil: '30 June 2026',
    },
    timeline: [
      { step: 'Application Submitted', role: 'Student', status: 'completed', updatedAt: 'Yesterday 11:30 AM' },
      { step: 'Faculty Mentor Endorsement', role: 'Prof. Sneha Mohanty', status: 'completed', updatedAt: 'Yesterday 14:15', signatureUrl: 'Prof. Sneha Mohanty (Faculty Mentor)' },
      { step: 'HOD Clearance', role: 'Dr. Rajesh Senapati', status: 'completed', updatedAt: 'Yesterday 16:45', signatureUrl: 'Dr. Rajesh Senapati (HOD CSE)' },
      { step: 'Academic Cell Dispatch', role: 'Dean Office', status: 'completed', updatedAt: 'Today 10:00 AM', signatureUrl: 'Dean of Student Affairs (Institutional Seal)' },
    ],
  },
  {
    id: 'APP-9925',
    type: 'leave',
    title: 'Academic Duty Leave for Smart Odisha AI Hackathon Representation',
    studentName: 'Arya Pattnayak',
    rollNo: '2501CSE008',
    submittedAt: 'Today, 09:15 AM',
    status: 'approved',
    currentApproverRole: 'hod',
    details: {
      Reason: 'Selected in Grand Finale of Smart Odisha Hackathon',
      Venue: 'IIT Bhubaneswar Research Park',
      Duration: '3 Days (Oct 5 to Oct 7, 2026)',
      MentorName: 'Prof. Sneha Mohanty',
      AttendanceCredit: '100% Duty Leave Attendance Applicable',
    },
    timeline: [
      { step: 'Leave Requested', role: 'Student', status: 'completed', updatedAt: 'Today 09:15 AM' },
      { step: 'Faculty Mentor Endorsement', role: 'Prof. Sneha Mohanty', status: 'completed', updatedAt: 'Today 10:30 AM', signatureUrl: 'Prof. Sneha Mohanty (Verified Contestant)' },
      { step: 'HOD Academic Approval', role: 'Dr. Rajesh Senapati', status: 'completed', updatedAt: 'Today 11:00 AM', signatureUrl: 'Dr. Rajesh Senapati (HOD CSE)' },
    ],
  },
  {
    id: 'APP-9929',
    type: 'mess_rebate',
    title: 'Mess Rebate Deduction for Authorized Hackathon Days',
    studentName: 'Arya Pattnayak',
    rollNo: '2501CSE008',
    submittedAt: 'Today, 11:45 AM',
    status: 'pending_warden',
    currentApproverRole: 'warden',
    details: {
      HostelBlock: 'Hostel Block A (Room A-204)',
      LeaveReference: 'APP-9925',
      FromDate: '2026-10-05',
      ToDate: '2026-10-07',
      RebateRate: '₹140/day (Total ₹420 credit to next month mess bill)',
    },
    timeline: [
      { step: 'Rebate Request Submitted', role: 'Student', status: 'completed', updatedAt: 'Today 11:45 AM' },
      { step: 'Warden Biometric Verification', role: 'Mr. Niranjan Sahu', status: 'current', updatedAt: 'In Review' },
      { step: 'Dining Board Accounts Credit', role: 'Mess Accountant', status: 'pending' },
    ],
  },
];

const INITIAL_THREADS: ChatThread[] = [
  {
    id: 'thread_cse_official',
    type: 'channel',
    name: 'Computer Science Department Official Broadcast',
    subtitle: 'Dr. Rajesh Senapati, HOD',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80',
    unreadCount: 1,
    lastMessage: 'Lab 4 access credentials for all hackathon finalists have been dispatched.',
    lastMessageTime: '12:40 PM',
    isOfficial: true,
  },
  {
    id: 'thread_warden_niranjan',
    type: 'dm',
    name: 'Mr. Niranjan Sahu (Chief Warden)',
    subtitle: 'Hostel Block A Administration',
    role: 'warden',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    unreadCount: 0,
    lastMessage: 'Your day out pass for today is approved. Be back by 20:30 hours.',
    lastMessageTime: '15:15 PM',
    isOnline: true,
  },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  thread_warden_niranjan: [
    {
      id: 'm1',
      threadId: 'thread_warden_niranjan',
      senderId: 'usr_student_01',
      senderName: 'Arya Pattnayak',
      senderRole: 'student',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      text: 'Good afternoon Sir, I have submitted a Day Out pass for purchasing project microcontrollers and reference texts from Master Canteen market.',
      timestamp: '15:10 PM',
      isMe: true,
      status: 'read',
    },
    {
      id: 'm2',
      threadId: 'thread_warden_niranjan',
      senderId: 'usr_warden_01',
      senderName: 'Mr. Niranjan Sahu',
      senderRole: 'warden',
      senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      text: 'Your day out pass is approved. Return strictly by 20:30 hours. Ensure you scan the QR at Gate 1.',
      timestamp: '15:15 PM',
      isMe: false,
      status: 'read',
    },
  ],
};

const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'AUD-901',
    timestamp: 'Today, 15:15 PM',
    actorName: 'Mr. Niranjan Sahu',
    actorRole: 'warden',
    action: 'APPROVE_GATEPASS',
    target: 'GP-2026-9042 (Arya Pattnayak - 2501CSE008)',
    details: 'Approved Day Outing until 20:30 hours. Purpose: Project hardware procurement.',
  },
];

interface AppState {
  isAuthenticated: boolean;
  currentRole: Role;
  currentUser: UserProfile;
  profiles: Record<Role, UserProfile>;
  language: Language;
  
  isOffline: boolean;
  activeTab: 'home' | 'classroom' | 'messages' | 'services' | 'issues' | 'profile';
  isCreateSceneOpen: boolean;
  activeStoryIndex: number | null;
  selectedThreadId: string | null;
  activeClassroomId: string | null;
  
  canteenMenu: CanteenDailyMenu;
  emergencyAlert: EmergencyAlert;

  classrooms: Classroom[];
  teacherClasses: TeacherClass[];
  scheduleBlocks: ScheduleBlock[];
  classResources: ClassResource[];
  gatePasses: GatePass[];
  notices: NoticePost[];
  feedItems: FeedItem[];
  issues: CampusIssue[];
  applications: ServiceApplication[];
  studentFees: StudentFeeItem[];
  roomRecord: StudentRoomRecord;
  messFeedback: MessFeedbackItem[];
  visitorPasses: VisitorPass[];
  gateLogs: GateLogEntry[];
  threads: ChatThread[];
  messages: Record<string, ChatMessage[]>;
  auditLogs: AuditLogItem[];
  authSession: any | null;

  // Actions
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string; requiresPasswordChange?: boolean; user?: UserProfile }>;
  signUpWithEmail: (email: string, password: string, fullName?: string, role?: Role) => Promise<{ success: boolean; error?: string; message?: string }>;
  updateUserPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  completePasswordReset: (newMetadata?: Record<string, any>) => void;
  login: (identifier?: string, password?: string, isDemo?: boolean) => { success: boolean; error?: string };
  claimAccount: (identifier: string, newPassword: string, email?: string) => { success: boolean; error?: string; user?: UserProfile };
  logout: () => void;
  setRole: (role: Role) => void;
  setLanguage: (lang: Language) => void;
  toggleOffline: () => void;
  setActiveTab: (tab: AppState['activeTab']) => void;
  setActiveClassroomId: (id: string | null) => void;
  markClassroomAttendance: (classId: string, date: string, timeSlot: string, topic: string, records: { rollNo: string; studentName: string; present: boolean }[]) => void;
  toggleClassroomStudentAttendance: (classId: string, rollNo: string) => void;
  markAllClassroomAttendance: (classId: string, present: boolean) => void;
  addClassroomNote: (classId: string, note: { title: string; unit: string; description: string; fileName: string; fileSize: string; fileType: ClassroomNote['fileType']; tags: string[]; contentSnippet?: string }) => void;
  incrementNoteDownload: (classId: string, noteId: string) => void;
  addClassroomAnnouncement: (classId: string, title: string, content: string, isImportant?: boolean) => void;
  setCreateSceneOpen: (open: boolean) => void;
  openStory: (index: number) => void;
  closeStory: () => void;
  selectThread: (threadId: string | null) => void;

  updateCanteenMenu: (menu: Partial<CanteenDailyMenu>) => void;
  triggerEmergencyAlert: (type: EmergencyAlert['type'], title: string, message: string) => void;
  dismissEmergencyAlert: () => void;

  adminEditUserProfile: (roleKey: Role, updatedData: Partial<UserProfile>) => void;
  provisionClassroom: (classroom: Classroom) => void;
  enrollStudentInClassroom: (classId: string, student: ClassroomStudent) => void;
  unenrollStudentFromClassroom: (classId: string, rollNo: string) => void;
  assignFacultyToClassroom: (classId: string, faculty: { id: string; name: string; email: string; avatarUrl: string }) => void;
  toggleStudentAttendance: (classId: string, rollNo: string) => void;
  submitClassAttendance: (classId: string, date: string, timeSlot: string) => void;
  saveTeacherDigitalSignature: (signature: string) => void;
  createGroupChannel: (name: string, subtitle: string, type: 'channel' | 'dm') => void;
  requestGatePass: (newPass: Omit<GatePass, 'id' | 'studentId' | 'studentName' | 'rollNo' | 'department' | 'hostelBlock' | 'roomNo' | 'approvedBy' | 'approvedAt' | 'qrToken' | 'status'>) => void;
  approveGatePass: (passId: string) => void;
  rejectGatePass: (passId: string) => void;
  verifyGuardScan: (qrToken: string, action: 'exit' | 'entry') => { success: boolean; message: string; pass?: GatePass };
  toggleNoticeGotIt: (noticeId: string) => void;
  acknowledgeNotice: (noticeId: string, userId?: string) => void;
  upvoteFeedIssue: (issueId: string, userId?: string) => void;
  voteFeedPoll: (pollId: string, optionId: string, userId?: string) => void;
  acknowledgeFeedNotice: (noticeId: string, userId?: string) => void;
  createFeedItem: (item: FeedItem) => void;
  addClassResource: (resource: { slotId: string; title: string; type: ClassResource['type']; url: string; fileSize?: string }) => void;
  createNotice: (title: string, content: string, groupName: string, tags: string[], isUrgent?: boolean, imageUrl?: string) => void;
  toggleIssueUpvote: (issueId: string) => void;
  createIssue: (title: string, description: string, category: CampusIssue['category'], location: string, urgency?: CampusIssue['urgency'], assetTag?: string) => void;
  updateIssueStatus: (issueId: string, status: CampusIssue['status'], note?: string) => void;
  approveApplication: (appId: string, remarks?: string) => void;
  submitServiceApplication: (newApp: { type: ApplicationType; title: string; details: Record<string, string>; targetApprover?: Role }) => void;
  payFeeItem: (feeId: string) => void;
  addMessFeedback: (feedback: { mealType: MessFeedbackItem['mealType']; rating: number; comment: string; dishesEvaluated: string[] }) => void;
  toggleMessFeedbackUpvote: (feedbackId: string) => void;
  requestVisitorPass: (pass: Omit<VisitorPass, 'id' | 'studentName' | 'studentRoll' | 'hostelBlock' | 'roomNo' | 'status' | 'qrToken'>) => void;
  approveVisitorPass: (passId: string) => void;
  sendMessage: (threadId: string, text: string) => void;
}

export const useAppStore = create<AppState>((set, get) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => set({ isOffline: false }));
    window.addEventListener('offline', () => set({ isOffline: true }));
  }

  return {
    isAuthenticated: false, // Default false: Starts directly on Institutional Login Screen!
    currentRole: 'student',
    currentUser: DEMO_PROFILES.student,
    profiles: DEMO_PROFILES,
    language: 'en',
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    activeTab: 'home',
    isCreateSceneOpen: false,
    activeStoryIndex: null,
    selectedThreadId: null,
    activeClassroomId: null,

    canteenMenu: INITIAL_CANTEEN_MENU,
    emergencyAlert: INITIAL_EMERGENCY_ALERT,

    classrooms: INITIAL_CLASSROOMS,
    teacherClasses: INITIAL_TEACHER_CLASSES,
    scheduleBlocks: INITIAL_SCHEDULE_BLOCKS,
    classResources: INITIAL_CLASS_RESOURCES,
    gatePasses: INITIAL_GATE_PASSES,
    notices: INITIAL_NOTICES,
    feedItems: INITIAL_FEED_ITEMS,
    issues: INITIAL_ISSUES,
    applications: INITIAL_APPLICATIONS,
    studentFees: INITIAL_STUDENT_FEES,
    roomRecord: INITIAL_ROOM_RECORD,
    messFeedback: INITIAL_MESS_FEEDBACK,
    visitorPasses: INITIAL_VISITOR_PASSES,
    gateLogs: INITIAL_GATE_LOGS,
    threads: INITIAL_THREADS,
    messages: INITIAL_MESSAGES,
    auditLogs: INITIAL_AUDIT_LOGS,
    authSession: null,

    signInWithEmail: async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const mapped = mapSupabaseProfileToUser(data.user, dbProfile);

          // Forced Password Reset check:
          // If metadata.requires_password_change is true, keep isAuthenticated=false
          // so InstitutionalLoginScreen can intercept and show the 'Set New Secure Password' form.
          const requiresChange = Boolean(
            dbProfile?.metadata?.requires_password_change ||
            mapped.metadata?.requires_password_change ||
            data.user.user_metadata?.requires_password_change
          );

          if (requiresChange) {
            set({
              isAuthenticated: false,
              authSession: data.session,
              currentUser: mapped,
              currentRole: mapped.role,
            });
            return {
              success: true,
              requiresPasswordChange: true,
              user: mapped,
            };
          }

          set({
            isAuthenticated: true,
            authSession: data.session,
            currentUser: mapped,
            currentRole: mapped.role,
          });
        }

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Authentication failed' };
      }
    },

    updateUserPassword: async (newPassword: string) => {
      try {
        const { data, error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to update password' };
      }
    },

    completePasswordReset: (newMetadata?: Record<string, any>) => {
      const { currentUser } = get();
      const updatedMeta = {
        ...(currentUser.metadata || {}),
        requires_password_change: false,
        ...(newMetadata || {}),
      };
      set({
        isAuthenticated: true,
        currentUser: {
          ...currentUser,
          metadata: updatedMeta,
        },
      });
    },

    signUpWithEmail: async (email: string, password: string, fullName?: string, role: Role = 'student') => {
      try {
        const cleanEmail = email.trim();
        const cleanName = fullName?.trim() || cleanEmail.split('@')[0];
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              role,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.session?.user) {
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          const mapped = mapSupabaseProfileToUser(data.session.user, dbProfile);
          set({
            isAuthenticated: true,
            authSession: data.session,
            currentUser: mapped,
            currentRole: mapped.role,
          });
          return { success: true };
        }

        return {
          success: true,
          message: 'Account created! If email confirmation is enabled on your project, please verify your inbox.',
        };
      } catch (err: any) {
        return { success: false, error: err.message || 'Registration error' };
      }
    },

    login: (identifier = 'student', password, isDemo = false) => {
      const { profiles } = get();

      // Read custom users from localStorage if any
      let customUsers: UserProfile[] = [];
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('instempus_admin_custom_users');
          if (saved) customUsers = JSON.parse(saved);
        } catch (e) {
          // ignore
        }
      }

      const allUsers = [...Object.values(profiles || {}), ...customUsers].filter(
        (u): u is UserProfile => Boolean(u && u.id)
      );

      // If isDemo === true (used by the Quick Access buttons), bypass the password check and log them in normally
      if (isDemo) {
        let user: UserProfile | undefined = profiles[identifier as Role];
        if (!user) {
          const q = identifier.trim().toLowerCase();
          user = allUsers.find(
            (u) =>
              u &&
              (u.role === q ||
                u.rollNo?.toLowerCase() === q ||
                u.employeeId?.toLowerCase() === q ||
                u.email?.toLowerCase() === q ||
                u.id?.toLowerCase() === q)
          );
        }
        if (!user) {
          user = DEMO_PROFILES.student;
        }

        set({
          isAuthenticated: true,
          currentRole: user.role,
          currentUser: user,
        });
        return { success: true };
      }

      // If isDemo is false/undefined (used by the main Log In tab), search profiles for a matching rollNo, employeeId, or email
      const q = identifier.trim().toLowerCase();
      const user = allUsers.find(
        (u) =>
          u &&
          (u.rollNo?.toLowerCase() === q ||
            u.employeeId?.toLowerCase() === q ||
            u.email?.toLowerCase() === q ||
            u.username?.toLowerCase() === q ||
            u.id?.toLowerCase() === q)
      );

      if (!user) {
        return { success: false, error: 'Invalid credentials: User ID or email not found in institutional register.' };
      }

      if (user.isActive === false) {
        return { success: false, error: 'Access revoked: Account suspended by campus administration.' };
      }

      const expectedPassword = user.password || 'bput@2026';
      if (!password || password !== expectedPassword) {
        return { success: false, error: 'Invalid credentials: Password does not match our records.' };
      }

      // Matches password and user is active
      set({
        isAuthenticated: true,
        currentRole: user.role,
        currentUser: user,
      });
      return { success: true };
    },

    claimAccount: (identifier, newPassword, email) => {
      const { profiles, auditLogs } = get();

      let customUsers: UserProfile[] = [];
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('instempus_admin_custom_users');
          if (saved) customUsers = JSON.parse(saved);
        } catch (e) {
          // ignore
        }
      }

      const allUsers = [...Object.values(profiles || {}), ...customUsers].filter(
        (u): u is UserProfile => Boolean(u && u.id)
      );
      const q = identifier.trim().toLowerCase();
      const targetUser = allUsers.find(
        (u) =>
          u &&
          (u.rollNo?.toLowerCase() === q ||
            u.employeeId?.toLowerCase() === q ||
            u.email?.toLowerCase() === q ||
            u.username?.toLowerCase() === q ||
            u.id?.toLowerCase() === q)
      );

      if (!targetUser) {
        return { success: false, error: 'Roll Number not found in institutional register. Please contact campus admin.' };
      }

      if (targetUser.isActive === false) {
        return { success: false, error: 'Account setup hold: This profile has been revoked by campus administration.' };
      }

      const updatedUser: UserProfile = {
        ...targetUser,
        password: newPassword,
        email: email || targetUser.email,
        isActive: true,
      };

      // Save into profiles record
      const updatedProfiles = {
        ...profiles,
        [targetUser.role]: updatedUser,
      };

      if (typeof window !== 'undefined') {
        try {
          const updatedCustom = customUsers.map((u) => (u.id === targetUser.id ? updatedUser : u));
          localStorage.setItem('instempus_admin_custom_users', JSON.stringify(updatedCustom));
        } catch (e) {
          // ignore
        }
      }

      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: updatedUser.name,
        actorRole: updatedUser.role,
        action: 'ACCOUNT_CLAIMED_PASSWORD_SET',
        target: `${updatedUser.name} (${updatedUser.rollNo || updatedUser.employeeId})`,
        details: 'Initial digital identity claimed and password configured.',
      };

      set({
        profiles: updatedProfiles,
        currentUser: updatedUser,
        currentRole: updatedUser.role,
        isAuthenticated: true,
        auditLogs: [newAudit, ...auditLogs],
      });

      return { success: true, user: updatedUser };
    },

    logout: () => {
      supabase.auth.signOut().catch((e) => console.warn('Supabase signout:', e));
      set({
        isAuthenticated: false,
        authSession: null,
        currentUser: DEMO_PROFILES.student,
        currentRole: 'student',
        activeTab: 'home',
      });
    },

    setRole: (role) => {
      const profiles = get().profiles;
      const user = profiles[role] || DEMO_PROFILES[role];
      set({
        currentRole: role,
        currentUser: user,
        isCreateSceneOpen: false,
        selectedThreadId: null,
      });
    },

    setLanguage: (language) => set({ language }),

    toggleOffline: () => set((state) => ({ isOffline: !state.isOffline })),

    setActiveTab: (activeTab) => set({ activeTab, selectedThreadId: null, isCreateSceneOpen: false }),

    setActiveClassroomId: (id) => set({ activeClassroomId: id }),

    markClassroomAttendance: (classId, date, timeSlot, topic, records) => {
      const { classrooms, currentUser, auditLogs } = get();
      const targetClass = classrooms.find((c) => c.id === classId);
      if (!targetClass) return;

      const presentCount = records.filter((r) => r.present).length;
      const totalStudents = records.length;
      const rate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 1000) / 10 : 0;

      const newSession: AttendanceRecord = {
        id: `att_${classId}_${Date.now()}`,
        date,
        timeSlot,
        topic: topic || 'Regular Scheduled Lecture',
        facultyName: currentUser.name,
        facultySignature: currentUser.digitalSignature || `${currentUser.name} (Faculty Mentor)`,
        presentCount,
        totalStudents,
        records,
      };

      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'SUBMIT_CLASSROOM_ATTENDANCE',
        target: `${targetClass.subjectCode} (${targetClass.subjectName})`,
        details: `Marked attendance for ${date} (${timeSlot}): ${presentCount}/${totalStudents} students present (${rate}%).`,
      };

      set({
        classrooms: classrooms.map((cls) => {
          if (cls.id === classId) {
            const updatedEnrolled = cls.enrolledStudents.map((st) => {
              const rec = records.find((r) => r.rollNo === st.rollNo);
              return rec ? { ...st, present: rec.present } : st;
            });
            return {
              ...cls,
              attendanceRate: rate,
              timeSlot,
              enrolledStudents: updatedEnrolled,
              attendanceHistory: [newSession, ...cls.attendanceHistory.filter((h) => !(h.date === date && h.timeSlot === timeSlot))],
            };
          }
          return cls;
        }),
        auditLogs: [newAudit, ...auditLogs],
      });
    },

    toggleClassroomStudentAttendance: (classId, rollNo) => {
      set((state) => ({
        classrooms: state.classrooms.map((cls) => {
          if (cls.id === classId) {
            const updatedEnrolled = cls.enrolledStudents.map((st) =>
              st.rollNo === rollNo ? { ...st, present: !st.present } : st
            );
            const presentCount = updatedEnrolled.filter((s) => s.present).length;
            const rate = updatedEnrolled.length > 0
              ? Math.round((presentCount / updatedEnrolled.length) * 1000) / 10
              : 0;
            return {
              ...cls,
              enrolledStudents: updatedEnrolled,
              attendanceRate: rate,
            };
          }
          return cls;
        }),
      }));
    },

    markAllClassroomAttendance: (classId, present) => {
      set((state) => ({
        classrooms: state.classrooms.map((cls) => {
          if (cls.id === classId) {
            const updatedEnrolled = cls.enrolledStudents.map((st) => ({
              ...st,
              present,
            }));
            const rate = present ? 100 : 0;
            return {
              ...cls,
              enrolledStudents: updatedEnrolled,
              attendanceRate: rate,
            };
          }
          return cls;
        }),
      }));
    },

    addClassroomNote: (classId, noteData) => {
      const { classrooms, currentUser, auditLogs } = get();
      const targetClass = classrooms.find((c) => c.id === classId);
      if (!targetClass) return;

      const newNote: ClassroomNote = {
        id: `note_${Date.now()}`,
        classId,
        title: noteData.title,
        unit: noteData.unit,
        description: noteData.description,
        fileName: noteData.fileName,
        fileSize: noteData.fileSize,
        fileType: noteData.fileType,
        uploadedBy: currentUser.name,
        uploaderRole: currentUser.role,
        uploaderRollNoOrEmpId: currentUser.role === 'student' ? currentUser.rollNo || '' : currentUser.employeeId || '',
        uploadDate: new Date().toISOString().split('T')[0],
        tags: noteData.tags,
        downloadsCount: 0,
        contentSnippet: noteData.contentSnippet,
      };

      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'UPLOAD_CLASS_NOTE',
        target: `${targetClass.subjectCode}: ${noteData.title}`,
        details: `Uploaded study material to ${noteData.unit} (${noteData.fileName}).`,
      };

      set({
        classrooms: classrooms.map((cls) =>
          cls.id === classId ? { ...cls, notes: [newNote, ...cls.notes] } : cls
        ),
        auditLogs: [newAudit, ...auditLogs],
      });
    },

    incrementNoteDownload: (classId, noteId) => {
      set((state) => ({
        classrooms: state.classrooms.map((cls) => {
          if (cls.id === classId) {
            return {
              ...cls,
              notes: cls.notes.map((n) =>
                n.id === noteId ? { ...n, downloadsCount: n.downloadsCount + 1 } : n
              ),
            };
          }
          return cls;
        }),
      }));
    },

    addClassroomAnnouncement: (classId, title, content, isImportant = false) => {
      const { classrooms, currentUser } = get();
      const newAnn: ClassroomAnnouncement = {
        id: `ann_${Date.now()}`,
        classId,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        title,
        content,
        timestamp: 'Just now',
        isImportant,
      };

      set({
        classrooms: classrooms.map((cls) =>
          cls.id === classId ? { ...cls, announcements: [newAnn, ...cls.announcements] } : cls
        ),
      });
    },

    setCreateSceneOpen: (open) => set({ isCreateSceneOpen: open }),

    openStory: (index) => set({ activeStoryIndex: index }),

    closeStory: () => set({ activeStoryIndex: null }),

    selectThread: (threadId) => set({ selectedThreadId: threadId }),

    updateCanteenMenu: (menu) => {
      const { canteenMenu, auditLogs, currentUser } = get();
      const updated = { ...canteenMenu, ...menu };

      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'UPDATE_CANTEEN_MENU',
        target: 'Campus Dining Hall Mess 2',
        details: `Special dish: ${updated.specialDish || 'Standard menu'}`,
      };

      set({
        canteenMenu: updated,
        auditLogs: [newAudit, ...auditLogs],
      });
    },

    triggerEmergencyAlert: (type, title, message) => {
      const { currentUser, auditLogs } = get();
      const alert: EmergencyAlert = {
        active: true,
        type,
        title,
        message,
        issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        issuedBy: `${currentUser.name} (${currentUser.role.toUpperCase()})`,
        musterPoint: 'Central Convocation Sports Field Ground',
        emergencyPhone: '+91 98533 11223',
      };

      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'TRIGGER_EMERGENCY_SIREN',
        target: `${type.toUpperCase()} WARNING`,
        details: title,
      };

      set({
        emergencyAlert: alert,
        auditLogs: [newAudit, ...auditLogs],
      });
    },

    dismissEmergencyAlert: () => {
      set((state) => ({
        emergencyAlert: {
          ...state.emergencyAlert,
          active: false,
        },
      }));
    },

    adminEditUserProfile: (roleKey, updatedData) => {
      const { profiles, currentUser, currentRole, auditLogs } = get();
      const targetUser = profiles[roleKey];
      if (!targetUser) return;

      const modified = { ...targetUser, ...updatedData };
      const newProfiles = { ...profiles, [roleKey]: modified };

      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: 'admin',
        action: 'ADMIN_OVERRIDE_PROFILE',
        target: `${modified.name} (${roleKey})`,
        details: `Profile credentials updated by Administrator.`,
      };

      set({
        profiles: newProfiles,
        currentUser: currentRole === roleKey ? modified : currentUser,
        auditLogs: [newAudit, ...auditLogs],
      });
    },

    provisionClassroom: (newClass: Classroom) => {
      const { classrooms, auditLogs, currentUser } = get();
      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser?.name || 'Administrator',
        actorRole: 'admin',
        action: 'PROVISION_CLASSROOM_SLOT',
        target: `${newClass.subjectCode} - ${newClass.department} Sec ${newClass.section}`,
        details: `Provisioned SectionSlot: ${newClass.subjectName}. Faculty: ${newClass.instructorName}. Initial roster: ${newClass.enrolledStudents.length} students.`,
      };
      set({
        classrooms: [newClass, ...classrooms],
        auditLogs: [newAudit, ...auditLogs],
      });
    },

    enrollStudentInClassroom: (classId: string, student: ClassroomStudent) => {
      const { classrooms, auditLogs, currentUser } = get();
      set({
        classrooms: classrooms.map((cls) => {
          if (cls.id === classId) {
            const alreadyEnrolled = cls.enrolledStudents.some(
              (s) => s.rollNo.trim().toUpperCase() === student.rollNo.trim().toUpperCase()
            );
            if (alreadyEnrolled) return cls;
            return {
              ...cls,
              enrolledStudents: [...cls.enrolledStudents, student],
            };
          }
          return cls;
        }),
        auditLogs: [
          {
            id: `AUD-${Date.now().toString().slice(-4)}`,
            timestamp: 'Just now',
            actorName: currentUser?.name || 'Administrator',
            actorRole: 'admin',
            action: 'ENROLL_STUDENT_ROSTER',
            target: `${student.name} (${student.rollNo})`,
            details: `Enrolled scholar into Classroom SectionSlot ${classId}.`,
          },
          ...auditLogs,
        ],
      });
    },

    unenrollStudentFromClassroom: (classId: string, rollNo: string) => {
      const { classrooms, auditLogs, currentUser } = get();
      set({
        classrooms: classrooms.map((cls) => {
          if (cls.id === classId) {
            return {
              ...cls,
              enrolledStudents: cls.enrolledStudents.filter((s) => s.rollNo !== rollNo),
            };
          }
          return cls;
        }),
        auditLogs: [
          {
            id: `AUD-${Date.now().toString().slice(-4)}`,
            timestamp: 'Just now',
            actorName: currentUser?.name || 'Administrator',
            actorRole: 'admin',
            action: 'UNENROLL_STUDENT_ROSTER',
            target: `Scholar ${rollNo}`,
            details: `Unenrolled scholar from SectionSlot ${classId}.`,
          },
          ...auditLogs,
        ],
      });
    },

    assignFacultyToClassroom: (classId: string, faculty: { id: string; name: string; email: string; avatarUrl: string }) => {
      const { classrooms, auditLogs, currentUser } = get();
      set({
        classrooms: classrooms.map((cls) => {
          if (cls.id === classId) {
            return {
              ...cls,
              instructorId: faculty.id,
              instructorName: faculty.name,
              instructorEmail: faculty.email,
              instructorAvatar: faculty.avatarUrl,
            };
          }
          return cls;
        }),
        auditLogs: [
          {
            id: `AUD-${Date.now().toString().slice(-4)}`,
            timestamp: 'Just now',
            actorName: currentUser?.name || 'Administrator',
            actorRole: 'admin',
            action: 'REASSIGN_FACULTY_SLOT',
            target: `SectionSlot ${classId}`,
            details: `Assigned faculty mentor ${faculty.name} to slot ${classId}.`,
          },
          ...auditLogs,
        ],
      });
    },

    toggleStudentAttendance: (classId, rollNo) => {
      set((state) => ({
        teacherClasses: state.teacherClasses.map((cls) => {
          if (cls.id === classId) {
            const updatedStudents = cls.students.map((st) =>
              st.rollNo === rollNo ? { ...st, present: !st.present } : st
            );
            const presentCount = updatedStudents.filter((s) => s.present).length;
            const rate = Math.round((presentCount / updatedStudents.length) * 1000) / 10;
            return {
              ...cls,
              students: updatedStudents,
              attendanceRate: rate,
            };
          }
          return cls;
        }),
      }));
    },

    submitClassAttendance: (classId, date, timeSlot) => {
      const { teacherClasses, currentUser, auditLogs } = get();
      const cls = teacherClasses.find((c) => c.id === classId);
      if (!cls) return;

      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'SUBMIT_CLASS_ATTENDANCE',
        target: `${cls.subjectCode} - Sec ${cls.section}`,
        details: `Attendance marked on ${date} (${timeSlot}) for ${cls.students.length} students (${cls.attendanceRate}% attendance).`,
      };

      set({
        teacherClasses: teacherClasses.map((c) =>
          c.id === classId
            ? {
                ...c,
                lastAttendanceDate: date,
                lastAttendanceSlot: timeSlot,
              }
            : c
        ),
        auditLogs: [newAudit, ...auditLogs],
      });
    },

    saveTeacherDigitalSignature: (signature) => {
      const { currentUser, profiles, currentRole } = get();
      const updated = { ...currentUser, digitalSignature: signature };
      set({
        currentUser: updated,
        profiles: { ...profiles, [currentRole]: updated },
      });
    },

    createGroupChannel: (name, subtitle, type) => {
      const { threads, currentUser, auditLogs } = get();
      const newThread: ChatThread = {
        id: `thread_${Date.now()}`,
        type,
        name,
        subtitle: subtitle || `Created by ${currentUser.name}`,
        avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80',
        unreadCount: 0,
        lastMessage: 'Official institutional channel initialized.',
        lastMessageTime: 'Just now',
        isOfficial: true,
        isOnline: true,
      };

      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'CREATE_CAMPUS_GROUP',
        target: name,
        details: `Scope: ${type.toUpperCase()}`,
      };

      set({
        threads: [newThread, ...threads],
        auditLogs: [newAudit, ...auditLogs],
      });
    },

    requestGatePass: (newPass) => {
      const { currentUser, gatePasses, auditLogs } = get();
      const id = `GP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const pass: GatePass = {
        ...newPass,
        id,
        studentId: currentUser.id,
        studentName: currentUser.name,
        rollNo: currentUser.rollNo || '2501CSE008',
        department: currentUser.department,
        hostelBlock: currentUser.hostelBlock || 'Hostel Block A',
        roomNo: currentUser.roomNo || 'Room A-204',
        approvedBy: 'Mr. Niranjan Sahu (Hostel Warden)',
        approvedAt: 'Just now',
        qrToken: `INST-${id}-${currentUser.rollNo}-${Date.now().toString(36).toUpperCase()}`,
        status: 'approved',
      };

      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'REQUEST_GATEPASS',
        target: `${id} (${currentUser.name})`,
        details: `Destination: ${newPass.destination}. Purpose: ${newPass.reason}`,
      };

      set({
        gatePasses: [pass, ...gatePasses],
        auditLogs: [newAudit, ...auditLogs],
        activeTab: 'services',
      });
    },

    approveGatePass: (passId: string) => {
      const { gatePasses, currentUser, auditLogs } = get();
      const qrToken = `PASS-${Math.floor(10000 + Math.random() * 90000)}`;

      const updated = gatePasses.map((p) => {
        if (p.id === passId) {
          return {
            ...p,
            status: 'approved' as const,
            approvedBy: currentUser.name || 'Mr. Niranjan Sahu (Chief Warden)',
            approvedAt: 'Just now',
            qrToken: p.qrToken || qrToken,
          };
        }
        return p;
      });

      const targetPass = gatePasses.find((p) => p.id === passId);
      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'APPROVE_GATEPASS',
        target: `${passId} (${targetPass?.studentName || 'Scholar'})`,
        details: `Approved & Signed by Warden. Cryptographic token generated: ${targetPass?.qrToken || qrToken}`,
      };

      set({
        gatePasses: updated,
        auditLogs: [newAudit, ...auditLogs],
      });
    },

    rejectGatePass: (passId: string) => {
      const { gatePasses, currentUser, auditLogs } = get();
      const updated = gatePasses.map((p) => {
        if (p.id === passId) {
          return {
            ...p,
            status: 'rejected' as const,
            approvedBy: currentUser.name || 'Mr. Niranjan Sahu (Chief Warden)',
            approvedAt: 'Just now',
          };
        }
        return p;
      });

      const targetPass = gatePasses.find((p) => p.id === passId);
      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'REJECT_GATEPASS',
        target: `${passId} (${targetPass?.studentName || 'Scholar'})`,
        details: `Declined by Warden.`,
      };

      set({
        gatePasses: updated,
        auditLogs: [newAudit, ...auditLogs],
      });
    },

    verifyGuardScan: (qrToken, action) => {
      const { gatePasses, auditLogs, currentUser } = get();
      const pass = gatePasses.find((p) => p.qrToken === qrToken || p.id === qrToken);

      if (!pass) {
        return { success: false, message: 'Invalid or forged QR Token. Verification rejected.' };
      }

      const updatedPasses = gatePasses.map((p) => {
        if (p.id === pass.id) {
          if (action === 'exit') {
            return {
              ...p,
              actualExitTime: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Gate 1)`,
              status: 'used' as const,
              verifiedByGuard: currentUser.name,
            };
          } else {
            return {
              ...p,
              actualReturnTime: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Gate 1)`,
              verifiedByGuard: currentUser.name,
            };
          }
        }
        return p;
      });

      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: action === 'exit' ? 'GATE_EXIT_VERIFIED' : 'GATE_RETURN_VERIFIED',
        target: `${pass.id} (${pass.studentName} - ${pass.rollNo})`,
        details: `Verified by Guard: ${currentUser.name}. Recorded at Main Gate 1.`,
      };

      set({
        gatePasses: updatedPasses,
        auditLogs: [newAudit, ...auditLogs],
      });

      return {
        success: true,
        message: action === 'exit' ? 'Gate Exit recorded successfully.' : 'Student return recorded successfully.',
        pass: updatedPasses.find((p) => p.id === pass.id),
      };
    },

    toggleNoticeGotIt: (noticeId) => {
      set((state) => ({
        notices: state.notices.map((n) => {
          if (n.id === noticeId) {
            const wasGotIt = n.userGotIt;
            return {
              ...n,
              userGotIt: !wasGotIt,
              gotItCount: wasGotIt ? n.gotItCount - 1 : n.gotItCount + 1,
            };
          }
          return n;
        }),
      }));
    },

    acknowledgeNotice: (noticeId: string, userId?: string) => {
      const { currentUser } = get();
      const uid = userId || currentUser.id;
      set((state) => ({
        notices: state.notices.map((n) => {
          if (n.id === noticeId) {
            const currentAck = n.acknowledgedBy || [];
            const hasAcked = currentAck.includes(uid);
            const updatedAck = hasAcked
              ? currentAck.filter((id) => id !== uid)
              : [...currentAck, uid];
            return {
              ...n,
              acknowledgedBy: updatedAck,
              gotItCount: updatedAck.length,
              userGotIt: !hasAcked,
            };
          }
          return n;
        }),
      }));
    },

    upvoteFeedIssue: (issueId: string, userId?: string) => {
      const { currentUser } = get();
      const uid = userId || currentUser.id;
      set((state) => ({
        feedItems: state.feedItems.map((item) => {
          if (item.id === issueId && item.type === 'issue') {
            const hasUpvoted = item.upvotedBy.includes(uid);
            const updatedUpvotedBy = hasUpvoted
              ? item.upvotedBy.filter((id) => id !== uid)
              : [...item.upvotedBy, uid];
            return {
              ...item,
              upvotedBy: updatedUpvotedBy,
            };
          }
          return item;
        }),
      }));
    },

    voteFeedPoll: (pollId: string, optionId: string, userId?: string) => {
      const { currentUser } = get();
      const uid = userId || currentUser.id;
      set((state) => ({
        feedItems: state.feedItems.map((item) => {
          if (item.id === pollId && item.type === 'poll') {
            const updatedOptions = item.options.map((opt) => {
              const filtered = opt.votedBy.filter((id) => id !== uid);
              if (opt.id === optionId) {
                return { ...opt, votedBy: [...filtered, uid] };
              }
              return { ...opt, votedBy: filtered };
            });
            return {
              ...item,
              options: updatedOptions,
            };
          }
          return item;
        }),
      }));
    },

    acknowledgeFeedNotice: (noticeId: string, userId?: string) => {
      const { currentUser } = get();
      const uid = userId || currentUser.id;
      set((state) => ({
        feedItems: state.feedItems.map((item) => {
          if (item.id === noticeId && item.type === 'notice') {
            const currentAck = item.acknowledgedBy || [];
            const hasAcked = currentAck.includes(uid);
            const updatedAck = hasAcked
              ? currentAck.filter((id) => id !== uid)
              : [...currentAck, uid];
            return {
              ...item,
              acknowledgedBy: updatedAck,
              gotItCount: updatedAck.length,
              userGotIt: !hasAcked,
            };
          }
          return item;
        }),
        notices: state.notices.map((n) => {
          if (n.id === noticeId) {
            const currentAck = n.acknowledgedBy || [];
            const hasAcked = currentAck.includes(uid);
            const updatedAck = hasAcked
              ? currentAck.filter((id) => id !== uid)
              : [...currentAck, uid];
            return {
              ...n,
              acknowledgedBy: updatedAck,
              gotItCount: updatedAck.length,
              userGotIt: !hasAcked,
            };
          }
          return n;
        }),
      }));
    },

    createFeedItem: (item: FeedItem) => {
      set((state) => ({
        feedItems: [item, ...state.feedItems],
      }));
    },

    addClassResource: (resource) => {
      const { classResources, currentUser, auditLogs } = get();
      const newResource: ClassResource = {
        id: `res_${Date.now().toString().slice(-4)}`,
        uploadedAt: 'Just now',
        uploaderId: currentUser.id,
        uploaderName: currentUser.name,
        fileSize: resource.fileSize || (resource.type === 'Link' ? 'External Link' : '3.8 MB'),
        ...resource,
      };

      set({
        classResources: [newResource, ...classResources],
        auditLogs: [
          {
            id: `AUD-${Date.now().toString().slice(-4)}`,
            timestamp: 'Just now',
            actorName: currentUser.name,
            actorRole: currentUser.role,
            action: 'UPLOAD_MATERIAL',
            target: newResource.title,
            details: `Uploaded ${newResource.type} for slot ${newResource.slotId}`,
          },
          ...auditLogs,
        ],
      });
    },

    createNotice: (title, content, groupName, tags, isUrgent = false, imageUrl) => {
      const { currentUser, notices, auditLogs } = get();
      const isVideo = imageUrl?.startsWith('data:video') || imageUrl?.endsWith('.mp4');

      const newNotice: NoticePost = {
        id: `notif_${Date.now().toString().slice(-4)}`,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        authorAvatar: currentUser.avatarUrl,
        authorTitle: `${currentUser.department} - ${currentUser.role.toUpperCase()}`,
        title,
        content,
        groupName: groupName || 'Computer Science 6th Semester',
        targetGroup: groupName || 'Computer Science 6th Semester',
        tags: tags.length ? tags : ['#announcement'],
        timestamp: 'Just now',
        isUrgent,
        imageUrl: !isVideo ? imageUrl : undefined,
        mediaUrl: imageUrl,
        mediaType: isVideo ? 'video' : 'image',
        reelImage: isUrgent ? (imageUrl || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=600&q=80') : undefined,
        gotItCount: 1,
        userGotIt: true,
        commentsCount: 0,
      };

      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: isUrgent ? 'PUBLISH_URGENT_BROADCAST' : 'PUBLISH_NOTICE',
        target: title,
        details: `Target Group: ${groupName}`,
      };

      set({
        notices: [newNotice, ...notices],
        auditLogs: [newAudit, ...auditLogs],
        isCreateSceneOpen: false,
      });
    },

    toggleIssueUpvote: (issueId) => {
      set((state) => ({
        issues: state.issues.map((issue) => {
          if (issue.id === issueId) {
            const wasUpvoted = issue.userUpvoted;
            return {
              ...issue,
              userUpvoted: !wasUpvoted,
              upvotes: wasUpvoted ? issue.upvotes - 1 : issue.upvotes + 1,
            };
          }
          return issue;
        }),
      }));
    },

    createIssue: (title, description, category, location, urgency = 'medium', assetTag) => {
      const { currentUser, issues, auditLogs } = get();
      const id = `TKT-${Math.floor(1050 + Math.random() * 500)}`;
      const newIssue: CampusIssue = {
        id,
        title,
        description,
        category,
        location,
        authorName: currentUser.name,
        authorRollNo: currentUser.rollNo || '2501CSE008',
        createdAt: 'Just now',
        upvotes: 1,
        userUpvoted: true,
        status: 'reported',
        urgency,
        assetTag,
        scheduledResolution: 'Within 24-48 hours',
      };

      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'REPORT_CAMPUS_ISSUE',
        target: `${id} (${category})`,
        details: `${title} at ${location}`,
      };

      set({
        issues: [newIssue, ...issues],
        auditLogs: [newAudit, ...auditLogs],
      });
    },

    updateIssueStatus: (issueId, status, note) => {
      const { currentUser, issues, auditLogs } = get();
      const updated = issues.map((i) => (i.id === issueId ? { ...i, status, statusUpdateNote: note || i.statusUpdateNote } : i));

      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'UPDATE_ISSUE_STATUS',
        target: `${issueId} -> ${status.toUpperCase()}`,
        details: note || `Updated by ${currentUser.name}`,
      };

      set({
        issues: updated,
        auditLogs: [newAudit, ...auditLogs],
      });
    },

    approveApplication: (appId, remarks) => {
      const { currentUser, applications, auditLogs } = get();
      const signature = currentUser.digitalSignature || `${currentUser.name} (${currentUser.role.toUpperCase()})`;

      const updated = applications.map((app) => {
        if (app.id === appId) {
          return {
            ...app,
            status: 'approved' as const,
            timeline: [
              ...app.timeline,
              {
                step: 'Official Clearance & Digital Signature',
                role: currentUser.name,
                status: 'completed' as const,
                updatedAt: 'Just now',
                remarks: remarks || 'Endorsed with valid institutional digital signature.',
                signatureUrl: signature,
              },
            ],
          };
        }
        return app;
      });

      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'APPROVE_APPLICATION_WITH_SIGNATURE',
        target: appId,
        details: `Signed by: ${signature}`,
      };

      set({
        applications: updated,
        auditLogs: [newAudit, ...auditLogs],
      });
    },

    submitServiceApplication: ({ type, title, details, targetApprover = 'teacher' }) => {
      const { currentUser, applications, auditLogs } = get();
      const id = `APP-${Math.floor(1000 + Math.random() * 9000)}`;

      const newApp: ServiceApplication = {
        id,
        type,
        title,
        studentName: currentUser.name,
        rollNo: currentUser.rollNo || '2501CSE008',
        submittedAt: 'Today, Just now',
        status: targetApprover === 'warden' ? 'pending_warden' : targetApprover === 'hod' ? 'pending_hod' : 'pending_mentor',
        currentApproverRole: targetApprover,
        details,
        timeline: [
          {
            step: 'Application Initiated by Scholar',
            role: currentUser.name,
            status: 'completed',
            updatedAt: 'Just now',
          },
          {
            step: targetApprover === 'warden' ? 'Hostel Warden Review' : targetApprover === 'hod' ? 'Department HOD Academic Verification' : 'Faculty Mentor Review',
            role: targetApprover === 'warden' ? 'Chief Warden' : targetApprover === 'hod' ? 'HOD CSE' : 'Prof. Sneha Mohanty',
            status: 'current',
            updatedAt: 'In Progress',
          },
          {
            step: 'Institutional Clearance & Seal Dispatch',
            role: 'Academic Cell / Accounts Board',
            status: 'pending',
          },
        ],
      };

      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'SUBMIT_SERVICE_APPLICATION',
        target: `${id} (${type.toUpperCase()})`,
        details: title,
      };

      set({
        applications: [newApp, ...applications],
        auditLogs: [newAudit, ...auditLogs],
      });
    },

    payFeeItem: (feeId) => {
      const { studentFees, currentUser, auditLogs } = get();
      const targetFee = studentFees.find((f) => f.id === feeId);
      if (!targetFee) return;

      const receipt = `BPUT-PAY-${Date.now().toString().slice(-6)}`;
      const todayDate = new Date().toISOString().split('T')[0];

      const updated = studentFees.map((f) =>
        f.id === feeId
          ? {
              ...f,
              status: 'paid' as const,
              receiptNo: receipt,
              paidAt: todayDate,
              paymentMode: 'Instant BPUT SmartPay (Simulated)',
            }
          : f
      );

      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'CLEAR_SEMESTER_DUES',
        target: `${targetFee.title} (₹${targetFee.amount})`,
        details: `Receipt generated: ${receipt}. Mode: Instant Online Clearance.`,
      };

      set({
        studentFees: updated,
        auditLogs: [newAudit, ...auditLogs],
      });
    },

    addMessFeedback: ({ mealType, rating, comment, dishesEvaluated }) => {
      const { currentUser, messFeedback, auditLogs } = get();
      const id = `MFB-${Date.now().toString().slice(-4)}`;
      const newFeedback: MessFeedbackItem = {
        id,
        date: 'Today, Just now',
        mealType,
        authorName: currentUser.name,
        authorRoll: currentUser.rollNo || '2501CSE008',
        rating,
        comment,
        dishesEvaluated,
        upvotes: 1,
        userUpvoted: true,
      };

      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'SUBMIT_MESS_FEEDBACK',
        target: `${mealType} Feedback (${rating} Stars)`,
        details: comment,
      };

      set({
        messFeedback: [newFeedback, ...messFeedback],
        auditLogs: [newAudit, ...auditLogs],
      });
    },

    toggleMessFeedbackUpvote: (feedbackId) => {
      set((state) => ({
        messFeedback: state.messFeedback.map((f) => {
          if (f.id === feedbackId) {
            const wasUpvoted = f.userUpvoted;
            return {
              ...f,
              userUpvoted: !wasUpvoted,
              upvotes: wasUpvoted ? f.upvotes - 1 : f.upvotes + 1,
            };
          }
          return f;
        }),
      }));
    },

    requestVisitorPass: (pass) => {
      const { currentUser, visitorPasses, auditLogs } = get();
      const id = `VIS-${Math.floor(100 + Math.random() * 900)}`;
      const newPass: VisitorPass = {
        ...pass,
        id,
        studentName: currentUser.name,
        studentRoll: currentUser.rollNo || '2501CSE008',
        hostelBlock: currentUser.hostelBlock || 'Hostel Block A',
        roomNo: currentUser.roomNo || 'A-204',
        status: 'pending',
        qrToken: `BPUT-VIS-${pass.visitorName.toUpperCase().replace(/\s+/g, '_')}-${id}`,
      };

      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'REQUEST_VISITOR_PASS',
        target: `${pass.visitorName} (${pass.relationship})`,
        details: `Visit date: ${pass.visitDate}, Purpose: ${pass.purpose}`,
      };

      set({
        visitorPasses: [newPass, ...visitorPasses],
        auditLogs: [newAudit, ...auditLogs],
      });
    },

    approveVisitorPass: (passId) => {
      const { currentUser, visitorPasses, auditLogs } = get();
      const updated = visitorPasses.map((p) =>
        p.id === passId
          ? {
              ...p,
              status: 'approved' as const,
              approvedBy: `${currentUser.name} (${currentUser.role.toUpperCase()})`,
            }
          : p
      );

      const newAudit: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'APPROVE_VISITOR_PASS',
        target: passId,
        details: `Approved by: ${currentUser.name}`,
      };

      set({
        visitorPasses: updated,
        auditLogs: [newAudit, ...auditLogs],
      });
    },

    sendMessage: (threadId, text) => {
      const { currentUser, messages, threads } = get();
      const msg: ChatMessage = {
        id: `msg_${Date.now()}`,
        threadId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        senderAvatar: currentUser.avatarUrl,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        status: 'read',
      };

      const threadMsgs = messages[threadId] || [];
      const updatedThreads = threads.map((t) =>
        t.id === threadId ? { ...t, lastMessage: text, lastMessageTime: msg.timestamp } : t
      );

      set({
        messages: {
          ...messages,
          [threadId]: [...threadMsgs, msg],
        },
        threads: updatedThreads,
      });
    },
  };
});

// ============================================================================
// SUPABASE REAL-TIME AUTH SYNCHRONIZATION
// Listens to onAuthStateChange so app state automatically updates on login/logout
// ============================================================================
if (typeof window !== 'undefined') {
  // Check active session on initial load
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (session?.user) {
      try {
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const user = mapSupabaseProfileToUser(session.user, dbProfile);
        useAppStore.setState({
          isAuthenticated: true,
          authSession: session,
          currentUser: user,
          currentRole: user.role,
        });
      } catch (e) {
        console.warn('Failed to load initial Supabase profile:', e);
      }
    }
  });

  // Listen to all real-time auth state events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
      try {
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const user = mapSupabaseProfileToUser(session.user, dbProfile);
        useAppStore.setState({
          isAuthenticated: true,
          authSession: session,
          currentUser: user,
          currentRole: user.role,
        });
      } catch (e) {
        console.warn('Failed to refresh Supabase profile on auth change:', e);
      }
    } else if (event === 'SIGNED_OUT') {
      useAppStore.setState({
        isAuthenticated: false,
        authSession: null,
        currentUser: DEMO_PROFILES.student,
        currentRole: 'student',
      });
    }
  });
}

