import { useState } from 'react';
import { useAppStore } from '../../services/store';
import {
  MessageSquare,
  Send,
  ArrowLeft,
  CheckCheck,
  Search,
} from 'lucide-react';

export function MessagingScreen() {
  const {
    threads,
    messages,
    selectedThreadId,
    selectThread,
    sendMessage,
    currentUser,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'all' | 'channels' | 'dms'>('all');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeThread = threads.find((th) => th.id === selectedThreadId);
  const currentMessages = selectedThreadId ? messages[selectedThreadId] || [] : [];

  const filteredThreads = threads.filter((th) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'channels' && th.type === 'channel') ||
      (activeTab === 'dms' && th.type === 'dm');
    const matchesSearch =
      searchQuery.trim() === '' ||
      th.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      th.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedThreadId) return;

    sendMessage(selectedThreadId, inputText.trim());
    setInputText('');
  };

  // If a thread is selected, render conversation view
  if (activeThread) {
    return (
      <div className="flex flex-col h-[calc(100vh-140px)] max-h-[640px] pb-2 select-none text-white">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-2.5 bg-[#0d0d0d] border-b border-[#1c1c1c]">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => selectThread(null)}
              className="p-1 text-slate-300 hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="relative">
              <img
                src={activeThread.avatar}
                alt={activeThread.name}
                className="h-8 w-8 rounded-full object-cover"
              />
              {activeThread.isOnline && (
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border border-black" />
              )}
            </div>
            <div>
              <h3 className="text-xs font-bold text-white truncate max-w-[190px]">
                {activeThread.name}
              </h3>
              <p className="text-[10px] text-slate-400">
                {activeThread.isOnline ? 'Online now' : activeThread.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2.5">
          <div className="text-center py-1">
            <span className="text-[9px] font-mono text-slate-500 bg-[#111] px-2 py-0.5 border border-[#1a1a1a]">
              ENCRYPTED INSTITUTIONAL DIRECT NETWORK
            </span>
          </div>

          {currentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-1.5 ${msg.isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!msg.isMe && (
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="h-6 w-6 rounded-full object-cover mb-0.5"
                />
              )}

              <div
                className={`max-w-[78%] px-3 py-2 text-xs leading-relaxed ${
                  msg.isMe
                    ? 'bg-indigo-600 text-white rounded-md'
                    : 'bg-[#181818] text-slate-200 border-b border-[#252525] rounded-md'
                }`}
              >
                {!msg.isMe && (
                  <span className="block text-[9px] font-bold text-indigo-300 mb-0.5">
                    {msg.senderName}
                  </span>
                )}
                <p>{msg.text}</p>
                <div
                  className={`flex items-center justify-end gap-1 mt-1 text-[9px] font-mono ${
                    msg.isMe ? 'text-indigo-200' : 'text-slate-500'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.isMe && <CheckCheck size={11} className="text-indigo-200" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-2 border-t border-[#1a1a1a] flex items-center gap-1.5 bg-[#0a0a0a]">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${activeThread.name.split(' ')[0]}...`}
            className="flex-1 bg-[#141414] border-b border-[#2b2b2b] px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="h-8 w-8 rounded-md bg-indigo-600 disabled:opacity-40 text-white flex items-center justify-center hover:bg-indigo-500 active:scale-95 transition-transform"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 select-none text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-[#141414]">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">Institutional Messaging</h1>
          <p className="text-[10px] text-slate-400">Direct Faculty Mentorship and Departmental Broadcasts</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channels or contacts..."
            className="w-full bg-[#111111] border-b border-[#222222] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 px-2">
        {[
          { id: 'all', label: 'All Channels' },
          { id: 'channels', label: 'Department Broadcasts' },
          { id: 'dms', label: 'Faculty Mentorship' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-black font-semibold'
                : 'bg-[#121212] text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Threads List */}
      <div className="divide-y divide-[#141414]">
        {filteredThreads.map((thread) => (
          <div
            key={thread.id}
            onClick={() => selectThread(thread.id)}
            className="flex items-center justify-between px-3 py-3 hover:bg-[#121212] cursor-pointer transition-colors active:bg-[#1a1a1a]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex-shrink-0">
                <img
                  src={thread.avatar}
                  alt={thread.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                {thread.isOnline && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-black" />
                )}
              </div>

              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-xs font-bold text-white truncate">
                  {thread.name}
                </span>
                <span className="text-[11px] text-slate-400 truncate mt-0.5">
                  {thread.lastMessage}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0 pl-2">
              <span className="text-[9px] font-mono text-slate-500">{thread.lastMessageTime}</span>
              {thread.unreadCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-sky-500" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
