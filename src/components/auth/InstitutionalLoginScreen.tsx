import React, { useState } from 'react';
import { useAppStore } from '../../services/store';
import { supabase } from '../../services/supabase';
import { UserProfile } from '../../types';
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Building2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Database,
  ShieldAlert,
  KeyRound,
  Check,
} from 'lucide-react';

export function InstitutionalLoginScreen() {
  const { signInWithEmail, updateUserPassword, completePasswordReset, currentUser } = useAppStore();

  // Sign In state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Forced Password Reset state (Feature 1)
  const [isPasswordResetRequired, setIsPasswordResetRequired] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // -----------------------------------------------------------------
  // SIGN IN: Real Supabase Email & Password Authentication
  // -----------------------------------------------------------------
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const email = loginEmail.trim();
    if (!email) {
      setLoginError('Please enter your institutional email address.');
      return;
    }

    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    setIsLoggingIn(true);

    try {
      const result = await signInWithEmail(email, loginPassword);

      if (!result.success) {
        setLoginError(result.error || 'Authentication failed. Please verify your credentials.');
        return;
      }

      // Check if administrative provisioning flagged this user for forced password change
      if (result.requiresPasswordChange) {
        setIsPasswordResetRequired(true);
        setPendingUser(result.user || currentUser);
        triggerToast('Temporary password detected: Security protocol requires choosing a new password.');
        return;
      }

      triggerToast('Successfully signed in! Welcome to Instempus.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setLoginError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // -----------------------------------------------------------------
  // FORCED PASSWORD RESET: Set New Secure Password & Clear Flag
  // -----------------------------------------------------------------
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    const newPass = newPassword.trim();
    const confirmPass = confirmPassword.trim();

    if (newPass.length < 6) {
      setResetError('New password must contain at least 6 characters.');
      return;
    }

    if (newPass !== confirmPass) {
      setResetError('New password and confirmation password do not match.');
      return;
    }

    if (newPass === loginPassword) {
      setResetError('New password cannot be the same as your temporary initial password.');
      return;
    }

    setIsResetting(true);

    try {
      // 1. Update password in Supabase Auth via store action
      const authResult = await updateUserPassword(newPass);

      if (!authResult.success) {
        setResetError(authResult.error || 'Failed to update password with authentication provider.');
        setIsResetting(false);
        return;
      }

      // 2. Clear requires_password_change flag in public.profiles table
      const targetUserId = pendingUser?.id || currentUser.id;
      const currentMeta = pendingUser?.metadata || currentUser?.metadata || {};
      const updatedMeta = {
        ...currentMeta,
        requires_password_change: false,
        password_updated_at: new Date().toISOString(),
      };

      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          metadata: updatedMeta,
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetUserId);

      if (dbError) {
        console.warn('Could not update metadata in public.profiles:', dbError);
      }

      // 3. Mark user authenticated in store and complete login
      completePasswordReset(updatedMeta);
      triggerToast('✓ Password updated successfully! Access granted to Instempus.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password update failed';
      setResetError(msg);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-4 bg-zinc-950 text-white select-none relative font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-4 z-50 flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/95 text-white border border-emerald-500/40 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top duration-300">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-mono font-medium flex-1 text-emerald-200">
            {toastMessage}
          </span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-zinc-400 hover:text-white text-xs ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Container */}
      <div className="space-y-4 pt-3">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
              <div className="h-full w-full rounded-[10px] bg-zinc-950 flex items-center justify-center">
                <Building2 size={18} className="text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-indigo-400 font-bold tracking-wider block">
                BPUT SECURE NETWORK
              </span>
              <h1 className="text-base font-bold text-white tracking-tight">Instempus Portal</h1>
            </div>
          </div>

          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SUPABASE AUTH
          </span>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW A: SET NEW SECURE PASSWORD (INTERCEPTED RESET FLOW)      */}
        {/* ------------------------------------------------------------- */}
        {isPasswordResetRequired ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-250">
            {/* Security Protocol Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-zinc-300 text-xs flex items-start gap-3 font-mono">
              <ShieldAlert size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-300 block text-xs">
                  Mandatory Password Reset Required
                </span>
                <p className="text-[11px] text-zinc-300/90 leading-relaxed font-sans">
                  Your identity was provisioned with a temporary administrative password. Security policy mandates establishing a permanent personal password before accessing campus services.
                </p>
              </div>
            </div>

            {/* Target Account Pill */}
            {(pendingUser || currentUser) && (
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-[11px] font-bold">
                    {(pendingUser?.name || currentUser.name || 'U').charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-white block text-xs">
                      {pendingUser?.name || currentUser.name}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {pendingUser?.rollNo || pendingUser?.employeeId || pendingUser?.email || currentUser.email}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold">
                  {pendingUser?.role || currentUser.role}
                </span>
              </div>
            )}

            {/* Reset Error Banner */}
            {resetError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold font-mono">Password Validation Error</span>
                  <p className="text-[11px] text-rose-200/90">{resetError}</p>
                </div>
              </div>
            )}

            {/* Set New Secure Password Form */}
            <form onSubmit={handlePasswordReset} className="space-y-3.5 font-mono">
              {/* New Password Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-zinc-300 font-semibold flex items-center gap-1.5">
                  <KeyRound size={13} className="text-indigo-400" />
                  <span>New Secure Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 chars)"
                    className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <span className="text-[10px] text-zinc-500 block">
                  Must be at least 6 characters in length
                </span>
              </div>

              {/* Confirm New Password Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-zinc-300 font-semibold flex items-center gap-1.5">
                  <Lock size={13} className="text-indigo-400" />
                  <span>Confirm New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {newPassword && confirmPassword && (
                  <div className="flex items-center gap-1 text-[10px]">
                    {newPassword === confirmPassword ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check size={11} /> Passwords match
                      </span>
                    ) : (
                      <span className="text-rose-400">Passwords do not match</span>
                    )}
                  </div>
                )}
              </div>

              {/* Submit New Password Button */}
              <button
                type="submit"
                disabled={isResetting || !newPassword || !confirmPassword}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98] mt-3"
              >
                {isResetting ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>Updating Credentials in Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Set New Password & Enter Instempus</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPasswordResetRequired(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setResetError(null);
                }}
                className="w-full py-2 text-center text-[11px] text-zinc-500 hover:text-zinc-300 font-mono"
              >
                Cancel and return to Sign In
              </button>
            </form>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* VIEW B: STANDARD INSTITUTIONAL SIGN IN FORM                   */
          /* ------------------------------------------------------------- */
          <>
            {/* Security Notice: Admin-Only Provisioning */}
            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/25 text-zinc-300 text-xs flex items-start gap-2.5 font-mono">
              <ShieldCheck size={16} className="text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-indigo-300 block text-[11px]">
                  Admin-Governed Access Policy
                </span>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                  Identity accounts for scholars and faculty mentors are provisioned exclusively through the Campus Administration Console. First-time sign in requires setting a new secure password.
                </p>
              </div>
            </div>

            {/* Exclusive Sign In Form */}
            <form onSubmit={handleSignIn} className="space-y-4 pt-1">
              {/* Error Banner */}
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                  <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold font-mono">Authentication Error</span>
                    <p className="text-[11px] text-rose-200/90">{loginError}</p>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5 font-mono">
                <label className="text-[11px] text-zinc-300 font-semibold flex items-center gap-1.5">
                  <Mail size={13} className="text-indigo-400" />
                  <span>Institutional Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. arya.pattnayak@bput.ac.in"
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-zinc-300 font-semibold flex items-center gap-1.5">
                    <Lock size={13} className="text-indigo-400" />
                    <span>Account Password</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your university password"
                    className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] mt-2"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>Verifying Supabase Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Instempus</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Bottom Security Footer */}
      <div className="pt-6 pb-2 border-t border-zinc-900 flex flex-col items-center gap-1 text-[10px] font-mono text-zinc-500 text-center">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Database size={11} className="text-indigo-400" />
          <span>PostgreSQL Row-Level Security Protected</span>
        </div>
        <span>Biju Patnaik University of Technology • Enterprise Portal</span>
      </div>
    </div>
  );
}

export default InstitutionalLoginScreen;
