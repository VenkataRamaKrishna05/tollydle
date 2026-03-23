import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const rawMovies = fs
  .readFileSync("./src/data/movies_cleaned.json", "utf-8")
  .replace(/^\uFEFF/, "");

const movies = JSON.parse(rawMovies);

async function generateHints(movie) {
  const prompt = `
Rewrite the following movie overview into 4 progressive, mysterious hints.
Rules:
- Do NOT reveal character names.
- Do NOT mention the movie title.
- Keep hints short (1 sentence each).
- Make Hint 1 vague.
- Make Hint 4 almost obvious.

Overview:
${movie.overview}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content
    .split("\n")
    .filter(Boolean);
}

async function main() {
  const updated = [];

  for (const movie of movies) {
    console.log(`Generating hints for ${movie.title}`);

    const hints = await generateHints(movie);

    updated.push({
      ...movie,
      hints,
    });
  }

  fs.writeFileSync(
    "./src/data/movies_with_hints.json",
    JSON.stringify(updated, null, 2)
  );

  console.log("✅ Cinematic hints generated!");
}

main();
