import { useState, useRef } from 'react';
import { useAppStore } from '../../services/store';
import {
  Search,
  CheckCircle2,
  Share2,
  Paperclip,
  Plus,
  ArrowRight,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';
import { CreateNoticeScene } from './CreateNoticeScene';
import { CanteenMenuCard } from '../canteen/CanteenMenuCard';

export function HomeFeedScreen() {
  const {
    notices,
    currentUser,
    currentRole,
    openStory,
    toggleNoticeGotIt,
    isCreateSceneOpen,
    setCreateSceneOpen,
    triggerEmergencyAlert,
    setActiveTab,
  } = useAppStore();

  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX.current;
    const diffY = touchEndY - touchStartY.current;

    // Only trigger if horizontal swipe is deliberate and significantly exceeds vertical scroll
    if (diffX < -70 && Math.abs(diffX) > Math.abs(diffY) * 1.8) {
      setCreateSceneOpen(true);
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (isCreateSceneOpen) {
    return <CreateNoticeScene />;
  }

  const urgentNotices = notices.filter((n) => n.isUrgent);
  const allTags = [
    'all',
    '#canteen',
    '#cse-dept',
    '#hostel-a',
    '#gate-pass',
    '#curfew',
    '#hackathon',
  ];

  const filteredNotices = notices.filter((n) => {
    const matchesTag =
      selectedTag === 'all' ||
      n.tags.includes(selectedTag) ||
      (selectedTag === '#canteen' && n.groupName.includes('Canteen'));

    const matchesQuery =
      searchQuery.trim() === '' ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.groupName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTag && matchesQuery;
  });

  const canTriggerAlarm = ['admin', 'security', 'warden', 'principal'].includes(currentRole);

  const handleEmergencyTrigger = () => {
    triggerEmergencyAlert(
      'fire',
      'Urgent Campus Evacuation Protocol Active',
      'Evacuate academic blocks immediately via emergency fire exits. Assemble at the Central Convocation Sports Field Ground.'
    );
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="space-y-3 pb-20 select-none text-white"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-[#141414]">
        <div>
          <span className="text-base font-bold tracking-tight text-white block">
            Instempus Campus
          </span>
          <span className="text-[10px] text-slate-400">
            {currentUser.name} • {currentUser.department}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Emergency Siren Alarm Trigger (Visible to Admin, Security, Warden) */}
          {canTriggerAlarm && (
            <button
              onClick={handleEmergencyTrigger}
              className="flex items-center gap-1 bg-red-950/60 hover:bg-red-900/80 text-red-300 px-2 py-1 rounded-md text-[10px] font-bold border border-red-800 transition-colors"
              title="Broadcast Emergency Siren to all phones"
            >
              <AlertTriangle size={12} className="text-red-400" />
              <span>SOS Siren</span>
            </button>
          )}

          {/* Quick Create Button */}
          <button
            onClick={() => setCreateSceneOpen(true)}
            className="flex items-center gap-1 bg-[#161616] hover:bg-[#222] text-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold border border-[#2b2b2b] transition-colors"
            title="Create Group Notice (or swipe left)"
          >
            <Plus size={13} />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Swipe left hint bar */}
      <div className="px-2 py-1.5 bg-[#0a0a0a] border-b border-[#141414] flex items-center justify-between text-[11px] text-slate-400">
        <span>Slide left to open notice creator</span>
        <button
          onClick={() => setCreateSceneOpen(true)}
          className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-0.5 text-[10px]"
        >
          <span>Open</span> <ArrowRight size={10} />
        </button>
      </div>

      {/* CLASSROOM LIVE ACTIVITY CARD */}
      <div className="px-2">
        <div
          onClick={() => setActiveTab('classroom')}
          className="p-3 bg-gradient-to-r from-[#111] via-[#141414] to-[#101018] border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl cursor-pointer transition-all shadow-sm flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <GraduationCap size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono uppercase text-indigo-400 font-bold">
                  Classroom Hub
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded font-bold">
                  ● Period 2 Active
                </span>
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                CS601: Distributed Systems & Cloud
              </h4>
              <p className="text-[10px] text-slate-400 font-mono">
                Hall 301 • Prof. Sneha Mohanty • Roll Call Ready
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <span>Enter</span>
            <ArrowRight size={11} />
          </div>
        </div>
      </div>

      {/* CANTEEN DAILY MENU HIGHLIGHT CARD */}
      <div className="px-2">
        <CanteenMenuCard />
      </div>

      {/* Stories / Urgent Priority Broadcasts */}
      {urgentNotices.length > 0 && (
        <div className="px-2 py-2 border-b border-[#141414] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Priority Campus Notices
            </span>
            <span className="text-[9px] font-mono text-slate-500">OFFICIAL DESK</span>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
            {urgentNotices.map((notice, idx) => (
              <button
                key={notice.id}
                onClick={() => openStory(idx)}
                className="flex flex-col items-center gap-1 flex-shrink-0 focus:outline-none"
              >
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500">
                  <div className="p-0.5 rounded-full bg-black">
                    <img
                      src={notice.authorAvatar}
                      alt={notice.authorName}
                      className="h-13 w-13 rounded-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-[10px] text-slate-300 max-w-[64px] truncate text-center">
                  {notice.authorName.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="px-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search group notices, circulars, or instructors..."
            className="w-full bg-[#111111] border-b border-[#222222] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tag filter strip */}
      <div className="flex items-center gap-1.5 px-2 overflow-x-auto no-scrollbar py-1">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-md transition-colors ${
              selectedTag === tag
                ? 'bg-white text-black font-semibold'
                : 'bg-[#121212] text-slate-400 hover:text-white'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Notices Feed List */}
      <div className="divide-y divide-[#141414]">
        {filteredNotices.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No notices found for this filter.
          </div>
        ) : (
          filteredNotices.map((post) => (
            <article key={post.id} className="py-3 space-y-2">
              {/* Group Source Tag & Author Bar */}
              <div className="px-2 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    Group: {post.groupName}
                  </span>
                  <span className="text-slate-500 font-mono">{post.timestamp}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{post.authorName}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-sm bg-[#1e1e1e] text-slate-300 font-mono">
                          {post.authorRole}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">{post.authorTitle}</p>
                    </div>
                  </div>

                  {post.isUrgent && (
                    <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-sm">
                      URGENT
                    </span>
                  )}
                </div>
              </div>

              {/* Notice Title & Text */}
              <div className="px-2 space-y-1">
                <h3 className="text-sm font-bold text-white leading-snug">{post.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* Image or Video Player Embed */}
              {post.mediaType === 'video' && post.mediaUrl ? (
                <div className="w-full bg-black overflow-hidden aspect-video">
                  <video
                    src={post.mediaUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : post.imageUrl ? (
                <div className="w-full bg-[#0a0a0a] overflow-hidden aspect-[16/9]">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null}

              {/* Attachments if any */}
              {post.attachments && post.attachments.length > 0 && (
                <div className="px-2 space-y-1">
                  {post.attachments.map((att, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-[#121212] px-3 py-1.5 text-xs border border-[#222]"
                    >
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <Paperclip size={13} className="text-indigo-400" />
                        <span className="font-mono text-[11px]">{att.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{att.size}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1 px-2 pt-0.5">
                {post.tags.map((tg) => (
                  <span key={tg} className="text-[11px] text-indigo-400 font-medium">
                    {tg}
                  </span>
                ))}
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between px-2 pt-1 border-t border-[#121212]">
                <button
                  onClick={() => toggleNoticeGotIt(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    post.userGotIt
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#161616] text-slate-300 hover:text-white'
                  }`}
                >
                  <CheckCircle2 size={14} />
                  <span>
                    {post.userGotIt ? 'Acknowledged' : 'Acknowledge'} ({post.gotItCount})
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: post.title, text: post.content });
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <Share2 size={15} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
