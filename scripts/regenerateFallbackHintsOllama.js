import fs from "fs";
import { spawnSync } from "child_process";

const FILE_PATH = process.env.FILE_PATH || "./src/data/movies_with_hints.json";
const MODEL = process.env.OLLAMA_MODEL || "gemma3:4b";
const BATCH_SIZE = Number(process.env.BATCH_SIZE || 20);
const PAUSE_MS = Number(process.env.PAUSE_MS || 800);
const RETRY_COUNT = Number(process.env.RETRY_COUNT || 3);
const HINT_COUNT = 5;
const MAX_BUFFER = 1024 * 1024 * 10;

const FORBIDDEN_WORDS = [
  "destiny",
  "legacy",
  "dynamics",
  "hierarchy",
  "aspiration",
  "turmoil",
  "equilibrium",
  "metaphor",
  "symbolizing",
  "symbolises",
  "symbolizes",
  "fractures",
  "shatters",
];

const GENERIC_STARTS = [
  "a man returns to his village",
  "two women become central to his life",
  "after his father loses everything",
  "a rival waits for years",
  "years later",
  "following a significant loss",
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

function sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // intentional sync pause between local model calls
  }
}

function readJson(path) {
  const raw = fs.readFileSync(path, "utf-8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function writeJson(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
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

function getForbiddenNameParts(movie) {
  const sources = [movie.title, movie.actor, movie.director].filter(Boolean).join(" ");
  return tokenize(sources).filter((part) => part.length > 2);
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
  if (typeof hint !== "string" || hint.trim().length === 0) return false;

  const words = wordCount(hint);
  if (words < 8 || words > 15) return false;
  if (containsForbiddenWord(hint)) return false;
  if (startsGenerically(hint)) return false;
  if (!hasConcreteElement(hint)) return false;

  const normalized = tokenize(hint).join(" ");
  const forbiddenParts = getForbiddenNameParts(movie);
  if (forbiddenParts.some((part) => normalized.includes(part))) return false;

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

function buildPrompt(movie) {
  const title = movie.title || "Unknown";
  const year = movie.year || "Unknown";
  const genre = movie.genre || "Unknown";
  const overview = (movie.overview || "").trim() || "Not available.";

  return `You are generating hints for a movie guessing web app.

For this movie, create exactly 5 hints with this structure:
1) Broad situation or atmosphere
2) Setting or environment
3) Specific conflict
4) Main character action
5) Strong identifiable clue (no spoilers)

Hard rules:
- 8 to 15 words per hint.
- Each hint must include at least one concrete noun (place, object, role, relationship, event, symbol).
- No abstract words like destiny, legacy, hierarchy, dynamics, aspiration, turmoil.
- No metaphors. No dramatic exaggeration.
- No generic phrases reusable across many movies.
- No repeated sentence openings in the 5 hints.
- Do NOT mention title, actor, director, or ending/twist.
- Keep hints clear, direct, and playable.

Return ONLY a valid JSON array of 5 strings.

Movie Data:
Title: ${title}
Year: ${year}
Genre: ${genre}
Overview: ${overview}
`;
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

function needsRegeneration(movie) {
  return !isValidHintSet(movie.hints, movie);
}

function generateHints(movie) {
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
    if (parsed && isValidHintSet(parsed, movie)) {
      return parsed;
    }
  }

  return Array.isArray(movie.hints) ? movie.hints : [];
}

function main() {
  const movies = readJson(FILE_PATH);
  const genericIndexes = movies
    .map((m, i) => ({ i, m }))
    .filter(({ m }) => needsRegeneration(m))
    .map(({ i }) => i);

  console.log(`Total movies: ${movies.length}`);
  console.log(`Movies to regenerate: ${genericIndexes.length}`);

  if (genericIndexes.length === 0) {
    console.log("Nothing to regenerate.");
    return;
  }

  let processed = 0;

  for (let start = 0; start < genericIndexes.length; start += BATCH_SIZE) {
    const batch = genericIndexes.slice(start, start + BATCH_SIZE);
    console.log(`\nBatch ${Math.floor(start / BATCH_SIZE) + 1}: ${batch.length} movies`);

    for (const idx of batch) {
      const movie = movies[idx];
      console.log(`Generating hints for ${movie.title}`);
      try {
        const hints = generateHints(movie);
        if (Array.isArray(hints) && hints.length === HINT_COUNT) {
          movies[idx] = { ...movie, hints };
        }
      } catch (err) {
        console.error(`Failed for ${movie.title}:`, err.message || err);
      }

      processed += 1;
      writeJson(FILE_PATH, movies);
      sleep(PAUSE_MS);
    }

    const remaining = movies.filter((m) => needsRegeneration(m)).length;
    console.log(`Batch complete. Remaining rows: ${remaining}`);
  }

  const finalRemaining = movies.filter((m) => needsRegeneration(m)).length;
  console.log(`\nDone. Processed ${processed} rows.`);
  console.log(`Remaining rows: ${finalRemaining}`);
}

main();
