import fs from "fs";

const newMovies = [
  {
    "id": 31,
    "title": "Chatrapathi",
    "year": "2005",
    "genre": "Action, Drama",
    "actor": "Prabhas",
    "overview": "A displaced refugee rises to become a powerful leader.",
    "popularity": 85,
    "hints": [
      "A family is violently separated during the evacuation of a coastal town.",
      "A mother searches endlessly for her younger biological son while raising her adopted older son.",
      "The older son becomes a protector of refugees exploited by a local mafia don.",
      "The hero famously issues a warning that if anyone steps into his area, they will be cut into half.",
      "The protagonist kills a cruel villain named Baji Rao."
    ]
  },
  {
    "id": 32,
    "title": "Attarintiki Daredi",
    "year": "2013",
    "genre": "Drama, Comedy",
    "actor": "Pawan Kalyan",
    "overview": "A billionaire's grandson tries to reunite his fractured family.",
    "popularity": 84,
    "hints": [
      "An elderly billionaire regrets a past mistake that tore his family apart.",
      "His grandson promises to bring his estranged aunt back home before his grandfather's 80th birthday.",
      "The hero goes to Hyderabad and secretly poses as a chauffeur for his aunt's family.",
      "He quietly fixes the personal lives of his cousins and saves his aunt's husband from financial ruin.",
      "The climax features a powerful emotional breakdown by the hero at a railway station."
    ]
  },
  {
    "id": 33,
    "title": "Kshana Kshanam",
    "year": "1991",
    "genre": "Thriller, Comedy",
    "actor": "Venkatesh, Sridevi",
    "overview": "A woman is pursued by criminals after discovering a clue to stolen money.",
    "popularity": 83,
    "hints": [
      "A massive gang robbery ends with a bag of stolen money being hidden in an unexpected place.",
      "An innocent middle-class working woman accidentally receives a photo booth envelope related to the money.",
      "She is chased by police and a quirky, dangerous gangster who wants the envelope.",
      "She meets a charming thief who accompanies her on a crazy road trip through forests and trains.",
      "This classic road-trip thriller was directed by Ram Gopal Varma."
    ]
  },
  {
    "id": 34,
    "title": "Shiva",
    "year": "1989",
    "genre": "Action, Drama",
    "actor": "Nagarjuna",
    "overview": "A college student stands up against a violent local mobster.",
    "popularity": 82,
    "hints": [
      "A new student enrolls in a university plagued by intense political violence.",
      "He quietly observes the bullying and criminal activities orchestrated by a powerful local mobster.",
      "To protect his friends, he brutally retaliates using a simple bicycle chain.",
      "This creates a massive gang war that shakes the entire city's underworld.",
      "This iconic trendsetting film marked the directorial debut of Ram Gopal Varma."
    ]
  },
  {
    "id": 35,
    "title": "Ninne Pelladata",
    "year": "1996",
    "genre": "Romance, Family",
    "actor": "Nagarjuna, Tabu",
    "overview": "A couple struggles to convince their feuding families to let them marry.",
    "popularity": 81,
    "hints": [
      "A large, happy joint family wants their favorite son to marry a girl of their choice.",
      "He falls in love with an outsider who comes to their city for aviation training.",
      "Her parents originally eloped in their youth, causing a major family rift.",
      "The couple tries to secretly win the hearts of both families to avoid another shocking elopement.",
      "The film features a massive chartbuster song named 'Greeku Veerudu'."
    ]
  },
  {
    "id": 36,
    "title": "Indra",
    "year": "2002",
    "genre": "Action, Drama",
    "actor": "Chiranjeevi",
    "overview": "A peace-loving man reveals his violent past to save a family in danger.",
    "popularity": 80,
    "hints": [
      "A taxi driver in Varanasi lives a quiet, helpful life with his family.",
      "A sudden encounter forces his violent past to catch up with him.",
      "Flashbacks reveal he was once a highly respected peace-keeping leader in his drought-stricken region.",
      "He willingly gave up his life and property so that his rival would sign an agreement for a water reservoir.",
      "The hero famously steps off a helicopter and buries a sickle in the ground to claim peace."
    ]
  },
  {
    "id": 37,
    "title": "Simhadri",
    "year": "2003",
    "genre": "Action, Drama",
    "actor": "NTR Jr",
    "overview": "A faithful servant reveals a bloody past to protect his master's granddaughter.",
    "popularity": 79,
    "hints": [
      "A fiercely loyal adoptive son will do anything for his master's family.",
      "He travels to Kerala to bring his master's estranged granddaughter back home.",
      "The girl suffers from extreme trauma and acts like a child.",
      "A twist reveals the hero has a terrifying past in Kerala where he was a savior of the masses.",
      "The hero takes up an axe to slaughter a massive army of goons led by a don named Bhai Saab."
    ]
  },
  {
    "id": 38,
    "title": "Mirchi",
    "year": "2013",
    "genre": "Action, Romance",
    "actor": "Prabhas",
    "overview": "A man attempts to reform a violent rival village family with love.",
    "popularity": 78,
    "hints": [
      "An architect returns to India and wins the hearts of his fierce rival's violent family.",
      "He teaches the family that a smile and a hug are better than swords and bloodshed.",
      "It is revealed that his own family suffered a tragic massacre due to this endless village rivalry.",
      "He falls in love with a woman whose brother is ironically his biggest enemy.",
      "The tagline of the hero's philosophy is 'Cutout chusi konni konni nammeyali dude.'"
    ]
  },
  {
    "id": 39,
    "title": "Pelli Choopulu",
    "year": "2016",
    "genre": "Comedy, Romance",
    "actor": "Vijay Deverakonda, Ritu Varma",
    "overview": "Two contrasting personalities form an unexpected business partnership.",
    "popularity": 77,
    "hints": [
      "A lazy engineering graduate and a focused businesswoman meet during an arranged marriage setup.",
      "Due to a mix-up, they get locked in a room together and share their past failed relationships.",
      "They decide not to get married but establish a food truck business together instead.",
      "The food truck is named after the heroine, 'Prashanthi'.",
      "This charming indie film launched the careers of Vijay Deverakonda and Tharun Bhascker."
    ]
  },
  {
    "id": 40,
    "title": "Arundhati",
    "year": "2009",
    "genre": "Horror, Thriller",
    "actor": "Anushka Shetty",
    "overview": "A woman discovers she is the reincarnation of a warrior who fought a dark sorcerer.",
    "popularity": 76,
    "hints": [
      "A soon-to-be-married woman visits her native palace and experiences terrifying paranormal events.",
      "She discovers she is the reincarnation of her brave great-grandmother.",
      "Her ancestor sacrificed herself to seal a powerful, shape-shifting evil sorcerer in a tomb.",
      "The sorcerer has escaped and wants revenge against the descendant.",
      "The climax involves the heroine mastering a weapon created from the bones of her predecessor."
    ]
  },
  {
    "id": 41,
    "title": "C/o Kancharapalem",
    "year": "2018",
    "genre": "Drama, Romance",
    "actor": "Subba Rao",
    "overview": "Four unconventional love stories intertwine in a tight-knit neighborhood.",
    "popularity": 75,
    "hints": [
      "Four different love stories unfold in a small neighborhood in Visakhapatnam.",
      "The stories cover different age groups: childhood, youth, middle age, and old age.",
      "A 50-year-old unmarried attendant falls for an officer from a different state.",
      "A sculptor faces backlash from locals for his relationship with a prostitute.",
      "A brilliant narrative twist reveals that all four stories belong to the same person."
    ]
  },
  {
    "id": 42,
    "title": "Mathu Vadalara",
    "year": "2019",
    "genre": "Comedy, Thriller",
    "actor": "Sri Simha",
    "overview": "A delivery boy gets entangled in a surreal murder mystery.",
    "popularity": 74,
    "hints": [
      "A depressed delivery boy gets cheated out of his wages and decides to secretly rob his customers.",
      "During a delivery, he accidentally gets trapped in an apartment with a dead body.",
      "He and his two roommates must safely dispose of the body without getting caught.",
      "A key plot element involves a wildly exaggerated, highly dramatic fictional daily TV serial.",
      "The main characters use sleep-inducing drugs, leading to hilarious hallucinations."
    ]
  },
  {
    "id": 43,
    "title": "Agent Sai Srinivasa Athreya",
    "year": "2019",
    "genre": "Detective, Thriller",
    "actor": "Naveen Polishetty",
    "overview": "A brilliant but quirky detective stumbles upon a massive dark conspiracy.",
    "popularity": 73,
    "hints": [
      "A brilliant but eccentric amateur detective sets up an agency in Nellore.",
      "He wears a trench coat, a fedora, and demands people call him an FBI agent.",
      "He accidentally uncovers a massive, horrific religious crime racket.",
      "The villains frame him for a murder he did not commit to stop his investigation.",
      "The hero's assistant is named Sneha, whom he frequently scolds."
    ]
  },
  {
    "id": 44,
    "title": "Jathi Ratnalu",
    "year": "2021",
    "genre": "Comedy",
    "actor": "Naveen Polishetty, Priyadarshi",
    "overview": "Three goofy friends get framed for a major political crime.",
    "popularity": 72,
    "hints": [
      "Three best friends from Jogipet move to Hyderabad to seek better lives and respect.",
      "The main protagonist falls madly in love with a girl who lives in his apartment complex.",
      "They accidentally stumble into a high-profile corruption scandal involving a minister.",
      "The three friends represent themselves in court in a wildly hilarious and nonsensical trial.",
      "The movie is packed with non-stop chaotic comedy and famous dialogues like 'Shameless fellows'."
    ]
  },
  {
    "id": 45,
    "title": "DJ Tillu",
    "year": "2022",
    "genre": "Comedy, Crime",
    "actor": "Siddhu Jonnalagadda",
    "overview": "A flashy local DJ gets involved in covering up an accidental murder.",
    "popularity": 71,
    "hints": [
      "A self-proclaimed 'Local DJ' who dresses flashily falls instantly for a mysterious woman.",
      "The woman accidentally murders her abusive boyfriend in his apartment.",
      "The DJ gets unwillingly dragged into disposing of the body and covering up her crimes.",
      "He constantly blabbers under extreme stress and delivers hilarious, heavily accented monologues.",
      "The hero's iconic dialogue is 'Atluntadhi manathoni'."
    ]
  }
];

const filePath = "./src/data/curated_manual_hints.json";
const currentData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
const mergedData = [...currentData, ...newMovies];
fs.writeFileSync(filePath, JSON.stringify(mergedData, null, 2));
console.log("Successfully appended 15 more movies to curated collection!");
