import { useEffect } from "react";
import { X, Trophy, Target, Zap, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StatsModal({ isOpen, onClose, stats, winRate }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const statItems = [
    { label: "Played", value: stats.played, icon: <Zap size={16} /> },
    { label: "Wins", value: stats.wins, icon: <Trophy size={16} /> },
    { label: "Streak", value: stats.currentStreak, icon: <TrendingUp size={16} />, highlight: true },
    { label: "Best", value: stats.maxStreak, icon: <Target size={16} /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Your Progress Statistics">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                  Your Progress
                </h2>
                <button
                  onClick={onClose}
                  aria-label="Close statistics modal"
                  className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {statItems.map((item) => (
                  <div key={item.label} className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      {item.icon}
                      <span className="text-[10px] uppercase tracking-widest font-bold">{item.label}</span>
                    </div>
                    <div className={`text-3xl font-extrabold ${item.highlight ? "text-sky-400" : "text-slate-100"}`}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-800/20 rounded-2xl p-6 border border-slate-700/30 mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-300">Win Rate</span>
                  <span className="text-sm font-bold text-sky-400">{winRate}%</span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${winRate}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-sky-600 to-indigo-500 rounded-full shadow-[0_0_12px_rgba(14,165,233,0.3)]"
                  />
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-all active:scale-[0.98] shadow-lg shadow-sky-600/20"
              >
                Continue Playing
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
