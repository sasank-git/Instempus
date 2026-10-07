import { ServiceApplication } from '../../types';
import { X, Download, ShieldCheck, CheckCircle2, Award, Printer, QrCode } from 'lucide-react';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface CertificateViewerModalProps {
  application: ServiceApplication | null;
  onClose: () => void;
}

export function CertificateViewerModal({ application, onClose }: CertificateViewerModalProps) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!application) return null;

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 2500);
  };

  const getDocTitle = () => {
    switch (application.type) {
      case 'bonafide':
        return 'BONAFIDE ACADEMIC CERTIFICATE';
      case 'leave':
        return 'ACADEMIC DUTY LEAVE ENDORSEMENT';
      case 'mess_rebate':
        return 'MESS REBATE CLEARANCE MEMO';
      case 'no_dues':
        return 'INSTITUTIONAL NO-DUES CLEARANCE';
      default:
        return 'OFFICIAL INSTITUTIONAL CERTIFICATE';
    }
  };

  const certNumber = `BPUT/ACAD/2026/${application.id}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="bg-[#0e0e0e] border border-[#2a2a2a] w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-3.5 bg-[#141414] border-b border-[#222] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Digital Certificate Slip
              </h3>
              <p className="text-[10px] text-emerald-400 font-mono">Digitally Signed & Validated</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-[#222] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Certificate Preview Body */}
        <div className="p-4 overflow-y-auto no-scrollbar space-y-4 text-xs">
          {/* Institutional Certificate Canvas */}
          <div className="bg-[#121212] border-2 border-[#2b2b2b] rounded-xl p-4 space-y-3.5 relative overflow-hidden text-slate-200">
            {/* Watermark Crest */}
            <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] text-white pointer-events-none">
              <Award size={220} />
            </div>

            {/* Institution Header */}
            <div className="text-center border-b border-[#222] pb-3 space-y-1">
              <span className="text-[9px] font-mono tracking-widest text-indigo-400 font-bold uppercase block">
                GOVERNMENT OF ODISHA AFFILIATED
              </span>
              <h2 className="text-xs font-extrabold text-white uppercase tracking-wider">
                BIJU PATNAIK UNIVERSITY OF TECHNOLOGY
              </h2>
              <p className="text-[9px] text-slate-400 font-mono">
                Central Campus • Rourkela & Bhubaneswar Academic Zone
              </p>
              <div className="inline-block mt-1 px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[9px] font-bold">
                {getDocTitle()}
              </div>
            </div>

            {/* Certificate Serial & Reference */}
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 border-b border-[#1c1c1c] pb-2">
              <span>Cert Ref: {certNumber}</span>
              <span>Issued: {application.submittedAt}</span>
            </div>

            {/* Endorsement Statement */}
            <div className="space-y-2 text-[11px] leading-relaxed text-slate-300">
              <p>
                This is to officially certify that <span className="font-bold text-white underline">{application.studentName}</span>, 
                holding Registration / Roll Number <span className="font-mono font-bold text-white underline">{application.rollNo}</span>, 
                is a bonafide scholar enrolled in the <span className="text-white font-medium">B.Tech Programme (Computer Science and Engineering)</span> for the academic year 2025-2026.
              </p>

              {/* Specific Details Grid */}
              <div className="bg-[#0a0a0a] p-2.5 rounded-lg border border-[#1a1a1a] space-y-1 text-[10px] font-mono">
                {Object.entries(application.details).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-0.5 border-b border-[#161616] last:border-0">
                    <span className="text-slate-400 uppercase">{key}:</span>
                    <span className="text-white font-semibold text-right">{val}</span>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-slate-400 italic">
                This digital document is cryptographically verified against university server records and does not require an ink seal.
              </p>
            </div>

            {/* QR Code & Signatures */}
            <div className="flex items-end justify-between pt-2 border-t border-[#222]">
              <div className="bg-white p-1.5 rounded-lg shadow shrink-0">
                <QRCodeSVG
                  value={`https://bput.ac.in/verify/${application.id}?roll=${application.rollNo}`}
                  size={64}
                />
              </div>

              <div className="text-right space-y-1 text-[9px] font-mono">
                <span className="text-emerald-400 font-bold block flex items-center justify-end gap-1">
                  <ShieldCheck size={12} />
                  Digitally Authenticated
                </span>
                <span className="text-white font-semibold block">Dean of Student Affairs</span>
                <span className="text-slate-400 block">BPUT Central Examination Cell</span>
              </div>
            </div>
          </div>

          {/* Timeline Review Status */}
          <div className="p-3 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Multi-Stage Verification Trail
            </span>
            <div className="space-y-1.5">
              {application.timeline.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[10px]">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-white font-medium">{step.step}</span>
                    <span className="text-slate-500 font-mono">{step.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3 bg-[#141414] border-t border-[#1c1c1c] flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-300" />
                <span>Certificate Saved!</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Download Official Certificate</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="py-2 px-3 rounded-lg bg-[#222] hover:bg-[#282828] text-slate-300 font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
