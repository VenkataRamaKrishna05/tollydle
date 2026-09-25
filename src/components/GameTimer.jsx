import { Timer } from "lucide-react";

export default function GameTimer({ elapsed }) {
  function formatClock(totalSeconds) {
    const safeSeconds = Math.max(0, totalSeconds);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return (
    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border bg-sky-500/10 border-sky-500/30 text-sky-400 transition-all duration-300">
      <Timer size={14} />
      <span className="text-xs font-mono font-bold tracking-wider">
        {formatClock(elapsed)}
      </span>
    </div>
  );
}
