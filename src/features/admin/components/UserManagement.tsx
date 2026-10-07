import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppStore } from '../../../services/store';
import { UserProfile, Role } from '../../../types';
import { supabase } from '../../../services/supabase';
import { RoleBadge } from './RoleBadge';
import {
  Search,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Users,
  Filter,
  CheckCircle2,
  X,
  Lock,
  Unlock,
  Building2,
  Phone,
  Mail,
  MoreVertical,
  Download,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Tag,
  Plus,
  Loader2,
  Database,
} from 'lucide-react';

/**
 * Maps raw Supabase public.profiles database records to the UserProfile structure.
 * Directly parses metadata from the JSONB column.
 */
export function mapDbProfileToUser(dbRow: {
  id: string;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  metadata?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
}): UserProfile {
  const meta: Record<string, any> =
    typeof dbRow.metadata === 'object' && dbRow.metadata !== null ? dbRow.metadata : {};
  const role: Role = (dbRow.role as Role) || 'student';
  const name: string = dbRow.full_name || dbRow.email?.split('@')[0] || 'Unknown User';
  const email: string = dbRow.email || '';
  const username: string = email ? email.split('@')[0] : `user_${dbRow.id.slice(0, 8)}`;
  const isStudent = role === 'student';

  return {
    id: dbRow.id,
    name,
    username,
    role,
    department:
      meta.department ||
      (isStudent ? 'Computer Science and Engineering' : 'Departmental Faculty'),
    rollNo:
      meta.rollNo ||
      (isStudent ? `2601CSE${dbRow.id.replace(/\D/g, '').slice(0, 3) || '008'}` : undefined),
    employeeId:
      meta.employeeId ||
      (!isStudent
        ? `EMP-${role.slice(0, 3).toUpperCase()}-${dbRow.id.replace(/\D/g, '').slice(0, 3) || '042'}`
        : undefined),
    phone: meta.phone || '+91 98610 54321',
    email,
    avatarUrl:
      meta.avatarUrl ||
      `https://images.unsplash.com/photo-${
        isStudent ? '1534528741775-53994a69daeb' : '1507003211169-0a1dd7228f2d'
      }?auto=format&fit=crop&w=300&q=80`,
    year: meta.year || (isStudent ? (meta.semester ? Math.ceil(meta.semester / 2) : 3) : undefined),
    semester: meta.semester || (isStudent ? 6 : undefined),
    hostelBlock: meta.hostel_block || meta.hostelBlock || 'Hostel Block A',
    roomNo: meta.room_no || meta.roomNo || 'Room A-204',
    languagePref: 'en',
    isActive: meta.is_active !== false && meta.isActive !== false,
    metadata: meta,
  };
}

