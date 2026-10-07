import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAppStore } from '../../services/store';
import {
  FileText,
  Clock,
  ChevronRight,
  Shield,
  Award,
  Calendar,
  UtensilsCrossed,
  FileCheck,
  Check,
  Plus,
  MapPin,
  PhoneCall,
  Layers,
  GraduationCap,
  CreditCard,
  CheckCircle2,
  CalendarCheck,
  Download,
  ExternalLink,
  ShieldCheck,
  Wallet,
  AlertTriangle,
  Send,
  Building2,
  FileSignature,
} from 'lucide-react';
import { AndroidBottomSheet } from '../android/AndroidBottomSheet';
import { ServiceApplication, PassType, ApplicationType, StudentFeeItem } from '../../types';
import { GuardScannerScreen } from '../security/GuardScannerScreen';
import { CertificateViewerModal } from './CertificateViewerModal';
import { ApplyDocumentModal } from './ApplyDocumentModal';
import { FeePaymentModal } from './FeePaymentModal';

export function ServicesScreen() {
  const {
    applications,
    currentUser,
    currentRole,
    approveApplication,
    gatePasses,
    requestGatePass,
    setActiveTab,
    studentFees,
    classrooms,
  } = useAppStore();

  // Sub-tabs (Uniform for all users: Certificates, Gate Passes, Fee Payment, Academic)
  const [activeSubTab, setActiveSubTab] = useState<
    'certificates' | 'passes' | 'fees' | 'academic'
  >('certificates');

  // For faculty: Toggle inside Fee Payment between Student Ledger and Faculty Payroll
  const [feeViewMode, setFeeViewMode] = useState<'student_fees' | 'faculty_payroll'>('student_fees');

  // Modals state
  const [selectedApp, setSelectedApp] = useState<ServiceApplication | null>(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [isRequestPassOpen, setIsRequestPassOpen] = useState(false);
  const [isApplyDocOpen, setIsApplyDocOpen] = useState(false);
  const [applyDocDefaultType, setApplyDocDefaultType] = useState<ApplicationType>('bonafide');
  const [viewingCertificate, setViewingCertificate] = useState<ServiceApplication | null>(null);
  const [payingFee, setPayingFee] = useState<StudentFeeItem | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<StudentFeeItem | null>(null);
  const [facultyPayslipToast, setFacultyPayslipToast] = useState('');

  // Gate pass form state
  const [passType, setPassType] = useState<PassType>('day_out');
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');
  const [departureTime, setDepartureTime] = useState('Today, 17:30 hours');
  const [expectedReturnTime, setExpectedReturnTime] = useState('Today, 20:30 hours');
  const [parentContact, setParentContact] = useState('+91 98610 11222');

  // Calculate fees statistics
  const totalPaidFees = studentFees
    .filter((f) => f.status === 'paid')
    .reduce((acc, f) => acc + f.amount, 0);
  const totalPendingFees = studentFees
    .filter((f) => f.status === 'pending')
    .reduce((acc, f) => acc + f.amount, 0);

  // Calculate overall attendance
  const myClasses = classrooms.filter((cls) =>
    cls.enrolledStudents.some((s) => s.rollNo === currentUser.rollNo)
  );
  const avgAttendance =
    myClasses.length > 0
      ? Math.round(
          (myClasses.reduce((acc, c) => acc + c.attendanceRate, 0) / myClasses.length) * 10
        ) / 10
      : 91.3;

  // Active pass ONLY exists if the user has created one!
  const activePass = gatePasses.find((p) => p.status === 'approved');
  const pastPasses = gatePasses.filter((p) => p.id !== activePass?.id);

  const canApprove = ['teacher', 'hod', 'warden', 'admin', 'principal'].includes(currentRole);

  const handleApprove = () => {
    if (!selectedApp) return;
    approveApplication(selectedApp.id, approvalRemarks || `Approved by ${currentUser.name}`);
    setApprovalRemarks('');
    setSelectedApp(null);
  };

  const handlePassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim() || !reason.trim()) return;

    requestGatePass({
      passType,
      destination: destination.trim(),
      reason: reason.trim(),
      departureTime,
      expectedReturnTime,
      parentContact,
    });

    setIsRequestPassOpen(false);
    setDestination('');
    setReason('');
  };

  const openApplyDoc = (type: ApplicationType) => {
    setApplyDocDefaultType(type);
    setIsApplyDocOpen(true);
  };

  if (currentRole === 'security') {
    return (
      <div className="space-y-4 pb-20 select-none text-white">
        <div className="p-2 border-b border-[#1a1a1a]">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Main Gate Security Terminal
          </h2>
          <p className="text-[11px] text-slate-400">Optical QR pass verification and student gate logs</p>
        </div>
        <GuardScannerScreen />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 select-none text-white animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-[#141414]">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">
            {currentRole === 'teacher'
              ? 'Faculty & Campus Services'
              : 'Student Operations & Services'}
          </h1>
          <p className="text-[10px] text-slate-400 font-mono">
            Clearances, Gate Passes, Fee Payment & Academic Requests
          </p>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {currentUser.rollNo || currentUser.employeeId || currentRole.toUpperCase()}
          </span>
        </div>
      </div>

      {/* QUICK STATUS METRICS RIBBON */}
      <div className="grid grid-cols-4 gap-1.5 px-2">
        <button
          onClick={() => setActiveSubTab('academic')}
          className="p-2 bg-[#0e0e0e] hover:bg-[#141414] border border-[#1e1e1e] rounded-xl text-left transition-colors"
        >
          <span className="text-[8px] font-mono text-slate-500 uppercase block">Attendance</span>
          <span className="text-xs font-bold text-emerald-400 font-mono block mt-0.5">
            {avgAttendance}%
          </span>
          <span className="text-[8px] text-emerald-300 font-mono block">Safe ≥75%</span>
        </button>

        <button
          onClick={() => setActiveSubTab('fees')}
          className="p-2 bg-[#0e0e0e] hover:bg-[#141414] border border-[#1e1e1e] rounded-xl text-left transition-colors"
        >
          <span className="text-[8px] font-mono text-slate-500 uppercase block">Fee Payment</span>
          <span className="text-xs font-bold text-white font-mono block mt-0.5">
            {totalPendingFees === 0 ? 'CLEARED' : `₹${totalPendingFees}`}
          </span>
          <span className="text-[8px] text-indigo-300 font-mono block">Sem 6 Ledger</span>
        </button>

        <button
          onClick={() => setActiveSubTab('passes')}
          className="p-2 bg-[#0e0e0e] hover:bg-[#141414] border border-[#1e1e1e] rounded-xl text-left transition-colors"
        >
          <span className="text-[8px] font-mono text-slate-500 uppercase block">Gate Pass</span>
          <span className="text-xs font-bold text-emerald-400 font-mono block mt-0.5">
            {activePass ? 'ACTIVE QR' : 'APPLY'}
          </span>
          <span className="text-[8px] text-slate-400 font-mono block">Gate 1 Outing</span>
        </button>

        <button
          onClick={() => setActiveSubTab('certificates')}
          className="p-2 bg-[#0e0e0e] hover:bg-[#141414] border border-[#1e1e1e] rounded-xl text-left transition-colors"
        >
          <span className="text-[8px] font-mono text-slate-500 uppercase block">Requests</span>
          <span className="text-xs font-bold text-white font-mono block mt-0.5">
            {applications.length} Items
          </span>
          <span className="text-[8px] text-amber-300 font-mono block">Certificates</span>
        </button>
      </div>

      {/* OPERATIONS SUB-TABS (Always with Fee Payment!) */}
      <div className="px-2">
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#121212] rounded-xl border border-[#222]">
          <button
            onClick={() => setActiveSubTab('certificates')}
            className={`py-1.5 rounded-lg text-center font-mono text-[10px] font-bold transition-all ${
              activeSubTab === 'certificates'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Certificates
          </button>
          <button
            onClick={() => setActiveSubTab('passes')}
            className={`py-1.5 rounded-lg text-center font-mono text-[10px] font-bold transition-all ${
              activeSubTab === 'passes'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Gate Passes
          </button>
          <button
            onClick={() => setActiveSubTab('fees')}
            className={`py-1.5 rounded-lg text-center font-mono text-[10px] font-bold transition-all ${
              activeSubTab === 'fees'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fee Payment
          </button>
          <button
            onClick={() => setActiveSubTab('academic')}
            className={`py-1.5 rounded-lg text-center font-mono text-[10px] font-bold transition-all ${
              activeSubTab === 'academic'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Academic
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: CERTIFICATES & DOCUMENT REQUESTS                   */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'certificates' && (
        <div className="space-y-3.5 px-2">
          {/* Quick Apply Services Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Official Document Applications
              </h2>
              <button
                onClick={() => openApplyDoc('bonafide')}
                className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
              >
                <Plus size={12} />
                <span>New Request</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#0e0e0e] p-3 space-y-2 border border-[#1c1c1c] rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono text-emerald-400 font-semibold uppercase">
                    Academic Cell
                  </span>
                  <h3 className="text-xs font-bold text-white mt-0.5">Bonafide Certificate</h3>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    For bank loans, passport, scholarship portals
                  </p>
                </div>
                <button
                  onClick={() => openApplyDoc('bonafide')}
                  className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
                >
                  Apply
                </button>
              </div>

              <div className="bg-[#0e0e0e] p-3 space-y-2 border border-[#1c1c1c] rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono text-purple-400 font-semibold uppercase">
                    Faculty Endorsed
                  </span>
                  <h3 className="text-xs font-bold text-white mt-0.5">Academic Duty Leave</h3>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    Hackathons, research paper presentation
                  </p>
                </div>
                <button
                  onClick={() => openApplyDoc('leave')}
                  className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
                >
                  Apply
                </button>
              </div>

              <div className="bg-[#0e0e0e] p-3 space-y-2 border border-[#1c1c1c] rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono text-amber-400 font-semibold uppercase">
                    Hostel Dining Board
                  </span>
                  <h3 className="text-xs font-bold text-white mt-0.5">Mess Rebate Credit</h3>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    ₹140/day deduction for sanctioned leaves ≥ 3 days
                  </p>
                </div>
                <button
                  onClick={() => openApplyDoc('mess_rebate')}
                  className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
                >
                  Apply
                </button>
              </div>

              <div className="bg-[#0e0e0e] p-3 space-y-2 border border-[#1c1c1c] rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono text-cyan-400 font-semibold uppercase">
                    Institutional Cell
                  </span>
                  <h3 className="text-xs font-bold text-white mt-0.5">No Dues Certificate</h3>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    Library, hostel & accounts clearance slip
                  </p>
                </div>
                <button
                  onClick={() => openApplyDoc('no_dues')}
                  className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE APPLICATIONS TRACKER */}
          <div className="space-y-2 pt-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Submitted Requests & Approvals ({applications.length})
            </h2>

            <div className="space-y-2.5">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-[#0f0f0f] p-3.5 space-y-2.5 border border-[#1c1c1c] rounded-xl hover:border-[#2a2a2a] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold">
                          {app.id}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">•</span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {app.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white mt-0.5 leading-snug">
                        {app.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Submitted: {app.submittedAt}
                      </p>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm border ${
                        app.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {app.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Multi-stage Progress Steps */}
                  <div className="pt-2 border-t border-[#1a1a1a]">
                    <div className="flex items-center gap-1">
                      {app.timeline.map((step, idx) => (
                        <div key={idx} className="flex-1 flex flex-col gap-1">
                          <div
                            className={`h-1 rounded-full transition-all ${
                              step.status === 'completed'
                                ? 'bg-emerald-500'
                                : step.status === 'current'
                                ? 'bg-amber-400'
                                : 'bg-[#222]'
                            }`}
                          />
                          <span className="text-[8px] text-slate-400 font-mono truncate">
                            {step.role.split(' ')[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#181818] text-[10px]">
                    <span className="text-slate-500 font-mono">
                      {app.status === 'approved' ? 'Ready for Download' : 'Processing in Queue'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="text-slate-400 hover:text-white font-mono transition-colors"
                      >
                        Details
                      </button>

                      {app.status === 'approved' && (
                        <button
                          onClick={() => setViewingCertificate(app)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-[10px] flex items-center gap-1 transition-colors shadow"
                        >
                          <Award size={12} />
                          <span>View Certificate</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: GATE PASSES & LEAVES                               */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'passes' && (
        <div className="space-y-3.5 px-2">
          <div className="flex items-center justify-between p-3 bg-[#0e0e0e] border border-[#1e1e1e] rounded-xl">
            <div>
              <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold block">
                Biometric Hostel Security Gate
              </span>
              <h3 className="text-xs font-bold text-white mt-0.5">Need to step out of campus?</h3>
              <p className="text-[10px] text-slate-400">
                Authorized digital QR token required for Main Gate 1
              </p>
            </div>
            <button
              onClick={() => setIsRequestPassOpen(true)}
              className="py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono transition-colors shrink-0 shadow"
            >
              Apply Pass
            </button>
          </div>

          {activePass ? (
            <div className="bg-[#0f0f0f] p-4 space-y-3 border border-emerald-500/30 rounded-xl shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-[#1a1a1a]">
                <div>
                  <span className="text-xs font-bold text-white block">{activePass.id}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    ● ACTIVE & VERIFIED FOR GATE 1
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {activePass.passType.replace('_', ' ')}
                </span>
              </div>

              <div className="mx-auto flex flex-col items-center justify-center p-3 bg-white text-black max-w-[190px] rounded-lg shadow-inner">
                <QRCodeSVG
                  value={activePass.qrToken}
                  size={160}
                  level="H"
                  includeMargin={false}
                />
                <span className="font-mono text-[8px] font-bold text-slate-800 mt-1">
                  {activePass.qrToken}
                </span>
              </div>

              <div className="space-y-1.5 text-xs pt-1">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-semibold text-white">{activePass.destination}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Departure:</span>
                  <span className="font-mono text-white">{activePass.departureTime}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Curfew Deadline:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {activePass.expectedReturnTime}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Parent Emergency Contact:</span>
                  <span className="font-mono text-slate-300">{activePass.parentContact}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 p-2.5 bg-[#080808] border border-[#1a1a1a] rounded flex items-center gap-2 font-mono">
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                <span>Present this optical token to Guard Pradeep Rout at Main Gate 1 scanner.</span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-[#0d0d0d] rounded-xl border border-[#1a1a1a] text-slate-500 space-y-1">
              <Shield size={24} className="mx-auto text-slate-600 mb-1" />
              <p className="text-xs font-bold text-slate-300">No active gate pass</p>
              <p className="text-[10px] font-mono text-slate-500">
                You are currently clocked inside the campus network.
              </p>
            </div>
          )}

          {pastPasses.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Previous Gate Outing Records
              </h3>
              <div className="space-y-2">
                {pastPasses.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-white font-bold block">{p.destination}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {p.departureTime} • {p.status.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{p.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: FEE PAYMENT & ACCOUNTS LEDGER (ALWAYS PRESENT!)    */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'fees' && (
        <div className="space-y-3.5 px-2">
          {/* If teacher: Optional toggle between Student Fee Payment and Faculty Payslip */}
          {currentRole === 'teacher' && (
            <div className="flex p-1 bg-[#141414] rounded-lg border border-[#222] font-mono text-[10px]">
              <button
                type="button"
                onClick={() => setFeeViewMode('student_fees')}
                className={`flex-1 py-1 rounded text-center font-bold transition-all ${
                  feeViewMode === 'student_fees'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Student Fee Payment Portal
              </button>
              <button
                type="button"
                onClick={() => setFeeViewMode('faculty_payroll')}
                className={`flex-1 py-1 rounded text-center font-bold transition-all ${
                  feeViewMode === 'faculty_payroll'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Faculty Salary Statement
              </button>
            </div>
          )}

          {/* FACULTY PAYSLIP VIEW (ONLY IF TEACHER SELECTS IT) */}
          {currentRole === 'teacher' && feeViewMode === 'faculty_payroll' ? (
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-indigo-950/40 to-[#0e0e0e] border border-indigo-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">
                    Faculty Salary Disbursement
                  </span>
                  <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                    Credited (SBI)
                  </span>
                </div>
                <div className="text-xl font-bold font-mono text-emerald-400">
                  ₹94,878.00 Net Disbursed
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  Level 11 Assistant Professor • Disbursed via SBI University Branch
                </p>
              </div>

              <div className="p-3 bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-mono text-[11px] text-slate-300">
                  <span>Basic Pay:</span>
                  <span>₹68,900.00</span>
                </div>
                <div className="flex justify-between font-mono text-[11px] text-slate-300">
                  <span>Dearness Allowance (DA 42%):</span>
                  <span>₹28,938.00</span>
                </div>
                <div className="flex justify-between font-mono text-[11px] text-slate-300">
                  <span>House Rent Allowance (HRA 16%):</span>
                  <span>₹11,024.00</span>
                </div>
                <div className="border-t border-[#222] pt-1.5 flex justify-between font-mono text-xs font-bold text-emerald-400">
                  <span>Net Salary Credited:</span>
                  <span>₹94,878.00</span>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setFacultyPayslipToast('Downloaded September 2026 Payslip PDF');
                      setTimeout(() => setFacultyPayslipToast(''), 2500);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-[10px] flex items-center justify-center gap-1.5 shadow"
                  >
                    <Download size={12} />
                    <span>Download Payslip PDF</span>
                  </button>
                </div>
                {facultyPayslipToast && (
                  <p className="text-[10px] text-emerald-400 font-mono text-center pt-1 animate-pulse">
                    ✓ {facultyPayslipToast}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* STUDENT FEE PAYMENT PORTAL (ACCESSIBLE TO ALL) */
            <>
              {/* Institutional Clearance Status Banner */}
              <div className="p-4 bg-gradient-to-r from-emerald-950/40 to-[#0e0e0e] border border-emerald-500/30 rounded-xl space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck size={18} />
                    <span className="text-xs font-bold uppercase font-mono tracking-wider">
                      Academic & Hostel Clearance Active
                    </span>
                  </div>
                  <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                    100% Eligible
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  All mandatory Semester 6 tuition, hostel room rent, laboratory charges, and examination dues have been cleared. Zero financial hold on hall ticket generation.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-900/30 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-400 block">Total Cleared:</span>
                    <span className="text-white font-bold text-xs">
                      ₹{totalPaidFees.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">Outstanding Balance:</span>
                    <span className={`text-xs font-bold ${totalPendingFees === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      ₹{totalPendingFees.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dues Breakdown Cards with Pay Online Button */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Fee Payment & Invoices ({studentFees.length})
                  </h2>
                  <span className="text-[9px] font-mono text-indigo-400 font-bold">
                    BPUT SmartPay Gateway
                  </span>
                </div>

                <div className="space-y-2.5">
                  {studentFees.map((fee) => (
                    <div
                      key={fee.id}
                      className="p-3.5 bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold block">
                            {fee.category} Fee
                          </span>
                          <h4 className="text-xs font-bold text-white mt-0.5">{fee.title}</h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Due Date: {fee.dueDate}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold font-mono text-white block">
                            ₹{fee.amount.toLocaleString('en-IN')}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${
                              fee.status === 'paid'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {fee.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a] text-[10px] font-mono">
                        {fee.status === 'paid' ? (
                          <>
                            <span className="text-slate-400">
                              Receipt: {fee.receiptNo} ({fee.paidAt})
                            </span>
                            <button
                              onClick={() => setViewingReceipt(fee)}
                              className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                            >
                              <FileText size={11} />
                              <span>View Receipt</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-amber-400 font-bold">Pending Clearance</span>
                            <button
                              onClick={() => setPayingFee(fee)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow transition-colors flex items-center gap-1"
                            >
                              <CreditCard size={12} />
                              <span>Pay Online</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 4: ACADEMIC SCHEDULE & ATTENDANCE                      */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'academic' && (
        <div className="space-y-3.5 px-2">
          {/* Attendance Overview Card */}
          <div className="p-4 bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold block">
                  BPUT Attendance Eligibility
                </span>
                <h3 className="text-xs font-bold text-white">
                  6th Semester Aggregate Attendance
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/30">
                {avgAttendance}%
              </span>
            </div>

            {/* Course-wise Breakdown */}
            <div className="space-y-2 pt-1">
              {myClasses.map((cls) => (
                <div key={cls.id} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 font-medium">
                      {cls.subjectCode}: {cls.subjectName.split(' ')[0]} {cls.subjectName.split(' ')[1]}
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {cls.attendanceRate}%
                    </span>
                  </div>
                  <div className="w-full bg-[#1c1c1c] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, cls.attendanceRate)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('classroom')}
              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono transition-colors flex items-center justify-center gap-1.5 shadow mt-2"
            >
              <GraduationCap size={14} />
              <span>Open Classroom & Full Lecture Register</span>
            </button>
          </div>

          {/* Today's Timetable Schedule */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Today's Lecture Schedule
              </h3>
              <span className="text-[9px] font-mono text-emerald-400 font-bold">
                ● Monday Timetable
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-[#0f1712] border border-emerald-500/40 rounded-xl space-y-1 shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold animate-pulse">
                      ● LIVE NOW (10:00 - 11:00 AM)
                    </span>
                    <h4 className="text-xs font-bold text-white mt-0.5">
                      CS601: Distributed Systems & Cloud
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-emerald-300 border border-emerald-500/30">
                    HALL 301
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-emerald-900/30 flex justify-between">
                  <span>Prof. Sneha Mohanty</span>
                  <span>Aryabhatta Block</span>
                </div>
              </div>

              <div className="p-3 bg-[#0e0e0e] border border-[#1e1e1e] rounded-xl space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono text-slate-400">
                      11:15 AM - 12:15 PM
                    </span>
                    <h4 className="text-xs font-bold text-white mt-0.5">
                      CS605: Machine Learning & Deep Nets
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#181818] text-slate-300 border border-[#282828]">
                    HALL 202
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-[#181818] flex justify-between">
                  <span>Dr. B. K. Panda</span>
                  <span>Kalam Block</span>
                </div>
              </div>

              <div className="p-3 bg-[#0e0e0e] border border-[#1e1e1e] rounded-xl space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono text-slate-400">
                      02:00 PM - 05:00 PM
                    </span>
                    <h4 className="text-xs font-bold text-white mt-0.5">
                      CS602: Compiler Lab & AST Generator
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#181818] text-slate-300 border border-[#282828]">
                    LAB 4
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-[#181818] flex justify-between">
                  <span>Prof. Sneha Mohanty</span>
                  <span>Software Complex</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Gate Pass Application Modal */}
      {isRequestPassOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
          <div className="bg-[#101010] border border-[#222] w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="p-4 border-b border-[#1c1c1c] flex items-center justify-between bg-[#141414]">
              <div>
                <h3 className="text-xs font-bold text-white">Generate Campus Gate Pass</h3>
                <p className="text-[10px] text-slate-400 font-mono">BPUT Hostel Outing Protocol</p>
              </div>
              <button
                onClick={() => setIsRequestPassOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePassSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Pass Classification
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['day_out', 'night_out', 'emergency', 'market_pass'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPassType(t)}
                      className={`p-2 rounded border font-mono text-[10px] uppercase font-bold text-center ${
                        passType === t
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-[#161616] border-[#222] text-slate-400'
                      }`}
                    >
                      {t.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Destination *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Canteen Market / City Library"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-[#161616] border border-[#262626] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Reason for Outing *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hardware components procurement for capstone project"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#161616] border border-[#262626] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Expected Exit
                  </label>
                  <input
                    type="text"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full bg-[#161616] border border-[#262626] rounded px-2.5 py-1.5 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Curfew Return
                  </label>
                  <input
                    type="text"
                    value={expectedReturnTime}
                    onChange={(e) => setExpectedReturnTime(e.target.value)}
                    className="w-full bg-[#161616] border border-[#262626] rounded px-2.5 py-1.5 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Parent / Guardian Contact
                </label>
                <input
                  type="text"
                  value={parentContact}
                  onChange={(e) => setParentContact(e.target.value)}
                  className="w-full bg-[#161616] border border-[#262626] rounded px-3 py-1.5 text-white text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow mt-2"
              >
                Submit Outing Pass Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Document Application Modal */}
      <ApplyDocumentModal
        isOpen={isApplyDocOpen}
        onClose={() => setIsApplyDocOpen(false)}
        defaultType={applyDocDefaultType}
      />

      {/* 3. Certificate Viewer Modal */}
      <CertificateViewerModal
        application={viewingCertificate}
        onClose={() => setViewingCertificate(null)}
      />

      {/* 4. Fee Payment Modal */}
      <FeePaymentModal
        fee={payingFee}
        onClose={() => setPayingFee(null)}
      />

      {/* 5. Receipt Viewer Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
          <div className="bg-[#101010] border border-[#222] w-full max-w-md rounded-t-2xl sm:rounded-2xl p-4 space-y-3 text-xs shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <h3 className="font-bold text-white text-xs uppercase font-mono">
                  Official Payment Receipt
                </h3>
              </div>
              <button
                onClick={() => setViewingReceipt(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-[#141414] rounded-lg border border-[#222] space-y-1.5 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt Ref:</span>
                <span className="text-white font-bold">{viewingReceipt.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="text-white">{viewingReceipt.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Cleared:</span>
                <span className="text-emerald-400 font-bold">
                  ₹{viewingReceipt.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date Paid:</span>
                <span className="text-slate-300">{viewingReceipt.paidAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Gateway:</span>
                <span className="text-slate-300">{viewingReceipt.paymentMode || 'Instant BPUT SmartPay'}</span>
              </div>
            </div>

            <button
              onClick={() => setViewingReceipt(null)}
              className="w-full py-2 rounded-lg bg-[#222] hover:bg-[#282828] text-white font-bold text-xs"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* 6. Application Details BottomSheet (for Review/Approval) */}
      <AndroidBottomSheet
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title={selectedApp?.title || 'Application Review'}
      >
        {selectedApp && (
          <div className="space-y-4 text-xs text-white">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-slate-400">Application Reference:</span>
              <span className="text-indigo-400 font-bold">{selectedApp.id}</span>
            </div>

            <div className="p-3 bg-[#121212] rounded-lg border border-[#1a1a1a] space-y-1 text-[11px] font-mono">
              {Object.entries(selectedApp.details).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-slate-400">{k}:</span>
                  <span className="text-white font-medium">{v}</span>
                </div>
              ))}
            </div>

            {canApprove && selectedApp.status !== 'approved' && (
              <div className="space-y-2 pt-2 border-t border-[#1a1a1a]">
                <label className="text-[10px] font-mono text-slate-400 uppercase block">
                  Official Verification Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Endorsed with digital signature"
                  value={approvalRemarks}
                  onChange={(e) => setApprovalRemarks(e.target.value)}
                  className="w-full bg-[#141414] border border-[#222] rounded px-3 py-1.5 text-xs text-white"
                />
                <button
                  onClick={handleApprove}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Approve & Sign as {currentUser.name}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </AndroidBottomSheet>
    </div>
  );
}
