/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AppShell } from './components/shell/AppShell';
import { AdminLayout } from './features/admin/components/AdminLayout';

export default function App() {
  const [viewMode, setViewMode] = useState<'mobile' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'admin' || window.location.pathname.startsWith('/admin')) {
        return 'admin';
      }
    }
    return 'mobile';
  });

  return (
    <>
      {viewMode === 'admin' ? (
        <AdminLayout onSwitchToMobile={() => setViewMode('mobile')} />
      ) : (
        <AppShell />
      )}

      {/* Floating Viewport Switcher */}
      <div className="fixed bottom-3 right-3 z-50 select-none">
        <button
          onClick={() => setViewMode(viewMode === 'admin' ? 'mobile' : 'admin')}
          className="px-3.5 py-1.5 rounded-full bg-zinc-900/95 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 shadow-2xl backdrop-blur-xl text-xs font-mono font-medium flex items-center gap-2 transition-all active:scale-95"
          title="Toggle between Mobile App and Web Admin Dashboard"
        >
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>{viewMode === 'admin' ? '📱 Mobile App View' : '🖥️ Web Admin Dashboard'}</span>
        </button>
      </div>
    </>
  );
}
