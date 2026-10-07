import React, { useState } from 'react';
import { useAppStore } from '../../services/store';
import {
  Home,
  BookOpen,
  Building2,
  User,
  Plus,
  Inbox,
  QrCode,
  X,
  FileText,
  AlertTriangle,
  Megaphone,
  Wrench,
} from 'lucide-react';
import { GatePassForm } from '../../features/create/components/GatePassForm';
import { ReportIssueForm } from '../../features/create/components/ReportIssueForm';
import { UniversalCreateSheet } from './UniversalCreateSheet';

export type MobileTab = 'feed' | 'academic' | 'hostel' | 'profile' | 'approvals' | 'scanner';

interface BottomNavProps {
  currentTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

export function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  const { currentUser, currentRole } = useAppStore();

  const role = currentUser.role || currentRole;

  // Universal FAB Action Sheet Modal state
  const [isFabSheetOpen, setIsFabSheetOpen] = useState(false);
  const [isGatePassFormOpen, setIsGatePassFormOpen] = useState(false);
  const [isReportIssueFormOpen, setIsReportIssueFormOpen] = useState(false);

  // -------------------------------------------------------------
  // ROLE 1: SECURITY GUARD NAVIGATION (Only Scanner & Profile)
  // -------------------------------------------------------------
  if (role === 'security') {
    return (
      <div className="bg-zinc-950/90 border-t border-zinc-800/80 backdrop-blur-2xl px-6 py-2.5 z-30 select-none">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Scanner Tab */}
          <button
            onClick={() => onTabChange('scanner')}
            className="flex flex-col items-center gap-1 p-1.5 transition-transform active:scale-90 focus:outline-none"
            aria-label="Scanner"
          >
            <QrCode
              size={22}
              className={
                currentTab === 'scanner'
                  ? 'text-indigo-400 stroke-[2.5]'
                  : 'text-zinc-500 stroke-[1.8]'
              }
            />
            <span
              className={`text-[10px] font-mono ${
                currentTab === 'scanner' ? 'text-indigo-300 font-bold' : 'text-zinc-500'
              }`}
            >
              Scanner
            </span>
          </button>

          {/* Profile Tab */}
          <button
            onClick={() => onTabChange('profile')}
            className="flex flex-col items-center gap-1 p-1.5 transition-transform active:scale-90 focus:outline-none"
            aria-label="Profile"
          >
            <User
              size={22}
              className={
                currentTab === 'profile'
                  ? 'text-indigo-400 stroke-[2.5]'
                  : 'text-zinc-500 stroke-[1.8]'
              }
            />
            <span
              className={`text-[10px] font-mono ${
                currentTab === 'profile' ? 'text-indigo-300 font-bold' : 'text-zinc-500'
              }`}
            >
              Profile
            </span>
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ROLE 2 & 3: WARDEN (Approvals) & STANDARD (Academic)
  // 4 Evenly Spaced Tabs + Central Prominent FAB
  // -------------------------------------------------------------
  const isWarden = role === 'warden';

  return (
    <>
      <div className="bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-2xl px-4 py-2 z-30 select-none">
        <div className="flex items-center justify-between max-w-md mx-auto relative">
          {/* 1. Home (Feed) */}
          <button
            onClick={() => onTabChange('feed')}
            className="flex-1 flex flex-col items-center gap-1 p-1 transition-transform active:scale-90 focus:outline-none"
            aria-label="Feed"
          >
            <Home
              size={22}
              className={
                currentTab === 'feed'
                  ? 'text-white stroke-[2.5]'
                  : 'text-zinc-500 stroke-[1.8]'
              }
            />
            <span
              className={`text-[10px] font-medium transition-colors ${
                currentTab === 'feed' ? 'text-white font-bold' : 'text-zinc-500'
              }`}
            >
              Feed
            </span>
            {currentTab === 'feed' && (
              <span className="h-1 w-1 rounded-full bg-indigo-500 -mt-0.5" />
            )}
          </button>

          {/* 2. Academic (Or Approvals if Warden) */}
          {isWarden ? (
            <button
              onClick={() => onTabChange('approvals')}
              className="flex-1 flex flex-col items-center gap-1 p-1 transition-transform active:scale-90 focus:outline-none"
              aria-label="Approvals"
            >
              <Inbox
                size={22}
                className={
                  currentTab === 'approvals'
                    ? 'text-white stroke-[2.5]'
                    : 'text-zinc-500 stroke-[1.8]'
                }
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  currentTab === 'approvals' ? 'text-white font-bold' : 'text-zinc-500'
                }`}
              >
                Approvals
              </span>
              {currentTab === 'approvals' && (
                <span className="h-1 w-1 rounded-full bg-amber-500 -mt-0.5" />
              )}
            </button>
          ) : (
            <button
              onClick={() => onTabChange('academic')}
              className="flex-1 flex flex-col items-center gap-1 p-1 transition-transform active:scale-90 focus:outline-none"
              aria-label="Academic"
            >
              <BookOpen
                size={22}
                className={
                  currentTab === 'academic'
                    ? 'text-white stroke-[2.5]'
                    : 'text-zinc-500 stroke-[1.8]'
                }
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  currentTab === 'academic' ? 'text-white font-bold' : 'text-zinc-500'
                }`}
              >
                Academic
              </span>
              {currentTab === 'academic' && (
                <span className="h-1 w-1 rounded-full bg-indigo-500 -mt-0.5" />
              )}
            </button>
          )}

