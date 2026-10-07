import { useState } from 'react';
import { ClassroomNote } from '../../types';
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react';

interface UploadNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (note: {
    title: string;
    unit: string;
    description: string;
    fileName: string;
    fileSize: string;
    fileType: ClassroomNote['fileType'];
    tags: string[];
    contentSnippet?: string;
  }) => void;
  subjectCode: string;
}

export function UploadNoteModal({ isOpen, onClose, onUpload, subjectCode }: UploadNoteModalProps) {
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState('Unit 1: Architectures & IPC');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState<ClassroomNote['fileType']>('pdf');
  const [fileName, setFileName] = useState('');
  const [tagInput, setTagInput] = useState('#LectureNotes, #ExamPrep');
  const [synopsis, setSynopsis] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const generatedFileName = fileName.trim() || `${subjectCode}_${title.trim().replace(/\s+/g, '_').slice(0, 24)}.${fileType === 'slides' ? 'pptx' : fileType === 'code' ? 'zip' : 'pdf'}`;
    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    onUpload({
      title: title.trim(),
      unit: unit.trim(),
      description: description.trim() || `Course study material for ${unit}.`,
      fileName: generatedFileName,
      fileSize: `${(Math.random() * 4 + 1.5).toFixed(1)} MB`,
      fileType,
      tags: tags.length > 0 ? tags : [`#${subjectCode}`, '#CourseNotes'],
      contentSnippet: synopsis.trim() || undefined,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setFileName('');
      setSynopsis('');
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="bg-[#101010] border border-[#222] w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#1c1c1c] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Upload size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Share Classroom Study Material</h3>
              <p className="text-[10px] text-slate-400 font-mono">Publish to {subjectCode} Repository</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-[#222] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto no-scrollbar space-y-3.5 text-xs">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle2 size={40} className="text-emerald-400 animate-bounce" />
              <span className="text-sm font-bold text-white">Study Material Published!</span>
              <p className="text-[11px] text-slate-400 font-mono">All enrolled scholars now have access to this note.</p>
            </div>
          ) : (
            <>
              {/* Document Type Selector */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1.5 font-bold">
                  Document Format
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['pdf', 'slides', 'notes', 'code'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFileType(type)}
                      className={`py-1.5 px-2 rounded border text-center font-mono text-[10px] font-bold uppercase transition-all ${
                        fileType === type
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-[#181818] border-[#252525] text-slate-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                  Material Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3: Kubernetes Architecture & Pod Lifecycle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#161616] border border-[#262626] rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              {/* Module / Unit */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                  Curriculum Module / Unit
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unit 2: Consensus Protocols or Lab Experiment 3"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-[#161616] border border-[#262626] rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                  Overview & Key Takeaways
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of syllabus points covered..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#161616] border border-[#262626] rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs resize-none"
                />
              </div>

              {/* Synopsis / Document Snippet */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                  Key Formulas / Snippet (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Paste important formulas, state machine rules, or definitions..."
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  className="w-full bg-[#161616] border border-[#262626] rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs font-mono resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                  Categorization Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="#MidSemPrep, #Formulas, #BPUT"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full bg-[#161616] border border-[#262626] rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={14} />
                  <span>Publish Study Material</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
