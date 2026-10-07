import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../services/supabase';
import { ServiceApplication, ApplicationType, ApplicationStatus, Role } from '../../../types';
import { Database, RefreshCw, FileCheck } from 'lucide-react';

export function Applications() {
  const [liveApplications, setLiveApplications] = useState<ServiceApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch live applications from supabase.from('applications').select('*')
  const fetchLiveApplications = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Notice from Supabase applications table:', error);
        setLiveApplications([]);
      } else if (data) {
        const mapped: ServiceApplication[] = data.map((row: any) => ({
          id: row.unique_code || row.id,
          type: (row.type_id || row.type || row.form_data?.type || 'bonafide') as ApplicationType,
          title: row.title || row.form_data?.subject || row.form_data?.title || 'Academic Application',
          studentName: row.student_name || row.form_data?.student_name || 'Scholar Submitter',
          rollNo: row.roll_no || row.form_data?.roll_no || row.submitter_id?.slice(0, 8) || 'N/A',
          submittedAt: row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Recent',
          status: (row.status || 'pending_mentor') as ApplicationStatus,
          currentApproverRole: (row.current_approver_role || 'hod') as Role,
          details: row.form_data || (row.details || {}),
          timeline: row.timeline || [],
        }));
        setLiveApplications(mapped);
      }
    } catch (err) {
      console.error('Failed to query applications from Supabase:', err);
      setLiveApplications([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Live data fetching on mount + Real-time synchronization
  useEffect(() => {
    fetchLiveApplications();

    const channel = supabase
      .channel('public-applications-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications' },
        () => {
          fetchLiveApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLiveApplications]);

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
              Central Approval Desk
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE SUPABASE
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Multi-tier sanction queue: Mentors, HODs, Wardens & Accounts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchLiveApplications(true)}
            disabled={isRefreshing || isLoading}
            title="Refresh applications from database"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all shadow-sm disabled:opacity-50 text-xs font-mono"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? 'animate-spin text-indigo-400' : 'text-zinc-400'}
            />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-bold">
            {liveApplications.length} Submissions
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        /* Subtle Loading Skeleton State */
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`app-skeleton-${idx}`}
              className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 animate-pulse space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-3 w-28 bg-zinc-800 rounded" />
                  <div className="h-4 w-48 bg-zinc-800 rounded" />
                  <div className="h-3 w-36 bg-zinc-800/80 rounded" />
                </div>
                <div className="h-6 w-20 bg-zinc-800 rounded-full" />
              </div>
              <div className="h-10 w-full bg-zinc-950/60 rounded-lg" />
            </div>
          ))}
        </div>
      ) : liveApplications.length === 0 ? (
        /* Empty State: Matching User Management & Classroom Management */
        <div className="p-16 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4 font-mono">
          <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-indigo-400 shadow-inner">
            <Database size={22} />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white font-sans">
              No Pending Applications
            </h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Connected to Supabase <code className="text-indigo-400">public.applications</code>. All scholar sanction applications, leave requests, and clearance dossiers are up to date.
            </p>
          </div>
        </div>
      ) : (
        /* Live Records List */
        <div className="grid grid-cols-1 gap-3 font-mono text-xs">
          {liveApplications.map((app, idx) => (
            <div
              key={`app-${app.id || 'record'}-${idx}`}
              className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2.5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase block">
                    {app.id} • {app.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <h4 className="text-sm font-bold text-white font-sans mt-0.5">{app.title}</h4>
                  <span className="text-xs text-zinc-400">
                    Scholar: {app.studentName} ({app.rollNo})
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase ${
                    app.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {app.status.replace('_', ' ')}
                </span>
              </div>

              {Object.keys(app.details || {}).length > 0 && (
                <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80 text-[11px] grid grid-cols-2 gap-2">
                  {Object.entries(app.details).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-zinc-500">{k}:</span>{' '}
                      <span className="text-zinc-300 font-medium">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Applications;
