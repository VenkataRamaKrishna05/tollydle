import { Trophy, Info } from "lucide-react";

export default function Header({ onShowStats, dayNumber }) {
  return (
    <header className="glass-header w-full">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
            <span className="text-white font-black text-xl">T</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100 leading-none">
              Tollydle
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
              Daily Telugu Movie Guess
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Puzzle</p>
            <p className="text-sm font-mono text-sky-400 font-bold leading-none">#{dayNumber}</p>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <button
              onClick={onShowStats}
              className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-sky-400"
              title="Statistics"
            >
              <Trophy size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
