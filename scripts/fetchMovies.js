import fs from "fs";

const API_KEY = "b699eec56c57b007306740f6a4f60a40";
const BASE_URL = "https://api.themoviedb.org/3";
const MAX_PAGES = Number(process.env.MAX_PAGES || 20);

async function fetchTeluguMovies(page = 1) {
  const res = await fetch(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=te&sort_by=popularity.desc&page=${page}`
  );
  return res.json();
}

async function fetchMovieDetails(id) {
  const res = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits`
  );
  return res.json();
}

async function main() {
  const allMovies = [];
  const seenMovieIds = new Set();

  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = await fetchTeluguMovies(page);

    if (!Array.isArray(data.results) || data.results.length === 0) {
      break;
    }

    for (const movie of data.results) {
      if (seenMovieIds.has(movie.id)) continue;

      const details = await fetchMovieDetails(movie.id);
      const director = details.credits?.crew?.find((c) => c.job === "Director")?.name;
      const hero = details.credits?.cast?.[0]?.name;

      allMovies.push({
        id: movie.id,
        title: movie.title,
        year: movie.release_date?.split("-")[0],
        genre: details.genres?.map((g) => g.name).join(", ") || "",
        actor: hero,
        director,
        overview: details.overview || movie.overview || "",
        popularity: movie.popularity,
      });

      seenMovieIds.add(movie.id);
    }

    console.log(`Fetched page ${page}`);
  }

  fs.writeFileSync("./src/data/movies.json", JSON.stringify(allMovies, null, 2));

  console.log(`Movies saved to src/data/movies.json (${allMovies.length} movies)`);
}

main();
