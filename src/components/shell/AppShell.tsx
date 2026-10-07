import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../services/store';
import { BottomNav, MobileTab } from '../navigation/BottomNav';
import { AndroidStatusBar } from '../android/AndroidStatusBar';
import { AndroidNavBar } from '../android/AndroidNavBar';
import { InstitutionalLoginScreen } from '../auth/InstitutionalLoginScreen';
import { StoryViewerModal } from '../story/StoryViewerModal';
import { EmergencyAlarmModal } from '../emergency/EmergencyAlarmModal';
import {
  CampusFeedPage,
  AcademicHubPage,
  HostelLifePage,
  StudentProfilePage,
  WardenApprovalsPage,
  SecurityScannerPage,
} from '../pages';

export function AppShell() {
  const {
    currentUser,
    currentRole,
    isOffline,
    isAuthenticated,
  } = useAppStore();

  const role = currentUser.role || currentRole;

  // Determine initial tab based on role
  const getInitialTab = (): MobileTab => {
    if (role === 'security') return 'scanner';
    return 'feed';
  };

  const [activeTab, setActiveTab] = useState<MobileTab>(getInitialTab);

  // Automatically adapt tab if role changes
  useEffect(() => {
    if (role === 'security' && activeTab !== 'scanner' && activeTab !== 'profile') {
      setActiveTab('scanner');
    } else if (role === 'warden' && activeTab === 'academic') {
      setActiveTab('approvals');
    } else if (role !== 'warden' && activeTab === 'approvals') {
      setActiveTab('academic');
    } else if (role !== 'security' && activeTab === 'scanner') {
      setActiveTab('feed');
    }
  }, [role]);

  return (
    <div className="min-h-screen bg-black text-slate-100 flex justify-center select-none font-sans">
      {/* 
        Native Mobile Viewport Container:
        - Responsive: Fills screen on mobile devices
        - Max width constrained on tablets / desktop monitors
      */}
      <div className="w-full max-w-md min-h-screen bg-black flex flex-col justify-between relative shadow-2xl overflow-x-hidden">
        {/* Offline notification banner */}
        {isOffline && (
          <div className="bg-rose-700 text-white text-[11px] font-bold py-1 px-4 text-center flex items-center justify-center gap-2 shadow z-30">
            <span>OFFLINE PROTOCOL ACTIVE • Operating via local cached storage</span>
          </div>
        )}

        {/* Top Status Bar (WiFi, Time, Battery) */}
        <AndroidStatusBar />

        {/* Main Viewport Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar px-4 pt-1 pb-20">
          {!isAuthenticated ? (
            <InstitutionalLoginScreen />
          ) : (
            <>
              {activeTab === 'feed' && <CampusFeedPage />}
              {activeTab === 'academic' && <AcademicHubPage />}
              {activeTab === 'approvals' && <WardenApprovalsPage />}
              {activeTab === 'hostel' && <HostelLifePage />}
              {activeTab === 'profile' && <StudentProfilePage />}
              {activeTab === 'scanner' && <SecurityScannerPage />}
            </>
          )}
        </main>

        {/* Bottom Navigation & Gesture Pill */}
        {isAuthenticated && (
          <div className="fixed bottom-0 w-full max-w-md bg-zinc-950 z-30">
            <BottomNav currentTab={activeTab} onTabChange={setActiveTab} />
            <AndroidNavBar />
          </div>
        )}
      </div>

      {/* Global Modals */}
      {isAuthenticated && <StoryViewerModal />}
      {isAuthenticated && <EmergencyAlarmModal />}
    </div>
  );
}

export default AppShell;
