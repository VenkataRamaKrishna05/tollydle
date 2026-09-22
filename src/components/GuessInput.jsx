import { useState } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GuessInput({ onGuess, onInputChange, disabled, suggestions = [] }) {
  const [value, setValue] = useState("");
  const [showList, setShowList] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!value.trim()) return;
    onGuess(value);
    setValue("");
    setShowList(false);
  }

  function handleKeyDown(e) {
    if (!showList || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(prev => prev >= suggestions.length - 1 ? 0 : prev + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => prev <= 0 ? suggestions.length - 1 : prev - 1);
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      const selected = suggestions[highlightedIndex];
      setValue(selected);
      setShowList(false);
      onGuess(selected);
      setValue("");
    } else if (e.key === "Escape") {
      setShowList(false);
    }
  }

  return (
    <div className="relative w-full max-w-xl mx-auto z-50">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200"></div>
        <div className="relative flex items-center bg-slate-900 rounded-2xl border border-slate-800/50 overflow-hidden shadow-2xl">
          <div className="pl-5 text-slate-500">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={value}
            disabled={disabled}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              const val = e.target.value;
              setValue(val);
              onInputChange(val);
              setShowList(val.trim().length >= 2);
              setHighlightedIndex(-1);
            }}
            placeholder="Search Telugu movies..."
            className="w-full bg-transparent px-5 py-4 text-slate-100 placeholder-slate-500 outline-none font-medium text-lg"
          />
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className="mr-2 px-6 py-2.5 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-500 disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
          >
            Guess
          </button>
        </div>
      </form>

      <AnimatePresence>
        {showList && !disabled && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute mt-3 w-full glass rounded-3xl shadow-2xl max-h-72 overflow-y-auto z-[100] p-2 space-y-1"
          >
            {suggestions.map((title, index) => (
              <li
                key={title}
                onClick={() => {
                  onGuess(title);
                  setValue("");
                  setShowList(false);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-5 py-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between group ${
                  index === highlightedIndex ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20" : "text-slate-300 hover:bg-slate-800/80"
                }`}
              >
                <span className="font-semibold">{title}</span>
                <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-lg border ${
                   index === highlightedIndex ? "border-white/40 text-white" : "border-slate-700 text-slate-500 opacity-0 group-hover:opacity-100"
                }`}>Select</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
