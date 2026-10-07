import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../services/supabase';
import { useAppStore } from '../../../services/store';
import { SupabaseEvent, EventWorkflowStep, WorkflowStepType } from '../../../types';
import {
  Calendar,
  Plus,
  RefreshCw,
  Image as ImageIcon,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  UploadCloud,
  Layers,
  Sparkles,
  Tag,
  Trash2,
  ListPlus,
  FileText,
  CheckSquare,
} from 'lucide-react';

interface LocalWorkflowStep extends EventWorkflowStep {
  rawOptions?: string;
}

export function EventManagement() {
  const { currentUser } = useAppStore();

  // -------------------------------------------------------------
  // LIVE EVENTS STATE & FETCHING
  // -------------------------------------------------------------
  const [events, setEvents] = useState<SupabaseEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // -------------------------------------------------------------
  // CREATE EVENT FORM LOCAL STATE (Phase 3, 4 & 5)
  // -------------------------------------------------------------
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [capacity, setCapacity] = useState<string>('');
  const [registrationDeadline, setRegistrationDeadline] = useState<string>('');
  const [bannerUrl, setBannerUrl] = useState<string>('');
  const [bannerFileName, setBannerFileName] = useState<string>('');
  const [isUploadingBanner, setIsUploadingBanner] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Phase 4: Target Audience Filtering state variables
  const [targetDept, setTargetDept] = useState<string>('all');
  const [targetRole, setTargetRole] = useState<string>('all');
  const [targetSemester, setTargetSemester] = useState<string>('all');
  const [targetHostel, setTargetHostel] = useState<string>('all');

  // Phase 5: Dynamic Registration Form Workflow Schema state
  const [workflowSchema, setWorkflowSchema] = useState<LocalWorkflowStep[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Toast message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch live events from Supabase
  const fetchEvents = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);
    setFetchError(null);

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching events from Supabase:', error);
        setFetchError(error.message);
      } else if (data) {
        setEvents(data as SupabaseEvent[]);
        if (isManual) {
          showToast(`✓ Database synchronized: ${data.length} events loaded.`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to query events table';
      console.error('Exception querying events from Supabase:', err);
      setFetchError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Mount + Realtime WebSocket listener
  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel('public-events-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEvents]);

  // -------------------------------------------------------------
  // PHASE 5: DYNAMIC WORKFLOW BUILDER HELPERS
  // -------------------------------------------------------------
  const handleAddWorkflowStep = () => {
    const newStep: LocalWorkflowStep = {
      step_id: `step_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'text',
      label: '',
      required: false,
      options: [],
      rawOptions: '',
    };
    setWorkflowSchema((prev) => [...prev, newStep]);
  };

  const handleUpdateStepField = (
    index: number,
    field: keyof LocalWorkflowStep,
    value: any
  ) => {
    setWorkflowSchema((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleUpdateStepOptions = (index: number, rawInput: string) => {
    const parsedOptions = rawInput
      .split(',')
      .map((opt) => opt.trim())
      .filter(Boolean);

    setWorkflowSchema((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        rawOptions: rawInput,
        options: parsedOptions,
      };
      return updated;
    });
  };

  const handleRemoveWorkflowStep = (index: number) => {
    setWorkflowSchema((prev) => prev.filter((_, i) => i !== index));
  };

  // -------------------------------------------------------------
  // BANNER UPLOAD HANDLER (Supabase Storage: instempus-media)
  // -------------------------------------------------------------
  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    setBannerFileName(file.name);

    const userId = currentUser?.id || 'admin';
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${userId}/events/${Date.now()}_${sanitizedName}`;

    try {
      // 1. Upload to Supabase Storage bucket instempus-media
      const { error: uploadError } = await supabase.storage
        .from('instempus-media')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.warn('Storage upload note:', uploadError.message);
        // Fallback preview URL in case storage bucket permissions are configured for specific roles
        const previewUrl = URL.createObjectURL(file);
        setBannerUrl(previewUrl);
        showToast(`Banner selected: ${file.name}`);
      } else {
        // 2. Retrieve the public URL
        const { data: urlData } = supabase.storage
          .from('instempus-media')
          .getPublicUrl(storagePath);

        const retrievedUrl = urlData?.publicUrl || '';
        setBannerUrl(retrievedUrl);
        showToast('✓ Banner uploaded to instempus-media storage.');
      }
    } catch (err) {
      console.error('Exception during banner upload:', err);
      setBannerUrl(URL.createObjectURL(file));
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // -------------------------------------------------------------
  // CREATE EVENT FORM SUBMISSION (Phase 4 & Phase 5 JSONB)
  // -------------------------------------------------------------
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please provide an event title.');
      return;
    }

    setIsSubmitting(true);

    // Dynamically construct targetTagsPayload (Phase 4)
    const targetTagsPayload: Record<string, any> = {};
    if (targetDept !== 'all') {
      targetTagsPayload.target_department = targetDept;
    }
    if (targetRole !== 'all') {
      targetTagsPayload.target_role = targetRole;
    }
    if (targetSemester !== 'all') {
      targetTagsPayload.target_semester = targetSemester;
    }
    if (targetHostel !== 'all') {
      targetTagsPayload.target_hostel = targetHostel;
    }

    // Dynamically compile workflowSchema payload (Phase 5)
    const compiledWorkflowSchema: EventWorkflowStep[] = workflowSchema.map((step, idx) => ({
      step_id: step.step_id || `step_${idx + 1}_${Date.now()}`,
      type: step.type,
      label: step.label.trim() || `Field ${idx + 1}`,
      required: Boolean(step.required),
      ...(step.type === 'select' ? { options: (step.options || []).filter(Boolean) } : {}),
    }));

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      capacity: capacity.trim() ? parseInt(capacity, 10) : null,
      registration_deadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : null,
      banner_url: bannerUrl.trim() || null,
      target_tags: targetTagsPayload, // Phase 4 dynamic payload
      workflow_schema: compiledWorkflowSchema, // Phase 5 dynamic payload
      is_active: true,
    };

    try {
      const { data, error } = await supabase
        .from('events')
        .insert(payload)
        .select();

      if (error) {
        console.warn('Error inserting into events table:', error);
        showToast(`Notice: ${error.message}`);
      } else {
        showToast(`✓ Event created: "${payload.title}" with ${compiledWorkflowSchema.length} custom fields.`);
        // Reset form state & controls
        setTitle('');
        setDescription('');
        setCapacity('');
        setRegistrationDeadline('');
        setBannerUrl('');
        setBannerFileName('');
        setTargetDept('all');
        setTargetRole('all');
        setTargetSemester('all');
        setTargetHostel('all');
        setWorkflowSchema([]);
        setIsCreateModalOpen(false);
        // Refresh live list
        fetchEvents();
      }
    } catch (err) {
      console.error('Exception creating event in Supabase:', err);
      showToast('Exception occurred while saving event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl font-mono text-xs flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Command Center Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
              Event Management Command Center
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE SUPABASE
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Dynamic Workflow Builder • Audience Targeting Rules • Media Pipelines
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchEvents(true)}
            disabled={isRefreshing || isLoading}
            title="Refresh events from database"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all shadow-sm disabled:opacity-50 text-xs font-mono"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? 'animate-spin text-indigo-400' : 'text-zinc-400'}
            />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs font-mono shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01]"
          >
            <Plus size={15} />
            <span>Create New Event</span>
          </button>
        </div>
      </div>

      {/* Error alert if Supabase query fails */}
      {fetchError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-mono flex items-center gap-3">
          <AlertCircle size={16} className="text-rose-400 shrink-0" />
          <span>Error loading events table: {fetchError}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LIVE EVENTS LISTING                                            */}
      {/* ------------------------------------------------------------- */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`event-skel-${i}`}
              className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 animate-pulse space-y-4"
            >
              <div className="h-36 bg-zinc-800/60 rounded-xl" />
              <div className="h-4 bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-zinc-800/70 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4 font-mono">
          <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-indigo-400 shadow-inner">
            <Calendar size={22} />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white font-sans">
              No Events Scheduled
            </h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Connected to Supabase <code className="text-indigo-400">public.events</code>. Use the command button above to create and publish your first institutional event with dynamic registration forms.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs font-mono shadow-md shadow-indigo-600/20"
          >
            <Plus size={14} />
            <span>Launch First Event</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev, idx) => (
            <div
              key={`event-${ev.id || 'event'}-${idx}`}
              className="rounded-2xl bg-zinc-900/70 border border-zinc-800/90 overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all shadow-md group"
            >
              {/* Event Banner */}
              <div className="h-36 bg-zinc-950 relative overflow-hidden flex items-center justify-center border-b border-zinc-800/80">
                {ev.banner_url ? (
                  <img
                    src={ev.banner_url}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-center p-4 space-y-1 text-zinc-600 font-mono text-xs">
                    <ImageIcon size={24} className="mx-auto text-zinc-700" />
                    <span>No Banner Image</span>
                  </div>
                )}

                {/* Status indicator */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      ev.is_active
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                        : 'bg-zinc-900 text-zinc-500 border-zinc-700'
                    }`}
                  >
                    {ev.is_active ? 'Active' : 'Closed'}
                  </span>
                </div>
              </div>

              {/* Event Content Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-white font-sans line-clamp-1">
                    {ev.title}
                  </h4>
                  {ev.description && (
                    <p className="text-xs text-zinc-400 font-sans line-clamp-2 leading-relaxed">
                      {ev.description}
                    </p>
                  )}
                </div>

                {/* Target Audience Badges (Phase 4 Feature) */}
                <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-mono">
                    <Tag size={11} className="text-indigo-400 shrink-0" />
                    <span className="uppercase font-semibold tracking-wider">Target Audience:</span>
                  </div>

                  {ev.target_tags && Object.keys(ev.target_tags).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {ev.target_tags.target_department && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-indigo-950/70 text-indigo-300 border border-indigo-500/30">
                          Dept: {ev.target_tags.target_department}
                        </span>
                      )}
                      {ev.target_tags.target_role && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 capitalize">
                          Role: {ev.target_tags.target_role}
                        </span>
                      )}
                      {ev.target_tags.target_semester && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-950/70 text-amber-300 border border-amber-500/30">
                          Sem {ev.target_tags.target_semester}
                        </span>
                      )}
                      {ev.target_tags.target_hostel && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-purple-950/70 text-purple-300 border border-purple-500/30">
                          {ev.target_tags.target_hostel}
                        </span>
                      )}
                      {/* Arbitrary remaining tag keys if present */}
                      {Object.entries(ev.target_tags)
                        .filter(([k]) => !['target_department', 'target_role', 'target_semester', 'target_hostel'].includes(k))
                        .map(([k, v]) => (
                          <span
                            key={k}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700"
                          >
                            {k}: {String(v)}
                          </span>
                        ))}
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 border border-zinc-700/60 inline-flex items-center gap-1">
                      ● Open to All Scholars & Faculty
                    </span>
                  )}
                </div>

                {/* Technical Metadata Strip */}
                <div className="pt-2.5 border-t border-zinc-800/80 space-y-2 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5 text-zinc-300">
                      <Users size={12} className="text-indigo-400" />
                      <span>Capacity:</span>
                    </span>
                    <span className="font-semibold text-white">
                      {ev.capacity ? `${ev.capacity} Seats` : 'Unlimited'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5 text-zinc-300">
                      <Clock size={12} className="text-amber-400" />
                      <span>Deadline:</span>
                    </span>
                    <span className="truncate max-w-[150px]">
                      {ev.registration_deadline
                        ? new Date(ev.registration_deadline).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Open'}
                    </span>
                  </div>

                  {/* Workflow Schema Indicator (Phase 5 Feature) */}
                  <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                    <span className="flex items-center gap-1">
                      <Layers size={11} className="text-zinc-600" />
                      <span>Workflow Schema:</span>
                    </span>
                    <span className="text-indigo-400 font-semibold font-mono">
                      {Array.isArray(ev.workflow_schema) && ev.workflow_schema.length > 0
                        ? `${ev.workflow_schema.length} custom field${ev.workflow_schema.length > 1 ? 's' : ''}`
                        : 'Standard RSVP (0 fields)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-2.5 bg-zinc-950/70 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[10px] text-zinc-500">
                <span className="truncate">ID: {ev.id.slice(0, 8)}…</span>
                <span>
                  {ev.created_at ? new Date(ev.created_at).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREATE NEW EVENT (Phase 3, 4 & 5 Builders)             */}
      {/* ------------------------------------------------------------- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-400" />
                  <span>Create New Event</span>
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Phase 5: Dynamic Registration Form Workflow Creator
                </p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateEvent} className="space-y-4 font-mono text-xs max-h-[75vh] overflow-y-auto pr-1">
              {/* Event Title */}
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. National Hackathon 2026: CodeOdisha"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              {/* Event Description */}
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed guidelines, tracks, eligibility criteria, and rewards..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-sans text-xs"
                />
              </div>

              {/* Grid: Capacity & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Capacity */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                    Participant Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g. 150 (Leave blank for unlimited)"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Registration Deadline */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                    Registration Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* TARGET AUDIENCE FILTERING (Phase 4: 2x2 Grid)                  */}
              {/* ------------------------------------------------------------- */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <label className="text-[10px] uppercase font-bold text-zinc-300 flex items-center gap-1.5">
                    <Tag size={13} className="text-indigo-400" />
                    <span>Target Audience Filtering</span>
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Dynamic target_tags JSONB
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Department */}
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 font-semibold">
                      Department
                    </label>
                    <select
                      value={targetDept}
                      onChange={(e) => setTargetDept(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                    >
                      <option value="all">All Departments</option>
                      <option value="CSE">CSE</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Civil">Civil</option>
                    </select>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 font-semibold">
                      Role
                    </label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                    >
                      <option value="all">All Roles</option>
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </div>

                  {/* Semester */}
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 font-semibold">
                      Semester
                    </label>
                    <select
                      value={targetSemester}
                      onChange={(e) => setTargetSemester(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                    >
                      <option value="all">All Semesters</option>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                      <option value="3">Semester 3</option>
                      <option value="4">Semester 4</option>
                      <option value="5">Semester 5</option>
                      <option value="6">Semester 6</option>
                      <option value="7">Semester 7</option>
                      <option value="8">Semester 8</option>
                    </select>
                  </div>

                  {/* Hostel Block */}
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 font-semibold">
                      Hostel Block
                    </label>
                    <select
                      value={targetHostel}
                      onChange={(e) => setTargetHostel(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                    >
                      <option value="all">All Hostels</option>
                      <option value="Hostel Block A">Hostel Block A</option>
                      <option value="Hostel Block B">Hostel Block B</option>
                      <option value="Girls Hostel">Girls Hostel</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* DYNAMIC REGISTRATION FORM (Phase 5 Workflow Creator)         */}
              {/* ------------------------------------------------------------- */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <ListPlus size={15} className="text-emerald-400" />
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-300 block">
                        Dynamic Registration Form
                      </label>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Schema compiled into workflow_schema JSONB ({workflowSchema.length} field{workflowSchema.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddWorkflowStep}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                  >
                    <Plus size={13} />
                    <span>Add Field</span>
                  </button>
                </div>

                {workflowSchema.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-zinc-950/40 border border-dashed border-zinc-850 space-y-1.5">
                    <FileText size={20} className="text-zinc-600 mx-auto" />
                    <p className="text-xs text-zinc-400 font-sans">
                      No custom fields added yet.
                    </p>
                    <p className="text-[10px] text-zinc-600 font-mono">
                      Participants will submit a default 1-click RSVP. Click <strong className="text-emerald-400">"Add Field"</strong> to collect custom answers, team names, or uploads.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-1">
                    {workflowSchema.map((step, idx) => (
                      <div
                        key={step.step_id || idx}
                        className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800/90 space-y-2.5 shadow-sm"
                      >
                        {/* Step Top Bar: Index & Controls */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-indigo-300 border border-zinc-700">
                            Field #{idx + 1}
                          </span>

                          <div className="flex items-center gap-3">
                            {/* Required Checkbox */}
                            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-zinc-300 font-mono select-none">
                              <input
                                type="checkbox"
                                checked={step.required}
                                onChange={(e) =>
                                  handleUpdateStepField(idx, 'required', e.target.checked)
                                }
                                className="accent-indigo-600 rounded cursor-pointer h-3.5 w-3.5"
                              />
                              <span>Required</span>
                            </label>

                            {/* Delete Step Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveWorkflowStep(idx)}
                              title="Delete Field"
                              className="text-zinc-500 hover:text-rose-400 p-1 rounded-md hover:bg-zinc-800 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Step Row: Type & Label */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {/* Input Type */}
                          <div>
                            <label className="text-[10px] text-zinc-400 block mb-1">
                              Input Type
                            </label>
                            <select
                              value={step.type}
                              onChange={(e) =>
                                handleUpdateStepField(idx, 'type', e.target.value as WorkflowStepType)
                              }
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                            >
                              <option value="text">text (Short Text)</option>
                              <option value="textarea">textarea (Long Description)</option>
                              <option value="select">select (Dropdown Menu)</option>
                              <option value="checkbox">checkbox (Confirmation Toggle)</option>
                              <option value="file_upload">file_upload (Document / Receipt)</option>
                            </select>
                          </div>

                          {/* Field Label */}
                          <div className="sm:col-span-2">
                            <label className="text-[10px] text-zinc-400 block mb-1">
                              Question / Prompt Label *
                            </label>
                            <input
                              type="text"
                              required
                              value={step.label}
                              onChange={(e) =>
                                handleUpdateStepField(idx, 'label', e.target.value)
                              }
                              placeholder="e.g. Team Name, GitHub URL, or Emergency Contact"
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500 font-sans text-xs"
                            />
                          </div>
                        </div>

                        {/* Dropdown Options (Visible only when type === 'select') */}
                        {step.type === 'select' && (
                          <div className="pt-2 border-t border-zinc-850 space-y-1.5">
                            <label className="text-[10px] text-indigo-300 block font-semibold">
                              Dropdown Options (comma-separated) *
                            </label>
                            <input
                              type="text"
                              value={
                                step.rawOptions !== undefined
                                  ? step.rawOptions
                                  : (step.options || []).join(', ')
                              }
                              onChange={(e) => handleUpdateStepOptions(idx, e.target.value)}
                              placeholder="e.g. Track 1: AI & ML, Track 2: Web3 & Security, Track 3: Open Innovation"
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                            />

                            {/* Option preview chips */}
                            {Array.isArray(step.options) && step.options.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {step.options.map((opt, optIdx) => (
                                  <span
                                    key={optIdx}
                                    className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700"
                                  >
                                    {opt}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Banner Upload File Picker */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-zinc-400 block">
                  Event Banner Image (Supabase: instempus-media)
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleBannerFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-zinc-700 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center"
                >
                  <UploadCloud
                    size={24}
                    className={isUploadingBanner ? 'animate-bounce text-indigo-400' : 'text-zinc-500'}
                  />
                  <div className="text-[11px] text-zinc-400">
                    {isUploadingBanner ? (
                      <span className="text-indigo-400 font-semibold animate-pulse">
                        Uploading to instempus-media…
                      </span>
                    ) : bannerFileName ? (
                      <span className="text-emerald-400 font-medium">Selected: {bannerFileName}</span>
                    ) : (
                      <span>
                        Click to select banner (<strong className="text-white">PNG, JPG, WebP</strong>)
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-600">
                    Storage path: {currentUser?.id || 'admin'}/events/[timestamp]_[filename]
                  </span>
                </div>

                {/* Banner Preview if URL is set */}
                {bannerUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-zinc-800 h-28 bg-zinc-950">
                    <img
                      src={bannerUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setBannerUrl('');
                        setBannerFileName('');
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-zinc-900/90 text-zinc-400 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="py-2 px-3.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingBanner}
                  className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
                >
                  {isSubmitting && <RefreshCw size={13} className="animate-spin" />}
                  <span>{isSubmitting ? 'Creating Event...' : 'Create Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventManagement;
