import { ClassroomNote } from '../../types';
import { X, Download, FileText, Calendar, User, Eye, CheckCircle2, Share2, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface NoteViewerModalProps {
  note: ClassroomNote | null;
  onClose: () => void;
  onDownload: (note: ClassroomNote) => void;
}

export function NoteViewerModal({ note, onClose, onDownload }: NoteViewerModalProps) {
  const [copied, setCopied] = useState(false);

  if (!note) return null;

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBadgeColor = (type: ClassroomNote['fileType']) => {
    switch (type) {
      case 'pdf':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'slides':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'code':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="bg-[#101010] border border-[#222] w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#1c1c1c] flex items-start justify-between bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${getBadgeColor(note.fileType)}`}>
                  {note.fileType.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{note.fileSize}</span>
              </div>
              <h3 className="text-xs font-bold text-white mt-1 line-clamp-1">{note.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-[#222] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto no-scrollbar space-y-4 text-xs text-slate-300">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a]">
            <div className="flex items-center gap-2">
              <User size={13} className="text-slate-500" />
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-mono block">Uploader</span>
                <span className="text-[11px] font-semibold text-slate-200 truncate block">
                  {note.uploadedBy}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-slate-500" />
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-mono block">Published Date</span>
                <span className="text-[11px] font-semibold text-slate-200 font-mono block">
                  {note.uploadDate}
                </span>
              </div>
            </div>
          </div>

          {/* Unit / Module info */}
          <div className="p-3 bg-[#151515] rounded-lg border border-[#222]">
            <span className="text-[9px] font-mono uppercase text-indigo-400 font-bold block mb-1">
              Curriculum Unit
            </span>
            <p className="text-[12px] font-semibold text-white">{note.unit}</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{note.description}</p>
          </div>

          {/* Simulated Document Reader / Synopsis */}
          <div className="p-3.5 bg-[#080808] rounded-lg border border-[#1f1f1f] space-y-2">
            <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-2">
              <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1.5 uppercase">
                <BookOpen size={12} />
                Verified Syllabus Synopsis & Key Concepts
              </span>
              <span className="text-[9px] font-mono text-slate-500">Document Excerpt</span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono leading-relaxed bg-[#0c0c0c] p-2.5 rounded border border-[#181818]">
              {note.contentSnippet ||
                'Lecture material thoroughly mapped to BPUT Semester 6 syllabus guidelines. Includes step-by-step mathematical proofs, architectural diagrams, model exam questions, and laboratory experiment pointers.'}
            </p>
          </div>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {note.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1a1a1a] text-slate-400 border border-[#262626]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-3 border-t border-[#1c1c1c] bg-[#141414] flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-2 px-3 rounded-lg bg-[#202020] hover:bg-[#282828] text-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 size={13} />
                <span>Share Reference</span>
              </>
            )}
          </button>
          <button
            onClick={() => onDownload(note)}
            className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow transition-colors"
          >
            <Download size={13} />
            <span>Download ({note.fileSize})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
