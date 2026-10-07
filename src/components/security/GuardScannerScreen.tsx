import { useState } from 'react';
import { useAppStore } from '../../services/store';
import { TRANSLATIONS } from '../../i18n/translations';
import {
  ScanLine,
  Camera,
  Flashlight,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertOctagon,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { GatePass } from '../../types';

export function GuardScannerScreen() {
  const { verifyGuardScan, gatePasses, language, currentUser, setActiveTab } = useAppStore();
  const [flashlight, setFlashlight] = useState(false);
  const [scannedPass, setScannedPass] = useState<GatePass | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [customToken, setCustomToken] = useState('');

  const t = TRANSLATIONS[language];

  // Quick simulate button targeting the active pass
  const demoActivePass = gatePasses.find((p) => p.status === 'approved') || gatePasses[0];

  const handleSimulateScan = (tokenToScan: string) => {
    setScanStatus('idle');
    setFeedbackMessage('Decoding QR token & cryptographically verifying signature...');

    setTimeout(() => {
      const result = verifyGuardScan(tokenToScan, 'exit');
      if (result.success && result.pass) {
        setScannedPass(result.pass);
        setScanStatus('success');
        setFeedbackMessage(result.message);
      } else {
        setScanStatus('error');
        setFeedbackMessage(result.message);
        setScannedPass(null);
      }
    }, 400);
  };

  const handleAction = (actionType: 'exit' | 'entry') => {
    if (!scannedPass) return;
    const result = verifyGuardScan(scannedPass.qrToken, actionType);
    if (result.success && result.pass) {
      setScannedPass(result.pass);
      setFeedbackMessage(result.message);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white tracking-tight">{t['guard.scanTitle']}</h1>
            <span className="rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 border border-emerald-500/30">
              GATE 1 ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400">Station Guard: {currentUser.name}</p>
        </div>

        <button
          onClick={() => setFlashlight(!flashlight)}
          className={`p-2 rounded-full border transition-colors ${
            flashlight
              ? 'bg-amber-400 text-slate-950 border-amber-300'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
          title="Toggle Scanner Torch"
        >
          <Flashlight size={16} />
        </button>
      </div>

      {/* CAMERA SCANNER SIMULATOR VIEWFINDER */}
      <div className="relative overflow-hidden rounded-3xl bg-black border border-slate-700 aspect-square max-w-[340px] mx-auto flex flex-col items-center justify-center shadow-2xl">
        {/* Background camera simulation view */}
        <div className="absolute inset-0 bg-radial from-slate-900 via-slate-950 to-black opacity-90" />

        {/* Animated laser scanning line */}
        <div className="absolute inset-x-8 h-0.5 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500 shadow-[0_0_12px_#10b981] animate-scan-line z-10 pointer-events-none" />

        {/* Camera Reticle Brackets */}
        <div className="relative z-10 w-56 h-56 border-2 border-emerald-500/60 rounded-3xl p-3 flex flex-col justify-between">
          <div className="flex justify-between">
            <div className="w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
            <div className="w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
          </div>

          <div className="text-center">
            <Camera size={28} className="mx-auto text-emerald-400/80 animate-pulse" />
            <p className="text-[11px] font-medium text-slate-300 mt-2">
              Align Student QR inside frame
            </p>
          </div>

          <div className="flex justify-between">
            <div className="w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
            <div className="w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
          </div>
        </div>

        {/* Torch indicator */}
        {flashlight && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
            <Flashlight size={10} />
            <span>TORCH ON</span>
          </div>
        )}
      </div>

      {/* QUICK SCAN SIMULATION ACTIONS */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
          Quick Test Scan Actions
        </span>

        <div className="grid grid-cols-2 gap-2">
          {demoActivePass ? (
            <button
              onClick={() => handleSimulateScan(demoActivePass.qrToken)}
              className="p-3 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-left transition-all active:scale-95"
            >
              <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs">
                <Sparkles size={14} />
                <span>Scan Arya's Pass</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                {demoActivePass.id} • {demoActivePass.studentName}
              </p>
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left flex flex-col justify-center">
              <span className="text-[10px] text-slate-500 font-mono">No passes available</span>
            </div>
          )}

          <button
            onClick={() => handleSimulateScan('INVALID_FORGED_TOKEN_XYZ')}
            className="p-3 rounded-2xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/40 text-left transition-all active:scale-95"
          >
            <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
              <AlertOctagon size={14} />
              <span>Simulate Fake Token</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Test forgery detection</p>
          </button>
        </div>
      </div>

      {/* VERIFICATION RESULT CARD */}
      {scanStatus === 'success' && scannedPass && (
        <div className="rounded-3xl bg-slate-900 border-2 border-emerald-500/60 p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <UserCheck size={28} />
              </div>
              <div>
                <span className="flex items-center gap-1 text-xs font-black text-emerald-400 uppercase tracking-wide">
                  <CheckCircle size={14} /> PASS VERIFIED & AUTHENTIC
                </span>
                <h3 className="text-base font-bold text-white">{scannedPass.studentName}</h3>
                <p className="font-mono text-xs text-indigo-400">
                  {scannedPass.rollNo} • {scannedPass.roomNo}
                </p>
              </div>
            </div>

            <span className="rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5">
              {scannedPass.id}
            </span>
          </div>

          <div className="rounded-2xl bg-slate-950/80 p-3 space-y-1.5 text-xs border border-slate-800">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Outing Purpose:</span>
              <span className="font-semibold text-right max-w-[200px] truncate">
                {scannedPass.reason}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Approved Curfew:</span>
              <span className="font-bold text-amber-400">{scannedPass.expectedReturnTime}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Approved By:</span>
              <span>{scannedPass.approvedBy}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Parent Emergency No:</span>
              <span className="font-mono text-emerald-400">{scannedPass.parentContact}</span>
            </div>
          </div>

          {/* Guard Actions */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => handleAction('exit')}
              className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform"
            >
              <ArrowRight size={16} />
              <span>{t['guard.allowExit']}</span>
            </button>

            <button
              onClick={() => handleAction('entry')}
              className="py-3 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition-transform"
            >
              <ArrowLeft size={16} />
              <span>{t['guard.allowEntry']}</span>
            </button>
          </div>

          {feedbackMessage && (
            <p className="text-center text-xs font-semibold text-emerald-400 pt-1">
              ✓ {feedbackMessage}
            </p>
          )}
        </div>
      )}

      {scanStatus === 'error' && (
        <div className="rounded-3xl bg-rose-950/60 border-2 border-rose-500 p-5 shadow-2xl space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
            <XCircle size={28} />
          </div>
          <h3 className="text-base font-bold text-rose-300">Gate Verification Failed!</h3>
          <p className="text-xs text-rose-200">{feedbackMessage}</p>
          <p className="text-[11px] text-slate-400">
            Pass token does not match any active student gate records or has been revoked. Retain student at gate desk.
          </p>
        </div>
      )}
    </div>
  );
}
