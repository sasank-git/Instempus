import { useState } from 'react';
import { useAppStore } from '../../services/store';
import { X, Lock, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export function InstitutionalLoginModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { signInWithEmail } = useAppStore();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);
    setStatusMsg('Verifying credentials with Supabase Auth...');

    try {
      const result = await signInWithEmail(identifier, password);
      if (!result.success) {
        setStatusMsg(result.error || 'Invalid email or password.');
        setIsError(true);
        setIsLoading(false);
        return;
      }

      setStatusMsg('Authentication successful.');
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setStatusMsg(msg);
      setIsError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none text-white animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#0c0c0c] border border-[#222222] p-5 space-y-4 shadow-2xl rounded-2xl">
        <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Institutional Authentication Portal
            </h2>
            <p className="text-[10px] text-slate-400">Connected to Supabase PostgreSQL Auth</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={16} />
          </button>
        </div>

        {statusMsg && (
          <div
            className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
              isError
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {isError ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
            <span>{statusMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3 text-xs font-mono">
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
              Institutional Email
            </label>
            <input
              type="email"
              required
              placeholder="e.g. user@bput.ac.in"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-[#141414] border border-[#2b2b2b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter account password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#141414] border border-[#2b2b2b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              {isLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
