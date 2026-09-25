import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import curatedMovies from "../data/curated_manual_hints.json";
import allMoviesCombined from "../data/all_movies_combined.json";
import { getTodayMovie } from "../utils/getTodayMovie";
import { filterMovieSuggestions } from "../utils/fuzzySearch";
import GuessInput from "../components/GuessInput";
import HintList from "../components/HintList";
import Header from "../components/Header";
import GameTimer from "../components/GameTimer";
import StatsModal from "../components/StatsModal";
import HelpModal from "../components/HelpModal";
import { Share2, RotateCcw, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

const MAX_ATTEMPTS = 5;
const MAX_HINTS = 5;

function formatCountdown(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
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

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getYesterdayLocalDateString(date = new Date()) {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateString(yesterday);
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
  const [searchParams] = useSearchParams();
  const isPractice = searchParams.get("mode") === "practice";

  const [now, setNow] = useState(new Date());
  const todayStr = getLocalDateString(now);

  // Practice mode random movie index
  const [practiceIndex, setPracticeIndex] = useState(() => Math.floor(Math.random() * curatedMovies.length));

  const movie = isPractice ? curatedMovies[practiceIndex] : getTodayMovie(curatedMovies, now);
  const allHints = getMovieHints(movie);

  const stateStorageKey = isPractice ? null : `tollydle-state-${todayStr}`;

  const [savedState] = useState(() => {
    if (isPractice) return null;
    try {
      const saved = localStorage.getItem(stateStorageKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [attempts, setAttempts] = useState(savedState ? savedState.attempts : 0);
  const [visibleHints, setVisibleHints] = useState(() => {
    const hintCount = savedState ? Math.min(savedState.attempts + 1, MAX_HINTS) : 1;
    return allHints.slice(0, hintCount);
  });
  const [message, setMessage] = useState(savedState ? savedState.message : "");
  const [gameOver, setGameOver] = useState(savedState ? savedState.gameOver : false);
  const [suggestions, setSuggestions] = useState([]);
  const [resultGrid, setResultGrid] = useState(savedState ? savedState.resultGrid : []);
  const [guessHistory, setGuessHistory] = useState(savedState ? savedState.guessHistory : []);
  
  const [gameStartedAt, setGameStartedAt] = useState(() => new Date());
  const [gameCompletedAt, setGameCompletedAt] = useState(
    savedState && savedState.gameCompletedAt ? new Date(savedState.gameCompletedAt) : null
  );
  const [shake, setShake] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem("tollydle-stats");
    return saved ? JSON.parse(saved) : { played: 0, wins: 0, currentStreak: 0, maxStreak: 0, lastPlayedDate: null, lastWinDate: null };
  });

  const baseDate = new Date(2024, 0, 1);
  const dayNumber = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - baseDate) / (1000 * 60 * 60 * 24)) + 1;

  useEffect(() => {
    if (isPractice || !stateStorageKey) return;
    const stateToSave = {
      attempts,
      guessHistory,
      resultGrid,
      gameOver,
      message,
      gameCompletedAt: gameCompletedAt ? gameCompletedAt.toISOString() : null
    };
    localStorage.setItem(stateStorageKey, JSON.stringify(stateToSave));
  }, [attempts, guessHistory, resultGrid, gameOver, message, gameCompletedAt, stateStorageKey, isPractice]);

  function startNextPracticeMovie() {
    const nextIdx = (practiceIndex + 1) % curatedMovies.length;
    setPracticeIndex(nextIdx);
    setAttempts(0);
    setGuessHistory([]);
    setResultGrid([]);
    setGameOver(false);
    setMessage("");
    setGameStartedAt(new Date());
    setGameCompletedAt(null);
    const nextMovie = curatedMovies[nextIdx];
    setVisibleHints(getMovieHints(nextMovie).slice(0, 1));
  }

  function updateStats(didWin) {
    if (isPractice) return; // Do not alter daily streak in practice mode
    const today = getLocalDateString(now);
    setStats(prev => {
      if (prev.lastPlayedDate === today) return prev;
      const yesterdayStr = getYesterdayLocalDateString(now);
      
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
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function handleGuess(guess) {
    if (gameOver) return;
    const currentTime = new Date();
    const startedAt = gameStartedAt;
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

  async function handleShare() {
    const grid = [...resultGrid, ...Array(MAX_ATTEMPTS - resultGrid.length).fill("⬜")].join(" ");
    const shareText = isPractice 
      ? `🎬 Tollydle (Practice Mode)\n\n${grid}\n\n🔥 ${resultGrid.includes("🟩") ? "Victory!" : "Missed!"}\n📊 ${resultGrid.length}/5\n⏳ Play: https://tollydle.vercel.app`
      : `🎬 Tollydle #${dayNumber}\n\n${grid}\n\n🔥 ${resultGrid.includes("🟩") ? "Victory!" : "Missed!"}\n📊 ${resultGrid.length}/5\n⏳ Play: https://tollydle.vercel.app`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Tollydle",
          text: shareText,
          url: "https://tollydle.vercel.app",
        });
        return;
      } catch {
        // Fallback to clipboard if user cancels or browser blocks share
      }
    }

    navigator.clipboard.writeText(shareText);
    alert("Copied result to clipboard!");
  }

  const elapsed = gameStartedAt ? Math.floor(((gameCompletedAt ?? now) - gameStartedAt) / 1000) : 0;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center">
      <Header 
        onShowStats={() => setShowStats(true)} 
        onShowHelp={() => setShowHelp(true)}
        dayNumber={dayNumber} 
        isPractice={isPractice}
      />
      
      <main className="w-full max-w-2xl px-4 py-12 flex flex-col items-center gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex justify-center"
        >
          <GameTimer elapsed={elapsed} />
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
                onInputChange={(inp) => setSuggestions(filterMovieSuggestions(allMoviesCombined, inp))} 
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
              onClick={handleShare}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-sky-600/20 active:scale-[0.98] transition-all"
            >
              <Share2 size={20} />
              Share Result
            </button>

            {isPractice ? (
              <button
                onClick={startNextPracticeMovie}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20 active:scale-[0.98] transition-all"
              >
                <RefreshCw size={20} />
                Play Another Movie
              </button>
            ) : (
              <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                Next puzzle in <span className="font-mono font-bold text-slate-300">{formatCountdown(getSecondsUntilNextMovie(now))}</span>
              </p>
            )}
          </motion.div>
        )}
      </main>

      <StatsModal 
        isOpen={showStats} 
        onClose={() => setShowStats(false)} 
        stats={stats} 
        winRate={stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0} 
      />

      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}
