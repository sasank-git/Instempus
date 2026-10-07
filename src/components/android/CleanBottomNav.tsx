import { useAppStore } from '../../services/store';
import {
  Home,
  GraduationCap,
  MessageSquare,
  Layers,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export function CleanBottomNav() {
  const { activeTab, setActiveTab, currentUser, currentRole, threads } = useAppStore();

  const totalUnreadMessages = threads.reduce((acc, t) => acc + t.unreadCount, 0);

  return (
    <div className="bg-[#0a0a0a] border-t border-[#1a1a1a] px-3 py-2.5 z-30 select-none">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Home Icon */}
        <button
          onClick={() => setActiveTab('home')}
          className="p-1.5 transition-transform active:scale-90 focus:outline-none"
          aria-label="Home Feed"
        >
          <Home
            size={21}
            className={activeTab === 'home' ? 'text-white stroke-[2.4]' : 'text-slate-500 stroke-[1.8]'}
          />
        </button>

        {/* 2. Classroom Icon */}
        <button
          onClick={() => setActiveTab('classroom')}
          className="p-1.5 transition-transform active:scale-90 focus:outline-none"
          aria-label="Classroom"
        >
          <GraduationCap
            size={22}
            className={activeTab === 'classroom' ? 'text-indigo-400 stroke-[2.4]' : 'text-slate-500 stroke-[1.8]'}
          />
        </button>

        {/* 3. Messages Icon */}
        <button
          onClick={() => setActiveTab('messages')}
          className="p-1.5 relative transition-transform active:scale-90 focus:outline-none"
          aria-label="Messages"
        >
          <MessageSquare
            size={21}
            className={activeTab === 'messages' ? 'text-white stroke-[2.4]' : 'text-slate-500 stroke-[1.8]'}
          />
          {totalUnreadMessages > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-rose-500 shadow-sm" />
          )}
        </button>

        {/* 4. Services Icon */}
        <button
          onClick={() => setActiveTab('services')}
          className="p-1.5 transition-transform active:scale-90 focus:outline-none"
          aria-label="Campus Services"
        >
          {currentRole === 'security' ? (
            <ShieldCheck
              size={21}
              className={activeTab === 'services' ? 'text-emerald-400 stroke-[2.4]' : 'text-slate-500 stroke-[1.8]'}
            />
          ) : (
            <Layers
              size={21}
              className={activeTab === 'services' ? 'text-white stroke-[2.4]' : 'text-slate-500 stroke-[1.8]'}
            />
          )}
        </button>

        {/* 5. Report Issues & Hostel Operations Icon */}
        <button
          onClick={() => setActiveTab('issues')}
          className="p-1.5 transition-transform active:scale-90 focus:outline-none"
          aria-label="Report Issues & Facilities"
        >
          <AlertCircle
            size={21}
            className={activeTab === 'issues' ? 'text-white stroke-[2.4]' : 'text-slate-500 stroke-[1.8]'}
          />
        </button>

        {/* 6. Profile Icon (User Avatar) */}
        <button
          onClick={() => setActiveTab('profile')}
          className="p-1 transition-transform active:scale-90 focus:outline-none"
          aria-label="Profile"
        >
          <div
            className={`rounded-full p-[1px] transition-all ${
              activeTab === 'profile'
                ? 'ring-2 ring-white ring-offset-2 ring-offset-black'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="h-5.5 w-5.5 rounded-full object-cover"
            />
          </div>
        </button>
      </div>
    </div>
  );
}