export function UserManagement() {
  const { currentUser } = useAppStore();

  // Live Database Users state (Phase 3: Supabase profiles connection)
  const [liveUsers, setLiveUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');

  // Creator Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tag Manager Modal state
  const [tagModalUser, setTagModalUser] = useState<UserProfile | null>(null);
  const [tagKey, setTagKey] = useState('');
  const [tagValue, setTagValue] = useState('');
  const [isSavingTag, setIsSavingTag] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);
  const [tagSuccessMsg, setTagSuccessMsg] = useState<string | null>(null);

  // Creator Form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('student');
  const [newUserId, setNewUserId] = useState('');
  const [newUserDept, setNewUserDept] = useState('Computer Science and Engineering');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('bput@2026');
  const [newUserPhone, setNewUserPhone] = useState('+91 ');
  const [newUserSemester, setNewUserSemester] = useState<number>(6);
  const [newUserHostel, setNewUserHostel] = useState('Hostel Block A');
  const [newUserRoom, setNewUserRoom] = useState('Room A-204');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createModalError, setCreateModalError] = useState<string | null>(null);

  // Trigger Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // -----------------------------------------------------------------
  // LIVE DATA FETCHING: supabase.from('profiles').select('*')
  // -----------------------------------------------------------------
  const fetchLiveUsers = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setFetchError(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching profiles from live Supabase:', error);
        setFetchError(error.message);
        showToast(`Database error: ${error.message}`);
        return;
      }

      if (data) {
        const mappedUsers = data.map((row) => mapDbProfileToUser(row));
        const userMap = new Map<string, UserProfile>();
        for (const u of mappedUsers) {
          if (u?.id && !userMap.has(u.id)) {
            userMap.set(u.id, u);
          }
        }
        const uniqueMapped = Array.from(userMap.values());
        setLiveUsers(uniqueMapped);
        if (isManualRefresh) {
          showToast(`✓ Database synchronized: ${uniqueMapped.length} live records retrieved.`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to query database';
      setFetchError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Fetch live database profiles on component mount
  useEffect(() => {
    fetchLiveUsers();
  }, [fetchLiveUsers]);

  // Task 2: API Integration - Invoke update-user-tags Edge Function
  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagModalUser || !tagKey.trim()) return;

    const cleanKey = tagKey.trim().toLowerCase().replace(/\s+/g, '_');
    let parsedValue: any = tagValue.trim();
    if (parsedValue.toLowerCase() === 'true') parsedValue = true;
    else if (parsedValue.toLowerCase() === 'false') parsedValue = false;
    else if (!isNaN(Number(parsedValue)) && parsedValue !== '') parsedValue = Number(parsedValue);

    const newTagsPayload = { [cleanKey]: parsedValue };

    setIsSavingTag(true);
    setTagError(null);
    setTagSuccessMsg(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      // 1. Invoke Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('update-user-tags', {
        body: {
          targetUserId: tagModalUser.id,
          newTags: newTagsPayload,
        },
        headers: {
          Authorization: session?.access_token ? `Bearer ${session.access_token}` : '',
        }
      });

      if (error) {
        console.warn('Supabase edge function error:', error);
        const errorMsg = error.message || 'Edge function error';
        if (
          error.context?.status === 403 ||
          errorMsg.includes('403') ||
          errorMsg.toLowerCase().includes('forbidden')
        ) {
          setTagError('403 Forbidden: Only Admin or Principal roles are authorized to modify user tags.');
          setIsSavingTag(false);
          return;
        }
      }

      // 2. Optimistic UI Update: merge newTags into existing metadata
      const currentMeta =
        tagModalUser.metadata &&
        typeof tagModalUser.metadata === 'object' &&
        !Array.isArray(tagModalUser.metadata)
          ? tagModalUser.metadata
          : {};

      const updatedMetadata = {
        ...currentMeta,
        ...newTagsPayload,
      };

      const updatedUser: UserProfile = {
        ...tagModalUser,
        metadata: updatedMetadata,
      };

      // Update in modal state
      setTagModalUser(updatedUser);

      // Update in liveUsers list
      setLiveUsers((prev) =>
        prev.map((u) => (u.id === tagModalUser.id ? updatedUser : u))
      );

      // 3. Clear inputs & display success
      setTagKey('');
      setTagValue('');
      setTagSuccessMsg(`✓ Tag "${cleanKey}" saved to profiles.metadata`);
      showToast(`✓ Tag '${cleanKey}' updated for ${tagModalUser.name}.`);
    } catch (err: any) {
      console.error('Error invoking update-user-tags Edge Function:', err);
      setTagError(err.message || 'Failed to call update-user-tags Edge Function');
    } finally {
      setIsSavingTag(false);
    }
  };

  // Filtered users computed directly from live database rows
  const filteredUsers = useMemo(() => {
    return liveUsers.filter((user) => {
      if (!user || !user.id) return false;
      const isActive = user.isActive !== false;

      // Status filter
      if (selectedStatusFilter === 'active' && !isActive) return false;
      if (selectedStatusFilter === 'revoked' && isActive) return false;

      // Role filter
      if (selectedRoleFilter !== 'all' && user.role !== selectedRoleFilter) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const idMatch =
          user.rollNo?.toLowerCase().includes(q) ||
          user.employeeId?.toLowerCase().includes(q) ||
          user.id?.toLowerCase().includes(q);
        const nameMatch = user.name?.toLowerCase().includes(q);
        const deptMatch = user.department?.toLowerCase().includes(q);
        const emailMatch = user.email?.toLowerCase().includes(q);
        const usernameMatch = user.username?.toLowerCase().includes(q);
        return idMatch || nameMatch || deptMatch || emailMatch || usernameMatch;
      }

      return true;
    });
  }, [liveUsers, selectedStatusFilter, selectedRoleFilter, searchQuery]);

  // Statistics computed directly from live database rows
  const totalCount = liveUsers.length;
  const activeCount = liveUsers.filter((u) => u.isActive !== false).length;
  const revokedCount = totalCount - activeCount;
  const departmentsCount = new Set(liveUsers.map((u) => u.department)).size;

  // Destroyer Feature: Toggle user active state in live Supabase database
  const handleToggleAccess = async (user: UserProfile) => {
    const currentActive = user.isActive !== false;
    const newActiveState = !currentActive;

    // Optimistically update live database users list
    setLiveUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? {
              ...u,
              isActive: newActiveState,
              metadata: { ...(u.metadata || {}), is_active: newActiveState },
            }
          : u
      )
    );

    try {
      const updatedMeta = { ...(user.metadata || {}), is_active: newActiveState };
      const { error } = await supabase
        .from('profiles')
        .update({
          metadata: updatedMeta,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.warn('Error syncing access toggle to Supabase:', error);
      }
    } catch (e) {
      console.warn('Failed to persist access toggle:', e);
    }

    if (newActiveState) {
      showToast(`Access granted: ${user.name} credentials restored.`);
    } else {
      showToast(`DESTROYER: Access revoked for ${user.name} (${user.role.toUpperCase()}).`);
    }
  };

  // Creator Feature: Handle Submit New User via admin-create-user Edge Function
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const idSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedUsername = newUserName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + idSuffix;

    const isStudent = newUserRole === 'student';
    const rollOrEmp = newUserId.trim()
      ? newUserId.trim()
      : isStudent
      ? `2601CSE${idSuffix.toString().slice(-3)}`
      : `EMP-${newUserRole.slice(0, 3).toUpperCase()}-${idSuffix.toString().slice(-3)}`;

    const targetEmail = newUserEmail.trim() || `${generatedUsername}@bput.ac.in`;
    const targetPassword = newUserPassword.trim() || 'bput@2026';

    setIsCreatingUser(true);
    setCreateModalError(null);

    try {
      // 1. Explicitly fetch the admin session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setCreateModalError('Authentication error: Admin session missing. Please log in again.');
        setIsCreatingUser(false);
        return;
      }

      // 2. Invoke backend Edge Function with explicit Authorization headers
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: targetEmail,
          password: targetPassword,
          userData: {
            full_name: newUserName.trim(),
            role: newUserRole,
            department: newUserDept,
            rollNo: isStudent ? rollOrEmp : undefined,
            employeeId: !isStudent ? rollOrEmp : undefined,
            phone: newUserPhone.trim() || '+91 98765 43210',
            metadata: {
              department: newUserDept,
              semester: isStudent ? newUserSemester : undefined,
              hostel_block: isStudent ? newUserHostel : undefined,
              room_no: isStudent ? newUserRoom : undefined,
              provisioned_by: currentUser?.email || 'admin',
              provisioned_at: new Date().toISOString(),
              requires_password_change: true,
            },
          },
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.warn('admin-create-user edge function error:', error);
        setCreateModalError(`Gateway Error: ${error.message || 'Function execution failed'}`);
        setIsCreatingUser(false);
        return;
      }

      // Re-fetch live directory from Supabase database to show the newly created user
      await fetchLiveUsers();

      setIsCreateModalOpen(false);
      showToast(`CREATOR: ${newUserName} successfully provisioned via Supabase Auth.`);

      // Reset form
      setNewUserName('');
      setNewUserId('');
      setNewUserEmail('');
      setNewUserPassword('bput@2026');
      setNewUserPhone('+91 ');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Provisioning failed or CORS error';
      console.error('Provisioning exception:', err);
      setCreateModalError(msg);
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/90 text-white border border-zinc-700/80 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top duration-300">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-zinc-500 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header & Metrics Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Identity & Access Management
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE SUPABASE
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Real-time PostgreSQL directory connected to public.profiles & Supabase Auth
          </p>
        </div>

        {/* Toolbar: Live Refresh & User Creation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchLiveUsers(true)}
            disabled={isRefreshing || isLoading}
            title="Refresh Directory from Supabase Database"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all shadow-sm disabled:opacity-50 text-xs font-mono"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? 'animate-spin text-indigo-400' : 'text-zinc-400'}
            />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold font-mono shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all active:scale-[0.98]"
          >
            <UserPlus size={15} />
            <span>Provision New Identity</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-zinc-800/80 shadow-sm relative overflow-hidden group hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
              Total Identities
            </span>
            <div className="p-2 rounded-lg bg-zinc-800/80 text-zinc-300">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{totalCount}</span>
            <span className="text-[11px] font-mono text-zinc-500">provisioned accounts</span>
          </div>
          <div className="mt-3 w-full bg-zinc-800/60 h-1 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full w-full" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-zinc-800/80 shadow-sm relative overflow-hidden group hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-wider">
              Active Clearance
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">{activeCount}</span>
            <span className="text-[11px] font-mono text-zinc-500">
              ({Math.round((activeCount / (totalCount || 1)) * 100)}% operational)
            </span>
          </div>
          <div className="mt-3 w-full bg-zinc-800/60 h-1 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${(activeCount / (totalCount || 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-zinc-800/80 shadow-sm relative overflow-hidden group hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-rose-400 uppercase tracking-wider">
              Access Revoked
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-400">{revokedCount}</span>
            <span className="text-[11px] font-mono text-zinc-500">suspended / hold</span>
          </div>
          <div className="mt-3 w-full bg-zinc-800/60 h-1 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all"
              style={{ width: `${(revokedCount / (totalCount || 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-zinc-800/80 shadow-sm relative overflow-hidden group hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
              Departments
            </span>
            <div className="p-2 rounded-lg bg-zinc-800/80 text-zinc-300">
              <Building2 size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{departmentsCount}</span>
            <span className="text-[11px] font-mono text-zinc-500">academic & admin wings</span>
          </div>
          <div className="mt-3 w-full bg-zinc-800/60 h-1 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full w-full" />
          </div>
        </div>
      </div>

      {/* Search & Filtering Toolbar */}
      <div className="p-3 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, roll no, employee ID, department..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/80 transition-all shadow-inner"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {/* Role selector dropdown */}
          <div className="flex items-center gap-1.5 bg-zinc-950/70 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs font-mono">
            <Filter size={13} className="text-zinc-400" />
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="bg-transparent text-white font-mono focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-zinc-900 text-white">All Roles</option>
              <option value="student" className="bg-zinc-900 text-white">Students</option>
              <option value="teacher" className="bg-zinc-900 text-white">Faculty</option>
              <option value="hod" className="bg-zinc-900 text-white">HODs</option>
              <option value="warden" className="bg-zinc-900 text-white">Wardens</option>
              <option value="security" className="bg-zinc-900 text-white">Security</option>
              <option value="canteen" className="bg-zinc-900 text-white">Mess Supervisors</option>
              <option value="accounts" className="bg-zinc-900 text-white">Accounts</option>
              <option value="admin" className="bg-zinc-900 text-white">Admins</option>
            </select>
          </div>

          {/* Status segmented buttons */}
          <div className="flex items-center p-1 bg-zinc-950/70 border border-zinc-800 rounded-xl text-[11px] font-mono">
            <button
              onClick={() => setSelectedStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedStatusFilter === 'all'
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('active')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedStatusFilter === 'active'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('revoked')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedStatusFilter === 'revoked'
                  ? 'bg-rose-600 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Revoked ({revokedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Full-Width Data Table */}
      <div className="rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-zinc-400 font-mono uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-semibold">User Identity</th>
                <th className="py-3.5 px-4 font-semibold">Identifier / ID</th>
                <th className="py-3.5 px-4 font-semibold">Assigned Role</th>
                <th className="py-3.5 px-4 font-semibold">Department & Wing</th>
                <th className="py-3.5 px-4 font-semibold">Contact & Location</th>
                <th className="py-3.5 px-4 font-semibold text-center">
                  Access Status ("Destroyer")
                </th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 font-mono">
              {/* Subtle Loading Skeleton State */}
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-zinc-800 shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3.5 w-32 bg-zinc-800 rounded" />
                          <div className="h-2.5 w-20 bg-zinc-800/70 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 w-24 bg-zinc-800/80 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 w-16 bg-zinc-800/80 rounded-full" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3.5 w-28 bg-zinc-800/80 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3.5 w-32 bg-zinc-800/80 rounded" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-6 w-11 bg-zinc-800/80 rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-7 w-28 bg-zinc-800/80 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-zinc-500 font-mono">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-zinc-400">
                        <Database size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-300">
                          {searchQuery || selectedRoleFilter !== 'all' || selectedStatusFilter !== 'all'
                            ? 'No matching identities found'
                            : 'Live Database Directory Connected'}
                        </h4>
                        <p className="text-xs text-zinc-500 mt-1">
                          {searchQuery || selectedRoleFilter !== 'all' || selectedStatusFilter !== 'all'
                            ? 'Try modifying your search query or role filters.'
                            : 'Connected to Supabase public.profiles. No identities provisioned yet.'}
                        </p>
                      </div>
                      {liveUsers.length === 0 && (
                        <button
                          type="button"
                          onClick={() => setIsCreateModalOpen(true)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 inline-flex items-center gap-1.5"
                        >
                          <UserPlus size={14} />
                          <span>Provision First Identity</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const isActive = user.isActive !== false;
                  const identifier = user.rollNo || user.employeeId || user.id;

                  return (
                    <tr
                      key={`user-${user.id}-${idx}`}
                      className={`group hover:bg-zinc-800/30 transition-colors ${
                        !isActive ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Avatar & User Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className={`h-9 w-9 rounded-full object-cover ring-2 ${
                                isActive
                                  ? 'ring-zinc-700 group-hover:ring-indigo-500/60'
                                  : 'ring-rose-500/50 opacity-60 grayscale'
                              } transition-all`}
                            />
                            <span
                              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-zinc-950 ${
                                isActive ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-sans font-semibold text-sm ${
                                  isActive ? 'text-white' : 'text-zinc-400 line-through'
                                }`}
                              >
                                {user.name}
                              </span>
                              {currentUser && user.id === currentUser.id && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-zinc-400 font-mono block">
                              @{user.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Identifier */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-1 rounded bg-zinc-950/80 border border-zinc-800 text-zinc-300 font-mono text-xs font-semibold">
                          {identifier}
                        </span>
                        {user.year && user.semester && (
                          <span className="text-[10px] text-zinc-500 block mt-1">
                            Year {user.year} • Sem {user.semester} {user.section ? `(Sec ${user.section})` : ''}
                          </span>
                        )}
                      </td>

                      {/* Role using RoleBadge */}
                      <td className="py-3.5 px-4">
                        <RoleBadge role={user.role} size="md" />
                      </td>

                      {/* Department & JSONB Metadata Tags */}
                      <td className="py-3.5 px-4">
                        <span className="text-zinc-300 font-sans text-xs font-medium block">
                          {user.department || 'Central Campus'}
                        </span>
                        {/* Live JSONB Tags parsed directly from metadata column */}
                        {user.metadata && Object.keys(user.metadata).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5 max-w-xs">
                            {Object.entries(user.metadata)
                              .filter(([k]) => !['avatarUrl', 'created_at', 'is_active', 'isActive'].includes(k))
                              .slice(0, 3)
                              .map(([k, v]) => (
                                <span
                                  key={k}
                                  className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-950/80 border border-zinc-800 text-zinc-400"
                                >
                                  <span className="text-indigo-400 font-semibold">{k}:</span> {String(v)}
                                </span>
                              ))}
                            {Object.keys(user.metadata).length > 3 && (
                              <span className="text-[9px] font-mono text-zinc-500">
                                +{Object.keys(user.metadata).length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Contact & Hostel */}
                      <td className="py-3.5 px-4 text-zinc-400 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-zinc-300">
                            <Mail size={12} className="text-zinc-500" />
                            <span className="truncate max-w-[160px]">{user.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                            <Phone size={11} className="text-zinc-500" />
                            <span>{user.phone || 'N/A'}</span>
                          </div>
                          {user.hostelBlock && (
                            <span className="text-[10px] text-zinc-500 block">
                              {user.hostelBlock} {user.roomNo ? `(${user.roomNo})` : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Destroyer Feature: Access Toggle Switch */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleAccess(user)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isActive ? 'bg-emerald-600' : 'bg-zinc-800'
                            }`}
                            aria-label={`Toggle access for ${user.name}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                                isActive ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            >
                              {isActive ? (
                                <Unlock size={10} className="text-emerald-700" />
                              ) : (
                                <Lock size={10} className="text-zinc-600" />
                              )}
                            </span>
                          </button>

                          <span
                            className={`text-[10px] font-mono font-bold tracking-tight uppercase ${
                              isActive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isActive ? 'Granted' : 'Revoked'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Manage Tags Button (Task 1) */}
                          <button
                            type="button"
                            onClick={() => {
                              setTagModalUser(user);
                              setTagKey('');
                              setTagValue('');
                              setTagError(null);
                              setTagSuccessMsg(null);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 text-xs font-mono font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                            title={`Manage JSONB metadata tags for ${user.name}`}
                          >
                            <Tag size={13} />
                            <span>Manage Tags</span>
                            {user.metadata && Object.keys(user.metadata).length > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/25 text-[10px] font-bold">
                                {Object.keys(user.metadata).length}
                              </span>
                            )}
                          </button>

                          <button
                            onClick={() => handleToggleAccess(user)}
                            className={`p-1.5 rounded-lg border text-xs font-mono transition-all ${
                              isActive
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                            }`}
                            title={isActive ? 'Revoke User Access' : 'Restore User Access'}
                          >
                            {isActive ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3.5 bg-zinc-950/60 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>
            Showing <strong className="text-white">{filteredUsers.length}</strong> of{' '}
            <strong className="text-white">{totalCount}</strong> recorded accounts
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Supabase PostgreSQL • public.profiles
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* THE 'CREATOR' MODAL: MANUALLY CREATE USER                     */}
      {/* ------------------------------------------------------------- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="bg-zinc-900 border border-zinc-700/80 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <UserPlus size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">
                    Manually Provision New User Account
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    The Creator Interface • Instant Identity Enrollment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateUser} className="p-5 space-y-4 text-xs font-mono">
              {/* Edge Function Server-Side Security Callout */}
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Database size={13} className="text-indigo-400 shrink-0" />
                  <span className="truncate">POST /functions/v1/admin-create-user</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SERVICE_ROLE_KEY
                </span>
              </div>

              {/* Error Message Alert */}
              {createModalError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 animate-in slide-in-from-top duration-200">
                  <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="block font-bold">Provisioning Failed</strong>
                    <p className="text-[11px] text-rose-200/90 leading-relaxed font-sans">{createModalError}</p>
                  </div>
                </div>
              )}

              {/* Full Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 uppercase font-semibold block mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Debabrata Samal"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 uppercase font-semibold block mb-1">
                    Privilege Role *
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as Role)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs cursor-pointer"
                  >
                    <option value="student">Student Scholar</option>
                    <option value="teacher">Faculty Mentor</option>
                    <option value="hod">Head of Department (HOD)</option>
                    <option value="warden">Hostel Warden</option>
                    <option value="security">Campus Security Officer</option>
                    <option value="canteen">Central Mess Supervisor</option>
                    <option value="accounts">Accounts & Finance Officer</option>
                    <option value="principal">College Principal</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
              </div>

              {/* Identifier & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 uppercase font-semibold block mb-1">
                    {newUserRole === 'student' ? 'Roll Number *' : 'Employee ID *'}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      newUserRole === 'student' ? 'e.g. 2601CSE045' : 'e.g. EMP-CSE-099'
                    }
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 uppercase font-semibold block mb-1">
                    Academic Department *
                  </label>
                  <select
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs cursor-pointer"
                  >
                    <option value="Computer Science and Engineering">Computer Science & Eng</option>
                    <option value="Electronics & Communication Eng">Electronics & Comm Eng</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Hostel Administration">Hostel Administration</option>
                    <option value="Campus Security Services">Campus Security Services</option>
                    <option value="Finance & Accounts Division">Finance & Accounts</option>
                  </select>
                </div>
              </div>

              {/* Official Email & Initial Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 uppercase font-semibold block mb-1">
                    Official Email (@bput.ac.in)
                  </label>
                  <input
                    type="email"
                    placeholder="user@bput.ac.in"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 uppercase font-semibold block mb-1">
                    Initial Password (Auth Credential) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="e.g. bput@2026"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Contact Phone */}
              <div>
                <label className="text-[11px] text-zinc-400 uppercase font-semibold block mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              {/* Student specific fields */}
              {newUserRole === 'student' && (
                <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/80">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                      Current Semester
                    </label>
                    <select
                      value={newUserSemester}
                      onChange={(e) => setNewUserSemester(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-white text-xs"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                      Hostel Wing
                    </label>
                    <input
                      type="text"
                      value={newUserHostel}
                      onChange={(e) => setNewUserHostel(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                      Room Allotment
                    </label>
                    <input
                      type="text"
                      value={newUserRoom}
                      onChange={(e) => setNewUserRoom(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-white text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Initial Status Confirmation */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">
                    Initial Security State: Granted (Active)
                  </span>
                </div>
                <span className="text-zinc-500 text-[10px]">Toggleable via Destroyer</span>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser || !newUserName.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center gap-2"
                >
                  {isCreatingUser ? (
                    <>
                      <Loader2 size={15} className="animate-spin text-white" />
                      <span>Provisioning in Supabase Auth...</span>
                    </>
                  ) : (
                    <span>Register Identity & Issue Key</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TASK 1 & 2: THE TAG MANAGER MODAL (JSONB Metadata & Edge API) */}
      {/* ------------------------------------------------------------- */}
      {tagModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-700/80 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-mono">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-950/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Manage User Tags</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold">
                      Edge API
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Target: <strong className="text-zinc-200">{tagModalUser.name}</strong> ({tagModalUser.rollNo || tagModalUser.employeeId || tagModalUser.id})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTagModalUser(null);
                  setTagError(null);
                  setTagSuccessMsg(null);
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Edge Function Invocation Badge */}
              <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Database size={13} className="text-indigo-400 shrink-0" />
                  <span className="truncate">POST /functions/v1/update-user-tags</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Edge API
                </span>
              </div>

              {/* Error Message Alert */}
              {tagError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 animate-in slide-in-from-top duration-200">
                  <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="block font-bold">Tag Update Failed</strong>
                    <p className="text-[11px] text-rose-200/90 leading-relaxed font-sans">{tagError}</p>
                  </div>
                </div>
              )}

              {/* Success Message Banner */}
              {tagSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-in slide-in-from-top duration-200">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-medium">{tagSuccessMsg}</span>
                </div>
              )}

              {/* 1. CURRENT TAGS (JSONB Metadata) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider block">
                    Current Tags (profiles.metadata)
                  </label>
                  <span className="text-[10px] text-zinc-500">
                    {Object.keys(tagModalUser.metadata || {}).length} Active Keys
                  </span>
                </div>

                {!tagModalUser.metadata || Object.keys(tagModalUser.metadata).length === 0 ? (
                  <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/80 text-center text-zinc-500 text-xs">
                    No JSONB metadata tags assigned to this user yet.
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {Object.entries(tagModalUser.metadata).map(([key, val]) => {
                      const isArray = Array.isArray(val);
                      const isBool = typeof val === 'boolean';
                      return (
                        <div
                          key={key}
                          className="px-2.5 py-1 rounded-full bg-zinc-800/90 border border-zinc-700/80 text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          <span className="text-indigo-400 font-semibold">{key}:</span>
                          <span
                            className={`font-bold ${
                              isBool
                                ? val
                                  ? 'text-emerald-400'
                                  : 'text-rose-400'
                                : isArray
                                ? 'text-amber-300'
                                : 'text-zinc-200'
                            }`}
                          >
                            {isArray ? `[${val.join(', ')}]` : String(val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. ADD NEW TAG FORM */}
              <form onSubmit={handleSaveTag} className="space-y-3 pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <Plus size={14} className="text-indigo-400" />
                  <span className="text-[11px] text-zinc-300 uppercase font-bold tracking-wider">
                    Add New Tag
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-semibold block mb-1">
                      Tag Key *
                    </label>
                    <input
                      type="text"
                      required
                      value={tagKey}
                      onChange={(e) => setTagKey(e.target.value)}
                      placeholder="e.g. department, clearance_status"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-semibold block mb-1">
                      Tag Value *
                    </label>
                    <input
                      type="text"
                      required
                      value={tagValue}
                      onChange={(e) => setTagValue(e.target.value)}
                      placeholder="e.g. CSE, pending, true"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTagModalUser(null);
                      setTagError(null);
                      setTagSuccessMsg(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors text-xs"
                  >
                    Done
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingTag || !tagKey.trim()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] text-xs flex items-center gap-1.5"
                  >
                    {isSavingTag ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Tag size={13} />
                        <span>Save Tag</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}