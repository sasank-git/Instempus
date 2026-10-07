export type Role =
  | 'student'
  | 'teacher'
  | 'hod'
  | 'warden'
  | 'canteen'
  | 'accounts'
  | 'security'
  | 'admin'
  | 'principal';

export type Language = 'en' | 'hi' | 'or';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  role: Role;
  rollNo?: string;
  employeeId?: string;
  department: string;
  year?: number;
  semester?: number;
  section?: string;
  hostelBlock?: string;
  roomNo?: string;
  phone: string;
  email?: string;
  avatarUrl: string;
  bio?: string;
  thoughtNote?: string;
  languagePref: Language;
  digitalSignature?: string;
  isActive?: boolean;
  password?: string;
  metadata?: Record<string, any>;
}

export interface TeacherClass {
  id: string;
  subjectCode: string;
  subjectName: string;
  semester: number;
  section: string;
  totalStudents: number;
  timeSlot: string;
  room: string;
  lastAttendanceDate?: string;
  lastAttendanceSlot?: string;
  attendanceRate: number;
  students: {
    rollNo: string;
    name: string;
    present: boolean;
  }[];
}

export interface ClassroomStudent {
  rollNo: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  present?: boolean;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  timeSlot: string;
  topic?: string;
  facultyName: string;
  facultySignature?: string;
  presentCount: number;
  totalStudents: number;
  records: {
    rollNo: string;
    studentName: string;
    present: boolean;
  }[];
}

export interface ClassroomNote {
  id: string;
  classId: string;
  title: string;
  unit: string;
  description: string;
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'doc' | 'slides' | 'notes' | 'code';
  uploadedBy: string;
  uploaderRole: Role;
  uploaderRollNoOrEmpId: string;
  uploadDate: string;
  tags: string[];
  downloadsCount: number;
  contentSnippet?: string;
}

export interface ClassroomTimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  timeSlot: string;
  startTime: string;
  endTime: string;
  room: string;
  type: 'Lecture' | 'Lab' | 'Tutorial';
  topic: string;
  facultyName: string;
}

export interface ClassroomAnnouncement {
  id: string;
  classId: string;
  authorName: string;
  authorRole: Role;
  title: string;
  content: string;
  timestamp: string;
  isImportant?: boolean;
}

export interface ScheduleBlock {
  id: string;
  slotId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string;
  endTime: string;
  roomName: string;
  subjectName?: string;
  subjectCode?: string;
  teacherName?: string;
}

export interface ClassResource {
  id: string;
  slotId: string;
  title: string;
  type: 'PDF' | 'Link' | 'Document';
  url: string;
  uploadedAt: string;
  uploaderId: string;
  uploaderName?: string;
  fileSize?: string;
}

export interface Classroom {
  id: string;
  subjectCode: string;
  subjectName: string;
  department: string;
  semester: number;
  section: string;
  credits: number;
  room: string;
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  instructorAvatar: string;
  timeSlot: string;
  attendanceRate: number;
  enrolledStudents: ClassroomStudent[];
  attendanceHistory: AttendanceRecord[];
  notes: ClassroomNote[];
  timetable: ClassroomTimetableSlot[];
  announcements: ClassroomAnnouncement[];
}

export type PassType = 'day_out' | 'night_out' | 'emergency' | 'market_pass';
export type PassStatus = 'approved' | 'used' | 'expired' | 'pending' | 'rejected';

export interface GatePass {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  department: string;
  hostelBlock: string;
  roomNo: string;
  passType: PassType;
  departureTime: string;
  expectedReturnTime: string;
  actualExitTime?: string;
  actualReturnTime?: string;
  reason: string;
  destination: string;
  parentContact: string;
  approvedBy: string;
  approvedAt: string;
  qrToken: string;
  status: PassStatus;
  guardNotes?: string;
  verifiedByGuard?: string;
}

export interface NoticePost {
  id: string;
  type?: 'notice';
  authorName: string;
  authorRole: Role | string;
  authorAvatar: string;
  avatar?: string;
  authorTitle: string;
  title: string;
  content: string;
  groupName: string; // Group to which this notice belongs
  targetGroup: string;
  targetAudience?: string;
  tags: string[];
  timestamp: string;
  isUrgent?: boolean;
  reelImage?: string;
  imageUrl?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  attachments?: { name: string; size: string; type: string }[];
  gotItCount: number;
  userGotIt?: boolean;
  commentsCount: number;
  acknowledgedBy?: string[];
}

export type FeedItemType = 'notice' | 'issue' | 'poll';

export interface PollOption {
  id: string;
  text: string;
  votedBy: string[];
}

export interface FeedPollItem {
  id: string;
  type: 'poll';
  authorName: string;
  authorRole: Role | string;
  authorAvatar: string;
  avatar?: string;
  question: string;
  options: PollOption[];
  timestamp: string;
  expiresAt: string;
  targetAudience?: string;
  tags?: string[];
}

export interface FeedIssueItem {
  id: string;
  type: 'issue';
  authorName: string;
  authorRole: Role | string;
  authorAvatar: string;
  avatar?: string;
  authorRollNo?: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: 'open' | 'in-progress' | 'resolved';
  upvotedBy: string[];
  timestamp: string;
  targetAudience?: string;
  imageUrl?: string;
}

