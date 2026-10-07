import { useState } from 'react';
import { useAppStore } from '../../services/store';
import {
  AlertCircle,
  ThumbsUp,
  MapPin,
  Clock,
  Plus,
  CheckCircle2,
  Wrench,
  Search,
  BedDouble,
  UtensilsCrossed,
  Shield,
  Star,
  UserPlus,
  PhoneCall,
  UserCheck,
  Building2,
  Check,
  ArrowRight,
  Filter,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { AndroidBottomSheet } from '../android/AndroidBottomSheet';
import { IssueCategory, CampusIssue, MessFeedbackItem } from '../../types';
import { CreateMaintenanceTicketModal } from '../hostel/CreateMaintenanceTicketModal';
import { MessFeedbackModal } from '../hostel/MessFeedbackModal';
import { VisitorPassModal } from '../hostel/VisitorPassModal';
import { RoomAssetModal } from '../hostel/RoomAssetModal';

export function IssuesBoardScreen() {
  const {
    issues,
    toggleIssueUpvote,
    currentUser,
    currentRole,
    updateIssueStatus,
    roomRecord,
    messFeedback,
    visitorPasses,
    gateLogs,
    canteenMenu,
    toggleMessFeedbackUpvote,
    setActiveTab,
  } = useAppStore();

  // Tabbed view state
  const [activeTab, setActiveFacilityTab] = useState<
    'maintenance' | 'rooms' | 'mess' | 'gate'
  >('maintenance');

  // Filter state for maintenance
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketDefaultLocation, setTicketDefaultLocation] = useState('Hostel Block A, Room A-204');
  const [ticketDefaultAsset, setTicketDefaultAsset] = useState('');
  const [isMessModalOpen, setIsMessModalOpen] = useState(false);
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [isRoomAssetModalOpen, setIsRoomAssetModalOpen] = useState(false);

  // Selected issue for bottom sheet details / status update
  const [selectedIssue, setSelectedIssue] = useState<CampusIssue | null>(null);
  const [statusUpdateNote, setStatusUpdateNote] = useState('');

  // Filter gate logs: 'my' vs 'all'
  const [gateLogFilter, setGateLogFilter] = useState<'my' | 'all'>('my');

  const categories = [
    { id: 'all', label: 'All Issues' },
    { id: 'hostel', label: 'Hostel Block' },
    { id: 'mess', label: 'Mess & Dining' },
    { id: 'infrastructure', label: 'Civil & RO' },
    { id: 'labs', label: 'Labs & Network' },
    { id: 'academic', label: 'Academic Block' },
  ];

  const filteredIssues = issues.filter((issue) => {
    const matchesCat = selectedCategory === 'all' || issue.category === selectedCategory;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && issue.status !== 'resolved') ||
      (statusFilter === 'resolved' && issue.status === 'resolved');
    const matchesQuery =
      !searchQuery.trim() ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesStatus && matchesQuery;
  });

  const activeTicketsCount = issues.filter((i) => i.status !== 'resolved').length;

  const isStaffOrAdmin = ['warden', 'canteen', 'admin', 'principal', 'hod'].includes(currentRole);

  const handleOpenAssetIssue = (assetTag: string, assetName: string) => {
    setTicketDefaultLocation(`Hostel Block A, Room ${roomRecord.roomNo}`);
    setTicketDefaultAsset(assetTag);
    setIsTicketModalOpen(true);
  };

  const handleUpdateStatus = (newStatus: CampusIssue['status']) => {
    if (!selectedIssue) return;
    updateIssueStatus(selectedIssue.id, newStatus, statusUpdateNote);
    setStatusUpdateNote('');
    setSelectedIssue(null);
  };

  const filteredGateLogs =
    gateLogFilter === 'my'
      ? gateLogs.filter(
          (g) =>
            g.personName.toLowerCase().includes(currentUser.name.toLowerCase()) ||
            g.identifier === currentUser.rollNo
        )
      : gateLogs;

  return (
    <div className="space-y-4 pb-24 select-none text-white animate-in fade-in duration-150">
      {/* Top Header with Prominent Report Issue Button */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-[#141414]">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">Campus Issues & Maintenance</h1>
          <p className="text-[10px] text-slate-400 font-mono">
            Report Grievances, Room Assets, Mess Dining & Gate Logs
          </p>
        </div>
        <button
          onClick={() => {
            setTicketDefaultLocation(`Hostel Block A, Room ${roomRecord.roomNo}`);
            setTicketDefaultAsset('');
            setIsTicketModalOpen(true);
          }}
          className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-colors shrink-0"
        >
          <Plus size={14} />
          <span>Report Issue</span>
        </button>
      </div>

      {/* QUICK STATUS METRICS RIBBON */}
      <div className="grid grid-cols-4 gap-1.5 px-2">
        <button
          onClick={() => setActiveFacilityTab('maintenance')}
          className="p-2 bg-[#0e0e0e] hover:bg-[#141414] border border-[#1e1e1e] rounded-xl text-left transition-colors"
        >
          <span className="text-[8px] font-mono text-slate-500 uppercase block">Reported Issues</span>
          <span className="text-xs font-bold text-amber-400 font-mono block mt-0.5">
            {activeTicketsCount} Active
          </span>
          <span className="text-[8px] text-slate-400 font-mono block">Status Tracked</span>
        </button>

        <button
          onClick={() => setActiveFacilityTab('rooms')}
          className="p-2 bg-[#0e0e0e] hover:bg-[#141414] border border-[#1e1e1e] rounded-xl text-left transition-colors"
        >
          <span className="text-[8px] font-mono text-slate-500 uppercase block">My Room</span>
          <span className="text-xs font-bold text-white font-mono block mt-0.5">
            {roomRecord.roomNo}
          </span>
          <span className="text-[8px] text-emerald-400 font-mono block">★ 4.8 Score</span>
        </button>

        <button
          onClick={() => setActiveFacilityTab('mess')}
          className="p-2 bg-[#0e0e0e] hover:bg-[#141414] border border-[#1e1e1e] rounded-xl text-left transition-colors"
        >
          <span className="text-[8px] font-mono text-slate-500 uppercase block">Mess Rating</span>
          <span className="text-xs font-bold text-amber-400 font-mono block mt-0.5">
            4.4 ★
          </span>
          <span className="text-[8px] text-slate-400 font-mono block">142 Reviews</span>
        </button>

        <button
          onClick={() => setActiveFacilityTab('gate')}
          className="p-2 bg-[#0e0e0e] hover:bg-[#141414] border border-[#1e1e1e] rounded-xl text-left transition-colors"
        >
          <span className="text-[8px] font-mono text-slate-500 uppercase block">Gate Logs</span>
          <span className="text-xs font-bold text-emerald-400 font-mono block mt-0.5">
            Main Gate 1
          </span>
          <span className="text-[8px] text-slate-400 font-mono block">Live Audit</span>
        </button>
      </div>

      {/* OPERATIONS NAVIGATION TABS */}
      <div className="px-2">
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#121212] rounded-xl border border-[#222]">
          <button
            onClick={() => setActiveFacilityTab('maintenance')}
            className={`py-1.5 rounded-lg text-center font-mono text-[10px] font-bold transition-all ${
              activeTab === 'maintenance'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Reported Issues ({activeTicketsCount})
          </button>
          <button
            onClick={() => setActiveFacilityTab('rooms')}
            className={`py-1.5 rounded-lg text-center font-mono text-[10px] font-bold transition-all ${
              activeTab === 'rooms'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Room & Assets
          </button>
          <button
            onClick={() => setActiveFacilityTab('mess')}
            className={`py-1.5 rounded-lg text-center font-mono text-[10px] font-bold transition-all ${
              activeTab === 'mess'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dining & Menu
          </button>
          <button
            onClick={() => setActiveFacilityTab('gate')}
            className={`py-1.5 rounded-lg text-center font-mono text-[10px] font-bold transition-all ${
              activeTab === 'gate'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Visitors & Gate
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW 1: COMPLAINTS & MAINTENANCE (REPORT ISSUES)          */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'maintenance' && (
        <div className="space-y-3.5 px-2">
          {/* Top Actions: Search + Report Issue Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reported issues, maintenance complaints..."
                className="w-full bg-[#121212] border border-[#222] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <button
              onClick={() => {
                setTicketDefaultLocation(`Hostel Block A, Room ${roomRecord.roomNo}`);
                setTicketDefaultAsset('');
                setIsTicketModalOpen(true);
              }}
              className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-colors shrink-0"
            >
              <Plus size={14} />
              <span>Report Issue</span>
            </button>
          </div>

          {/* Trade Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono whitespace-nowrap transition-colors border ${
                  selectedCategory === cat.id
                    ? 'bg-white text-black font-bold border-white'
                    : 'bg-[#121212] text-slate-400 border-[#222] hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Status Sub-filter */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Showing {filteredIssues.length} issues</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`hover:text-white transition-colors ${statusFilter === 'all' ? 'text-indigo-400 font-bold underline' : ''}`}
              >
                All
              </button>
              <span>•</span>
              <button
                onClick={() => setStatusFilter('active')}
                className={`hover:text-white transition-colors ${statusFilter === 'active' ? 'text-indigo-400 font-bold underline' : ''}`}
              >
                In Progress
              </button>
              <span>•</span>
              <button
                onClick={() => setStatusFilter('resolved')}
                className={`hover:text-white transition-colors ${statusFilter === 'resolved' ? 'text-indigo-400 font-bold underline' : ''}`}
              >
                Resolved
              </button>
            </div>
          </div>

          {/* Issue Cards List */}
          <div className="space-y-3">
            {filteredIssues.map((ticket) => (
              <div
                key={ticket.id}
                className="p-3.5 bg-[#0e0e0e] border border-[#1e1e1e] hover:border-[#2a2a2a] rounded-xl space-y-2.5 transition-all"
              >
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] font-bold uppercase text-indigo-400">
                        {ticket.id}
                      </span>
                      {ticket.urgency && (
                        <span
                          className={`font-mono text-[8px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                            ticket.urgency === 'emergency'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : ticket.urgency === 'high'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          }`}
                        >
                          {ticket.urgency}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-white mt-1 leading-snug">
                      {ticket.title}
                    </h3>
                  </div>

                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border shrink-0 ${
                      ticket.status === 'resolved'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : ticket.status === 'in_progress'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : ticket.status === 'assigned'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        : 'bg-[#222] text-slate-300 border-[#333]'
                    }`}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {ticket.description}
                </p>

                {/* Location & Asset Tag */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-[#181818]">
                  <div className="flex items-center gap-1 truncate max-w-[240px]">
                    <MapPin size={12} className="text-indigo-400 shrink-0" />
                    <span className="truncate">{ticket.location}</span>
                  </div>
                  {ticket.assetTag && (
                    <span className="text-indigo-300 font-bold bg-[#141414] px-1.5 py-0.5 rounded">
                      {ticket.assetTag}
                    </span>
                  )}
                </div>

                {/* Assigned Technician Banner */}
                {ticket.assignedTechnician && (
                  <div className="p-2 bg-[#121513] border border-emerald-500/20 rounded-lg flex items-center justify-between text-[10px] font-mono">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <Wrench size={12} />
                      </div>
                      <div>
                        <span className="text-white font-bold block">
                          {ticket.assignedTechnician.name} ({ticket.assignedTechnician.trade})
                        </span>
                        <span className="text-[9px] text-slate-400 block">
                          ETA: {ticket.scheduledResolution || 'Within 24 hours'}
                        </span>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-semibold text-[9px]">
                      {ticket.assignedTechnician.contact}
                    </span>
                  </div>
                )}

                {/* Update notes */}
                {ticket.statusUpdateNote && (
                  <div className="text-[10px] text-slate-400 font-mono bg-[#141414] p-2 rounded border border-[#1e1e1e]">
                    <span className="text-slate-500">Estate Note:</span> {ticket.statusUpdateNote}
                  </div>
                )}

                {/* Bottom Row Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-[#181818] text-[10px]">
                  <span className="text-slate-500 font-mono">
                    Reported: {ticket.createdAt} by {ticket.authorName}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleIssueUpvote(ticket.id)}
                      className={`flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        ticket.userUpvoted
                          ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 font-bold'
                          : 'bg-[#161616] border-[#222] text-slate-400 hover:text-white'
                      }`}
                    >
                      <ThumbsUp size={11} />
                      <span>{ticket.upvotes} Endorse</span>
                    </button>

                    {isStaffOrAdmin && (
                      <button
                        onClick={() => setSelectedIssue(ticket)}
                        className="px-2 py-0.5 rounded bg-[#222] hover:bg-[#282828] text-white font-mono text-[10px] transition-colors"
                      >
                        Manage
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW 2: ROOM & ASSET RECORDS                              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'rooms' && (
        <div className="space-y-3.5 px-2">
          {/* My Allocated Room Banner */}
          <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-[#101010] to-[#0e0e0e] border border-indigo-500/30 rounded-xl space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold block">
                  Resident Allotment Ledger
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  {roomRecord.hostelBlock}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  Room {roomRecord.roomNo} • {roomRecord.bedNo} • Floor {roomRecord.floor}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px] border border-emerald-500/30">
                ★ {roomRecord.cleanlinessRating} Cleanliness
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e1e1e] text-[10px] font-mono text-slate-300">
              <div>
                <span className="text-slate-500 block">Roommate:</span>
                <span className="text-white font-semibold">
                  {roomRecord.roommateName} ({roomRecord.roommateRoll})
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Allotment Date:</span>
                <span className="text-white">{roomRecord.allocatedDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#1a1a1a] text-[9px] font-mono text-emerald-400">
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} />
                <span>{roomRecord.inspectionStatus}</span>
              </span>
              <button
                onClick={() => setIsRoomAssetModalOpen(true)}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
              >
                <span>Inspect Full Room Record</span>
                <ChevronRight size={11} />
              </button>
            </div>
          </div>

          {/* Assigned Furniture & Fixture Condition Ledger */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Room Inventory & Asset Conditions ({roomRecord.assets.length})
              </h3>
              <span className="text-[9px] font-mono text-slate-500">Physical Barcoded</span>
            </div>

            <div className="space-y-2">
              {roomRecord.assets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 bg-[#0e0e0e] border border-[#1e1e1e] rounded-xl space-y-1.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block">
                        {asset.assetTag}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-0.5">{asset.name}</h4>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        asset.condition === 'Excellent' || asset.condition === 'Good'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {asset.condition.toUpperCase()}
                    </span>
                  </div>

                  {asset.remarks && (
                    <p className="text-[10px] text-slate-400 font-mono">{asset.remarks}</p>
                  )}

                  <div className="flex items-center justify-between pt-1.5 border-t border-[#181818] text-[9px] font-mono">
                    <span className="text-slate-500">Verified: {asset.lastInspected}</span>
                    <button
                      onClick={() => handleOpenAssetIssue(asset.assetTag, asset.name)}
                      className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                    >
                      <Wrench size={10} />
                      <span>Report Damage</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW 3: MESS MENU & MEAL FEEDBACK                         */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'mess' && (
        <div className="space-y-3.5 px-2">
          {/* Today's 4-Meal Menu Card */}
          <div className="p-4 bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-amber-400 uppercase font-bold block">
                  Central Dining Hall Menu
                </span>
                <h3 className="text-xs font-bold text-white mt-0.5">{canteenMenu.date}</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px]">
                {canteenMenu.isVegOnly ? 'VEG ONLY' : 'STANDARD HOSTEL'}
              </span>
            </div>

            {/* Meals Grid */}
            <div className="space-y-2 pt-1 font-mono text-xs">
              <div className="p-2.5 bg-[#141414] rounded-lg border border-[#222] space-y-0.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-amber-400 font-bold uppercase">Breakfast (07:30 - 09:30)</span>
                  <span className="text-slate-500">Session 1</span>
                </div>
                <p className="text-white text-[11px]">{canteenMenu.breakfast}</p>
              </div>

              <div className="p-2.5 bg-[#141414] rounded-lg border border-[#222] space-y-0.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-amber-400 font-bold uppercase">Lunch (12:30 - 14:30)</span>
                  <span className="text-slate-500">Session 2</span>
                </div>
                <p className="text-white text-[11px]">{canteenMenu.lunch}</p>
              </div>

              <div className="p-2.5 bg-[#141414] rounded-lg border border-[#222] space-y-0.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-amber-400 font-bold uppercase">Snacks & Tea (17:00 - 18:15)</span>
                  <span className="text-slate-500">Session 3</span>
                </div>
                <p className="text-white text-[11px]">{canteenMenu.snacks}</p>
              </div>

              <div className="p-2.5 bg-[#141414] rounded-lg border border-[#222] space-y-0.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-amber-400 font-bold uppercase">Dinner (19:30 - 21:30)</span>
                  <span className="text-slate-500">Session 4</span>
                </div>
                <p className="text-white text-[11px]">{canteenMenu.dinner}</p>
              </div>
            </div>

            <button
              onClick={() => setIsMessModalOpen(true)}
              className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs font-mono transition-colors flex items-center justify-center gap-1.5 shadow"
            >
              <Star size={14} className="fill-white" />
              <span>Rate Today's Meal & Submit Review</span>
            </button>
          </div>

          {/* Student Reviews & Feedback Stream */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Verified Resident Dining Reviews ({messFeedback.length})
              </h3>
              <span className="text-[9px] font-mono text-emerald-400 font-bold">
                Food Quality Audit: 4.4 ★
              </span>
            </div>

            <div className="space-y-2.5">
              {messFeedback.map((fb) => (
                <div
                  key={fb.id}
                  className="p-3 bg-[#0e0e0e] border border-[#1e1e1e] rounded-xl space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-amber-400 font-bold uppercase">
                          {fb.mealType}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">•</span>
                        <span className="text-[9px] font-mono text-slate-400">{fb.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-0.5">
                        {fb.authorName} ({fb.authorRoll})
                      </h4>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(fb.rating)].map((_, i) => (
                        <Star key={i} size={12} className="fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">{fb.comment}</p>

                  <div className="flex flex-wrap gap-1">
                    {fb.dishesEvaluated.map((dish, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#161616] text-slate-400 border border-[#242424]"
                      >
                        {dish}
                      </span>
                    ))}
                  </div>

                  {fb.canteenResponse && (
                    <div className="p-2 bg-[#12110c] border border-amber-500/20 rounded-lg text-[10px] font-mono text-amber-200">
                      <span className="text-amber-400 font-bold">Canteen Supervisor Note:</span>{' '}
                      {fb.canteenResponse}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-[#181818] text-[10px]">
                    <span className="text-slate-500 font-mono">Dining Committee Audited</span>
                    <button
                      onClick={() => toggleMessFeedbackUpvote(fb.id)}
                      className={`flex items-center gap-1 font-mono text-[9px] px-2 py-0.5 rounded border transition-colors ${
                        fb.userUpvoted
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                          : 'bg-[#161616] border-[#222] text-slate-400 hover:text-white'
                      }`}
                    >
                      <ThumbsUp size={10} />
                      <span>{fb.upvotes} Agree</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW 4: VISITORS & GATE LOGS                              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'gate' && (
        <div className="space-y-3.5 px-2">
          {/* Visitor Pre-Registration Button */}
          <div className="flex items-center justify-between p-3 bg-[#0e0e0e] border border-[#1e1e1e] rounded-xl">
            <div>
              <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold block">
                Main Gate 1 Security Checkpoint
              </span>
              <h3 className="text-xs font-bold text-white mt-0.5">Expecting Parents or Visitors?</h3>
              <p className="text-[10px] text-slate-400">
                Pre-register to generate automatic boom barrier clearance QR
              </p>
            </div>
            <button
              onClick={() => setIsVisitorModalOpen(true)}
              className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono shadow transition-colors shrink-0"
            >
              Pre-Register
            </button>
          </div>

          {/* Active / Registered Visitor Passes */}
          {visitorPasses.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Scheduled Visitor Entry Permits
              </h3>
              <div className="space-y-2">
                {visitorPasses.map((pass) => (
                  <div
                    key={pass.id}
                    className="p-3 bg-[#0f0f0f] border border-emerald-500/30 rounded-xl space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase">
                            {pass.id}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">•</span>
                          <span className="text-[9px] font-mono text-slate-400">
                            {pass.relationship.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-0.5">{pass.visitorName}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Visit Date: {pass.visitDate} ({pass.expectedArrivalTime} - {pass.expectedDepartureTime})
                        </p>
                      </div>

                      <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {pass.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="p-2 bg-[#0a0a0a] rounded border border-[#161616] text-[10px] font-mono space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Contact:</span>
                        <span className="text-slate-300">{pass.contactNo}</span>
                      </div>
                      {pass.vehicleNumber && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Vehicle:</span>
                          <span className="text-slate-300">{pass.vehicleNumber}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-500">Hostel Room Access:</span>
                        <span className="text-emerald-400">
                          {pass.hostelEntryPermitted ? 'Permitted (A-204)' : 'Lobby Only'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Real-Time Optical Gate Logs Audit Stream */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Gate Entry & Exit Audit Ledger
              </h3>
              <div className="flex items-center gap-1.5 p-0.5 bg-[#141414] rounded-lg border border-[#222] text-[9px] font-mono">
                <button
                  onClick={() => setGateLogFilter('my')}
                  className={`px-2 py-0.5 rounded ${gateLogFilter === 'my' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  My Logs
                </button>
                <button
                  onClick={() => setGateLogFilter('all')}
                  className={`px-2 py-0.5 rounded ${gateLogFilter === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  Main Gate 1
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {filteredGateLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                          log.direction === 'ENTRY'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                        }`}
                      >
                        {log.direction}
                      </span>
                      <span className="font-bold text-white">{log.personName}</span>
                    </div>

                    <span className="text-[9px] font-mono text-slate-400">{log.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-[#161616]">
                    <span>{log.gateLocation}</span>
                    <span className="text-emerald-400">{log.verifiedByGuard}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Maintenance Ticket Modal */}
      <CreateMaintenanceTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        defaultLocation={ticketDefaultLocation}
        defaultAssetTag={ticketDefaultAsset}
      />

      {/* 2. Mess Feedback Modal */}
      <MessFeedbackModal
        isOpen={isMessModalOpen}
        onClose={() => setIsMessModalOpen(false)}
      />

      {/* 3. Visitor Pass Modal */}
      <VisitorPassModal
        isOpen={isVisitorModalOpen}
        onClose={() => setIsVisitorModalOpen(false)}
      />

      {/* 4. Room Asset Inspection Modal */}
      <RoomAssetModal
        roomRecord={roomRecord}
        isOpen={isRoomAssetModalOpen}
        onClose={() => setIsRoomAssetModalOpen(false)}
        onReportAssetIssue={handleOpenAssetIssue}
      />

      {/* 5. Issue Management BottomSheet (For Staff/Warden) */}
      <AndroidBottomSheet
        isOpen={Boolean(selectedIssue)}
        onClose={() => setSelectedIssue(null)}
        title={selectedIssue?.title || 'Manage Maintenance Ticket'}
      >
        {selectedIssue && (
          <div className="space-y-4 text-xs text-white">
            <div className="p-3 bg-[#121212] rounded-lg border border-[#1a1a1a] space-y-1 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Ticket ID:</span>
                <span className="text-white font-bold">{selectedIssue.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="text-white">{selectedIssue.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reporter:</span>
                <span className="text-white">{selectedIssue.authorName}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-400 uppercase block">
                Technician Inspection Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Parts replaced. Tested and functional."
                value={statusUpdateNote}
                onChange={(e) => setStatusUpdateNote(e.target.value)}
                className="w-full bg-[#141414] border border-[#222] rounded px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1a1a1a]">
              <button
                onClick={() => handleUpdateStatus('in_progress')}
                className="py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
              >
                Mark In Progress
              </button>
              <button
                onClick={() => handleUpdateStatus('resolved')}
                className="py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Mark Resolved & Close
              </button>
            </div>
          </div>
        )}
      </AndroidBottomSheet>
    </div>
  );
}
