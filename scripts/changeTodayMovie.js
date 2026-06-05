import fs from "fs";
import path from "path";

const DATA_FILE = "./src/data/curated_manual_hints.json";

function getTodayIndex(moviesLength) {
  const baseDate = new Date(2024, 0, 1);
  const currentDate = new Date();
  const todayStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );

  const diffDays = Math.floor((todayStart - baseDate) / (1000 * 60 * 60 * 24));
  return ((diffDays % moviesLength) + moviesLength) % moviesLength;
}

function main() {
  const args = process.argv.slice(2);
  
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`Error: Could not find ${DATA_FILE}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(DATA_FILE, "utf-8");
  const movies = JSON.parse(rawData);

  const todayIndex = getTodayIndex(movies.length);
  const todayMovie = movies[todayIndex];

  console.log(`Current movie for today (Index ${todayIndex}): "${todayMovie.title}"`);

  let swapIndex = -1;

  if (args.length > 0) {
    const searchStr = args.join(" ").toLowerCase();
    swapIndex = movies.findIndex(
      (m, i) => i !== todayIndex && m.title.toLowerCase().includes(searchStr)
    );

    if (swapIndex === -1) {
      console.error(`\n❌ Could not find an alternative movie matching: "${searchStr}"`);
      process.exit(1);
    }
  } else {
    // Pick a random movie AFTER today's index to avoid replacing with past movies
    const remainingCount = movies.length - 1 - todayIndex;
    if (remainingCount <= 0) {
       console.error("\n❌ No future movies left to swap with!");
       process.exit(1);
    }
    const randomOffset = Math.floor(Math.random() * remainingCount) + 1;
    swapIndex = todayIndex + randomOffset;
  }

  const newMovie = movies[swapIndex];
  
  // Perform the swap
  movies[todayIndex] = newMovie;
  movies[swapIndex] = todayMovie;

  fs.writeFileSync(DATA_FILE, JSON.stringify(movies, null, 2));

  console.log(`\n✅ Successfully changed today's movie!`);
  console.log(`New movie for today: "${newMovie.title}"`);
  console.log(`The previous movie ("${todayMovie.title}") has been moved to slot ${swapIndex}.`);
}

main();
