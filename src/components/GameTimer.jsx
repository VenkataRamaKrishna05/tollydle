import { Timer } from "lucide-react";

export default function GameTimer({ elapsed, isCritical }) {
  function formatClock(totalSeconds) {
    const safeSeconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${
      isCritical 
        ? "bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse" 
        : "bg-sky-500/10 border-sky-500/30 text-sky-400"
    }`}>
      <Timer size={14} className={isCritical ? "animate-spin-slow" : ""} />
      <span className="text-xs font-mono font-bold tracking-wider">
        {formatClock(elapsed)}
      </span>
    </div>
  );
}
