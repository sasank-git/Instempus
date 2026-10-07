import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../services/supabase';
import {
  Users,
  GraduationCap,
  ShieldCheck,
  Clock,
  RefreshCw,
  Terminal,
  Activity,
  Layers,
  Database,
} from 'lucide-react';

interface AuditLogRecord {
  id: string;
  action: string;
  table_name?: string;
  target_entity?: string;
  target_id?: string;
  details?: any;
  before_data?: any;
  after_data?: any;
  actor_id?: string;
  created_at: string;
}

/**
 * Parses a concise, informative snippet from the audit log details JSONB
 */
function parseAuditSnippet(log: AuditLogRecord): { entity: string; snippet: string } {
  const entity = log.table_name || log.target_entity || 'system';
  const table = entity.toLowerCase();
  const rawDetails = log.details || log.after_data || log.before_data || {};

  let details = rawDetails;
  if (typeof rawDetails === 'string') {
    try {
      details = JSON.parse(rawDetails);
    } catch {
      details = { value: rawDetails };
    }
  }

  let snippet = '';

  if (table.includes('profile')) {
    const name = details.full_name || details.name || details.username || details.email;
    const role = details.role ? `[${details.role.toUpperCase()}]` : '';
    snippet = name ? `${name} ${role}`.trim() : 'User identity profile';
  } else if (table.includes('section') || table.includes('slot')) {
    const code = details.subject_code || details.code;
    const name = details.subject_name || details.name;
    const sec = details.section ? `Sec ${details.section}` : '';
    const yr = details.year ? `Y${details.year}` : '';
    const parts = [code, name, yr, sec].filter(Boolean);
    snippet = parts.length > 0 ? parts.join(' • ') : 'Academic SectionSlot';
  } else if (table.includes('enrollment')) {
    if (details.student_id && details.slot_id) {
      snippet = `Student: ${String(details.student_id).slice(0, 8)}… → Slot: ${String(details.slot_id).slice(0, 8)}…`;
    } else {
      snippet = 'Student enrollment binding';
    }
  } else if (table.includes('application')) {
    const title = details.title || details.type || details.unique_code;
    const status = details.status ? `(${details.status})` : '';
    snippet = title ? `${title} ${status}`.trim() : 'Service approval dossier';
  } else {
    const candidate = details.full_name || details.name || details.title || details.subject_code || details.message;
    if (candidate) {
      snippet = String(candidate);
    } else {
      const keys = Object.keys(details);
      if (keys.length > 0) {
        snippet = keys.slice(0, 2).map((k) => `${k}: ${String(details[k])}`).join(', ');
      } else {
        snippet = `Row ID: ${String(log.target_id || log.id || '').slice(0, 8)}`;
      }
    }
  }

  return { entity, snippet };
}

