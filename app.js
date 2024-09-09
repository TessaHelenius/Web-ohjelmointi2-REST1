let dictionary = [];
const express = require("express");
const fs = require("fs");
//const bodyParser = require("body-parser");
/* const app = express().use(bodyParser.json()); //vanha tapa - ei enää voimassa. 
kts. https://devdocs.io/express/ -> req.body*/
var app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));

/*CORS isn't enabled on the server, this is due to security reasons by default,
so no one else but the webserver itself can make requests to the server.*/
// Add headers
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  res.setHeader("Content-type", "application/json");

  // Pass to next layer of middleware
  next();
});

//GET kaikki sanat
app.get("/words", (req, res) => {
  const data = fs.readFileSync("./sanakirja.txt", {
    encoding: "utf8",
    flag: "r",
  });
  //data:ssa on nyt koko tiedoston sisältö
  /*tiedoston sisältö pitää pätkiä ja tehdä taulukko*/
  const splitLines = data.split(/\r?\n/);
  /*Tässä voisi käydä silmukassa läpi splitLines:ssa jokaisen rivin*/
  splitLines.forEach((line) => {
    const words = line.split(" "); //sanat taulukkoon words
    console.log(words);
    const word = {
      fin: words[0],
      eng: words[1],
    };
    dictionary.push(word);
    console.log(dictionary);
  });

  res.json(dictionary);
});

//GET yksi sana = englanninkielinen vastine suomenkieliselle sanalle
app.get("/words/:finnish", (req, res) => {
  // Otetaan URL-parametrina saatu suomenkielinen sana ja muutetaan se pieniksi kirjaimiksi
  const finnishWord = req.params.finnish.toLowerCase();
  // Luetaan sanakirja tiedostosta synkronisesti, käyttäen UTF-8-koodausta kuten Mikon esimerkissä
  const data = fs.readFileSync("./sanakirja.txt", {
    encoding: "utf8",
    flag: "r",
  });
  // Pilkotaan sisältö
  const splitLines = data.split(/\r?\n/);
  let englishWord = null; // Muuttuja johon tallennetaan englanninkielinen sana, jos se löytyy

  // Käydään jokainen rivi läpi ja pilkotaan rivin sisältö sanapareiksi
  splitLines.forEach((line) => {
    const words = line.split(" "); //Tässä jokainen rivi pilkotaan kahdeksi sanaksi välilyönnin perusteella, eli ensimmäinen sana on suomenkielinen ja toinen englanninkielinen
    if (words[0].toLowerCase() === finnishWord) {
      // Jos suomenkielinen sana täsmää hakusanaan
      englishWord = words[1]; // tallennetaan englanninkielinen vastine
    }
  });

  if (englishWord) {
    // Jos englanninkielinen sana löytyi, palautetaan se, muuten palautetaan 404-virhe
    res.status(200).json({ english: englishWord });
  } else {
    res.status(404).json({ message: `Sanaa ${finnishWord} ei löytynyt` });
  }
});

// POST: Lisää uusi sana sanakirjaan
app.post("/words", (req, res) => {
  // Haetaan pyyntödatasta suomenkielinen ja englanninkielinen sana
  const { fin, eng } = req.body;

  // Tarkistetaan, että molemmat sanat on annettu
  if (!fin || !eng) {
    return res.status(400).json({
      error: "Molemmat suomen- ja englanninkieliset sanat ovat pakollisia",
    });
  }

  // Luodaan uusi rivi tiedostoon: suomenkielinen ja englanninkielinen sana välilyönnillä erotettuna
  const newEntry = `${fin} ${eng}\n`;

  // Lisätään uusi rivi tiedostoon (synkronisesti)
  fs.appendFileSync("./sanakirja.txt", newEntry, "utf8");

  // Palautetaan vastaus onnistuneesta lisäyksestä
  res.status(201).json({ message: "Sana lisätty onnistuneesti", fin, eng });
});

/* POST new word
app.post("/words", (req, res) => {
  const newWord = req.body;
  dictionary.push(newWord);

  // Save the new word to the file
  const wordLine = `${newWord.fin} ${newWord.eng}\n`;
  fs.appendFileSync("./sanakirja.txt", wordLine);

  res.json(dictionary);
});
/*app.post("/words", (req, res) => {
  const newWord = req.body;
  dictionary.push(newWord);
  res.json(dictionary);
});

/*ADD user
app.post("/users", (req, res) => {
  const user = req.body;
  data.push(user);
  res.json(data);
});

// UPDATE user
app.put("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const updatedUser = req.body;
  data = data.map((user) => (user.id === id ? updatedUser : user));
  res.json(data);
});
//DELETE user
app.delete("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  data = data.filter((user) => user.id !== id);
  res.json(data);
});*/

app.listen(3000, () => {
  console.log("Server listening at port 3000");
});
