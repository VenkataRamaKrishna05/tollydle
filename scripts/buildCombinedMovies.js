import fs from 'fs';

const allM = JSON.parse(fs.readFileSync('./src/data/movies.json', 'utf-8'));
const curatedM = JSON.parse(fs.readFileSync('./src/data/curated_manual_hints.json', 'utf-8'));

function cleanTitle(title) {
  if (!title) return "";
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove macrons: Bāhubali -> Bahubali
    .replace(/Bahubali/g, "Baahubali")
    .trim();
}

const titleSet = new Set();
const combinedList = [];

let nextId = 1;

// 1. Add curated movies first
curatedM.forEach(m => {
  if (m.title) {
    const cleaned = cleanTitle(m.title);
    const key = cleaned.toLowerCase();
    if (!titleSet.has(key)) {
      titleSet.add(key);
      combinedList.push({
        id: m.id || nextId++,
        title: cleaned,
        year: m.year || "",
        genre: m.genre || "",
        actor: m.actor || "",
        director: m.director || ""
      });
    }
  }
});

// 2. Add remaining movies from movies.json
allM.forEach(m => {
  if (m.title) {
    const cleaned = cleanTitle(m.title);
    const key = cleaned.toLowerCase();
    if (!titleSet.has(key)) {
      titleSet.add(key);
      combinedList.push({
        id: nextId++,
        title: cleaned,
        year: m.year || "",
        genre: m.genre || "",
        actor: m.actor || "",
        director: m.director || ""
      });
    }
  }
});

fs.writeFileSync('./src/data/all_movies_combined.json', JSON.stringify(combinedList, null, 2));
console.log(`✅ Built src/data/all_movies_combined.json with ${combinedList.length} clean Telugu movies!`);
