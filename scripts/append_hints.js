import fs from "fs";

const newMovies = [
  {
    "id": 16,
    "title": "Srimanthudu",
    "year": "2015",
    "genre": "Action, Drama",
    "actor": "Mahesh Babu",
    "overview": "A multi-millionaire heir adopts a village to earn respect.",
    "popularity": 85,
    "hints": [
      "A multi-millionaire heir realizes that wealth isn't enough and wants to earn respect.",
      "He travels to a rural village to adopt and develop it.",
      "He secretly falls in love with a woman from the same village who hates his rich background.",
      "He uses a bicycle to commute instead of his luxury cars.",
      "The protagonist single-handedly fights a local politician and his goons to protect his adopted village."
    ]
  },
  {
    "id": 17,
    "title": "Fidaa",
    "year": "2017",
    "genre": "Romance, Drama",
    "actor": "Varun Tej, Sai Pallavi",
    "overview": "An NRI boy comes to India and falls for a village girl.",
    "popularity": 84,
    "hints": [
      "An NRI boy comes to India for his older brother's wedding.",
      "He falls in love with the bride's younger sister, an independent village girl.",
      "Their relationship suffers due to misunderstandings and the girl's refusal to leave her father.",
      "The heroine is from Banswada in Telangana and speaks with a strong local dialect.",
      "The girl's famous dialogue is 'Badmash, Bakwas, Balishtha'."
    ]
  },
  {
    "id": 18,
    "title": "Arya",
    "year": "2004",
    "genre": "Romance, Comedy",
    "actor": "Allu Arjun",
    "overview": "A free-spirited student falls for a girl already forced into a relationship.",
    "popularity": 83,
    "hints": [
      "A free-spirited college student falls in love with a girl at first sight.",
      "The girl is forced to be the girlfriend of the college bully.",
      "The protagonist practices 'one-side love' and constantly annoys the bully.",
      "He helps the couple elope to a remote town to protect them.",
      "He famously asks his love interest to simply 'Feel my love'."
    ]
  },
  {
    "id": 19,
    "title": "Julayi",
    "year": "2012",
    "genre": "Action, Comedy",
    "actor": "Allu Arjun",
    "overview": "A smart youth accidentally witnesses a massive bank robbery.",
    "popularity": 82,
    "hints": [
      "A happy-go-lucky youth believes in making quick, easy money instead of working hard.",
      "He accidentally witnesses a massive bank robbery planned by a highly intelligent criminal.",
      "He helps the police commissioner track down the stolen money and the mastermind.",
      "The protagonist and the villain engage in a battle of wits involving a betting ring.",
      "The hero famously explains the difference between logic and magic."
    ]
  },
  {
    "id": 20,
    "title": "Gabbar Singh",
    "year": "2012",
    "genre": "Action, Comedy",
    "actor": "Pawan Kalyan",
    "overview": "A reckless police officer clashes with a local goon.",
    "popularity": 81,
    "hints": [
      "A young boy changes his name after being inspired by a famous Bollywood villain.",
      "He grows up to become a reckless but righteous police officer.",
      "He clashes with a local goon who wants to enter politics.",
      "The hero runs a special gang of rowdy constables who wear red bandanas.",
      "The movie is a massive blockbuster remake of the Hindi movie 'Dabangg'."
    ]
  },
  {
    "id": 21,
    "title": "Race Gurram",
    "year": "2014",
    "genre": "Action, Comedy",
    "actor": "Allu Arjun",
    "overview": "Two drastically different brothers work against a politician.",
    "popularity": 80,
    "hints": [
      "Two brothers have completely opposite personalities and constantly fight.",
      "The older brother is a sincere police officer trying to capture a dangerous politician.",
      "The younger brother is carefree and ends up falling in love with a girl who shows no emotions.",
      "When the older brother is attacked, the younger brother creates a fake police force to take revenge.",
      "The climax features a hilarious character named 'Kill Bill Pandey'."
    ]
  },
  {
    "id": 22,
    "title": "Kushi",
    "year": "2001",
    "genre": "Romance, Comedy",
    "actor": "Pawan Kalyan, Bhumika Chawla",
    "overview": "Two college students with massive egos constantly clash but secretly admire each other.",
    "popularity": 79,
    "hints": [
      "Two college students with massive egos constantly clash but secretly admire each other.",
      "Misunderstandings keep them apart, even though they study in the same college.",
      "A crucial conflict arises when the hero accidentally sees the heroine’s waist.",
      "They help their respective friends elope and get married against their parents' wishes.",
      "The hero famously searches for the heroine in the rain at a train station complex."
    ]
  },
  {
    "id": 23,
    "title": "Okkadu",
    "year": "2003",
    "genre": "Action, Drama",
    "actor": "Mahesh Babu",
    "overview": "A kabaddi player saves a girl from a powerful factionist.",
    "popularity": 78,
    "hints": [
      "A state-level Kabaddi player travels to a historical city for a match.",
      "He accidentally ends up rescuing a girl from a powerful factionist who wants to forcefully marry her.",
      "He hides the girl in his own house in Hyderabad without his strict police officer father knowing.",
      "The hero physically defeats the villain at the Charminar monument.",
      "He eventually wins the national Kabaddi championship and defeats the factionist once and for all."
    ]
  },
  {
    "id": 24,
    "title": "Dookudu",
    "year": "2011",
    "genre": "Action, Comedy",
    "actor": "Mahesh Babu",
    "overview": "An undercover cop maintains a massive lie to keep his recovering father happy.",
    "popularity": 77,
    "hints": [
      "An undercover cop is determined to take down a powerful mafia don hiding abroad.",
      "His father, an honest politician, wakes up from a long coma.",
      "The hero creates elaborate fake setups to make his father believe everything is perfect.",
      "The movie features a hilarious side plot where a greedy house broker is tricked into investing in a fake movie.",
      "It features the famous comedy character 'Padmanabha Simha'."
    ]
  },
  {
    "id": 25,
    "title": "Happy Days",
    "year": "2007",
    "genre": "Drama, Romance",
    "actor": "Varun Sandesh, Tamannaah",
    "overview": "A coming-of-age story of a group of engineering students.",
    "popularity": 76,
    "hints": [
      "A coming-of-age story that perfectly captures the four-year journey of a group of engineering students.",
      "The group forms strong bonds despite completely different backgrounds and seniors ragging them.",
      "A prominent storyline involves a junior boy falling deeply in love with a beautiful senior girl.",
      "Another boy has a secret crush on a girl from an affluent, strict family.",
      "The film ends with an emotional farewell on their graduation day."
    ]
  },
  {
    "id": 26,
    "title": "Bharat Ane Nenu",
    "year": "2018",
    "genre": "Political, Drama",
    "actor": "Mahesh Babu",
    "overview": "An NRI suddenly becomes the Chief Minister of the state.",
    "popularity": 75,
    "hints": [
      "An NRI returns to India after receiving news of his father's sudden death.",
      "He is unexpectedly forced to take over his father's position to keep the ruling party together.",
      "He implements strict traffic rules, heavy fines, and massive changes to the education system.",
      "Disgusted by the corruption, he publicly resigns and fights a secret political mafia.",
      "The film's tagline, and a repeating phrase, is 'A promise is a promise.'"
    ]
  },
  {
    "id": 27,
    "title": "Goodachari",
    "year": "2018",
    "genre": "Action, Thriller",
    "actor": "Adivi Sesh",
    "overview": "An orphan joins an intelligence agency but is framed for an attack.",
    "popularity": 74,
    "hints": [
      "An orphan who was raised by an ex-spy dreams of joining India's premier intelligence agency.",
      "He finally gets recruited, but on graduation day, a massive terrorist attack kills the agency's leaders.",
      "He is framed as the mastermind behind the attack and goes on the run.",
      "He discovers a shocking connection between the terrorist group's leader and his own deceased father.",
      "The hero is known by the operative code 'Agent 116'."
    ]
  },
  {
    "id": 28,
    "title": "Sita Ramam",
    "year": "2022",
    "genre": "Romance, Drama",
    "actor": "Dulquer Salmaan, Mrunal Thakur",
    "overview": "An orphaned Indian army officer receives letters from an anonymous girl.",
    "popularity": 73,
    "hints": [
      "An orphaned Indian army officer stationed in Kashmir receives hundreds of letters from an anonymous girl.",
      "He tracks her down to Hyderabad and they fall deeply in love.",
      "He is called for a secret mission to cross the border to save a rogue operative.",
      "A young Pakistani student in the present day must deliver his final letter to the mysterious woman.",
      "The heroine's true identity reveals she is a princess."
    ]
  },
  {
    "id": 29,
    "title": "Hi Nanna",
    "year": "2023",
    "genre": "Romance, Drama",
    "actor": "Nani, Mrunal Thakur",
    "overview": "A single father's daughter befriends a mysterious woman with amnesia.",
    "popularity": 72,
    "hints": [
      "A single father in Mumbai tells his young daughter incomplete bedtime stories about her missing mother.",
      "The daughter befriends a woman who recently survived a serious accident and lost her memory.",
      "The woman slowly realizes she has a deeper connection to the little girl and her father.",
      "A crucial flashback reveals a painful sacrifice the woman made for her father’s reputation.",
      "The movie revolves around cystic fibrosis and an emotional family reunion."
    ]
  },
  {
    "id": 30,
    "title": "Nuvvostanante Nenoddantana",
    "year": "2005",
    "genre": "Romance, Comedy",
    "actor": "Siddharth, Trisha",
    "overview": "An NRI boy tries to win over a village girl's strict brother.",
    "popularity": 71,
    "hints": [
      "A playful, rich NRI boy falls in love with a traditional village girl during a wedding.",
      "The girl’s strict, overprotective brother hates wealthy city people because of past trauma.",
      "The hero travels to the village and agrees to work as a farmer for an entire season to prove his love.",
      "He must harvest more grain than the local landlord's son to win the brother's approval.",
      "The film marked the directorial debut of Prabhu Deva."
    ]
  }
];

const filePath = "./src/data/curated_manual_hints.json";
const currentData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
const mergedData = [...currentData, ...newMovies];
fs.writeFileSync(filePath, JSON.stringify(mergedData, null, 2));
console.log("Successfully appended 15 movies!");
