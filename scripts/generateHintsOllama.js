import fs from "fs";
import { spawnSync } from "child_process";

const SOURCE_PATH = process.env.SOURCE_PATH || "./src/data/movies_with_hints.json";
const OUTPUT_PATH = process.env.OUTPUT_PATH || "./src/data/top_500_movies_with_hints.json";
const MODEL = process.env.OLLAMA_MODEL || "gemma3:4b";
const LIMIT = Number(process.env.LIMIT || 500);
const RETRY_COUNT = Number(process.env.RETRY_COUNT || 3);
const PAUSE_MS = Number(process.env.PAUSE_MS || 500);
const HINT_COUNT = 5;
const MAX_BUFFER = 1024 * 1024 * 10;

const FORBIDDEN_WORDS = [
  "dynamics", "hierarchy", "aspiration", "turmoil", "equilibrium", "metaphor",
  "symbolizing", "symbolizes", "fractures", "shatters", "whispers", "silhouette",
  "identity", "societal", "expectations", "narrative", "climax", "pivotal",
  "turning point", "complex relationship", "influential figure", "profound",
  "legacy", "destiny", "navigates", "unfolds", "confronts", "discovery",
  "dramatic", "alters", "secures", "future", "encounter", "themes",
  "exploration", "centers on", "revolves around", "struggles with",
  "brave guy", "bad guy", "hero", "villain", "really bad", "brave hero",
  "lots of people", "very mean", "nice person", "scary", "fun movie"
];

const FORBIDDEN_PHRASES = [
  "jungle warrior", "motorcycle journey", "mountain rescue",
  "sandalwood", "crimson dust", "shattered mirror", "forgotten kingdom",
  "ancient betrayal", "solemn oath", "deadly game", "shifting dynamics",
  "battle for a kingdom", "fight against evil", "heroic journey"
];

const GENERIC_STARTS = [
  "this movie", "a story about", "the plot follows", "in this film"
];

const CONCRETE_WORDS = new Set([
  "village", "city", "town", "school", "college", "campus", "temple", "church", "mosque",
  "house", "mansion", "forest", "river", "sea", "port", "market", "court", "jail", "prison",
  "station", "police", "bus", "train", "car", "bike", "truck", "ship", "road", "bridge",
  "farm", "field", "paddy", "shop", "factory", "office", "hospital", "hotel", "club", "bar",
  "wedding", "engagement", "funeral", "festival", "party", "match", "battle", "fight",
  "brother", "sister", "father", "mother", "son", "daughter", "wife", "husband", "friend",
  "teacher", "lawyer", "doctor", "officer", "journalist", "student", "driver", "mechanic",
  "thief", "cop", "gangster", "leader", "kingdom", "flag", "sword", "gun", "ring", "letter",
  "photo", "diary", "phone", "money", "cash", "gold", "treasure", "business", "case",
]);

function buildPrompt(movie) {
  const parts = [
    `Movie: ${movie.title}`,
    `Overview: ${movie.overview || "No overview available."}`
  ];

  return `
Write 5 PROGRESSIVE, PROFESSIONAL hints for a movie guessing game.
Persona: An intelligent movie critic who uses clear, mature language.

### STRICT RULES:
1. **ONLY USE THE OVERVIEW**: Base hints EXCLUSIVELY on the "Overview" text below. DO NOT add outside knowledge or details (like characters' names or professions) not found in the text.
2. **MATURE & CONCRETE**: Avoid childish words (brave guy, bad guy, mean, hero). Use professional descriptors (protagonist, antagonist, rival, operative).
3. **PLOT-CONCRETE**: Every hint must mention a specific narrative detail from the overview.
4. **NO SPOILERS**: Level 1 is a vague setup; Level 5 is the unmistakable "big hook."
5. **LIMITS**: Max 20 words per hint. No academic filler ("explores themes of").

${parts.join("\n")}

Return ONLY a JSON array of 5 strings.
Example: ["A man enters an opulent mansion after discovering a hidden family secret.", "He attempts to fix the broken relationships in a household that isn't his own.", "A shocking exchange at birth has given him a rightful claim in a world of privilege.", "He uses his wit to protect the family from an internal power struggle.", "A middle-class youth claims his place as the true heir to a massive estate."]
`.trim();
}

function parseJsonHints(stdout) {
  const start = stdout.indexOf("[");
  const end = stdout.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;

  const maybeJson = stdout.slice(start, end + 1);
  try {
    const parsed = JSON.parse(maybeJson);
    if (!Array.isArray(parsed)) return null;
    const cleaned = parsed
      .map((hint) => (typeof hint === "string" ? hint.trim() : ""))
      .filter(Boolean)
      .slice(0, HINT_COUNT);
    return cleaned.length === HINT_COUNT ? cleaned : null;
  } catch {
    return null;
  }
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function hasConcreteElement(hint) {
  const tokens = tokenize(hint);
  return tokens.some((token) => CONCRETE_WORDS.has(token) || /\d/.test(token));
}

const COMMON_MOVIE_WORDS = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "beginning", "the", "conclusion", "rise", "part", "return", "story", "epic", "legend", "movie", "film", "rise"]);

function getForbiddenNameParts(movie) {
  const sources = [movie.title, movie.actor, movie.director].filter(Boolean).join(" ");
  return tokenize(sources).filter((part) => part.length > 2 && !COMMON_MOVIE_WORDS.has(part.toLowerCase()));
}

function containsForbiddenWord(hint) {
  const normalized = hint.toLowerCase();
  return FORBIDDEN_WORDS.some((word) => normalized.includes(word));
}

