import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../../services/store';
import { UserManagement } from './UserManagement';
import { ClassroomManagement } from './ClassroomManagement';
import { Dashboard } from './Dashboard';
import { Applications } from './Applications';
import { EventManagement } from './EventManagement';
import { RoleBadge } from './RoleBadge';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileCheck,
  Calendar,
  Settings,
  ShieldCheck,
  Bell,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Server,
  LogOut,
  Smartphone,
  Layers,
  Database,
  Clock,
  Building2,
} from 'lucide-react';

interface AdminLayoutProps {
  onSwitchToMobile?: () => void;
}

export function AdminLayout({ onSwitchToMobile }: AdminLayoutProps) {
  const {
    currentUser,
    currentRole,
    setRole,
    applications,
    issues,
    auditLogs,
    classrooms,
    logout,
  } = useAppStore();

  const [activeNav, setActiveNav] = useState<'users' | 'classrooms' | 'dashboard' | 'applications' | 'events' | 'settings'>('users');

  // Ensure currentUser in our store for the Admin view has role: 'admin'
  useEffect(() => {
    if (currentRole !== 'admin' || currentUser?.role !== 'admin') {
      setRole('admin');
    }
  }, [currentRole, currentUser?.role, setRole]);

  const pendingAppsCount = applications.filter(
    (a) => a.status === 'pending_mentor' || a.status === 'pending_hod' || a.status === 'pending_warden'
  ).length;

  const activeIssuesCount = issues.filter((i) => i.status !== 'resolved').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* ------------------------------------------------------------- */}
      {/* FIXED LEFT-HAND SIDEBAR (Desktop-First Widescreen Navigation)  */}
      {/* ------------------------------------------------------------- */}
      <aside className="w-64 fixed inset-y-0 left-0 z-30 bg-zinc-950/80 backdrop-blur-2xl border-r border-zinc-800/80 flex flex-col justify-between select-none">
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
                <div className="h-full w-full rounded-[10px] bg-zinc-950 flex items-center justify-center">
                  <Building2 size={16} className="text-indigo-400" />
                </div>
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white block">
                  Instempus Admin
                </span>
                <span className="text-[10px] font-mono text-zinc-500 block">
                  BPUT Enterprise Node
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-mono font-bold text-emerald-400">LIVE</span>
            </div>
          </div>

          {/* Primary Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
              Identity & Core Operations
            </div>

            {/* 1. Dashboard */}
            <button
              onClick={() => setActiveNav('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                activeNav === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">v2.4</span>
            </button>

            {/* 2. User Management (Active Feature) */}
            <button
              onClick={() => setActiveNav('users')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                activeNav === 'users'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users size={16} />
                <span>User Management</span>
              </div>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  activeNav === 'users' ? 'bg-indigo-700 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                RBAC
              </span>
            </button>

            {/* 3. Classrooms & SectionSlots (Creator Feature) */}
            <button
              onClick={() => setActiveNav('classrooms')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                activeNav === 'classrooms'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <GraduationCap size={16} />
                <span>Classrooms & Sections</span>
              </div>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  activeNav === 'classrooms' ? 'bg-indigo-700 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                SLOTS
              </span>
            </button>

            {/* 3. Applications & Clearances */}
            <button
              onClick={() => setActiveNav('applications')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                activeNav === 'applications'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCheck size={16} />
                <span>Applications</span>
              </div>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  activeNav === 'applications' ? 'bg-indigo-700 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                DESK
              </span>
            </button>

            {/* 4. Event Management Command Center (Phase 3) */}
            <button
              onClick={() => setActiveNav('events')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                activeNav === 'events'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar size={16} />
                <span>Events & Forms</span>
              </div>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  activeNav === 'events' ? 'bg-indigo-700 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                LIVE
              </span>
            </button>

            {/* 4. Settings & Policies */}
            <button
              onClick={() => setActiveNav('settings')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                activeNav === 'settings'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings size={16} />
                <span>System Policies</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">2026-27</span>
            </button>
          </nav>

          {/* System Telemetry Widget */}
          <div className="m-3 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-zinc-400 text-[10px]">
              <span className="flex items-center gap-1.5">
                <Database size={11} className="text-emerald-400" />
                <span>Cluster Store</span>
              </span>
              <span className="text-emerald-400 font-bold">Synchronized</span>
            </div>

            <div className="space-y-1 text-[10px] text-zinc-500">
              <div className="flex justify-between">
                <span>Active Dues:</span>
                <span className="text-zinc-300">₹1,800 Hold</span>
              </div>
              <div className="flex justify-between">
                <span>Maintenance:</span>
                <span className="text-amber-400 font-bold">{activeIssuesCount} Tickets</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer & Admin Identity */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/40 space-y-2">
          {/* Switch to Mobile Button (if handler provided) */}
          {onSwitchToMobile && (
            <button
              onClick={onSwitchToMobile}
              className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Smartphone size={13} className="text-indigo-400" />
              <span>Switch to Mobile View</span>
            </button>
          )}

          {/* Active System Administrator User Card */}
          <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800/70 flex items-center gap-2.5 shadow-sm">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 ring-1 ring-indigo-500/30">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-white truncate block">
                  System Administrator
                </span>
                <RoleBadge role="admin" size="sm" />
              </div>
              <span className="text-[11px] font-mono text-zinc-400 truncate block mt-0.5">
                admin@bput.ac.in
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA (Full-Width Desktop Widescreen Layout)       */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 ml-64 min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/30 via-zinc-950 to-zinc-950">
        {/* Top Navbar */}
        <header className="h-16 px-6 lg:px-8 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="text-zinc-500">Admin Console</span>
            <ChevronRight size={12} className="text-zinc-600" />
            <span className="text-zinc-500">Identity & Access</span>
            <ChevronRight size={12} className="text-zinc-600" />
            <span className="text-white font-semibold capitalize">
              {activeNav === 'users' ? 'User Directory' : activeNav}
            </span>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-3">
            {/* Server ping indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>18ms • ap-south-1</span>
            </div>

            {/* Notification Icon */}
            <div className="relative">
              <button
                title="System Notifications"
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
              >
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-zinc-950" />
              </button>
            </div>

            {/* Switch to Mobile link badge */}
            {onSwitchToMobile && (
              <button
                onClick={onSwitchToMobile}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono transition-colors font-medium"
              >
                <Smartphone size={13} />
                <span>Mobile Preview</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Body Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeNav === 'users' && <UserManagement />}
          {activeNav === 'classrooms' && <ClassroomManagement />}
          {activeNav === 'dashboard' && <Dashboard />}
          {activeNav === 'applications' && <Applications />}
          {activeNav === 'events' && <EventManagement />}

          {/* Policies & Settings View */}
          {activeNav === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">System Configuration & Policies</h2>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  BPUT Academic Regulations, Attendance Cutoffs & Cryptographic Digital Signatures
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4 text-xs font-mono">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <span className="text-white font-bold block">Minimum Attendance Eligibility</span>
                    <span className="text-zinc-500 text-[11px]">Strict 75% rule for end-term examination admit card issuance</span>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-zinc-800 text-emerald-400 font-bold">75.0% Required</span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <span className="text-white font-bold block">Hostel Curfew Lockout</span>
                    <span className="text-zinc-500 text-[11px]">Automatic turnstile lockout and security alert dispatch</span>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-zinc-800 text-amber-400 font-bold">20:30 Hours Daily</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-bold block">Mess Rebate Threshold</span>
                    <span className="text-zinc-500 text-[11px]">Sanctioned duty or medical leave required to claim ₹140/day deduction</span>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-zinc-800 text-indigo-400 font-bold">≥ 3 Days Consecutive</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
