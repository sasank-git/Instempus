import React, { useState } from 'react';
import { useAppStore } from '../../services/store';
import {
  X,
  Megaphone,
  BarChart3,
  Bell,
  Ticket,
  Sparkles,
  ArrowRight,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { RaiseIssueForm } from '../../features/create/components/RaiseIssueForm';

interface UniversalCreateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGatePass: () => void;
  onOpenHostelReport: () => void;
}

export function UniversalCreateSheet({
  isOpen,
  onClose,
  onOpenGatePass,
  onOpenHostelReport,
}: UniversalCreateSheetProps) {
  const { currentUser, currentRole, createFeedItem } = useAppStore();
  const role = currentUser.role || currentRole || 'student';

  // Strict RBAC: If student, strictly HIDE 'Create Poll' and 'Broadcast Notice'
  // These should ONLY render for teacher, admin, warden, canteen, or hod.
  const canBroadcastOrPoll = ['teacher', 'admin', 'warden', 'canteen', 'hod'].includes(role);

  // Sub-modal states
  const [isRaiseIssueOpen, setIsRaiseIssueOpen] = useState(false);
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);
  const [isBroadcastNoticeOpen, setIsBroadcastNoticeOpen] = useState(false);

  // Success toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Poll placeholder state
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollSubmitted, setPollSubmitted] = useState(false);

  // Broadcast notice placeholder state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeSubmitted, setNoticeSubmitted] = useState(false);

  // Handle Poll Submission
  const handlePollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = pollOptions.filter((o) => o.trim().length > 0);
    createFeedItem({
      id: `feed_poll_${Date.now()}`,
      type: 'poll',
      authorName: currentUser.name,
      authorRole: currentUser.role === 'teacher' ? 'Faculty' : 'Administrative Board',
      authorAvatar: currentUser.avatarUrl,
      question: pollQuestion || 'Quick Campus Opinion Poll',
      options: (validOptions.length >= 2 ? validOptions : ['Yes, Agree', 'No, Disagree']).map(
        (text, idx) => ({
          id: `opt_${idx + 1}`,
          text,
          votedBy: [],
        })
      ),
      timestamp: 'Just now',
      expiresAt: 'Closes in 24 hours',
      targetAudience: 'All University Students',
    });
    setPollSubmitted(true);
    showToast('✓ Campus poll launched to live feed.');
    setTimeout(() => {
      setPollSubmitted(false);
      setIsCreatePollOpen(false);
      setPollQuestion('');
      setPollOptions(['', '']);
    }, 1200);
  };

  // Handle Broadcast Notice Submission
  const handleNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFeedItem({
      id: `feed_notif_${Date.now()}`,
      type: 'notice',
      authorName: currentUser.name,
      authorRole: currentUser.role === 'teacher' ? 'Faculty Mentor' : 'Administrative Desk',
      authorAvatar: currentUser.avatarUrl,
      authorTitle: `${currentUser.department || 'BPUT'} - ${currentUser.role.toUpperCase()}`,
      title: noticeTitle || 'Official Institutional Broadcast',
      content: noticeContent || 'Official university circular for all enrolled scholars.',
      groupName: 'General Institutional Circular',
      targetGroup: 'General Institutional Circular',
      targetAudience: 'All Registered Scholars',
      tags: ['#broadcast', '#official'],
      timestamp: 'Just now',
      gotItCount: 1,
      userGotIt: true,
      commentsCount: 0,
      acknowledgedBy: [currentUser.id || 'usr_student_01'],
    });
    setNoticeSubmitted(true);
    showToast('✓ Institutional notice broadcasted to campus feed.');
    setTimeout(() => {
      setNoticeSubmitted(false);
      setIsBroadcastNoticeOpen(false);
      setNoticeTitle('');
      setNoticeContent('');
    }, 1200);
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 inset-x-4 z-50 flex items-center gap-2.5 p-3.5 rounded-2xl bg-zinc-900/95 text-white border border-emerald-500/50 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top duration-300">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-mono font-medium flex-1 text-emerald-100">
            {toastMessage}
          </span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. MAIN ACTION SHEET (Triggered by central '+' FAB)            */}
      {/* ------------------------------------------------------------- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end justify-center select-none animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-950 border-t border-zinc-800 rounded-t-3xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-250">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  Universal Create
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  {canBroadcastOrPoll
                    ? 'Faculty & Administrative Publishing Node'
                    : 'Scholar Campus Actions'}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Actions List with Strict RBAC (Task 1) */}
            <div className="space-y-2.5 font-sans">
              {/* Option 1: Raise Public Issue (Visible to ALL, including Students) */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setIsRaiseIssueOpen(true);
                }}
                className="w-full p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/80 flex items-center gap-3.5 transition-all text-left active:scale-[0.99] group"
              >
                <div className="h-11 w-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Megaphone size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Raise Public Issue</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Post community grievances (Wi-Fi, water, labs) with peer upvotes
                  </p>
                </div>
              </button>

              {/* Option 2: Create Poll (STRICT RBAC: Hidden for students!) */}
              {canBroadcastOrPoll && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setIsCreatePollOpen(true);
                  }}
                  className="w-full p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/80 flex items-center gap-3.5 transition-all text-left active:scale-[0.99] group"
                >
                  <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                    <BarChart3 size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Create Poll</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Gather live student votes for mess menus, events or schedules
                    </p>
                  </div>
                </button>
              )}

              {/* Option 3: Broadcast Notice (STRICT RBAC: Hidden for students!) */}
              {canBroadcastOrPoll && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setIsBroadcastNoticeOpen(true);
                  }}
                  className="w-full p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/80 flex items-center gap-3.5 transition-all text-left active:scale-[0.99] group"
                >
                  <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Bell size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Broadcast Notice</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Official announcements with tracked scholar read-receipts
                    </p>
                  </div>
                </button>
              )}

              {/* Option 4: Apply for Gate Pass (Visible to Students) */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGatePass();
                }}
                className="w-full p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/80 flex items-center gap-3.5 transition-all text-left active:scale-[0.99] group"
              >
                <div className="h-11 w-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Ticket size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Apply for Gate Pass</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Smart outing request with warden approval workflow
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. RAISE ISSUE SMART FORM (Task 3: Photo Attachment & Icons)  */}
      {/* ------------------------------------------------------------- */}
      <RaiseIssueForm
        isOpen={isRaiseIssueOpen}
        onClose={() => setIsRaiseIssueOpen(false)}
        onSuccessToast={showToast}
      />

      {/* ------------------------------------------------------------- */}
      {/* 3. CREATE POLL MODAL (Faculty / Admin / Warden / Canteen)     */}
      {/* ------------------------------------------------------------- */}
      {isCreatePollOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none font-sans animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-t-[32px] sm:rounded-3xl p-6 space-y-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create Campus Poll</h3>
                  <span className="text-xs text-zinc-400 font-mono">Faculty & Admin Portal</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatePollOpen(false)}
                className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {pollSubmitted ? (
              <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
                <CheckCircle2 size={42} className="text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">Poll Published to Feed!</h4>
                <p className="text-xs text-zinc-400 font-mono">Live results will display as scholars vote.</p>
              </div>
            ) : (
              <form onSubmit={handlePollSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Poll Question *</label>
                  <input
                    type="text"
                    required
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="e.g. Which extra session slot works best?"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Options (min 2) *</label>
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const updated = [...pollOptions];
                          updated[i] = e.target.value;
                          setPollOptions(updated);
                        }}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}
                          className="h-8 w-8 rounded-lg bg-zinc-900 text-zinc-500 hover:text-rose-400 flex items-center justify-center"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}

                  {pollOptions.length < 4 && (
                    <button
                      type="button"
                      onClick={() => setPollOptions([...pollOptions, ''])}
                      className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 hover:underline pt-1"
                    >
                      <Plus size={12} />
                      <span>Add Option</span>
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>Launch Live Poll</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. BROADCAST NOTICE MODAL (Faculty / Admin / Warden / HOD)   */}
      {/* ------------------------------------------------------------- */}
      {isBroadcastNoticeOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none font-sans animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-t-[32px] sm:rounded-3xl p-6 space-y-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Broadcast Notice</h3>
                  <span className="text-xs text-zinc-400 font-mono">Official Campus Circular</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBroadcastNoticeOpen(false)}
                className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {noticeSubmitted ? (
              <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
                <CheckCircle2 size={42} className="text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">Notice Dispatched!</h4>
                <p className="text-xs text-zinc-400 font-mono">Read acknowledgments will be tracked live.</p>
              </div>
            ) : (
              <form onSubmit={handleNoticeSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Notice Title *</label>
                  <input
                    type="text"
                    required
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="e.g. End Semester Exam Hall Ticket Dispatch"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Message Content *</label>
                  <textarea
                    required
                    rows={3}
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    placeholder="Official communication body for the campus feed..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>Publish Broadcast</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
