import fs from 'fs';

const filePath = './src/data/curated_manual_hints.json';
const movies = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

function sanitizeHint1(movie, rawHint1) {
  let h1 = rawHint1 || movie.overview || '';
  const title = movie.title || '';

  // Remove direct title occurrences
  h1 = h1.replace(new RegExp(title, 'gi'), 'the protagonist');

  // Specific high-giveaway phrase replacements for Hint 1
  const replacements = [
    [/a middle-class cable TV operator/i, 'a peaceful family man'],
    [/lives a simple life with his wife and two daughters in a small town/i, 'values his simple life and family above everything else'],
    [/game developer/i, 'tech enthusiast'],
    [/faction-ridden village in Rayalaseema/i, 'remote village'],
    [/corporate employee/i, 'busy professional'],
    [/Brahmin household falls in love with a Christian girl/i, 'conservative household faces an unexpected cross-cultural romance'],
    [/piano player pretends to be blind/i, 'musician gets entangled in a web of deceit'],
    [/three working women in Hyderabad/i, 'three independent women'],
    [/sexual assault attempt/i, 'unfortunate crisis'],
    [/manufacturing defect in a commercial product/i, 'strange discovery that alters their fortune'],
    [/reincarnation of his deceased father/i, 'mysterious connection across generations'],
    [/red sandalwood smuggling syndicate/i, 'dangerous underground syndicate'],
    [/medical student spirals into self-destruction/i, 'promising student struggles with personal loss'],
    [/tribal warrior looking for a kidnapped young girl/i, 'determined fighter on a secret rescue mission'],
    [/finance agent in the US runs a strict debt collection/i, 'determined individual enforcing strict financial rules'],
    [/rejection by a wealthy girl/i, 'unexpected heartbreak'],
    [/veterinary doctor/i, 'passionate professional'],
    [/stuntman who robs wedding jewelry/i, 'desperate man seeking a way out of trouble'],
    [/quadriplegic billionaire/i, 'wealthy individual with physical limitations'],
    [/Pakistani submarine/i, 'stealth naval threat'],
    [/ex-military officer/i, 'former defense officer'],
    [/rebellion against the British East India Company/i, 'historic fight for freedom against foreign rulers']
  ];

  replacements.forEach(([pattern, replacement]) => {
    h1 = h1.replace(pattern, replacement);
  });

  return h1;
}

movies.forEach((movie) => {
  if (Array.isArray(movie.hints) && movie.hints.length >= 5) {
    // Sanitize Hint 1 so it is intriguing and vague
    movie.hints[0] = sanitizeHint1(movie, movie.hints[0]);
  }
});

fs.writeFileSync(filePath, JSON.stringify(movies, null, 2));
console.log(`✅ Successfully sanitized Hint 1 for all ${movies.length} movies!`);
