import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '../../services/store';
import { UserProfile } from '../../types';
import { supabase } from '../../services/supabase';
import {
  CheckCircle2,
  Bell,
  Search,
  Utensils,
  AlertTriangle,
  X,
  Clock,
  ShieldCheck,
  Building2,
  Users,
  Send,
  MoreHorizontal,
  Flame,
  Check,
  Share2,
  ArrowBigUp,
  BarChart3,
  MapPin,
  Megaphone,
  Radio,
  FileText,
  Vote,
  RefreshCw,
  Tag,
  Loader2,
  Plus,
  Database,
  Filter,
  Wrench,
  HelpCircle,
  Trash2,
  Image as ImageIcon,
  Camera,
} from 'lucide-react';

export interface SupabaseMessage {
  id: string;
  sender_id?: string;
  content: string;
  message_type: 'broadcast' | 'dm';
  target_tags?: Record<string, any> | any[] | null;
  recipient_id?: string | null;
  created_at: string;
  title?: string;
  sender_name?: string;
  sender_role?: string;
  sender_avatar?: string;
  is_urgent?: boolean;
}

export interface SupabaseIssue {
  id: string;
  title: string;
  description: string;
  category?: string;
  location?: string;
  status: 'reported' | 'investigating' | 'resolved';
  author_id?: string;
  author_name?: string;
  author_role?: string;
  author_avatar?: string;
  target_tags?: Record<string, any> | any[] | null;
  upvoted_by?: string[];
  image_url?: string;
  created_at: string;
}

export interface SupabasePollOption {
  id: string;
  text: string;
  votes?: number;
  voted_by?: string[];
}

export interface SupabasePoll {
  id: string;
  question: string;
  options: SupabasePollOption[];
  author_id?: string;
  author_name?: string;
  author_role?: string;
  author_avatar?: string;
  target_tags?: Record<string, any> | any[] | null;
  expires_at?: string;
  created_at: string;
}

/**
 * Institutional Seed Data:
 * Used as fallback candidates if tables are empty or newly initialized,
 * ensuring tag-based filtering and interactions can be verified immediately.
 */
const SEED_BROADCASTS: SupabaseMessage[] = [
  {
    id: 'msg_seed_01',
    content: 'All B.Tech Computer Science and Engineering scholars must submit their Cryptography & Distributed Systems lab records to Room CS-204 before Friday, 4:00 PM.',
    title: 'Lab Record Submission Deadline: CSE Dept',
    message_type: 'broadcast',
    target_tags: { target_department: 'CSE', target_role: 'student' },
    sender_name: 'Dr. Manoj Panda',
    sender_role: 'HOD, Computer Science',
    sender_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    is_urgent: true,
  },
  {
    id: 'msg_seed_02',
    content: 'Notice for all Mechanical Engineering scholars: Industrial visit to Tata Steel Kalinganagar is scheduled for next Monday. Collect parent consent forms from ME Department office.',
    title: 'Industrial Plant Tour: ME Department',
    message_type: 'broadcast',
    target_tags: { target_department: 'Mechanical Engineering' },
    sender_name: 'Prof. S. R. Mohanty',
    sender_role: 'Faculty Coordinator, ME',
    sender_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    is_urgent: false,
  },
  {
    id: 'msg_seed_03',
    content: 'Water supply pipeline maintenance scheduled in Hostel Block A from 10:00 AM to 1:00 PM tomorrow. Please store required drinking water in advance.',
    title: 'Hostel Block A: Water Maintenance Notice',
    message_type: 'broadcast',
    target_tags: { target_hostel: 'Hostel Block A' },
    sender_name: 'Chief Hostel Warden',
    sender_role: 'Hostel Administration',
    sender_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    created_at: new Date(Date.now() - 14400000).toISOString(),
    is_urgent: false,
  },
  {
    id: 'msg_seed_04',
    content: 'University Convocation 2026: Registration for degree conferment is now live on the student portal. All final year graduating scholars must register before the end of the month.',
    title: 'Annual University Convocation Notice',
    message_type: 'broadcast',
    target_tags: {}, // Global campus notice - visible to all
    sender_name: 'Office of the Registrar',
    sender_role: 'Central University Administration',
    sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_urgent: false,
  },
];

const SEED_ISSUES: SupabaseIssue[] = [
  {
    id: 'issue_seed_01',
    title: 'Lab 3 High-Performance Workstation OS Crash',
    description: 'Workstations #12 through #18 in CS Lab 3 are experiencing kernel panic on Ubuntu boot during Cryptography practicals.',
    category: 'Lab Infrastructure',
    location: 'CS Lab 3, 2nd Floor',
    status: 'investigating',
    author_name: 'Priyanshu Mohapatra',
    author_role: 'Student (CSE)',
    author_avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    target_tags: { target_department: 'CSE' },
    upvoted_by: ['usr_student_02', 'usr_student_03'],
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'issue_seed_02',
    title: 'Hydraulics Lab Pressure Gauge Calibration Error',
    description: 'Digital sensor readouts on Venturi Flume rig are fluctuating by ±15% during fluid mechanics testing.',
    category: 'Equipment Maintenance',
    location: 'Mechanical Workshop Bay 4',
    status: 'reported',
    author_name: 'Soumya Ranjan Das',
    author_role: 'Student (ME)',
    author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    target_tags: { target_department: 'Mechanical Engineering' },
    upvoted_by: ['usr_student_04'],
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'issue_seed_03',
    title: 'Hostel Block A 2nd Floor Wi-Fi Access Point Offline',
    description: 'Cisco AP in Wing 2 corridor has no uplink LED. Scholars unable to access IEEE research portal.',
    category: 'Network',
    location: 'Hostel Block A, Wing 2',
    status: 'reported',
    author_name: 'Amitav Rath',
    author_role: 'Hostel Resident',
    author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    target_tags: { target_hostel: 'Hostel Block A' },
    upvoted_by: ['usr_student_01'],
    created_at: new Date(Date.now() - 21600000).toISOString(),
  },
];

