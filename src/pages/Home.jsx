import { useNavigate } from "react-router-dom";
import { Play, Flame, Film } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md glass rounded-3xl p-8 sm:p-10 text-center space-y-8 relative z-10 shadow-2xl border border-slate-800/80">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-sky-500/20">
            <Film size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight">Tollydle</h1>
          <p className="text-sm text-slate-400 font-medium">
            The Ultimate Telugu Movie Guessing Game
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <button
            onClick={() => navigate("/play")}
            className="w-full py-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 rounded-2xl font-bold transition-all shadow-lg shadow-sky-600/25 active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
          >
            <Play size={20} className="fill-white" />
            Play Daily Movie
          </button>

          <button
            onClick={() => navigate("/play?mode=practice")}
            className="w-full py-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-2xl font-bold text-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
          >
            <Flame size={20} className="text-amber-400" />
            Practice Mode (Unlimited)
          </button>
        </div>

        <p className="text-xs text-slate-500">
          A new movie is selected every day at midnight!
        </p>
      </div>
    </div>
  );
}
