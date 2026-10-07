import { useState } from 'react';
import { ApplicationType, Role } from '../../types';
import { X, Send, FileText, CheckCircle2, Award } from 'lucide-react';
import { useAppStore } from '../../services/store';

interface ApplyDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: ApplicationType;
}

export function ApplyDocumentModal({ isOpen, onClose, defaultType = 'bonafide' }: ApplyDocumentModalProps) {
  const { currentUser, submitServiceApplication } = useAppStore();

  const [type, setType] = useState<ApplicationType>(defaultType);
  const [purpose, setPurpose] = useState('');
  const [remarks, setRemarks] = useState('');
  const [duration, setDuration] = useState('');
  const [organization, setOrganization] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let title = '';
    let targetApprover: Role = 'teacher';
    const details: Record<string, string> = {
      Semester: `Semester ${currentUser.semester || 6} (${currentUser.department || 'CSE'})`,
      ScholarName: currentUser.name,
      RollNumber: currentUser.rollNo || '2501CSE008',
      SubmissionDate: new Date().toLocaleDateString('en-GB'),
    };

    if (type === 'bonafide') {
      title = `Bonafide Certificate for ${purpose || 'Official Documentation'}`;
      details['Purpose'] = purpose || 'Official Verification';
      details['RecipientOrganization'] = organization || 'Competent Authority';
      targetApprover = 'admin';
    } else if (type === 'leave') {
      title = `Academic Duty Leave (${duration || '3 Days'})`;
      details['Reason'] = purpose || 'Symposium / Hackathon Representation';
      details['Duration'] = duration || '3 Days';
      details['EventDetails'] = organization || 'BPUT Technical Symposium';
      targetApprover = 'teacher';
    } else if (type === 'mess_rebate') {
      title = `Mess Rebate Deduction (${duration || '3 Days'})`;
      details['HostelBlock'] = currentUser.hostelBlock || 'Hostel Block A';
      details['RoomNo'] = currentUser.roomNo || 'Room A-204';
      details['LeaveDuration'] = duration || '3 Days';
      details['Reason'] = purpose || 'Official Sanctioned Leave';
      targetApprover = 'warden';
    } else if (type === 'no_dues') {
      title = 'Institutional No Dues Certificate & Semester Clearance';
      details['ClearanceScope'] = 'Library, Laboratory, Hostel, Accounts';
      details['AcademicYear'] = '2025-2026';
      targetApprover = 'hod';
    } else {
      title = `Application for Character & Conduct Certificate`;
      details['Purpose'] = purpose || 'Higher Studies / Placement';
      targetApprover = 'admin';
    }

    if (remarks.trim()) {
      details['ScholarNotes'] = remarks.trim();
    }

    submitServiceApplication({
      type,
      title,
      details,
      targetApprover,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setPurpose('');
      setRemarks('');
      setDuration('');
      setOrganization('');
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="bg-[#101010] border border-[#222] w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#1c1c1c] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Apply for Document / Certificate</h3>
              <p className="text-[10px] text-slate-400 font-mono">Academic Operations Clearance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-[#222] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto no-scrollbar space-y-3.5 text-xs">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle2 size={40} className="text-emerald-400 animate-bounce" />
              <span className="text-sm font-bold text-white">Application Submitted!</span>
              <p className="text-[11px] text-slate-400 font-mono">
                Routed to the respective review authority. Track status in your Services tab.
              </p>
            </div>
          ) : (
            <>
              {/* Document Type Selector */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1.5 font-bold">
                  Select Document Service
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'bonafide', label: 'Bonafide Certificate', desc: 'Scholarship / Bank / Visa' },
                    { id: 'leave', label: 'Academic Duty Leave', desc: 'Hackathons / Competitions' },
                    { id: 'mess_rebate', label: 'Mess Rebate', desc: 'Deduction for ≥3 Days' },
                    { id: 'no_dues', label: 'No Dues Clearance', desc: 'Semester Clearance Slip' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setType(item.id as ApplicationType)}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        type === item.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-[#161616] border-[#242424] text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold block">{item.label}</span>
                      <span className="text-[9px] text-slate-500 font-mono block">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose / Reason */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                  {type === 'bonafide'
                    ? 'Purpose of Bonafide Certificate *'
                    : type === 'leave'
                    ? 'Reason for Academic Leave *'
                    : type === 'mess_rebate'
                    ? 'Leave Purpose (for Mess Rebate) *'
                    : 'Clearance Purpose *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    type === 'bonafide'
                      ? 'e.g. National Scholarship Portal / Education Loan'
                      : 'e.g. Representing college at Grand Finale Hackathon'
                  }
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-[#161616] border border-[#262626] rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              {/* Extra Field for Duty Leave / Rebate: Duration */}
              {(type === 'leave' || type === 'mess_rebate') && (
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                    Duration & Dates *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3 Days (Oct 5 to Oct 7, 2026)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-[#161616] border border-[#262626] rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              )}

              {/* Organization / Event */}
              {type === 'bonafide' && (
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                    Submitting To (Organization / Bank)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. State Bank of India / Ministry of Education"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full bg-[#161616] border border-[#262626] rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              )}

              {/* Additional Remarks */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                  Additional Information (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Any reference order, roll number notes, or mentor endorsement details..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-[#161616] border border-[#262626] rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs resize-none"
                />
              </div>

              {/* Applicant Card Summary */}
              <div className="p-2.5 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">Applicant:</span>
                <span className="text-white font-bold">
                  {currentUser.name} ({currentUser.rollNo})
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  <span>Submit Application</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