export interface FeedNoticeItem extends NoticePost {
  type: 'notice';
}

export type FeedItem = FeedNoticeItem | FeedIssueItem | FeedPollItem;

export interface CanteenDailyMenu {
  date: string;
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
  specialDish?: string;
  isVegOnly: boolean;
  postedBy: string;
  lastUpdated: string;
}

export interface EmergencyAlert {
  active: boolean;
  type: 'fire' | 'earthquake' | 'flood' | 'lockdown';
  title: string;
  message: string;
  issuedAt: string;
  issuedBy: string;
  musterPoint: string;
  emergencyPhone: string;
}

export type IssueCategory = 'hostel' | 'mess' | 'academic' | 'infrastructure' | 'labs';
export type IssueStatus = 'reported' | 'assigned' | 'investigating' | 'in_progress' | 'resolved';

export interface CampusIssue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  location: string;
  authorName: string;
  authorRollNo: string;
  createdAt: string;
  upvotes: number;
  userUpvoted?: boolean;
  status: IssueStatus;
  statusUpdateNote?: string;
  assignedTo?: string;
  imageUrl?: string;
  urgency?: 'low' | 'medium' | 'high' | 'emergency';
  assignedTechnician?: {
    name: string;
    contact: string;
    trade: string;
  };
  scheduledResolution?: string;
  assetTag?: string;
}

export interface RoomAssetItem {
  id: string;
  name: string;
  assetTag: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Needs Repair';
  lastInspected: string;
  remarks?: string;
}

export interface StudentRoomRecord {
  hostelBlock: string;
  roomNo: string;
  floor: number;
  bedNo: string;
  occupancyType: string;
  roommateName: string;
  roommateRoll: string;
  allocatedDate: string;
  cleanlinessRating: number;
  assets: RoomAssetItem[];
  lastInspectionDate: string;
  inspectionStatus: string;
}

export interface MessFeedbackItem {
  id: string;
  date: string;
  mealType: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  authorName: string;
  authorRoll: string;
  rating: number;
  comment: string;
  dishesEvaluated: string[];
  upvotes: number;
  userUpvoted?: boolean;
  canteenResponse?: string;
  respondedAt?: string;
}

export interface VisitorPass {
  id: string;
  visitorName: string;
  relationship: string;
  contactNo: string;
  studentName: string;
  studentRoll: string;
  hostelBlock: string;
  roomNo: string;
  purpose: string;
  visitDate: string;
  expectedArrivalTime: string;
  expectedDepartureTime: string;
  vehicleNumber?: string;
  hostelEntryPermitted: boolean;
  status: 'pending' | 'approved' | 'completed';
  qrToken: string;
  approvedBy?: string;
}

export interface GateLogEntry {
  id: string;
  timestamp: string;
  personName: string;
  identifier: string;
  roleType: 'student' | 'faculty' | 'visitor' | 'staff';
  direction: 'ENTRY' | 'EXIT';
  gateLocation: string;
  passReference?: string;
  verifiedByGuard: string;
  status: 'Authorized' | 'Curfew Alert' | 'Emergency Pass';
}

export type ApplicationType =
  | 'leave'
  | 'bonafide'
  | 'mess_rebate'
  | 'no_dues'
  | 'character_certificate'
  | 'transcript_verification';
export type ApplicationStatus = 'pending_mentor' | 'pending_hod' | 'pending_warden' | 'approved' | 'rejected';

export interface StudentFeeItem {
  id: string;
  category: 'Tuition' | 'Hostel' | 'Mess' | 'Exam' | 'Library' | 'Convocation';
  title: string;
  semester: number;
  amount: number;
  status: 'paid' | 'pending';
  receiptNo?: string;
  paidAt?: string;
  dueDate: string;
  paymentMode?: string;
}

export interface ServiceApplication {
  id: string;
  type: ApplicationType;
  title: string;
  studentName: string;
  rollNo: string;
  submittedAt: string;
  status: ApplicationStatus;
  currentApproverRole: Role;
  details: Record<string, string>;
  timeline: {
    step: string;
    role: string;
    status: 'completed' | 'current' | 'pending';
    updatedAt?: string;
    remarks?: string;
    signatureUrl?: string;
  }[];
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface ChatThread {
  id: string;
  type: 'dm' | 'channel';
  name: string;
  subtitle: string;
  role?: Role;
  avatar: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  isOfficial?: boolean;
  isOnline?: boolean;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: Role;
  action: string;
  target: string;
  details: string;
}

// -------------------------------------------------------------
// EVENT MANAGEMENT & DYNAMIC WORKFLOW TYPES
// -------------------------------------------------------------
export type WorkflowStepType = 'text' | 'textarea' | 'select' | 'checkbox' | 'file_upload';

export interface EventWorkflowStep {
  step_id: string;
  type: WorkflowStepType;
  label: string;
  required: boolean;
  options?: string[];
}

export interface SupabaseEvent {
  id: string;
  title: string;
  description?: string;
  banner_url?: string;
  target_tags?: Record<string, any>;
  workflow_schema: EventWorkflowStep[];
  capacity?: number;
  is_active: boolean;
  registration_deadline?: string;
  created_at: string;
}

export interface SupabaseEventRegistration {
  id: string;
  event_id: string;
  student_id: string;
  step_data: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

