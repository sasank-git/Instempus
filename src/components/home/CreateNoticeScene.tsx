import { useState, useRef } from 'react';
import { useAppStore } from '../../services/store';
import { ArrowLeft, Send, Upload, Film, Image as ImageIcon, X } from 'lucide-react';

export function CreateNoticeScene() {
  const { setCreateSceneOpen, createNotice, currentUser } = useAppStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [groupName, setGroupName] = useState('Computer Science 6th Semester');
  const [tags, setTags] = useState('#academics #notice');
  const [isUrgent, setIsUrgent] = useState(false);

  // File upload state (Image or Video)
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      const isVideo = file.type.startsWith('video');
      setMediaType(isVideo ? 'video' : 'image');
      const previewUrl = URL.createObjectURL(file);
      setMediaPreviewUrl(previewUrl);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tagsArray = tags
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.startsWith('#'));

    createNotice(
      title.trim(),
      content.trim(),
      groupName,
      tagsArray.length ? tagsArray : ['#general'],
      isUrgent,
      mediaPreviewUrl || undefined
    );
  };

  return (
    <div className="min-h-full bg-black text-white p-4 space-y-4 pb-20 select-none animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f]">
        <button
          onClick={() => setCreateSceneOpen(false)}
          className="flex items-center gap-1 text-xs text-slate-300 hover:text-white"
        >
          <ArrowLeft size={16} />
          <span>Back to Feed</span>
        </button>

        <h2 className="text-xs font-bold tracking-wider uppercase text-slate-200">
          Create Group Notice
        </h2>

        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim()}
          className="text-xs font-bold text-indigo-400 disabled:text-slate-600 hover:text-indigo-300"
        >
          Publish
        </button>
      </div>

      <div className="text-[11px] text-slate-400 bg-[#0d0d0d] p-2.5 border-b border-[#1a1a1a]">
        Notices published here are dispatched directly to the selected group cohort.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Target Group Selector (Includes Canteen Menu Group!) */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Target Group / Enrolled Cohort
          </label>
          <select
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full bg-[#121212] border-b border-[#2a2a2a] px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="Computer Science 6th Semester">Computer Science 6th Semester</option>
            <option value="Campus Canteen and Mess Menu">Campus Canteen and Mess Menu</option>
            <option value="Hostel Block A Residents">Hostel Block A Residents</option>
            <option value="Computer Science Department (All Semesters)">
              Computer Science Department (All Semesters)
            </option>
            <option value="Central Institutional Notice (All Students)">
              Central Institutional Notice (All Students)
            </option>
            <option value="Faculty and Staff Only">Faculty and Staff Only</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Notice Title / Headline
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Official circular subject or daily menu headline..."
            className="w-full bg-[#121212] border-b border-[#2a2a2a] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Body */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Notice Content and Instructions
          </label>
          <textarea
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write official instructions or menu list (Breakfast, Lunch, Dinner)..."
            className="w-full bg-[#121212] border-b border-[#2a2a2a] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* REAL IMAGE & VIDEO FILE UPLOAD */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Upload Image or Video (From Phone / PC)
            </label>
            {mediaPreviewUrl && (
              <button
                type="button"
                onClick={handleRemoveMedia}
                className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-0.5"
              >
                <X size={12} />
                <span>Remove File</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
            id="mediaUploadInput"
          />

          {mediaPreviewUrl ? (
            <div className="relative bg-[#0a0a0a] overflow-hidden border border-[#262626]">
              {mediaType === 'video' ? (
                <video
                  src={mediaPreviewUrl}
                  controls
                  className="w-full max-h-56 object-contain"
                />
              ) : (
                <img
                  src={mediaPreviewUrl}
                  alt="Upload preview"
                  className="w-full max-h-56 object-cover"
                />
              )}
              <div className="p-2 bg-[#121212] text-[10px] text-slate-400 font-mono flex justify-between">
                <span>{mediaFile?.name}</span>
                <span>{(mediaFile!.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
            </div>
          ) : (
            <label
              htmlFor="mediaUploadInput"
              className="flex flex-col items-center justify-center p-6 bg-[#0e0e0e] border border-dashed border-[#333] hover:border-indigo-500 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <Upload size={18} />
                <ImageIcon size={18} />
                <Film size={18} />
              </div>
              <span className="text-xs font-semibold text-slate-300">
                Choose Image or Video File
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                Supports JPG, PNG, MP4, MOV from Camera or Disk
              </span>
            </label>
          )}
        </div>

        {/* Hashtags */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Categorization Tags
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="#academics #canteen #notice"
            className="w-full bg-[#121212] border-b border-[#2a2a2a] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Priority Urgent Toggle */}
        <div className="flex items-center justify-between p-3 bg-[#0d0d0d] border-b border-[#1a1a1a]">
          <div>
            <p className="text-xs font-bold text-white">Mark as Urgent Priority Circular</p>
            <p className="text-[10px] text-slate-400">Triggers priority placement in student feed</p>
          </div>
          <input
            type="checkbox"
            checked={isUrgent}
            onChange={(e) => setIsUrgent(e.target.checked)}
            className="h-4 w-4 bg-slate-800 text-indigo-600 focus:ring-0"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
        >
          <Send size={14} />
          <span>Publish Group Notice</span>
        </button>
      </form>
    </div>
  );
}
