import { X, Film, Sparkles, Trophy, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
          className="relative w-full max-w-lg glass rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 max-h-[90vh] flex flex-col"
        >
          <div className="p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <HelpCircle className="text-sky-400" size={24} />
                How to Play Tollydle
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <div className="flex items-start gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/60">
                <Film className="text-sky-400 mt-1 shrink-0" size={20} />
                <div>
                  <h3 className="font-bold text-slate-100 mb-1">Guess the Daily Tollywood Movie</h3>
                  <p className="text-xs text-slate-400">
                    A new Telugu movie is chosen every midnight. You have <strong className="text-sky-400">5 attempts</strong> to guess it correctly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/60">
                <Sparkles className="text-indigo-400 mt-1 shrink-0" size={20} />
                <div>
                  <h3 className="font-bold text-slate-100 mb-1">Progressive Sentence Hints</h3>
                  <p className="text-xs text-slate-400 mb-2">
                    Each wrong attempt unlocks a clearer hint:
                  </p>
                  <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4">
                    <li><strong>Hint 1:</strong> Vague story setup / theme</li>
                    <li><strong>Hint 2:</strong> Inciting crisis / rising action</li>
                    <li><strong>Hint 3:</strong> Core turning point</li>
                    <li><strong>Hint 4:</strong> Specific plot conflict</li>
                    <li><strong>Hint 5:</strong> Star cast & director clue</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/60">
                <Trophy className="text-emerald-400 mt-1 shrink-0" size={20} />
                <div>
                  <h3 className="font-bold text-slate-100 mb-1">Maintain Your Daily Streak</h3>
                  <p className="text-xs text-slate-400">
                    Solve the puzzle every day to grow your winning streak. Your stats are saved automatically in your browser!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold transition-all active:scale-[0.98] shadow-lg shadow-sky-600/20"
            >
              Got it, let's play!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
