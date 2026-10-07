import { useAppStore } from '../../services/store';
import { AndroidBottomSheet } from '../android/AndroidBottomSheet';
import { Language } from '../../types';
import { LogOut, User, Building, Phone, Mail, MapPin, Globe, Shield, RefreshCw } from 'lucide-react';

export function AccountSettingsSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    currentUser,
    currentRole,
    logout,
    language,
    setLanguage,
    isOffline,
    toggleOffline,
  } = useAppStore();

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <AndroidBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Institutional Account Settings"
      subtitle={`Authenticated as ${currentUser.name}`}
    >
      <div className="space-y-4 pt-2 text-xs select-none text-white">
        {/* User Details Matrix (No Bios, Institutional Identity) */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Official Identity Record
          </span>

          <div className="bg-[#121212] divide-y divide-[#1e1e1e] border-b border-[#222]">
            <div className="p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <User size={14} className="text-indigo-400" />
                <span>Full Name</span>
              </div>
              <span className="font-semibold text-white">{currentUser.name}</span>
            </div>

            <div className="p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Shield size={14} className="text-indigo-400" />
                <span>Institutional Identifier</span>
              </div>
              <span className="font-mono font-bold text-white">
                {currentUser.rollNo || currentUser.employeeId}
              </span>
            </div>

            <div className="p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Building size={14} className="text-indigo-400" />
                <span>Department / Cell</span>
              </div>
              <span className="font-medium text-slate-200 text-right max-w-[200px] truncate">
                {currentUser.department}
              </span>
            </div>

            {currentUser.hostelBlock && (
              <div className="p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin size={14} className="text-indigo-400" />
                  <span>Campus Residence</span>
                </div>
                <span className="font-medium text-slate-200">
                  {currentUser.hostelBlock} ({currentUser.roomNo})
                </span>
              </div>
            )}

            <div className="p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Phone size={14} className="text-indigo-400" />
                <span>Registered Contact</span>
              </div>
              <span className="font-mono text-slate-300">{currentUser.phone}</span>
            </div>

            <div className="p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail size={14} className="text-indigo-400" />
                <span>Official Email</span>
              </div>
              <span className="font-mono text-indigo-300 text-right max-w-[200px] truncate">
                {currentUser.email || `${currentUser.username}@bput.ac.in`}
              </span>
            </div>
          </div>
        </div>

        {/* System Language Preference */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            System Language
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'en', label: 'English' },
              { id: 'hi', label: 'Hindi' },
              { id: 'or', label: 'Odia' },
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id as Language)}
                className={`py-1.5 text-center text-xs rounded-md transition-colors ${
                  language === l.id
                    ? 'bg-white text-black font-bold'
                    : 'bg-[#141414] text-slate-400 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Offline Cache Simulator */}
        <div className="bg-[#121212] p-2.5 flex items-center justify-between border-b border-[#222]">
          <div>
            <span className="font-semibold text-white block">Offline Persistence Mode</span>
            <span className="text-[10px] text-slate-400">IndexedDB local storage simulation</span>
          </div>
          <button
            onClick={toggleOffline}
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              isOffline ? 'bg-rose-600 text-white' : 'bg-[#1e1e1e] text-slate-300'
            }`}
          >
            {isOffline ? 'Offline Active' : 'Online'}
          </button>
        </div>

        {/* PROMINENT LOG OUT BUTTON */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-md bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-colors active:scale-95"
          >
            <LogOut size={15} />
            <span>Log Out of Instempus</span>
          </button>
          <span className="text-[10px] text-slate-500 font-mono text-center block mt-1.5">
            Terminates active session and returns to Institutional Login Screen.
          </span>
        </div>
      </div>
    </AndroidBottomSheet>
  );
}
