export function phoneticNormalize(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ph/g, "f")
    .replace(/th/g, "t")
    .replace(/sh/g, "s")
    .replace(/ch/g, "c")
    .replace(/ee/g, "i")
    .replace(/oo/g, "u")
    .replace(/ou/g, "u")
    .replace(/aa/g, "a")
    .replace(/uu/g, "u")
    .replace(/ii/g, "i")
    .replace(/bh/g, "b")
    .replace(/dh/g, "d")
    .replace(/gh/g, "g")
    .replace(/kh/g, "k")
    .replace(/y/g, "i")
    .replace(/w/g, "v")
    .replace(/[^a-z0-9]/g, "")
    .replace(/(.)\1+/g, "$1");
}

const COMMON_ALIASES = {
  "drishyam": ["Drushyam"],
  "vaikuntapuramlo": ["Ala Vaikunthapurramuloo"],
  "ala vaikuntapuramlo": ["Ala Vaikunthapurramuloo"],
  "ala vaikunthapurramloo": ["Ala Vaikunthapurramuloo"],
  "bahubali": ["Baahubali: The Beginning", "Baahubali 2: The Conclusion"],
  "baahubali": ["Baahubali: The Beginning", "Baahubali 2: The Conclusion"],
  "arjun reddy": ["Arjun Reddy"],
  "pushpa": ["Pushpa: The Rise", "Pushpa 2: The Rule"],
  "eega": ["Eega"],
  "rrr": ["RRR"]
};

export function matchesMovie(title, searchInput) {
  if (!searchInput || searchInput.trim().length < 2) return false;
  const rawInput = searchInput.trim().toLowerCase();
  const rawTitle = title.toLowerCase();

  // 1. Direct substring match
  if (rawTitle.includes(rawInput)) return true;

  // 2. Phonetic normalized match
  const pInput = phoneticNormalize(rawInput);
  const pTitle = phoneticNormalize(rawTitle);

  if (pInput.length >= 2 && pTitle.includes(pInput)) return true;

  // 3. Word token prefix match
  const inputWords = rawInput.split(/\s+/).filter(Boolean);
  const titleWords = rawTitle.split(/\s+/).filter(Boolean);

  return inputWords.every(iw =>
    titleWords.some(tw => {
      const pTw = phoneticNormalize(tw);
      const pIw = phoneticNormalize(iw);
      if (tw.toLowerCase().startsWith(iw) || pTw.startsWith(pIw)) return true;
      if (pIw.length >= 2 && pTw.includes(pIw)) return true;
      return false;
    })
  );
}

export function filterMovieSuggestions(movies, searchInput, maxResults = 8) {
  if (!searchInput || searchInput.trim().length < 2) return [];
  const query = searchInput.trim().toLowerCase();
  
  const movieTitles = movies.map(m => typeof m === "string" ? m : m.title);
  
  let result = [];
  if (COMMON_ALIASES[query]) {
    const aliasMatches = COMMON_ALIASES[query];
    result.push(...aliasMatches);
  }

  const matchingTitles = movieTitles.filter(title => matchesMovie(title, query));
  result.push(...matchingTitles);

  // Deduplicate results while maintaining order
  const uniqueResults = Array.from(new Set(result));
  return uniqueResults.slice(0, maxResults);
}