          {/* 3. Central Prominent Floating Action Button (FAB) */}
          <div className="flex-1 flex justify-center -mt-6">
            <button
              onClick={() => setIsFabSheetOpen(true)}
              className="h-13 w-13 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/50 border border-indigo-400/40 active:scale-90 transition-transform"
              aria-label="Create Action"
            >
              <Plus size={24} className="stroke-[2.8]" />
            </button>
          </div>

          {/* 4. Hostel */}
          <button
            onClick={() => onTabChange('hostel')}
            className="flex-1 flex flex-col items-center gap-1 p-1 transition-transform active:scale-90 focus:outline-none"
            aria-label="Hostel"
          >
            <Building2
              size={22}
              className={
                currentTab === 'hostel'
                  ? 'text-white stroke-[2.5]'
                  : 'text-zinc-500 stroke-[1.8]'
              }
            />
            <span
              className={`text-[10px] font-medium transition-colors ${
                currentTab === 'hostel' ? 'text-white font-bold' : 'text-zinc-500'
              }`}
            >
              Hostel
            </span>
            {currentTab === 'hostel' && (
              <span className="h-1 w-1 rounded-full bg-emerald-500 -mt-0.5" />
            )}
          </button>

          {/* 5. Profile */}
          <button
            onClick={() => onTabChange('profile')}
            className="flex-1 flex flex-col items-center gap-1 p-1 transition-transform active:scale-90 focus:outline-none"
            aria-label="Profile"
          >
            <User
              size={22}
              className={
                currentTab === 'profile'
                  ? 'text-white stroke-[2.5]'
                  : 'text-zinc-500 stroke-[1.8]'
              }
            />
            <span
              className={`text-[10px] font-medium transition-colors ${
                currentTab === 'profile' ? 'text-white font-bold' : 'text-zinc-500'
              }`}
            >
              Profile
            </span>
            {currentTab === 'profile' && (
              <span className="h-1 w-1 rounded-full bg-indigo-500 -mt-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* UNIVERSAL CREATE ACTION SHEET (Triggered by central '+' FAB)  */}
      {/* ------------------------------------------------------------- */}
      <UniversalCreateSheet
        isOpen={isFabSheetOpen}
        onClose={() => setIsFabSheetOpen(false)}
        onOpenGatePass={() => setIsGatePassFormOpen(true)}
        onOpenHostelReport={() => setIsReportIssueFormOpen(true)}
      />

      {/* Smart Forms Triggered by FAB */}
      <GatePassForm
        isOpen={isGatePassFormOpen}
        onClose={() => setIsGatePassFormOpen(false)}
      />

      <ReportIssueForm
        isOpen={isReportIssueFormOpen}
        onClose={() => setIsReportIssueFormOpen(false)}
      />
    </>
  );
}
