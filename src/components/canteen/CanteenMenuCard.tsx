import { useState } from 'react';
import { useAppStore } from '../../services/store';
import { Utensils, Edit3, Check, Clock, Star, MessageSquare } from 'lucide-react';
import { AndroidBottomSheet } from '../android/AndroidBottomSheet';

export function CanteenMenuCard() {
  const { canteenMenu, updateCanteenMenu, currentRole, setActiveTab, messFeedback } = useAppStore();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [breakfast, setBreakfast] = useState(canteenMenu.breakfast);
  const [lunch, setLunch] = useState(canteenMenu.lunch);
  const [snacks, setSnacks] = useState(canteenMenu.snacks);
  const [dinner, setDinner] = useState(canteenMenu.dinner);
  const [specialDish, setSpecialDish] = useState(canteenMenu.specialDish || '');
  const [isVegOnly, setIsVegOnly] = useState(canteenMenu.isVegOnly);

  const canEdit = ['canteen', 'admin', 'warden'].includes(currentRole);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCanteenMenu({
      breakfast,
      lunch,
      snacks,
      dinner,
      specialDish,
      isVegOnly,
      lastUpdated: 'Just now',
    });
    setIsEditOpen(false);
  };

  return (
    <div className="bg-[#0e0e0e] border-b border-[#1c1c1c] p-3 space-y-2.5 select-none text-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Campus Canteen and Mess Menu
            </span>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.2 rounded-sm ${
                canteenMenu.isVegOnly
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {canteenMenu.isVegOnly ? 'VEG ONLY TODAY' : 'STANDARD / NON-VEG OPTION'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {canteenMenu.date} • Last updated {canteenMenu.lastUpdated}
          </span>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#181818] hover:bg-[#222] text-slate-300 text-xs font-medium border border-[#262626]"
          >
            <Edit3 size={12} />
            <span>Update</span>
          </button>
        )}
      </div>

      {/* Meals Grid */}
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <div className="bg-[#121212] p-2 space-y-0.5">
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Breakfast</span>
            <span>07:30 - 09:30</span>
          </div>
          <p className="font-semibold text-slate-200 text-[11px]">{canteenMenu.breakfast}</p>
        </div>

        <div className="bg-[#121212] p-2 space-y-0.5">
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Lunch</span>
            <span>12:30 - 14:30</span>
          </div>
          <p className="font-semibold text-slate-200 text-[11px]">{canteenMenu.lunch}</p>
        </div>

        <div className="bg-[#121212] p-2 space-y-0.5">
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Evening Snacks</span>
            <span>17:00 - 18:00</span>
          </div>
          <p className="font-semibold text-slate-200 text-[11px]">{canteenMenu.snacks}</p>
        </div>

        <div className="bg-[#121212] p-2 space-y-0.5">
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Dinner</span>
            <span>20:00 - 22:00</span>
          </div>
          <p className="font-semibold text-slate-200 text-[11px]">{canteenMenu.dinner}</p>
        </div>
      </div>

      {canteenMenu.specialDish && (
        <div className="p-2 bg-[#121212] border-l-2 border-amber-500 text-[11px] flex justify-between items-center">
          <div>
            <span className="text-[10px] text-amber-400 font-mono uppercase block">
              Today's Dining Special:
            </span>
            <span className="font-semibold text-white">{canteenMenu.specialDish}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Dining Hall Mess 2</span>
        </div>
      )}

      {/* Link to Dining Feedback & Rating in Hostel Desk */}
      <div className="pt-1 flex items-center justify-between text-[10px] font-mono border-t border-[#1a1a1a]">
        <div className="flex items-center gap-1 text-amber-400">
          <Star size={11} className="fill-amber-400" />
          <span className="font-bold">4.4 / 5.0 Rating</span>
          <span className="text-slate-500">({messFeedback.length} Reviews)</span>
        </div>
        <button
          onClick={() => setActiveTab('issues')}
          className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5"
        >
          <span>Rate Meal & Feedback →</span>
        </button>
      </div>

      {/* UPDATE MENU BOTTOM SHEET */}
      <AndroidBottomSheet
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Update Canteen and Mess Menu"
        subtitle="Changes reflect instantly on all student feeds"
      >
        <form onSubmit={handleSave} className="space-y-3 pt-2 text-xs">
          <div>
            <label className="text-slate-400 block mb-0.5">Breakfast (07:30 - 09:30)</label>
            <input
              type="text"
              required
              value={breakfast}
              onChange={(e) => setBreakfast(e.target.value)}
              className="w-full bg-[#141414] border-b border-[#2b2b2b] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-0.5">Lunch (12:30 - 14:30)</label>
            <input
              type="text"
              required
              value={lunch}
              onChange={(e) => setLunch(e.target.value)}
              className="w-full bg-[#141414] border-b border-[#2b2b2b] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-0.5">Evening Snacks (17:00 - 18:00)</label>
            <input
              type="text"
              required
              value={snacks}
              onChange={(e) => setSnacks(e.target.value)}
              className="w-full bg-[#141414] border-b border-[#2b2b2b] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-0.5">Dinner (20:00 - 22:00)</label>
            <input
              type="text"
              required
              value={dinner}
              onChange={(e) => setDinner(e.target.value)}
              className="w-full bg-[#141414] border-b border-[#2b2b2b] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-0.5">Special Dish (Optional)</label>
            <input
              type="text"
              value={specialDish}
              onChange={(e) => setSpecialDish(e.target.value)}
              className="w-full bg-[#141414] border-b border-[#2b2b2b] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="vegCheck"
              checked={isVegOnly}
              onChange={(e) => setIsVegOnly(e.target.checked)}
              className="h-4 w-4 bg-slate-800 text-indigo-600 focus:ring-0"
            />
            <label htmlFor="vegCheck" className="text-slate-300">
              Strictly Vegetarian Menu Today
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow mt-2"
          >
            Publish Daily Menu
          </button>
        </form>
      </AndroidBottomSheet>
    </div>
  );
}
