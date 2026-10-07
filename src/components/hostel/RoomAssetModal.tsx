import { RoomAssetItem, StudentRoomRecord } from '../../types';
import { X, BedDouble, CheckCircle2, AlertTriangle, ShieldCheck, Wrench } from 'lucide-react';

interface RoomAssetModalProps {
  roomRecord: StudentRoomRecord;
  isOpen: boolean;
  onClose: () => void;
  onReportAssetIssue: (assetTag: string, assetName: string) => void;
}

export function RoomAssetModal({
  roomRecord,
  isOpen,
  onClose,
  onReportAssetIssue,
}: RoomAssetModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="bg-[#101010] border border-[#222] w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#1c1c1c] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BedDouble size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Room & Fixture Asset Ledger</h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {roomRecord.hostelBlock} • Room {roomRecord.roomNo}
              </p>
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
        <div className="p-4 overflow-y-auto no-scrollbar space-y-3.5 text-xs">
          {/* Room Summary Card */}
          <div className="p-3 bg-[#151515] rounded-xl border border-[#222] space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold block">
                  Allocated Accommodation
                </span>
                <h4 className="text-xs font-bold text-white mt-0.5">
                  Room {roomRecord.roomNo} ({roomRecord.bedNo})
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px] border border-emerald-500/30">
                ★ {roomRecord.cleanlinessRating} / 5.0 Rating
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1e1e1e] text-[10px] font-mono text-slate-300">
              <div>
                <span className="text-slate-500 block">Roommate:</span>
                <span className="text-white font-semibold">
                  {roomRecord.roommateName} ({roomRecord.roommateRoll})
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Allotment Date:</span>
                <span className="text-white">{roomRecord.allocatedDate}</span>
              </div>
            </div>

            <div className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 p-2 rounded flex items-center gap-1.5 border border-emerald-500/20">
              <ShieldCheck size={13} className="shrink-0" />
              <span>Inspection: {roomRecord.lastInspectionDate}</span>
            </div>
          </div>

          {/* Asset List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                Assigned Furniture & Electrical Fixtures ({roomRecord.assets.length})
              </span>
              <span className="text-[9px] font-mono text-slate-500">BPUT Asset Tagged</span>
            </div>

            <div className="space-y-2">
              {roomRecord.assets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 bg-[#0e0e0e] border border-[#1e1e1e] rounded-xl space-y-1.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block">
                        {asset.assetTag}
                      </span>
                      <h5 className="text-xs font-bold text-white mt-0.5">{asset.name}</h5>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        asset.condition === 'Excellent' || asset.condition === 'Good'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {asset.condition.toUpperCase()}
                    </span>
                  </div>

                  {asset.remarks && (
                    <p className="text-[10px] text-slate-400 font-mono">{asset.remarks}</p>
                  )}

                  <div className="flex items-center justify-between pt-1.5 border-t border-[#181818] text-[9px] font-mono">
                    <span className="text-slate-500">Verified: {asset.lastInspected}</span>
                    <button
                      type="button"
                      onClick={() => {
                        onReportAssetIssue(asset.assetTag, asset.name);
                        onClose();
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                    >
                      <Wrench size={10} />
                      <span>Report Damage</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
