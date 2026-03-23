import { useState, useEffect } from "react";

export default function GuessInput({
  onGuess,
  onInputChange,
  disabled,
  suggestions = [],
}) {
  const [value, setValue] = useState("");
  const [showList, setShowList] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim()) return;

    onGuess(value);

    setValue("");      // ✅ CLEAR INPUT
    setShowList(false);
  }

  function handleChange(e) {
    const val = e.target.value;
    setValue(val);
    onInputChange(val);

    // Option B: show suggestions only after 2 chars
    if (val.trim().length >= 2) {
      setShowList(true);
    } else {
      setShowList(false);
    }
    setHighlightedIndex(-1);
  }

  function handleSelect(title) {
    setValue(title);
    setShowList(false);
    setHighlightedIndex(-1);
  }

  function handleKeyDown(e) {
    if (!showList || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev >= suggestions.length - 1 ? 0 : prev + 1
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setShowList(false);
    }
  }

  useEffect(() => {
    if (!showList) {
      setHighlightedIndex(-1);
      return;
    }

    setHighlightedIndex((prev) =>
      prev >= suggestions.length ? -1 : prev
    );
  }, [showList, suggestions.length]);

  return (
    <div className="relative z-20">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          placeholder="Enter Telugu movie name..."
          className="flex-1 px-4 py-2 rounded bg-slate-800 text-white outline-none border border-slate-600"
        />
        <button
          type="submit"
          disabled={disabled}
          className="px-4 py-2 rounded bg-cyan-500 text-slate-900 font-semibold disabled:opacity-50"
        >
          Guess
        </button>
      </form>

      {showList && !disabled && suggestions.length > 0 && (
        <ul className="mt-2 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((title, index) => (
            <li
              key={title}
              onClick={() => handleSelect(title)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`px-4 py-2 cursor-pointer hover:bg-slate-700 ${
                index === highlightedIndex ? "bg-slate-700" : ""
              }`}
            >
              {title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
