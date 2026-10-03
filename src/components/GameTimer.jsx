import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

export default function GameTimer({ gameStartedAt, gameCompletedAt }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (gameCompletedAt) return;
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [gameCompletedAt]);

  const end = gameCompletedAt ? new Date(gameCompletedAt) : now;
  const start = gameStartedAt ? new Date(gameStartedAt) : now;
  const elapsed = Math.max(0, Math.floor((end - start) / 1000));

  function formatClock(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return (
    <div
      className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border bg-sky-500/10 border-sky-500/30 text-sky-400 transition-all duration-300"
      role="timer"
      aria-label={`Elapsed time: ${formatClock(elapsed)}`}
    >
      <Timer size={14} />
      <span className="text-xs font-mono font-bold tracking-wider">
        {formatClock(elapsed)}
      </span>
    </div>
  );
}
