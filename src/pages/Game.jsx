import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import movies from "../data/movies_with_hints.json";
import { getTodayMovie } from "../utils/getTodayMovie";
import GuessInput from "../components/GuessInput";
import HintList from "../components/HintList";

const MAX_ATTEMPTS = 5;
const MAX_HINTS = 5;
const GAME_TIME_LIMIT_SECONDS = 5 * 60;

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

  const initials = name
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z]/g, ""))
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .join(".");

  return initials ? `${initials}.` : null;
}

function getTitlePatternHint(title) {
  if (!title) return null;

  const words = title.trim().split(/\s+/).filter(Boolean);
  const compactTitle = title.replace(/\s+/g, "").trim();
  if (!compactTitle) return null;

  const firstChar = compactTitle[0].toUpperCase();
  const lastChar = compactTitle[compactTitle.length - 1].toUpperCase();

  return `Title clue: ${words.length} word${words.length === 1 ? "" : "s"}, starts with "${firstChar}" and ends with "${lastChar}".`;
}

function getMovieHints(movie) {
  const storyHints = Array.isArray(movie?.hints)
    ? movie.hints.map((hint) => hint?.trim()).filter(Boolean)
    : [];

  if (storyHints.length > 0) {
    return storyHints.slice(0, MAX_HINTS);
  }

  return [
    getPrimaryGenre(movie.genre)
      ? `Hint: Primary genre is ${getPrimaryGenre(movie.genre)}.`
      : null,
    getDecadeLabel(movie.year)
      ? `Hint: Released in the ${getDecadeLabel(movie.year)}.`
      : null,
    getInitials(movie.director)
      ? `Hint: Director initials are ${getInitials(movie.director)}.`
      : null,
    getInitials(movie.actor)
      ? `Hint: Lead actor initials are ${getInitials(movie.actor)}.`
      : null,
    getTitlePatternHint(movie.title),
  ]
    .filter(Boolean)
    .slice(0, MAX_HINTS);
}

