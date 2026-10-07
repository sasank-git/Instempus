import { useState } from 'react';
import { useAppStore } from '../../services/store';
import { MessFeedbackItem } from '../../types';
import { X, Star, UtensilsCrossed, Send, CheckCircle2 } from 'lucide-react';

interface MessFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMeal?: MessFeedbackItem['mealType'];
}

export function MessFeedbackModal({
  isOpen,
  onClose,
  defaultMeal = 'Lunch',
}: MessFeedbackModalProps) {
  const { addMessFeedback, currentUser } = useAppStore();

  const [mealType, setMealType] = useState<MessFeedbackItem['mealType']>(defaultMeal);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedDishes, setSelectedDishes] = useState<string[]>(['Paneer Butter Masala', 'Basmati Rice']);
  const [customDish, setCustomDish] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const popularDishes = [
    'Paneer Butter Masala',
    'Basmati Rice',
    'Dal Tadka',
    'Tawa Roti',
    'Puri Sabji',
    'Chana Masala',
    'Sambar',
    'Curd / Raita',
    'Gulab Jamun',
  ];

  const toggleDish = (dish: string) => {
    if (selectedDishes.includes(dish)) {
      setSelectedDishes(selectedDishes.filter((d) => d !== dish));
    } else {
      setSelectedDishes([...selectedDishes, dish]);
    }
  };

  const handleAddCustomDish = () => {
    if (customDish.trim() && !selectedDishes.includes(customDish.trim())) {
      setSelectedDishes([...selectedDishes, customDish.trim()]);
      setCustomDish('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addMessFeedback({
      mealType,
      rating,
      comment: comment.trim(),
      dishesEvaluated: selectedDishes.length > 0 ? selectedDishes : ['General Meal Quality'],
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setComment('');
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="bg-[#101010] border border-[#222] w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#1c1c1c] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <UtensilsCrossed size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Rate & Review Campus Dining</h3>
              <p className="text-[10px] text-slate-400 font-mono">Central Mess Quality Committee</p>
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
              <span className="text-sm font-bold text-white">Dining Feedback Recorded!</span>
              <p className="text-[11px] text-slate-400 font-mono">
                Thank you. Ratings directly impact monthly mess vendor inspection audits.
              </p>
            </div>
          ) : (
            <>
              {/* Meal Selector */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                  Select Meal Session
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Breakfast', 'Lunch', 'Snacks', 'Dinner'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMealType(m)}
                      className={`py-1.5 rounded border text-center font-mono text-[10px] font-bold transition-all ${
                        mealType === m
                          ? 'bg-amber-600 border-amber-500 text-white'
                          : 'bg-[#181818] border-[#252525] text-slate-400 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Star Rating */}
              <div className="p-3 bg-[#141414] rounded-xl border border-[#222] text-center space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  Overall Taste & Hygiene Rating
                </span>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        size={26}
                        className={
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600 stroke-[1.5]'
                        }
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-300 block">
                  {rating === 5
                    ? 'Excellent • Highly Commendable'
                    : rating === 4
                    ? 'Good • Fresh & Clean'
                    : rating === 3
                    ? 'Average • Needs Improvement'
                    : 'Unsatisfactory • Flagged to Committee'}
                </span>
              </div>

              {/* Evaluated Dishes Pills */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                  Items Consumed (Tap to Select)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {popularDishes.map((dish) => (
                    <button
                      key={dish}
                      type="button"
                      onClick={() => toggleDish(dish)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-colors border ${
                        selectedDishes.includes(dish)
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                          : 'bg-[#161616] text-slate-400 border-[#252525] hover:text-white'
                      }`}
                    >
                      {selectedDishes.includes(dish) ? '✓ ' : ''}{dish}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                  Suggestions / Feedback Comments *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share details on salt balance, hot food serving, hygiene, or queue management..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-[#161616] border border-[#262626] rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-xs resize-none"
                />
              </div>

              <div className="p-2.5 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">Reviewer:</span>
                <span className="text-white font-bold">
                  {currentUser.name} ({currentUser.rollNo})
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  <span>Publish Meal Review</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
