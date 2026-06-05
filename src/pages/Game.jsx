import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import curatedMovies from "../data/curated_manual_hints.json";
import allMovies from "../data/movies.json";
import { getTodayMovie } from "../utils/getTodayMovie";
import GuessInput from "../components/GuessInput";
import HintList from "../components/HintList";
import Header from "../components/Header";
import GameTimer from "../components/GameTimer";
import StatsModal from "../components/StatsModal";
import { Share2, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";

const MAX_ATTEMPTS = 5;
const MAX_HINTS = 5;
const GAME_TIME_LIMIT_SECONDS = 5 * 60;

function formatClock(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getSecondsUntilNextMovie(now) {
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return Math.floor((nextMidnight - now) / 1000);
}

function formatDuration(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes} min${minutes === 1 ? "" : "s"} and ${seconds} sec${seconds === 1 ? "" : "s"}`;
}

function getDayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function getPrimaryGenre(genre) {
  if (!genre) return null;
  return genre.split(",")[0]?.trim() || null;
}

function getDecadeLabel(yearValue) {
  const year = Number.parseInt(yearValue, 10);
  if (Number.isNaN(year)) return null;
  const decadeStart = Math.floor(year / 10) * 10;
  return `${decadeStart}s`;
}

function getInitials(name) {
  if (!name) return null;
  return name.split(/\s+/).map(p => p[0]?.toUpperCase()).filter(Boolean).join(".") + ".";
}

function getTitlePatternHint(title) {
  if (!title) return null;
  const words = title.trim().split(/\s+/).filter(Boolean);
  const compact = title.replace(/\s+/g, "").trim();
  return `Title clue: ${words.length} word${words.length === 1 ? "" : "s"}, starts with "${compact[0].toUpperCase()}" and ends with "${compact[compact.length - 1].toUpperCase()}".`;
}

function getMovieHints(movie) {
  const storyHints = Array.isArray(movie?.hints) ? movie.hints : [];
  if (storyHints.length > 0) return storyHints.slice(0, MAX_HINTS);
  
  return [
    getPrimaryGenre(movie.genre) ? `Hint: Primary genre is ${getPrimaryGenre(movie.genre)}.` : null,
    getDecadeLabel(movie.year) ? `Hint: Released in the ${getDecadeLabel(movie.year)}.` : null,
    getInitials(movie.director) ? `Hint: Director initials are ${getInitials(movie.director)}.` : null,
    getInitials(movie.actor) ? `Hint: Lead actor initials are ${getInitials(movie.actor)}.` : null,
    getTitlePatternHint(movie.title),
  ].filter(Boolean).slice(0, MAX_HINTS);
}

export default function Game() {
  const [now, setNow] = useState(new Date());
  const [dayKey, setDayKey] = useState(getDayKey(new Date()));
  const movie = getTodayMovie(curatedMovies, now);
  const allHints = getMovieHints(movie);

  const [attempts, setAttempts] = useState(0);
  const [visibleHints, setVisibleHints] = useState(allHints.slice(0, 1));
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [resultGrid, setResultGrid] = useState([]);
  const [guessHistory, setGuessHistory] = useState([]);
  const [gameStartedAt, setGameStartedAt] = useState(null);
  const [gameCompletedAt, setGameCompletedAt] = useState(null);
  const [shake, setShake] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem("tollydle-stats");
    return saved ? JSON.parse(saved) : { played: 0, wins: 0, currentStreak: 0, maxStreak: 0, lastPlayedDate: null, lastWinDate: null };
  });

  const baseDate = new Date(2024, 0, 1);
  const dayNumber = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - baseDate) / (1000 * 60 * 60 * 24)) + 1;

  function updateStats(didWin) {
    const today = getTodayString();
    setStats(prev => {
      if (prev.lastPlayedDate === today) return prev;
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      
      let newStreak = didWin ? (prev.lastWinDate === yesterdayStr ? prev.currentStreak + 1 : 1) : 0;
      const updated = {
        played: prev.played + 1,
        wins: didWin ? prev.wins + 1 : prev.wins,
        currentStreak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
        lastPlayedDate: today,
        lastWinDate: didWin ? today : prev.lastWinDate,
      };
      localStorage.setItem("tollydle-stats", JSON.stringify(updated));
      return updated;
    });
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = new Date();
      setNow(currentTime);
      setDayKey(getDayKey(currentTime));
      if (gameStartedAt && !gameOver) {
        if (Math.floor((currentTime - gameStartedAt) / 1000) >= GAME_TIME_LIMIT_SECONDS) {
          setMessage(`Time's up! The movie was "${movie.title}".`);
          setGameOver(true);
          setGameCompletedAt(currentTime);
          updateStats(false);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStartedAt, gameOver, movie.title]);

  function handleGuess(guess) {
    if (gameOver) return;
    const currentTime = new Date();
    const startedAt = gameStartedAt ?? currentTime;
    if (!gameStartedAt) setGameStartedAt(startedAt);

    const isCorrect = guess.trim().toLowerCase() === movie.title.toLowerCase();
    setGuessHistory(prev => [...prev, guess]);

    if (isCorrect) {
      setResultGrid(prev => [...prev, "🟩"]);
      setMessage(`Correct! You solved it in ${formatDuration(Math.floor((currentTime - startedAt) / 1000))}.`);
      setGameOver(true);
      setGameCompletedAt(currentTime);
      updateStats(true);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      return;
    }

    const nextAttempt = attempts + 1;
    setAttempts(nextAttempt);
    setVisibleHints(allHints.slice(0, nextAttempt + 1));
    setResultGrid(prev => [...prev, "🟥"]);
    setShake(true); setTimeout(() => setShake(false), 400);

    if (nextAttempt >= MAX_ATTEMPTS) {
      setMessage(`Game over! The movie was "${movie.title}".`);
      setGameOver(true);
      setGameCompletedAt(currentTime);
      updateStats(false);
    } else {
      setMessage("Not quite. Check the new hint!");
    }
  }

  const elapsed = gameStartedAt ? Math.floor(((gameCompletedAt ?? now) - gameStartedAt) / 1000) : 0;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center">
      <Header onShowStats={() => setShowStats(true)} dayNumber={dayNumber} />
      
      <main className="w-full max-w-2xl px-4 py-12 flex flex-col items-center gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex justify-center"
        >
          <GameTimer elapsed={elapsed} isCritical={elapsed > 240} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full glass rounded-[2.5rem] p-8 sm:p-12 relative shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 flex gap-1 pointer-events-none opacity-20">
             {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < attempts ? (resultGrid[i] === "🟩" ? "bg-emerald-500" : "bg-rose-500") : "bg-slate-700"}`} />
             ))}
          </div>

          <div className="space-y-12">
            <div className={shake ? "shake" : ""}>
              <GuessInput 
                onGuess={handleGuess} 
                onInputChange={(inp) => setSuggestions(inp.trim().length < 2 ? [] : allMovies.map(m => m.title).filter(t => t.toLowerCase().includes(inp.toLowerCase())).slice(0, 5))} 
                disabled={gameOver} 
                suggestions={suggestions} 
              />
            </div>

            <HintList hints={visibleHints} animated />

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold text-sm ${
                    message.startsWith("Correct") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
                    message.startsWith("Game over") ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : 
                    "bg-slate-800/80 text-slate-300 border border-slate-700/50"
                  }`}
                >
                  {message.startsWith("Correct") ? <CheckCircle2 size={18} /> : 
                   message.startsWith("Game over") ? <AlertCircle size={18} /> : 
                   <RotateCcw size={18} className="animate-spin-slow" />}
                  {message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {guessHistory.length > 0 && (
           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }}
             className="w-full space-y-4"
           >
             <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-4">Guess History</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {guessHistory.map((g, i) => (
                 <motion.div 
                   key={i} 
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="flex items-center justify-between bg-slate-900/40 px-5 py-3 rounded-2xl border border-slate-800/60"
                 >
                   <span className="text-sm font-medium text-slate-300 truncate">{g}</span>
                   <span className="text-lg">{resultGrid[i] === "🟩" ? "✅" : "❌"}</span>
                 </motion.div>
               ))}
             </div>
           </motion.div>
        )}

        {gameOver && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col gap-4"
          >
            <button
              onClick={() => {
                const grid = [...resultGrid, ...Array(MAX_ATTEMPTS - resultGrid.length).fill("⬜")].join(" ");
                navigator.clipboard.writeText(`🎬 Tollydle #${dayNumber}\n\n${grid}\n\n🔥 ${resultGrid.includes("🟩") ? "Victory!" : "Missed!"}\n📊 ${resultGrid.length}/5\n⏳ Play: tollydle.vercel.app`);
                alert("Copied to clipboard!");
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-sky-600/20 active:scale-[0.98] transition-all"
            >
              <Share2 size={20} />
              Share Result
            </button>
            <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              Next puzzle in <span className="font-mono font-bold text-slate-300">{formatClock(getSecondsUntilNextMovie(now))}</span>
            </p>
          </motion.div>
        )}
      </main>

      <StatsModal 
        isOpen={showStats} 
        onClose={() => setShowStats(false)} 
        stats={stats} 
        winRate={stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0} 
      />
    </div>
  );
}