export function Dashboard() {
  const [scholarsCount, setScholarsCount] = useState<number>(0);
  const [facultyCount, setFacultyCount] = useState<number>(0);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // 1. Fetch live metrics from supabase.from('profiles').select('role')
  const fetchDashboardStats = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const { data, error } = await supabase.from('profiles').select('role');
      if (error) {
        console.warn('Error fetching profiles role counts:', error);
      } else if (data) {
        const activeScholars = data.filter((p) => p.role === 'student').length;
        const activeFaculty = data.filter((p) => p.role === 'teacher').length;
        setScholarsCount(activeScholars);
        setFacultyCount(activeFaculty);
      }
    } catch (err) {
      console.error('Failed to query dashboard stats from Supabase:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // 2. Fetch latest 5 records from supabase.from('audit_logs')
  const fetchAuditLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.warn('Notice from audit_logs table:', error);
      } else if (data) {
        setAuditLogs(data);
      }
    } catch (err) {
      console.error('Failed to query audit_logs from Supabase:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  // Combined refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchDashboardStats(true), fetchAuditLogs()]);
    setIsRefreshing(false);
  };

  // Live profile metrics sync
  useEffect(() => {
    fetchDashboardStats();

    const profileChannel = supabase
      .channel('public-dashboard-profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchDashboardStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [fetchDashboardStats]);

  // Real-Time WebSocket listener for audit_logs table
  useEffect(() => {
    fetchAuditLogs();

    const auditChannel = supabase
      .channel('public-audit-logs-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'audit_logs' },
        () => {
          fetchAuditLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(auditChannel);
    };
  }, [fetchAuditLogs]);

  return (
    <div className="space-y-6">
      {/* Top Header & Sync Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold text-white font-sans">Institutional Overview</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE SUPABASE
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Academic Session 2026-27 • Central Management Node
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          title="Refresh stats and audit ledger from database"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all shadow-sm disabled:opacity-50 text-xs font-mono self-start md:self-auto"
        >
          <RefreshCw
            size={14}
            className={isRefreshing ? 'animate-spin text-indigo-400' : 'text-zinc-400'}
          />
          <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Live Stats Cards Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Registered Scholars */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase">Registered Scholars</span>
            <Users size={16} className="text-indigo-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-white">
            {isLoading ? (
              <span className="inline-block h-8 w-16 bg-zinc-800 rounded animate-pulse" />
            ) : (
              scholarsCount
            )}
          </div>
          <span className="text-[11px] text-emerald-400 font-mono block">
            ● Active scholar identities in directory
          </span>
        </div>

        {/* 2. Faculty Load */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase">Faculty Load</span>
            <GraduationCap size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-indigo-400">
            {isLoading ? (
              <span className="inline-block h-8 w-24 bg-zinc-800 rounded animate-pulse" />
            ) : (
              `${facultyCount} Professors`
            )}
          </div>
          <span className="text-[11px] text-zinc-400 font-mono block">
            Department of CSE & Allied Branches
          </span>
        </div>

        {/* 3. Gate Pass Activity */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase">Gate Pass Activity</span>
            <ShieldCheck size={16} className="text-amber-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400">
            0 Today
          </div>
          <span className="text-[11px] text-zinc-400 font-mono block">
            Main Gate 1 Optical Scanners
          </span>
        </div>
      </div>

      {/* Security & Administrative Audit Stream */}
      <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              Security & Administrative Audit Stream
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              TRIGGERS LIVE
            </span>
            <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
              Latest 5 Events
            </span>
          </div>
        </div>

        {isLoadingLogs ? (
          /* Subtle skeleton loader */
          <div className="space-y-2 font-mono">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={`audit-skel-${idx}`}
                className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-850 animate-pulse flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-4 w-14 bg-zinc-800 rounded" />
                  <div className="h-4 w-20 bg-zinc-800/80 rounded" />
                  <div className="h-4 w-40 bg-zinc-800/60 rounded" />
                </div>
                <div className="h-3 w-16 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        ) : auditLogs.length === 0 ? (
          /* Clean empty state if no trigger events have fired yet */
          <div className="p-10 text-center rounded-xl bg-zinc-950/40 border border-zinc-800/80 space-y-2 font-mono">
            <Clock size={20} className="text-zinc-600 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-300">No recent audit logs</h4>
            <p className="text-xs text-zinc-500 font-sans">
              Connected to PostgreSQL <code className="text-indigo-400">public.audit_logs</code>. System events logged by the database trigger will stream here in real-time.
            </p>
          </div>
        ) : (
          /* Live Mapped Audit Stream */
          <div className="space-y-2 font-mono text-xs">
            {auditLogs.map((log, idx) => {
              const { entity, snippet } = parseAuditSnippet(log);
              const op = (log.action || 'INSERT').toUpperCase();

              const actionColor =
                op === 'INSERT'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : op === 'UPDATE'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : op === 'DELETE'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700';

              const formattedTime = log.created_at
                ? new Date(log.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })
                : 'Just now';

              return (
                <div
                  key={`audit-${log.id || 'log'}-${idx}`}
                  className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-zinc-300 shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Action Pill (INSERT / UPDATE / DELETE) */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${actionColor}`}
                    >
                      {op}
                    </span>

                    {/* Table Name Chip (profiles, section_slots, etc.) */}
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 shrink-0">
                      {entity}
                    </span>

                    {/* Parsed Snippet from details JSONB */}
                    <div className="min-w-0 truncate">
                      <span className="text-xs text-zinc-200 font-medium truncate block">
                        {snippet}
                      </span>
                    </div>
                  </div>

                  {/* Timestamp & Real-Time Indicator */}
                  <div className="text-right shrink-0 flex items-center justify-between sm:justify-end gap-2 text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-400">
                      <Clock size={11} className="text-zinc-500" />
                      {formattedTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
