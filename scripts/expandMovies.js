import fs from "fs";

const additionalTitles = [
  "Khaidi", "Indra", "Tagore", "Shankar Dada MBBS", "Mutha Mestri", "Gang Leader", 
  "Jagadeka Veerudu Athiloka Sundari", "Swayam Krushi", "Rudraveena", "Stalin", 
  "Khaidi No. 150", "Sye Raa Narasimha Reddy", "Waltair Veerayya",
  "Siva", "Geethanjali", "Ninne Pelladata", "Annamayya", "Manmadhudu", "Mass", "King", 
  "Oopiri", "Soggade Chinni Nayana",
  "Bobbili Raja", "Chanti", "Preminchukundam Raa", "Kalisundam Raa", "Nuvvu Naaku Nachav", 
  "Malliswari", "Adavari Matalaku Arthale Verule", "Drushyam", "F2", "Guru", "Seethamma Vakitlo Sirimalle Chettu",
  "Samarasimha Reddy", "Narasimha Naidu", "Legend", "Simha", "Akhanda", "Aditya 369", "Bhairava Dweepam",
  "Rajakumarudu", "Murari", "Okkadu", "Athadu", "Pokiri", "Dookudu", "Businessman", 
  "Srimanthudu", "Bharat Ane Nenu", "Maharshi", "Sarileru Neekevvaru", "Sarkaru Vaari Paata", "Guntur Kaaram",
  "Tholi Prema", "Thammudu", "Badri", "Kushi", "Jalsa", "Gabbar Singh", "Attarintiki Daredi", 
  "Vakeel Saab", "Bheemla Nayak", "Bro",
  "Student No. 1", "Aadi", "Simhadri", "Yamadonga", "Adhurs", "Brindavanam", "Temper", 
  "Nannaku Prematho", "Janatha Garage", "Jai Lava Kusa", "Aravinda Sametha Veera Raghava", "RRR", "Devara",
  "Gangotri", "Arya", "Bunny", "Desamuduru", "Parugu", "Arya 2", "Julayi", "Race Gurram", 
  "S/O Satyamurthy", "Sarrainodu", "Ala Vaikunthapurramuloo", "Pushpa: The Rise", "Pushpa 2: The Rule",
  "Chirutha", "Magadheera", "Racha", "Nayak", "Yevadu", "Dhruva", "Rangasthalam",
  "Eeswar", "Varsham", "Chatrapathi", "Billa", "Darling", "Mr. Perfect", "Mirchi", 
  "Baahubali: The Beginning", "Baahubali 2: The Conclusion", "Saaho", "Radhe Shyam", "Salaar: Part 1 - Ceasefire", "Kalki 2898 AD",
  "Pelli Choopulu", "Arjun Reddy", "Geetha Govindam", "Taxiwala", "Dear Comrade", 
  "World Famous Lover", "Liger", "Family Star",
  "Ashta Chamma", "Ride", "Bheemili Kabaddi Jattu", "Ala Modalaindi", "Pilla Zamindar", 
  "Eega", "Yevade Subramanyam", "Bhale Bhale Magadivoy", "Krishna Gaadi Veera Prema Gaadha", 
  "Gentleman", "Ninnu Kori", "MCA", "Jersey", "Shyam Singha Roy", "Ante Sundaraniki", "Dasara", "Hi Nanna", "Saripodhaa Sanivaaram",
  "Itlu Sravani Subramanyam", "Idiot", "Amma Nanna O Tamila Ammayi", "Venky", "Bhadra", 
  "Vikramarkudu", "Dubai Seenu", "Krishna", "Kick", "Don Seenu", "Mirapakay", "Balupu", 
  "Power", "Bengal Tiger", "Raja The Great", "Krack", "Dhamaka",
  "Jayam", "Dil", "Sye", "Ishq", "Gunde Jaari Gallanthayyinde", "A Aa", "Bheeshma",
  "Devadasu", "Ready", "Maska", "Kandireega", "Pandaga Chesko", "Nenu Sailaja", "iSmart Shankar", "Double iSmart",
  "Gamyam", "Prasthanam", "Run Raja Run", "Malli Malli Idi Rani Roju", "Express Raja", "Shatamanam Bhavati", "Mahanubhavudu",
  "Mukunda", "Kanche", "Loafer", "Fidaa", "Gaddalakonda Ganesh", "Tholi Prema (2018)",
  "Pilla Nuvvu Leni Jeevitham", "Subramanyam For Sale", "Supreme", "Chitralahari", "Prati Roju Pandage", "Republic", "Virupaksha",
  "Josh", "Ye Maaya Chesave", "100% Love", "Manam", "Premam", "Rarandoi Veduka Chudham", "Majili", "Love Story", "Bangarraju",
  "Akhil", "Hello", "Mr. Majnu", "Most Eligible Bachelor",
  "Shiva", "Mayabazar", "Nartanasala", "Gundamma Katha", "Missamma", "Pathala Bhairavi", 
  "Sankarabharanam", "Sagara Sangamam", "Swati Mutyam", "Geetanjali", "Kshana Kshanam", 
  "Govindudu Andarivadele", "Ekkadiki Pothavu Chinnavada", "Karthikeya", "Karthikeya 2", "Swamy Ra Ra", 
  "Uyyala Jampala", "Cinema Bandi", "C/o Kancharapalem", "Mathu Vadalara", "Agent Sai Srinivasa Athreya", 
  "Brochevarevarura", "Jathi Ratnalu", "DJ Tillu", "Tillu Square", "Samajavaragamana", "Sita Ramam", 
  "Baby", "Hanu-Man", "Gaami", "Kalki 2898 AD", "Arundhati", "Magadheera", "Maryada Ramanna",
  "Sye Raa Narasimha Reddy", "Happy Days", "Godavari", "Anand", "Leader", "Fidaa"
];

const filePath = "./src/data/movies.json";
let currentData = [];

try {
  currentData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
} catch (e) {
  console.error("Error reading movies.json:", e.message);
}

// Create a Set of existing lowercased titles to avoid duplicates
const existingTitles = new Set();
currentData.forEach(movie => {
  if (movie.title) {
    existingTitles.add(movie.title.toLowerCase().trim());
  }
});

let addedCount = 0;
// Find the max ID to assign new unique IDs
let maxId = currentData.reduce((max, m) => Math.max(max, m.id || 0), 0);

additionalTitles.forEach(title => {
  const normalizedTitle = title.toLowerCase().trim();
  if (!existingTitles.has(normalizedTitle)) {
    maxId++;
    currentData.push({
      id: maxId,
      title: title,
      popularity: 50 // arbitrary default popularity
    });
    existingTitles.add(normalizedTitle);
    addedCount++;
  }
});

fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));
console.log(`Successfully added ${addedCount} new movies to the dictionary.`);
console.log(`The total dictionary size is now ${currentData.length} movies.`);
