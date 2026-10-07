import { useState } from 'react';
import { StudentFeeItem } from '../../types';
import { X, CreditCard, CheckCircle2, ShieldCheck, ArrowRight, Wallet, Building2, Smartphone } from 'lucide-react';
import { useAppStore } from '../../services/store';

interface FeePaymentModalProps {
  fee: StudentFeeItem | null;
  onClose: () => void;
}

export function FeePaymentModal({ fee, onClose }: FeePaymentModalProps) {
  const { payFeeItem, currentUser } = useAppStore();
  const [paymentMode, setPaymentMode] = useState<'upi' | 'netbanking' | 'card'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');

  if (!fee) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      payFeeItem(fee.id);
      setIsProcessing(false);
      setIsSuccess(true);
      setReceiptNumber(`BPUT-PAY-${Date.now().toString().slice(-6)}`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="bg-[#101010] border border-[#222] w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#1c1c1c] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CreditCard size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Institutional Fee Payment</h3>
              <p className="text-[10px] text-slate-400 font-mono">BPUT Online Clearance Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-[#222] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto no-scrollbar space-y-4 text-xs">
          {isSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">Payment Cleared Successfully!</span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold block mt-1">
                  Receipt: {receiptNumber}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Your academic clearance status has been updated in the accounts ledger.
                </p>
              </div>

              <div className="p-3 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] w-full text-left space-y-1 font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="text-white font-bold">₹{fee.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account:</span>
                  <span className="text-white">{currentUser.name} ({currentUser.rollNo})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode:</span>
                  <span className="text-emerald-400">BPUT SmartPay Gateway</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Fee Bill Summary */}
              <div className="p-3.5 bg-[#141414] rounded-xl border border-[#222] space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold block">
                      {fee.category} Fee
                    </span>
                    <h4 className="text-xs font-bold text-white mt-0.5">{fee.title}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-emerald-400">
                      ₹{fee.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-slate-500 block font-mono">Due: {fee.dueDate}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1e1e1e] flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Student: {currentUser.name}</span>
                  <span>Roll: {currentUser.rollNo}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                  Select Payment Method
                </label>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('upi')}
                    className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                      paymentMode === 'upi'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-[#141414] border-[#222] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Smartphone size={16} className="text-indigo-400" />
                      <div>
                        <span className="text-xs font-bold text-white block">UPI Instant Pay</span>
                        <span className="text-[10px] text-slate-400 font-mono">Google Pay, PhonePe, Paytm, BHIM</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">Zero Fee</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('netbanking')}
                    className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                      paymentMode === 'netbanking'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-[#141414] border-[#222] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 size={16} className="text-indigo-400" />
                      <div>
                        <span className="text-xs font-bold text-white block">Net Banking / SBI Collect</span>
                        <span className="text-[10px] text-slate-400 font-mono">HDFC, SBI, ICICI, Axis Bank</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">Institutional</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('card')}
                    className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                      paymentMode === 'card'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-[#141414] border-[#222] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard size={16} className="text-indigo-400" />
                      <div>
                        <span className="text-xs font-bold text-white block">Debit / Credit Card</span>
                        <span className="text-[10px] text-slate-400 font-mono">RuPay, Visa, MasterCard</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">Secure</span>
                  </button>
                </div>
              </div>

              {/* Security Badge */}
              <div className="p-2.5 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                <span>256-Bit Encrypted BPUT Institutional Accounts Gateway</span>
              </div>

              {/* Pay Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span>Processing Transaction...</span>
                  ) : (
                    <>
                      <span>Pay ₹{fee.amount.toLocaleString('en-IN')} & Clear Dues</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