function startsGenerically(hint) {
  const normalized = hint.trim().toLowerCase();
  return GENERIC_STARTS.some((prefix) => normalized.startsWith(prefix));
}

function openingKey(hint) {
  return tokenize(hint).slice(0, 2).join(" ");
}

function isValidHint(hint, movie) {
  if (typeof hint !== "string" || hint.trim().length === 0) {
    console.error("  - Failed: hint is not a non-empty string");
    return false;
  }

  const words = wordCount(hint);
  if (words < 3 || words > 30) {
    console.error(`  - Failed: word count ${words} is out of range (3-30)`);
    return false;
  }
  if (containsForbiddenWord(hint)) {
    console.error("  - Failed: contains forbidden abstract word/phrase");
    return false;
  }
  // if (startsGenerically(hint)) {
  //   console.error("  - Failed: starts with a generic phrase");
  //   return false;
  // }
  // if (!hasConcreteElement(hint)) {
  //   console.error("  - Failed: missing concrete noun or number");
  //   return false;
  // }

  const hintTokens = tokenize(hint);
  const forbiddenParts = new Set(getForbiddenNameParts(movie));
  if (hintTokens.some((token) => forbiddenParts.has(token))) {
    console.error(`  - Failed: contains forbidden word from title/actor/director`);
    return false;
  }

  return true;
}

function isValidHintSet(hints, movie) {
  if (!Array.isArray(hints) || hints.length !== HINT_COUNT) return false;

  const normalized = hints.map((hint) => hint.trim().toLowerCase());
  if (new Set(normalized).size !== HINT_COUNT) return false;

  const openings = hints.map((hint) => openingKey(hint));
  if (new Set(openings).size !== HINT_COUNT) return false;

  return hints.every((hint) => isValidHint(hint, movie));
}

function generateHintsWithOllama(movie) {
  for (let attempt = 1; attempt <= RETRY_COUNT; attempt += 1) {
    const prompt = buildPrompt(movie);
    const result = spawnSync("ollama", ["run", MODEL], {
      input: prompt,
      encoding: "utf-8",
      maxBuffer: MAX_BUFFER,
    });

    if (result.error) {
      throw result.error;
    }

    const parsed = parseJsonHints(result.stdout || "");
    if (parsed) {
      if (isValidHintSet(parsed, movie)) {
        return parsed;
      } else {
        console.warn(`  - Attempt ${attempt}: Hints set failed validation.`);
        console.log("Hints:", JSON.stringify(parsed, null, 2)); // Debug log
      }
    } else {
      console.warn(`  - Attempt ${attempt}: Failed to parse JSON hints from LLM output.`);
      console.log("STDOUT:", result.stdout); // Debug log
    }
  }

  return [];
}

function sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // intentional sync pause between local model calls
  }
}

function readMovies(path) {
  if (!fs.existsSync(path)) return [];
  const raw = fs.readFileSync(path, "utf-8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function initializeMoviesWithHints(movies) {
  return movies.map((movie) => ({ ...movie, hints: [] }));
}

const allMovies = readMovies(SOURCE_PATH);

// 1. Sort by popularity descending
const sortedMovies = [...allMovies].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

// 2. Filter for decent overviews (at least 30 characters)
const candidateMovies = sortedMovies.filter(m => (m.overview || "").trim().length > 30);

// 3. Take the top LIMIT
const targetMovies = candidateMovies.slice(0, LIMIT);

console.log(`Starting generation for top ${targetMovies.length} movies...`);

let successCount = 0;
let failures = 0;

// Load existing output if it exists to support resuming
let results = [];
if (fs.existsSync(OUTPUT_PATH)) {
  try {
    results = readMovies(OUTPUT_PATH);
    console.log(`Loaded ${results.length} existing results from ${OUTPUT_PATH}`);
  } catch (e) {
    console.warn(`Failed to load ${OUTPUT_PATH}: ${e.message}. Starting fresh.`);
  }
}

for (let i = 0; i < targetMovies.length; i += 1) {
  const movie = targetMovies[i];
  
  // Skip if already has hints in our results list
  const existing = results.find(r => r.id === movie.id);
  if (existing && Array.isArray(existing.hints) && existing.hints.length === HINT_COUNT) {
    console.log(`[${i+1}/${targetMovies.length}] Skipping ${movie.title} (already has hints)`);
    continue;
  }

  console.log(`[${i+1}/${targetMovies.length}] Generating hints for ${movie.title}...`);

  try {
    const hints = generateHintsWithOllama(movie);
    if (Array.isArray(hints) && hints.length === HINT_COUNT) {
      const updatedMovie = { ...movie, hints };
      // Update or add to results
      const index = results.findIndex(r => r.id === movie.id);
      if (index !== -1) {
        results[index] = updatedMovie;
      } else {
        results.push(updatedMovie);
      }
      successCount += 1;
      console.log(`  - Success! Total results: ${results.length}`);
    } else {
      failures += 1;
      console.error(`Invalid hints for ${movie.title}; skipping.`);
    }
  } catch (error) {
    failures += 1;
    console.error(`Failed for ${movie.title}:`, error.message || error);
  }

  // Periodic saving
  if (i % 5 === 0 || i === targetMovies.length - 1) {
    console.log(`  - Saving ${results.length} entries to ${OUTPUT_PATH}...`);
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
  }
  
  sleep(PAUSE_MS);
}

console.log(
  `\n✅ Hints generation completed!\n- Targeted: ${targetMovies.length}\n- Newly Generated: ${successCount}\n- Failures: ${failures}\n- Total in File: ${results.length}\n-> ${OUTPUT_PATH}`
);
