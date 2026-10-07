import React, { useState, useRef } from 'react';
import { useAppStore } from '../../../services/store';
import { FeedIssueItem } from '../../../types';
import {
  X,
  Megaphone,
  Zap,
  Droplets,
  Wifi,
  Wrench,
  Camera,
  Trash2,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface RaiseIssueFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

type IssueCategoryType = 'Electrical' | 'Plumbing' | 'Network' | 'General';

const CATEGORIES: { id: IssueCategoryType; label: string; icon: string; desc: string }[] = [
  { id: 'Electrical', label: 'Electrical', icon: '💡', desc: 'Lighting, power sockets, fans' },
  { id: 'Plumbing', label: 'Plumbing', icon: '💧', desc: 'Water cooler, taps, leakage' },
  { id: 'Network', label: 'Network', icon: '📶', desc: 'Wi-Fi, LAN port, server access' },
  { id: 'General', label: 'General', icon: '⚙️', desc: 'Furniture, doors, sanitation' },
];

export function RaiseIssueForm({ isOpen, onClose, onSuccessToast }: RaiseIssueFormProps) {
  const { currentUser, createFeedItem } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IssueCategoryType>('Network');
  const [location, setLocation] = useState('Central Library / Hostel Quad');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setImagePreview(blobUrl);
    }
  };

  const handleRemovePhoto = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newIssue: FeedIssueItem = {
      id: `feed_issue_${Date.now()}`,
      type: 'issue',
      authorName: currentUser.name || 'Arya Pattnayak',
      authorRollNo: currentUser.rollNo || '2501CSE008',
      authorRole: `${currentUser.department || 'CSE'} Scholar`,
      authorAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      title: title.trim(),
      description: description.trim(),
      category: `${category} & Facilities`,
      location: location.trim() || 'Campus Grounds & Hostels',
      status: 'open',
      upvotedBy: [currentUser.id || 'usr_student_01'],
      timestamp: 'Just now',
      targetAudience: 'Campus Community',
      imageUrl: imagePreview || undefined,
    };

    createFeedItem(newIssue);
    setIsSubmitted(true);

    if (onSuccessToast) {
      onSuccessToast(`✓ Public issue "${title}" published to campus feed.`);
    }

    setTimeout(() => {
      setIsSubmitted(false);
      setTitle('');
      setDescription('');
      setLocation('Central Library / Hostel Quad');
      setImagePreview(null);
      onClose();
    }, 1200);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setTitle('');
    setDescription('');
    setImagePreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none font-sans animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-t-[32px] sm:rounded-3xl p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Megaphone size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Raise Public Issue
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Community Grievance Feed with Peer Upvotes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {isSubmitted ? (
          /* Success Animation */
          <div className="py-10 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="h-20 w-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-xl">
              <CheckCircle2 size={40} className="animate-bounce" />
            </div>
            <div className="space-y-1">
              <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Issue Published
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight pt-1">
                Broadcasted to Community Feed
              </h3>
              <p className="text-xs text-zinc-400 font-mono max-w-xs mx-auto">
                Scholars can now upvote to escalate facility repairs.
              </p>
            </div>
          </div>
        ) : (
          /* Form Fields */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Issue Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 2nd Floor Library Wi-Fi disconnected"
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Field 2: Category (Grid of visual icons: Electrical, Plumbing, Network, General) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Category *
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                      category === cat.id
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{cat.icon}</span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block text-white leading-tight">
                        {cat.label}
                      </span>
                      <span className="text-[10px] text-zinc-400 block truncate mt-0.5">
                        {cat.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Field 3: Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Location *</span>
                <span className="text-[10px] text-zinc-500 font-mono">Building / Room</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Central Library 2nd Floor / Hostel Block B"
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <MapPin size={16} className="absolute right-3.5 top-3 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* Field 4: Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the issue, impact on scholars, and how long it has persisted..."
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Photo Attachment (Task 3) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Photo Attachment</span>
                <span className="text-[10px] text-zinc-500 font-mono">Visual Evidence</span>
              </label>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              {imagePreview ? (
                /* Image Preview with Remove Button */
                <div className="relative rounded-2xl overflow-hidden border border-zinc-700 shadow-lg group">
                  <img
                    src={imagePreview}
                    alt="Issue Preview"
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-1.5 px-3 rounded-xl bg-zinc-900/90 text-white font-mono text-xs flex items-center gap-1.5 border border-zinc-700"
                    >
                      <Camera size={14} />
                      <span>Change</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="py-1.5 px-3 rounded-xl bg-rose-600/90 text-white font-mono text-xs flex items-center gap-1.5 border border-rose-500"
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white sm:hidden"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                /* Prominent 'Attach Photo' Button */
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-2xl border border-dashed border-zinc-700 hover:border-amber-500 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2.5 text-xs font-semibold group"
                >
                  <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                    <Camera size={16} />
                  </div>
                  <span>📷 Attach Photo</span>
                  <span className="text-[10px] text-zinc-500 font-mono">(PNG, JPG or Camera)</span>
                </button>
              )}
            </div>

            {/* Large Prominent Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-600/35 active:scale-[0.98] transition-all"
              >
                <span>Post Issue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