const SEED_POLLS: SupabasePoll[] = [
  {
    id: 'poll_seed_01',
    question: 'Preferred programming framework for 6th Sem Distributed Systems Capstone Project?',
    options: [
      { id: 'opt_1', text: 'Go (Golang) Microservices', voted_by: ['usr_student_02', 'usr_student_05'] },
      { id: 'opt_2', text: 'Rust + Tokio Async', voted_by: ['usr_student_03'] },
      { id: 'opt_3', text: 'TypeScript / Node.js + gRPC', voted_by: ['usr_student_04', 'usr_student_06', 'usr_student_07'] },
      { id: 'opt_4', text: 'Java Spring Cloud', voted_by: [] },
    ],
    author_name: 'Dr. Manoj Panda',
    author_role: 'HOD, Computer Science',
    author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    target_tags: { target_department: 'CSE' },
    expires_at: 'Tomorrow, 5:00 PM',
    created_at: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'poll_seed_02',
    question: 'Proposed timing for Mechanical CAD/CAM certification workshop?',
    options: [
      { id: 'opt_m1', text: 'Saturday 10:00 AM - 1:00 PM', voted_by: ['usr_student_08'] },
      { id: 'opt_m2', text: 'Sunday 2:00 PM - 5:00 PM', voted_by: ['usr_student_09', 'usr_student_10'] },
    ],
    author_name: 'Prof. S. R. Mohanty',
    author_role: 'Faculty Coordinator, ME',
    author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    target_tags: { target_department: 'Mechanical Engineering' },
    expires_at: 'In 3 days',
    created_at: new Date(Date.now() - 25000000).toISOString(),
  },
  {
    id: 'poll_seed_03',
    question: 'Campus Canteen: Selection of Special Dinner Menu for TechSangam Fest',
    options: [
      { id: 'opt_c1', text: 'Paneer Lababdar & Dum Biryani', voted_by: ['usr_student_02', 'usr_student_03', 'usr_student_04'] },
      { id: 'opt_c2', text: 'South Indian Special Dosa Feast', voted_by: ['usr_student_05'] },
      { id: 'opt_c3', text: 'Chinese Hakka Noodles & Manchurian', voted_by: ['usr_student_06', 'usr_student_07'] },
    ],
    author_name: 'Central Canteen Committee',
    author_role: 'Student Welfare Board',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    target_tags: {}, // Global campus poll - visible to all
    expires_at: 'In 2 days',
    created_at: new Date(Date.now() - 36000000).toISOString(),
  },
];

/**
 * The Critical Matching Logic:
 * A user ONLY sees an item if its target tags match the user's metadata tags.
 */
export function matchTargetTags(
  targetTags: Record<string, any> | any[] | null | undefined,
  userMetadata: Record<string, any> | undefined,
  currentUser: UserProfile
): boolean {
  if (!targetTags || Object.keys(targetTags).length === 0) {
    return true; // Universal
  }

  if (Array.isArray(targetTags)) {
    if (targetTags.length === 0) return true;
    const userSlots = Array.isArray(userMetadata?.assigned_slots) ? userMetadata.assigned_slots : [];
    return targetTags.some((tag) => userSlots.includes(tag));
  }

  const meta: Record<string, any> = {
    ...(userMetadata || {}),
    ...(currentUser.metadata || {}),
    department: currentUser.metadata?.department || currentUser.department,
    role: currentUser.metadata?.role || currentUser.role,
    semester: currentUser.metadata?.semester || currentUser.semester,
    hostel_block: currentUser.metadata?.hostel_block || currentUser.hostelBlock,
  };

  for (const [targetKey, targetValue] of Object.entries(targetTags)) {
    if (targetValue === undefined || targetValue === null || targetValue === '') {
      continue;
    }

    const tKey = targetKey.toLowerCase();
    const tValStr = String(targetValue).toLowerCase().trim();

    // 1. Department matching
    if (tKey === 'target_department' || tKey === 'department' || tKey === 'dept') {
      const userDept = String(meta.department || currentUser.department || '').toLowerCase();
      const isCse =
        (tValStr === 'cse' && (userDept.includes('computer science') || userDept.includes('cse'))) ||
        (userDept === 'cse' && tValStr.includes('computer science'));

      const isMatch =
        userDept === tValStr ||
        userDept.includes(tValStr) ||
        tValStr.includes(userDept) ||
        isCse;

      if (!isMatch) return false;
      continue;
    }

    // 2. Role matching
    if (tKey === 'target_role' || tKey === 'role') {
      const userRole = String(meta.role || currentUser.role || '').toLowerCase();
      if (userRole !== tValStr && !userRole.includes(tValStr)) {
        return false;
      }
      continue;
    }

    // 3. Semester matching
    if (tKey === 'target_semester' || tKey === 'semester') {
      const userSem = String(meta.semester || currentUser.semester || '');
      if (userSem !== tValStr) {
        return false;
      }
      continue;
    }

    // 4. Hostel matching
    if (tKey === 'target_hostel' || tKey === 'hostel' || tKey === 'hostel_block') {
      const userHostel = String(meta.hostel_block || currentUser.hostelBlock || '').toLowerCase();
      if (!userHostel.includes(tValStr) && !tValStr.includes(userHostel)) {
        return false;
      }
      continue;
    }

    // 5. Generic target tags
    const strippedKey = tKey.startsWith('target_') ? tKey.replace('target_', '') : tKey;
    const userVal = meta[targetKey] ?? meta[tKey] ?? meta[strippedKey];

    if (userVal === undefined || userVal === null) {
      return false;
    }

    if (String(userVal).toLowerCase().trim() !== tValStr) {
      return false;
    }
  }

  return true;
}