export default function Game() {
  const [now, setNow] = useState(new Date());
  const [dayKey, setDayKey] = useState(getDayKey(new Date()));
  const movie = getTodayMovie(movies, now);

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

    return saved
      ? JSON.parse(saved)
      : {
          played: 0,
          wins: 0,
          currentStreak: 0,
          maxStreak: 0,
          lastPlayedDate: null,
          lastWinDate: null,
          freezeUsedDate: null,
        };
  });

  function updateStats(didWin) {
    const today = getTodayString();

    setStats((prev) => {
      if (prev.lastPlayedDate === today) return prev;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split("T")[0];

      const daysDiff =
        (new Date(today) - new Date(prev.lastPlayedDate)) /
        (1000 * 60 * 60 * 24);

      let newCurrentStreak = prev.currentStreak;
      let freezeUsedDate = prev.freezeUsedDate;

      // LOSS -> always reset
      if (!didWin) {
        newCurrentStreak = 0;
      }

      // WIN
      if (didWin) {
        if (prev.lastWinDate === yesterdayString) {
          newCurrentStreak += 1;
        } else if (daysDiff === 1) {
          newCurrentStreak = 1;
        }
        // Missed a day
        else if (daysDiff > 1) {
          const freezeAvailable =
            !freezeUsedDate ||
            (new Date(today) - new Date(freezeUsedDate)) >
              7 * 24 * 60 * 60 * 1000;

          if (freezeAvailable) {
            freezeUsedDate = today; // consume freeze
          } else {
            newCurrentStreak = 1;
          }
        } else {
          newCurrentStreak = 1;
        }
      }

      const updated = {
        played: prev.played + 1,
        wins: didWin ? prev.wins + 1 : prev.wins,
        currentStreak: newCurrentStreak,
        maxStreak: Math.max(prev.maxStreak, newCurrentStreak),
        lastPlayedDate: today,
        lastWinDate: didWin ? today : prev.lastWinDate,
        freezeUsedDate,
      };

      localStorage.setItem("tollydle-stats", JSON.stringify(updated));

      return updated;
    });
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTime = new Date();
      setNow(currentTime);
      setDayKey((previousDayKey) => {
        const currentDayKey = getDayKey(currentTime);
        return previousDayKey === currentDayKey ? previousDayKey : currentDayKey;
      });

      if (gameStartedAt && !gameOver) {
        const elapsed = Math.floor((currentTime - gameStartedAt) / 1000);
        if (elapsed >= GAME_TIME_LIMIT_SECONDS) {
          setMessage(`Time's up! The movie was "${movie.title}".`);
          setGameOver(true);
          setGameCompletedAt(currentTime);
          setSuggestions([]);
          updateStats(false);
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gameOver, gameStartedAt, movie.title]);

  useEffect(() => {
    setAttempts(0);
    setVisibleHints(allHints.slice(0, 1));
    setMessage("");
    setGameOver(false);
    setSuggestions([]);
    setResultGrid([]);
    setGuessHistory([]);
    setGameStartedAt(null);
    setGameCompletedAt(null);
    setShake(false);
    setShowStats(false);
  }, [dayKey, movie]);

  const timerReferenceTime = gameCompletedAt ?? now;
  const elapsedSeconds = gameStartedAt
    ? Math.floor((timerReferenceTime - gameStartedAt) / 1000)
    : 0;
  const secondsUntilNextMovie = getSecondsUntilNextMovie(now);

  const baseDate = new Date(2024, 0, 1);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayNumber =
    Math.floor((todayStart - baseDate) / (1000 * 60 * 60 * 24)) + 1;
  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const freezeAvailable =
    !stats.freezeUsedDate ||
    new Date() - new Date(stats.freezeUsedDate) > 7 * 24 * 60 * 60 * 1000;

  function getShareText() {
    const gridLine = [
      ...resultGrid,
      ...Array(MAX_ATTEMPTS - resultGrid.length).fill("⬜"),
    ].join(" ");

    return `🎬 Tollydle #${dayNumber}

${gridLine}

🔥 ${resultGrid.includes("🟩") ? "Victory!" : "Better luck tomorrow!"}
📊 ${resultGrid.length}/5
⏳ Play: yoursite.com`;
  }

  function handleGuess(guess) {
    if (gameOver) return;
    const currentTime = new Date();
    const startedAt = gameStartedAt ?? currentTime;
    if (!gameStartedAt) setGameStartedAt(startedAt);

    const isCorrect = guess.trim().toLowerCase() === movie.title.toLowerCase();

    setGuessHistory((prev) => [...prev, guess]);

    if (isCorrect) {
      const completionSeconds = Math.floor((currentTime - startedAt) / 1000);
      setResultGrid((prev) => [...prev, "🟩"]);
      setMessage(
        `Correct! You completed the game in ${formatDuration(completionSeconds)}.`
      );
      setGameOver(true);
      setGameCompletedAt(currentTime);
      setSuggestions([]);
      updateStats(true);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
      return;
    }

    const nextAttempt = attempts + 1;
    setAttempts(nextAttempt);
    setVisibleHints(allHints.slice(0, nextAttempt + 1));
    setResultGrid((prev) => [...prev, "🟥"]);
    setShake(true);
    setTimeout(() => setShake(false), 400);

    if (nextAttempt >= MAX_ATTEMPTS) {
      setMessage(`Game over! The movie was "${movie.title}".`);
      setGameOver(true);
      setGameCompletedAt(currentTime);
      setSuggestions([]);
      updateStats(false);
    } else {
      setMessage("Wrong guess. Here's a hint.");
    }
  }

  function handleInputChange(input) {
    if (input.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const filtered = movies
      .map((m) => m.title)
      .filter((title) => title.toLowerCase().includes(input.toLowerCase()));

    setSuggestions(filtered);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4 pb-16">
      <div
        className={`relative w-full ${
          guessHistory.length > 0 ? "max-w-4xl" : "max-w-md sm:max-w-lg"
        } bg-slate-900/85 backdrop-blur rounded-2xl shadow-2xl p-6 space-y-6 ring-1 ring-slate-700/60`}
      >
        <div className="text-center space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-slate-100">
            Tollydle
          </h1>
          <p className="text-sm text-slate-400">Guess the Telugu movie of the day</p>
          <div className="pt-2 space-y-1 text-xs tracking-wide">
            <p className="text-sky-300">Game timer: {formatClock(elapsedSeconds)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-center">
            <div
              className={`w-full space-y-4 ${
                guessHistory.length > 0 ? "sm:flex-none sm:w-[30rem]" : ""
              }`}
            >
              <div className={shake ? "shake" : ""}>
                <GuessInput
                  onGuess={handleGuess}
                  onInputChange={handleInputChange}
                  disabled={gameOver}
                  suggestions={suggestions}
                />
              </div>

              <HintList hints={visibleHints} />
            </div>

            {guessHistory.length > 0 && (
              <div className="w-full sm:w-auto sm:min-w-[12rem] sm:max-w-[22rem]">
                <p className="text-xs font-semibold text-slate-200 mb-1">Guess history</p>
                <div className="space-y-2 text-sm">
                  {guessHistory.map((g, i) => (
                    <div
                      key={`${g}-${i}`}
                      className="flex items-start gap-2 bg-slate-800/60 px-3 py-2 rounded border border-slate-700"
                    >
                      <span className="min-w-0 max-w-full flex-1 break-words leading-tight text-slate-200">
                        {g}
                      </span>
                      <span className="shrink-0 text-slate-200">{resultGrid[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {resultGrid.length > 0 && (
          <div className="flex justify-center gap-1 text-xl">
            {resultGrid.map((cell, i) => (
              <span
                key={i}
                className="flip-tile"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {cell}
              </span>
            ))}
            {Array.from({ length: MAX_ATTEMPTS - resultGrid.length }).map((_, i) => (
              <span key={`e-${i}`}>⬜</span>
            ))}
          </div>
        )}

        {message && (
          <p
            className={`rounded-lg px-3 py-2 text-center text-lg font-medium text-white ${
              message.startsWith("Correct")
                ? "bg-emerald-600"
                : message.startsWith("Game over") || message.startsWith("Time's up")
                  ? "bg-rose-700"
                  : "bg-slate-700/90"
            }`}
          >
            {message}
          </p>
        )}

        <div className="flex items-center justify-center gap-3">
          <p className="text-center text-xs tracking-wide text-slate-300">
            Attempts {attempts} / {MAX_ATTEMPTS}
          </p>
          <button
            onClick={() => setShowStats(true)}
            className="rounded bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-200 ring-1 ring-slate-600 hover:bg-slate-700"
          >
            View Stats
          </button>
        </div>

        {gameOver && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(getShareText());
              alert("Result copied to clipboard!");
            }}
            className="w-full mt-4 py-2 rounded-lg bg-sky-600 text-white font-semibold
                       hover:bg-sky-500 active:scale-[0.98] transition"
          >
            Copy Result
          </button>
        )}
      </div>

      {gameOver && (
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-slate-700/70 bg-slate-950/90 backdrop-blur px-4 py-3 text-center text-sm text-slate-200">
          Next movie in {formatClock(secondsUntilNextMovie)}
        </div>
      )}

      {showStats && (
        <div className="fixed inset-0 z-20 bg-black/60 flex items-center justify-center">
          <div className="bg-slate-900 p-6 rounded-xl animate-scaleIn w-full max-w-md mx-4 ring-1 ring-slate-700/60">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100">Stats</h2>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-800/80 p-3 ring-1 ring-slate-700/60">
                <p className="text-xs uppercase tracking-wide text-slate-400">Played</p>
                <p className="text-2xl font-bold text-slate-100">{stats.played}</p>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-3 ring-1 ring-slate-700/60">
                <p className="text-xs uppercase tracking-wide text-slate-400">Wins</p>
                <p className="text-2xl font-bold text-slate-100">{stats.wins}</p>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-3 ring-1 ring-slate-700/60">
                <p className="text-xs uppercase tracking-wide text-slate-400">Current Streak</p>
                <p className="text-2xl font-bold text-sky-300">{stats.currentStreak}</p>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-3 ring-1 ring-slate-700/60">
                <p className="text-xs uppercase tracking-wide text-slate-400">Best Streak</p>
                <p className="text-2xl font-bold text-slate-100">{stats.maxStreak}</p>
              </div>
            </div>

            <div className="mb-4 rounded-lg bg-slate-800/60 p-3 ring-1 ring-slate-700/60">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-300">Win Rate</span>
                <span className="font-semibold text-slate-100">{winRate}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-700">
                <div
                  className="h-2 rounded-full bg-sky-500 transition-all"
                  style={{ width: `${winRate}%` }}
                />
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-800/60 p-3 ring-1 ring-slate-700/60">
                <p className="text-slate-400">Today</p>
                <p className="mt-1 font-semibold text-slate-200">
                  {resultGrid.includes("🟩") ? "Solved" : gameOver ? "Missed" : "In Progress"}
                </p>
                <p className="mt-1 text-slate-300">Attempts: {attempts}/{MAX_ATTEMPTS}</p>
              </div>
              <div className="rounded-lg bg-slate-800/60 p-3 ring-1 ring-slate-700/60">
                <p className="text-slate-400">Timer</p>
                <p className="mt-1 font-semibold text-slate-200">{formatClock(elapsedSeconds)}</p>
                <p className="mt-1 text-slate-300">Next in: {formatClock(secondsUntilNextMovie)}</p>
              </div>
            </div>

            <div className="mb-4">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                  freezeAvailable
                    ? "bg-sky-500/15 text-sky-300 ring-sky-400/40"
                    : "bg-slate-700/60 text-slate-300 ring-slate-600"
                }`}
              >
                🧊 Freeze: {freezeAvailable ? "Available" : "Used"}
              </span>
            </div>
            <button
              onClick={() => setShowStats(false)}
              className="mt-4 w-full rounded-lg bg-sky-600 py-2 font-semibold text-white hover:bg-sky-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
