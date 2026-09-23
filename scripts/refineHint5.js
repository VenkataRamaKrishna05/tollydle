import fs from 'fs';

const filePath = './src/data/curated_manual_hints.json';
const movies = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

function buildCleanHint5(movie) {
  const actor = movie.actor || 'The lead actor';
  const director = movie.director ? `directed by ${movie.director}` : '';
  const genre = movie.genre ? `${movie.genre.toLowerCase()}` : 'feature';
  const year = movie.year ? `(${movie.year})` : '';

  let h5 = `Stars ${actor} in this acclaimed ${genre} film ${director} ${year}.`.replace(/\s+/g, ' ').trim();

  // Custom refined Hint 5 for top iconic movies to sound natural & punchy without title/character spoilers
  const customHint5Map = {
    1: "Stars Prabhas and Rana Daggubati in this epic action-fantasy spectacle directed by S.S. Rajamouli.",
    2: "Stars Vijay Deverakonda and Shalini Pandey in this cult romantic drama directed by Sandeep Reddy Vanga.",
    3: "Stars Nani, Samantha, and Sudeep in this fantasy action film directed by S.S. Rajamouli.",
    4: "Stars Allu Arjun and Pooja Hegde in this blockbuster family action drama directed by Trivikram Srinivas.",
    5: "Stars Allu Arjun and Rashmika Mandanna in this action drama directed by Sukumar.",
    6: "Stars NTR Jr. and Ram Charan in lead roles, directed by S.S. Rajamouli.",
    7: "Stars Ram Charan and Kajal Aggarwal in this historic fantasy action drama directed by S.S. Rajamouli.",
    8: "Stars Mahesh Babu and Anushka Shetty in this action drama directed by Trivikram Srinivas.",
    9: "Stars Mahesh Babu and Ileana D'Cruz in this action thriller directed by Puri Jagannadh.",
    10: "Stars NTR Jr. and Trisha in this high-voltage action drama directed by Boyapati Sreenu.",
    121: "Stars NTR Jr., Jagapathi Babu, and Rakul Preet Singh in this stylish revenge thriller directed by Sukumar.",
    122: "Stars Venkatesh and Meena in lead roles, directed by Sripriya in this acclaimed mystery thriller.",
    123: "Stars Teja Sajja and Anandhi in this action comedy thriller directed by Prasanth Varma.",
    124: "Stars Dr. Rajasekhar and Pooja Kumar in this spy action thriller directed by Praveen Sattaru.",
    125: "Stars Chiranjeevi and Kajal Aggarwal in this action drama directed by V. V. Vinayak."
  };

  if (customHint5Map[movie.id]) {
    return customHint5Map[movie.id];
  }

  return h5;
}

let updatedCount = 0;
movies.forEach((movie) => {
  if (Array.isArray(movie.hints) && movie.hints.length >= 5) {
    movie.hints[4] = buildCleanHint5(movie);
    updatedCount++;
  }
});

fs.writeFileSync(filePath, JSON.stringify(movies, null, 2));
console.log(`✅ Successfully refined Hint 5 for all ${updatedCount} movies!`);