export function CampusFeedPage() {
  const { currentUser, canteenMenu } = useAppStore();

  // Live Supabase tables state (Task 1: Live database fetching)
  const [liveMessages, setLiveMessages] = useState<SupabaseMessage[]>([]);
  const [liveIssues, setLiveIssues] = useState<SupabaseIssue[]>([]);
  const [livePolls, setLivePolls] = useState<SupabasePoll[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(() => new Set());

  // Bottom Sheet states for ephemeral stories
  const [activeStorySheet, setActiveStorySheet] = useState<'mess' | 'warden' | null>(null);

  // Search query filter
  const [searchQuery, setSearchQuery] = useState('');

  // Category filter for the feed
  const [activeFeedTab, setActiveFeedTab] = useState<'all' | 'notices' | 'issues' | 'polls'>('all');

  // Modals state (Task 3: Submission logic)
  const [isNoticeComposerOpen, setIsNoticeComposerOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);

  // Notice form
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [noticeTargetDept, setNoticeTargetDept] = useState('CSE');
  const [noticeTargetRole, setNoticeTargetRole] = useState('all');
  const [isPostingNotice, setIsPostingNotice] = useState(false);

  // Issue form
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [newIssueDescription, setNewIssueDescription] = useState('');
  const [newIssueCategory, setNewIssueCategory] = useState('Lab Infrastructure');
  const [newIssueLocation, setNewIssueLocation] = useState('CS Lab 3');
  const [issueTargetDept, setIssueTargetDept] = useState('CSE');
  const [issueTargetRole, setIssueTargetRole] = useState('all');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [isPostingIssue, setIsPostingIssue] = useState(false);

  // Poll form
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollExpiresAt, setPollExpiresAt] = useState('In 3 days');
  const [pollTargetDept, setPollTargetDept] = useState('CSE');
  const [pollTargetRole, setPollTargetRole] = useState('all');
  const [isPostingPoll, setIsPostingPoll] = useState(false);

  const currentUserId = currentUser.id || 'usr_student_01';

  // -----------------------------------------------------------------
  // TASK 1: LIVE DATA FETCHING FROM SUPABASE (messages, issues, polls)
  // -----------------------------------------------------------------
  const fetchAllFeedData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      // 1. Fetch live messages
      const { data: messagesData, error: messagesErr } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!messagesErr && messagesData) {
        setLiveMessages(messagesData);
      }

      // 2. Fetch live issues (Task 1)
      const { data: issuesData, error: issuesErr } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (!issuesErr && issuesData) {
        setLiveIssues(issuesData);
      }

      // 3. Fetch live polls (Task 1)
      const { data: pollsData, error: pollsErr } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (!pollsErr && pollsData) {
        setLivePolls(pollsData);
      }
    } catch (err) {
      console.error('Error querying live feed tables:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllFeedData();
  }, [fetchAllFeedData]);

  // -----------------------------------------------------------------
  // REAL-TIME WEBSOCKET LISTENERS: supabase.channel('public-feed')
  // -----------------------------------------------------------------
  useEffect(() => {
    const channel = supabase
      .channel('public-feed')
      // 1. messages listeners (INSERT, UPDATE, DELETE)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newRecord = payload.new as SupabaseMessage;
          setLiveMessages((prev) => [newRecord, ...prev.filter((m) => m.id !== newRecord.id)]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          const updatedRecord = payload.new as SupabaseMessage;
          setLiveMessages((prev) =>
            prev.map((m) => (m.id === updatedRecord.id ? { ...m, ...updatedRecord } : m))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          const deletedId = (payload.old as { id?: string })?.id;
          if (deletedId) {
            setLiveMessages((prev) => prev.filter((m) => m.id !== deletedId));
          }
        }
      )
      // 2. issues listeners (INSERT, UPDATE, DELETE)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'issues' },
        (payload) => {
          const newRecord = payload.new as SupabaseIssue;
          setLiveIssues((prev) => [newRecord, ...prev.filter((i) => i.id !== newRecord.id)]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'issues' },
        (payload) => {
          const updatedRecord = payload.new as SupabaseIssue;
          setLiveIssues((prev) =>
            prev.map((i) => (i.id === updatedRecord.id ? { ...i, ...updatedRecord } : i))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'issues' },
        (payload) => {
          const deletedId = (payload.old as { id?: string })?.id;
          if (deletedId) {
            setLiveIssues((prev) => prev.filter((i) => i.id !== deletedId));
          }
        }
      )
      // 3. polls listeners (INSERT, UPDATE, DELETE)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'polls' },
        (payload) => {
          const newRecord = payload.new as SupabasePoll;
          setLivePolls((prev) => [newRecord, ...prev.filter((p) => p.id !== newRecord.id)]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'polls' },
        (payload) => {
          const updatedRecord = payload.new as SupabasePoll;
          setLivePolls((prev) =>
            prev.map((p) => (p.id === updatedRecord.id ? { ...p, ...updatedRecord } : p))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'polls' },
        (payload) => {
          const deletedId = (payload.old as { id?: string })?.id;
          if (deletedId) {
            setLivePolls((prev) => prev.filter((p) => p.id !== deletedId));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsRealtimeConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsRealtimeConnected(false);
        }
      });

    // Cleanup function that calls supabase.removeChannel()
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // -----------------------------------------------------------------
  // TASK 2: APPLY CONTENT FILTERING VIA matchTargetTags
  // -----------------------------------------------------------------
  const filteredMessages = useMemo(() => {
    const candidates = liveMessages.length > 0 ? liveMessages : SEED_BROADCASTS;
    return candidates.filter((msg) => {
      if (msg.message_type === 'dm' && msg.recipient_id && msg.recipient_id !== currentUser.id) {
        return false;
      }
      const matches = matchTargetTags(msg.target_tags, currentUser.metadata, currentUser);
      if (!matches) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          msg.content?.toLowerCase().includes(q) ||
          msg.title?.toLowerCase().includes(q) ||
          msg.sender_name?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [liveMessages, currentUser, searchQuery]);

  const filteredIssues = useMemo(() => {
    const candidates = liveIssues.length > 0 ? liveIssues : SEED_ISSUES;
    return candidates.filter((issue) => {
      const matches = matchTargetTags(issue.target_tags, currentUser.metadata, currentUser);
      if (!matches) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          issue.title?.toLowerCase().includes(q) ||
          issue.description?.toLowerCase().includes(q) ||
          issue.location?.toLowerCase().includes(q) ||
          issue.category?.toLowerCase().includes(q) ||
          issue.author_name?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [liveIssues, currentUser, searchQuery]);

  const filteredPolls = useMemo(() => {
    const candidates = livePolls.length > 0 ? livePolls : SEED_POLLS;
    return candidates.filter((poll) => {
      const matches = matchTargetTags(poll.target_tags, currentUser.metadata, currentUser);
      if (!matches) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          poll.question?.toLowerCase().includes(q) ||
          poll.author_name?.toLowerCase().includes(q) ||
          poll.options?.some((o) => o.text.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [livePolls, currentUser, searchQuery]);

  // Total count for current active tab
  const totalItemCount = useMemo(() => {
    if (activeFeedTab === 'notices') return filteredMessages.length;
    if (activeFeedTab === 'issues') return filteredIssues.length;
    if (activeFeedTab === 'polls') return filteredPolls.length;
    return filteredMessages.length + filteredIssues.length + filteredPolls.length;
  }, [activeFeedTab, filteredMessages, filteredIssues, filteredPolls]);

  // -----------------------------------------------------------------
  // TASK 3: SUBMISSION LOGIC - INSERT DIRECTLY INTO LIVE SUPABASE TABLES
  // -----------------------------------------------------------------

  // 1. Submit Broadcast Notice
  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeContent.trim()) return;

    setIsPostingNotice(true);
    const targetTagsPayload: Record<string, any> = {};
    if (noticeTargetDept !== 'all') targetTagsPayload.target_department = noticeTargetDept;
    if (noticeTargetRole !== 'all') targetTagsPayload.target_role = noticeTargetRole;

    try {
      const { data, error } = await supabase.from('messages').insert({
        content: newNoticeContent.trim(),
        message_type: 'broadcast',
        target_tags: targetTagsPayload,
        sender_id: currentUser.id || '00000000-0000-0000-0000-000000000000',
      }).select();

      const optimisticMsg: SupabaseMessage = {
        id: data?.[0]?.id || `msg_local_${Date.now()}`,
        title: newNoticeTitle.trim() || undefined,
        content: newNoticeContent.trim(),
        message_type: 'broadcast',
        target_tags: targetTagsPayload,
        sender_name: currentUser.name,
        sender_role: currentUser.role.toUpperCase(),
        created_at: new Date().toISOString(),
      };

      setLiveMessages((prev) => [optimisticMsg, ...prev]);
      setIsNoticeComposerOpen(false);
      setNewNoticeTitle('');
      setNewNoticeContent('');
    } catch (e) {
      console.error('Failed to insert message:', e);
    } finally {
      setIsPostingNotice(false);
    }
  };

  // 2. Submit Community Issue (Task 3: Upload Image to instempus-media & insert issue)
  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueTitle.trim() || !newIssueDescription.trim()) return;

    setIsPostingIssue(true);
    let uploadedImageUrl: string | undefined = undefined;

    // Task 3: If selectedImage exists, upload to instempus-media bucket
    if (selectedImage) {
      setIsUploadingImage(true);
      try {
        const sanitizedName = selectedImage.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${currentUser.id || 'anonymous'}/${Date.now()}_${sanitizedName}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('instempus-media')
          .upload(filePath, selectedImage, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadErr) {
          console.warn('Storage upload warning (proceeding resiliently):', uploadErr);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('instempus-media')
            .getPublicUrl(filePath);
          uploadedImageUrl = publicUrlData?.publicUrl;
        }
      } catch (err) {
        console.warn('Storage upload exception:', err);
      } finally {
        setIsUploadingImage(false);
      }
    }

    const targetTagsPayload: Record<string, any> = {};
    if (issueTargetDept !== 'all') targetTagsPayload.target_department = issueTargetDept;
    if (issueTargetRole !== 'all') targetTagsPayload.target_role = issueTargetRole;

    const payload = {
      title: newIssueTitle.trim(),
      description: newIssueDescription.trim(),
      category: newIssueCategory,
      location: newIssueLocation.trim() || 'Central Campus',
      status: 'reported' as const,
      author_id: currentUser.id,
      author_name: currentUser.name,
      author_role: currentUser.role,
      author_avatar: currentUser.avatarUrl,
      target_tags: targetTagsPayload,
      upvoted_by: [currentUserId],
      ...(uploadedImageUrl ? { image_url: uploadedImageUrl } : {}),
    };

    try {
      // Direct insert into live Supabase 'issues' table
      const { data, error } = await supabase.from('issues').insert(payload).select();

      const createdIssue: SupabaseIssue = {
        id: data?.[0]?.id || `issue_local_${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
      };

      setLiveIssues((prev) => [createdIssue, ...prev]);
      setIsIssueModalOpen(false);
      setNewIssueTitle('');
      setNewIssueDescription('');
      setSelectedImage(null);
      setSelectedImagePreview(null);
    } catch (e) {
      console.error('Failed to insert issue into Supabase:', e);
    } finally {
      setIsPostingIssue(false);
      setIsUploadingImage(false);
    }
  };

  // 3. Submit Live Poll (Task 3)
  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPollQuestion.trim()) return;

    const validOptions: SupabasePollOption[] = pollOptions
      .filter((opt) => opt.trim().length > 0)
      .map((opt, idx) => ({
        id: `opt_${Date.now()}_${idx}`,
        text: opt.trim(),
        voted_by: [],
      }));

    if (validOptions.length < 2) return;

    setIsPostingPoll(true);
    const targetTagsPayload: Record<string, any> = {};
    if (pollTargetDept !== 'all') targetTagsPayload.target_department = pollTargetDept;
    if (pollTargetRole !== 'all') targetTagsPayload.target_role = pollTargetRole;

    const payload = {
      question: newPollQuestion.trim(),
      options: validOptions,
      author_id: currentUser.id,
      author_name: currentUser.name,
      author_role: currentUser.role,
      author_avatar: currentUser.avatarUrl,
      target_tags: targetTagsPayload,
      expires_at: pollExpiresAt.trim() || 'In 3 days',
    };

    try {
      // Direct insert into live Supabase 'polls' table
      const { data, error } = await supabase.from('polls').insert(payload).select();

      const createdPoll: SupabasePoll = {
        id: data?.[0]?.id || `poll_local_${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
      };

      setLivePolls((prev) => [createdPoll, ...prev]);
      setIsPollModalOpen(false);
      setNewPollQuestion('');
      setPollOptions(['', '']);
    } catch (e) {
      console.error('Failed to insert poll into Supabase:', e);
    } finally {
      setIsPostingPoll(false);
    }
  };

  // Upvote an Issue directly
  const handleUpvoteIssue = async (issueId: string) => {
    setLiveIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        const currentList = iss.upvoted_by || [];
        const hasUpvoted = currentList.includes(currentUserId);
        const updatedList = hasUpvoted
          ? currentList.filter((id) => id !== currentUserId)
          : [...currentList, currentUserId];

        // Sync with Supabase asynchronously
        supabase
          .from('issues')
          .update({ upvoted_by: updatedList })
          .eq('id', issueId)
          .then();

        return { ...iss, upvoted_by: updatedList };
      })
    );
  };

  // Vote on a Poll directly
  const handleVotePoll = async (pollId: string, optionId: string) => {
    setLivePolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId) return poll;
        const updatedOptions = poll.options.map((opt) => {
          const currentVotes = opt.voted_by || [];
          if (opt.id === optionId) {
            return currentVotes.includes(currentUserId)
              ? opt
              : { ...opt, voted_by: [...currentVotes, currentUserId] };
          }
          return {
            ...opt,
            voted_by: currentVotes.filter((id) => id !== currentUserId),
          };
        });

        // Sync with Supabase asynchronously
        supabase
          .from('polls')
          .update({ options: updatedOptions })
          .eq('id', pollId)
          .then();

        return { ...poll, options: updatedOptions };
      })
    );
  };

  return (
    <div className="space-y-5 pb-28 select-none font-sans max-w-lg mx-auto">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP BRAND HEADER & LIVE REFRESH TOOLBAR                    */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between px-2 pt-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              Instempus
            </h1>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isRealtimeConnected ? 'WEBSOCKET LIVE' : 'LIVE SUPABASE'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-normal">
            Directly connected to messages, issues & polls
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Live Feed Button */}
          <button
            type="button"
            onClick={() => fetchAllFeedData(true)}
            disabled={isRefreshing || isLoading}
            title="Refresh Live Tables"
            className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? 'animate-spin text-indigo-400' : 'text-zinc-400'}
            />
          </button>

          {/* Context-Aware Action Button */}
          {activeFeedTab === 'issues' ? (
            <button
              type="button"
              onClick={() => setIsIssueModalOpen(true)}
              className="h-9 px-3 rounded-full bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 text-xs font-semibold font-mono shadow-md shadow-amber-600/30 transition-all active:scale-95"
            >
              <Plus size={14} />
              <span>Report Issue</span>
            </button>
          ) : activeFeedTab === 'polls' ? (
            <button
              type="button"
              onClick={() => setIsPollModalOpen(true)}
              className="h-9 px-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 text-xs font-semibold font-mono shadow-md shadow-emerald-600/30 transition-all active:scale-95"
            >
              <Plus size={14} />
              <span>Create Poll</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsNoticeComposerOpen(true)}
              className="h-9 px-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 text-xs font-semibold font-mono shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Plus size={14} />
              <span>Broadcast</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ACTIVE USER METADATA TAGS BANNER                              */}
      {/* ------------------------------------------------------------- */}
      <div className="mx-1 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 text-xs font-mono space-y-1.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1.5">
            <Filter size={11} className="text-indigo-400" />
            <span>Active Tag-Based Filter</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold">
            {totalItemCount} relevant items
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-0.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-indigo-950/70 border border-indigo-500/30 text-indigo-300">
            dept: <strong className="text-white">{currentUser.department || 'CSE'}</strong>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-purple-950/70 border border-purple-500/30 text-purple-300">
            role: <strong className="text-white">{currentUser.role}</strong>
          </span>
          {currentUser.semester && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300">
              sem: <strong className="text-white">{currentUser.semester}</strong>
            </span>
          )}
          {currentUser.hostelBlock && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-amber-950/70 border border-amber-500/30 text-amber-300">
              hostel: <strong className="text-white">{currentUser.hostelBlock}</strong>
            </span>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. THE 'STORIES' BAR (Ephemeral Updates)                      */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
            Ephemeral Stories & Alerts
          </span>
          <span className="text-[9px] font-mono text-zinc-500">Live Campus Pulse</span>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar py-1 px-2">
          {/* Story 1: 'Mess Menu' */}
          <button
            type="button"
            onClick={() => setActiveStorySheet('mess')}
            className="flex flex-col items-center gap-1.5 shrink-0 transition-transform active:scale-95 focus:outline-none group"
          >
            <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <div className="p-0.5 rounded-full bg-black">
                <div className="h-14 w-14 rounded-full bg-zinc-900 border border-orange-500/30 flex items-center justify-center text-amber-400">
                  <Utensils size={22} className="stroke-[2.2]" />
                </div>
              </div>
            </div>
            <span className="text-[11px] text-zinc-200 font-semibold truncate max-w-[72px]">
              Mess Menu
            </span>
          </button>

          {/* Story 2: 'Warden Alert' */}
          <button
            type="button"
            onClick={() => setActiveStorySheet('warden')}
            className="flex flex-col items-center gap-1.5 shrink-0 transition-transform active:scale-95 focus:outline-none group"
          >
            <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <div className="p-0.5 rounded-full bg-black">
                <div className="h-14 w-14 rounded-full bg-zinc-900 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertTriangle size={22} className="stroke-[2.2]" />
                </div>
              </div>
            </div>
            <span className="text-[11px] text-zinc-200 font-semibold truncate max-w-[72px]">
              Warden Alert
            </span>
          </button>

          {/* Story 3: 'Dean Office' */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 opacity-70">
            <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
              <div className="p-0.5 rounded-full bg-black">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Dean Office"
                  className="h-14 w-14 rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[72px]">
              Dean Desk
            </span>
          </div>

          {/* Story 4: 'TechSangam' */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 opacity-70">
            <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500">
              <div className="p-0.5 rounded-full bg-black">
                <img
                  src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=150&q=80"
                  alt="Tech Fest"
                  className="h-14 w-14 rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[72px]">
              TechSangam
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. CATEGORY CHIPS & SEARCH BAR                                */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-2 px-1">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search filtered broadcasts, issues, polls..."
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-zinc-500 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-zinc-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex gap-2 text-xs font-mono overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setActiveFeedTab('all')}
            className={`py-1.5 px-3.5 rounded-2xl font-bold whitespace-nowrap transition-all ${
              activeFeedTab === 'all'
                ? 'bg-zinc-100 text-zinc-950 shadow'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            All Feed ({filteredMessages.length + filteredIssues.length + filteredPolls.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFeedTab('notices')}
            className={`py-1.5 px-3.5 rounded-2xl font-bold whitespace-nowrap transition-all ${
              activeFeedTab === 'notices'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Notices ({filteredMessages.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFeedTab('issues')}
            className={`py-1.5 px-3.5 rounded-2xl font-bold whitespace-nowrap transition-all ${
              activeFeedTab === 'issues'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Issues ({filteredIssues.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFeedTab('polls')}
            className={`py-1.5 px-3.5 rounded-2xl font-bold whitespace-nowrap transition-all ${
              activeFeedTab === 'polls'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Polls ({filteredPolls.length})
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. MAIN FEED: LIVE NOTICES, ISSUES & POLLS                    */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4 px-1">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <article
                key={`feed-skeleton-${idx}`}
                className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl animate-pulse space-y-3"
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-11 w-11 rounded-full bg-zinc-800 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-32 bg-zinc-800 rounded" />
                      <div className="h-3 w-16 bg-zinc-800 rounded" />
                    </div>
                    <div className="h-3 w-24 bg-zinc-800/60 rounded" />
                    <div className="h-5 w-40 bg-zinc-800/80 rounded-full" />
                    <div className="space-y-1.5 pt-2">
                      <div className="h-3.5 w-full bg-zinc-800/70 rounded" />
                      <div className="h-3.5 w-4/5 bg-zinc-800/70 rounded" />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <>
            {/* SECTION A: NOTICES (MESSAGES TABLE) */}
            {(activeFeedTab === 'all' || activeFeedTab === 'notices') &&
              filteredMessages.map((msg) => {
                const isAck = acknowledgedIds.has(msg.id);

                return (
                  <article
                    key={msg.id}
                    className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800/90 backdrop-blur-xl shadow-xl transition-all space-y-3 font-sans relative overflow-hidden"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="shrink-0 relative">
                        <img
                          src={
                            msg.sender_avatar ||
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={msg.sender_name || 'Notice Author'}
                          className="h-11 w-11 rounded-full object-cover ring-2 ring-indigo-500/40"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-sm font-bold text-white leading-tight">
                                {msg.sender_name || 'Academic Administrator'}
                              </h3>
                              <CheckCircle2 size={13} className="text-indigo-400 shrink-0" />
                            </div>
                            <span className="text-[11px] font-mono text-zinc-400 block mt-0.5">
                              {msg.sender_role || 'Faculty / Administration'}
                            </span>
                          </div>

                          <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Target Tags Badge on Card */}
                        <div className="pt-0.5">
                          {msg.target_tags && Object.keys(msg.target_tags).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(msg.target_tags).map(([k, v]) => (
                                <span
                                  key={k}
                                  className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 inline-flex items-center gap-1"
                                >
                                  <Tag size={10} />
                                  <span>{k}: {String(v)}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 inline-flex items-center gap-1">
                              <Megaphone size={10} />
                              <span>Campus-Wide Broadcast</span>
                            </span>
                          )}
                        </div>

                        {msg.title && (
                          <h4 className="text-xs font-bold text-zinc-100 pt-1 leading-snug">
                            {msg.title}
                          </h4>
                        )}

                        <p className="text-[13px] leading-relaxed text-zinc-200 font-normal pt-0.5 whitespace-pre-line">
                          {msg.content}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/70 mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setAcknowledgedIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(msg.id)) next.delete(msg.id);
                                else next.add(msg.id);
                                return next;
                              });
                            }}
                            className={`py-1.5 px-3.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all active:scale-95 ${
                              isAck
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700'
                            }`}
                          >
                            {isAck ? (
                              <>
                                <Check size={13} className="stroke-[2.8]" />
                                <span>Acknowledged</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={13} />
                                <span>Acknowledge</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                            <Database size={11} className="text-indigo-400" />
                            <span>public.messages</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

            {/* SECTION B: ISSUES (ISSUES TABLE) */}
            {(activeFeedTab === 'all' || activeFeedTab === 'issues') &&
              filteredIssues.map((issue) => {
                const upvoteCount = issue.upvoted_by?.length || 0;
                const hasUpvoted = issue.upvoted_by?.includes(currentUserId);

                return (
                  <article
                    key={issue.id}
                    className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl transition-all space-y-3 font-sans"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="shrink-0 relative">
                        <img
                          src={
                            issue.author_avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={issue.author_name || 'Issue Submitter'}
                          className="h-11 w-11 rounded-full object-cover ring-2 ring-amber-500/40"
                        />
                        <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-amber-500 ring-2 ring-zinc-950 flex items-center justify-center text-[9px] text-zinc-950 font-bold">
                          ⚠️
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <h3 className="text-sm font-bold text-white leading-tight">
                              {issue.author_name || 'Campus Scholar'}
                            </h3>
                            <span className="text-[11px] font-mono text-zinc-400 block mt-0.5">
                              {issue.category} • {issue.location}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            {issue.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Target Tags Badge on Card */}
                        {issue.target_tags && Object.keys(issue.target_tags).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(issue.target_tags).map(([k, v]) => (
                              <span
                                key={k}
                                className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 inline-flex items-center gap-1"
                              >
                                <Tag size={10} />
                                <span>{k}: {String(v)}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        <h4 className="text-xs font-bold text-zinc-100">{issue.title}</h4>
                        <p className="text-xs text-zinc-300 leading-relaxed">{issue.description}</p>

                        {/* Task 4: Render attached image if present */}
                        {issue.image_url && (
                          <div className="pt-1.5 overflow-hidden">
                            <img
                              src={issue.image_url}
                              alt={issue.title}
                              className="w-full max-h-72 object-cover rounded-2xl border border-zinc-800/80 shadow-md bg-zinc-950"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/70">
                          <button
                            type="button"
                            onClick={() => handleUpvoteIssue(issue.id)}
                            className={`py-1 px-3 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                              hasUpvoted
                                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/30'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                            }`}
                          >
                            <ArrowBigUp size={16} />
                            <span>{upvoteCount} Upvotes</span>
                          </button>

                          <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                            <Database size={11} className="text-amber-400" />
                            <span>public.issues</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

            {/* SECTION C: POLLS (POLLS TABLE) */}
            {(activeFeedTab === 'all' || activeFeedTab === 'polls') &&
              filteredPolls.map((poll) => {
                const totalVotes = poll.options.reduce(
                  (acc, o) => acc + (o.voted_by?.length || 0),
                  0
                );
                const hasVoted = poll.options.some((o) => o.voted_by?.includes(currentUserId));

                return (
                  <article
                    key={poll.id}
                    className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl transition-all space-y-3 font-sans"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="shrink-0 relative">
                        <img
                          src={
                            poll.author_avatar ||
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={poll.author_name || 'Poll Creator'}
                          className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-500/40"
                        />
                        <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-zinc-950 flex items-center justify-center text-[9px] text-zinc-950 font-bold">
                          📊
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="text-sm font-bold text-white leading-tight">
                            {poll.author_name || 'Campus Council'}
                          </h3>
                          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Active Poll
                          </span>
                        </div>

                        {/* Target Tags Badge on Card */}
                        {poll.target_tags && Object.keys(poll.target_tags).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(poll.target_tags).map(([k, v]) => (
                              <span
                                key={k}
                                className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 inline-flex items-center gap-1"
                              >
                                <Tag size={10} />
                                <span>{k}: {String(v)}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        <h4 className="text-xs font-bold text-zinc-100">{poll.question}</h4>

                        {/* Options */}
                        <div className="space-y-1.5 pt-1">
                          {poll.options.map((opt) => {
                            const optionVotes = opt.voted_by?.length || 0;
                            const percentage =
                              totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                            const isUserChoice = opt.voted_by?.includes(currentUserId);

                            if (hasVoted) {
                              return (
                                <div
                                  key={opt.id}
                                  className={`relative overflow-hidden rounded-xl border p-2.5 text-xs ${
                                    isUserChoice
                                      ? 'bg-zinc-900 border-emerald-500/50 text-white'
                                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
                                  }`}
                                >
                                  <div
                                    className="absolute inset-y-0 left-0 bg-emerald-500/20 transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  />
                                  <div className="relative z-10 flex items-center justify-between">
                                    <span className="font-semibold">{opt.text}</span>
                                    <span className="font-mono text-[11px] font-bold">
                                      {percentage}% ({optionVotes})
                                    </span>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleVotePoll(poll.id, opt.id)}
                                className="w-full p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-left text-xs font-semibold text-zinc-200 transition-all flex items-center justify-between active:scale-[0.99]"
                              >
                                <span>{opt.text}</span>
                                <Vote size={13} className="text-zinc-500" />
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/70 text-[10px] font-mono text-zinc-400">
                          <span>{totalVotes} total votes</span>
                          <div className="flex items-center gap-1 text-zinc-500">
                            <Database size={11} className="text-emerald-400" />
                            <span>public.polls</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

            {/* Empty State */}
            {totalItemCount === 0 && (
              <div className="p-10 text-center rounded-3xl bg-zinc-900/40 border border-zinc-800 text-xs font-mono space-y-2">
                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <Filter size={18} />
                </div>
                <h4 className="font-bold text-zinc-300">No items match your active profile tags</h4>
                <p className="text-zinc-500 max-w-xs mx-auto text-[11px]">
                  Only items tagged for <strong className="text-indigo-400">{currentUser.department || 'CSE'}</strong> or universal campus items are rendered.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. MODAL 1: REPORT ISSUE MODAL (TASK 3: INSERT TO SUPABASE)   */}
      {/* ------------------------------------------------------------- */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Wrench size={18} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white font-mono">Report Campus Issue</h3>
              </div>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReportIssue} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Issue Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken Projector in CS Lab 3"
                  value={newIssueTitle}
                  onChange={(e) => setNewIssueTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Category</label>
                  <select
                    value={newIssueCategory}
                    onChange={(e) => setNewIssueCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-2 text-white text-xs"
                  >
                    <option value="Lab Infrastructure">Lab Infrastructure</option>
                    <option value="Equipment Maintenance">Equipment Maintenance</option>
                    <option value="Network">Network / Wi-Fi</option>
                    <option value="Hostel Maintenance">Hostel Facility</option>
                    <option value="Mess / Dining">Mess & Dining</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. CS Lab 3"
                    value={newIssueLocation}
                    onChange={(e) => setNewIssueLocation(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed description of the issue or breakdown..."
                  value={newIssueDescription}
                  onChange={(e) => setNewIssueDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 text-xs resize-none"
                />
              </div>

              {/* Photo Attachment (Task 2) */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon size={13} className="text-amber-400" />
                    <span>Attach Photo Evidence (Optional)</span>
                  </span>
                  {selectedImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setSelectedImagePreview(null);
                      }}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold"
                    >
                      Remove photo
                    </button>
                  )}
                </label>

                {selectedImagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 p-1.5">
                    <img
                      src={selectedImagePreview}
                      alt="Attachment preview"
                      className="h-28 w-full object-cover rounded-xl"
                    />
                    <div className="p-1.5 flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="truncate max-w-[200px]">{selectedImage?.name}</span>
                      <span>{((selectedImage?.size || 0) / 1024).toFixed(0)} KB</span>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-3.5 border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 rounded-2xl cursor-pointer transition-colors group">
                    <div className="flex items-center gap-2 text-zinc-400 group-hover:text-zinc-200">
                      <Camera size={16} className="text-amber-400" />
                      <span className="text-[11px] font-medium">Upload photo or equipment screenshot</span>
                    </div>
                    <span className="text-[9px] text-zinc-600 mt-0.5">PNG, JPG, WebP up to 10MB to instempus-media bucket</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedImage(file);
                          setSelectedImagePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Tag Targeting */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Target Department</label>
                  <select
                    value={issueTargetDept}
                    onChange={(e) => setIssueTargetDept(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs"
                  >
                    <option value="CSE">CSE (Computer Science)</option>
                    <option value="Mechanical Engineering">Mechanical Eng</option>
                    <option value="all">Universal (All Depts)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Target Role</label>
                  <select
                    value={issueTargetRole}
                    onChange={(e) => setIssueTargetRole(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs"
                  >
                    <option value="student">Students</option>
                    <option value="teacher">Faculty</option>
                    <option value="all">All Roles</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsIssueModalOpen(false);
                    setSelectedImage(null);
                    setSelectedImagePreview(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPostingIssue || isUploadingImage || !newIssueTitle.trim()}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-amber-600/30"
                >
                  {isPostingIssue || isUploadingImage ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>{isUploadingImage ? 'Uploading Image...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Submit to public.issues</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. MODAL 2: CREATE POLL MODAL (TASK 3: INSERT TO SUPABASE)    */}
      {/* ------------------------------------------------------------- */}
      {isPollModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Vote size={18} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-mono">Create Campus Poll</h3>
              </div>
              <button
                onClick={() => setIsPollModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Poll Question *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Best time for Project Review?"
                  value={newPollQuestion}
                  onChange={(e) => setNewPollQuestion(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Poll Options (min 2)</label>
                <div className="space-y-2">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        required={idx < 2}
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...pollOptions];
                          updated[idx] = e.target.value;
                          setPollOptions(updated);
                        }}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 text-xs"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            setPollOptions(pollOptions.filter((_, i) => i !== idx));
                          }}
                          className="text-zinc-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}

                  {pollOptions.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setPollOptions([...pollOptions, ''])}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 pt-1"
                    >
                      <Plus size={12} /> Add another option
                    </button>
                  )}
                </div>
              </div>

              {/* Tag Targeting */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Target Department</label>
                  <select
                    value={pollTargetDept}
                    onChange={(e) => setPollTargetDept(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs"
                  >
                    <option value="CSE">CSE (Computer Science)</option>
                    <option value="Mechanical Engineering">Mechanical Eng</option>
                    <option value="all">Universal (All Depts)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Target Role</label>
                  <select
                    value={pollTargetRole}
                    onChange={(e) => setPollTargetRole(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs"
                  >
                    <option value="student">Students</option>
                    <option value="teacher">Faculty</option>
                    <option value="all">All Roles</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Expiration Period</label>
                <input
                  type="text"
                  placeholder="e.g. In 3 days"
                  value={pollExpiresAt}
                  onChange={(e) => setPollExpiresAt(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsPollModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPostingPoll || !newPollQuestion.trim()}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  {isPostingPoll ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  <span>Publish to public.polls</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. MODAL 3: BROADCAST NOTICE COMPOSER                         */}
      {/* ------------------------------------------------------------- */}
      {isNoticeComposerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Megaphone size={18} className="text-indigo-400" />
                <h3 className="text-sm font-bold text-white font-mono">Post Tagged Broadcast</h3>
              </div>
              <button
                onClick={() => setIsNoticeComposerOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishNotice} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Notice Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Examination Hall Allocation"
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Content *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Compose notice announcement body..."
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Target Department</label>
                  <select
                    value={noticeTargetDept}
                    onChange={(e) => setNoticeTargetDept(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs"
                  >
                    <option value="CSE">CSE (Computer Science)</option>
                    <option value="Mechanical Engineering">Mechanical Eng</option>
                    <option value="all">Universal (All Depts)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Target Role</label>
                  <select
                    value={noticeTargetRole}
                    onChange={(e) => setNoticeTargetRole(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs"
                  >
                    <option value="student">Students</option>
                    <option value="teacher">Faculty</option>
                    <option value="all">All Roles</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNoticeComposerOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPostingNotice || !newNoticeContent.trim()}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                >
                  {isPostingNotice ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  <span>Publish to public.messages</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. EPHEMERAL STORY BOTTOM SHEETS                              */}
      {/* ------------------------------------------------------------- */}
      {activeStorySheet === 'mess' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end justify-center select-none animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-950 border-t border-zinc-800 rounded-t-3xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-250">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Utensils size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-sans">
                    Today's 4-Meal Dining Menu
                  </h3>
                  <span className="text-xs text-zinc-400 font-mono">{canteenMenu.date}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveStorySheet(null)}
                className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-amber-400 font-bold uppercase text-[10px] block">Breakfast</span>
                <p className="text-zinc-200 mt-1">
                  {typeof canteenMenu.breakfast === 'string'
                    ? canteenMenu.breakfast
                    : (canteenMenu.breakfast as any)?.items?.join(' • ')}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-orange-400 font-bold uppercase text-[10px] block">Lunch</span>
                <p className="text-zinc-200 mt-1">
                  {typeof canteenMenu.lunch === 'string'
                    ? canteenMenu.lunch
                    : (canteenMenu.lunch as any)?.items?.join(' • ')}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-yellow-400 font-bold uppercase text-[10px] block">Snacks</span>
                <p className="text-zinc-200 mt-1">
                  {typeof canteenMenu.snacks === 'string'
                    ? canteenMenu.snacks
                    : (canteenMenu.snacks as any)?.items?.join(' • ')}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-emerald-400 font-bold uppercase text-[10px] block">Dinner</span>
                <p className="text-zinc-200 mt-1">
                  {typeof canteenMenu.dinner === 'string'
                    ? canteenMenu.dinner
                    : (canteenMenu.dinner as any)?.items?.join(' • ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeStorySheet === 'warden' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end justify-center select-none animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-950 border-t border-zinc-800 rounded-t-3xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-250">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-sans">
                    Hostel Curfew & Gate Notification
                  </h3>
                  <span className="text-xs text-zinc-400 font-mono">Enforced Campus Protocol</span>
                </div>
              </div>

              <button
                onClick={() => setActiveStorySheet(null)}
                className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-xs space-y-2">
              <p className="text-rose-200 leading-relaxed font-sans">
                Hostel main gates close promptly at <strong>9:00 PM</strong> tonight. All scholars with valid digital gate-passes must biometric scan prior to entry cutoff.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CampusFeedPage;
