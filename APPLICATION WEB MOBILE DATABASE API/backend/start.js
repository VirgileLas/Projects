const app = require("./server"); // <- récupère ton app Express
const PORT = process.env.PORT || 5000;
const { db } = require("./db");

// Les deux templates à ajouter (exemple)
const templatesToInsert = [
  { id: 1, name: "Wordle", description: "Mode classique", type:"word_guess"},
  { id: 2, name: "Characters", description: "Mode où tu choisis personnage", type:"character_guess" },
];

// Fonction d’insertion si le template n’existe pas
async function insertTemplatesIfNotExist() {
  for (const tpl of templatesToInsert) {
    const [rows] = await db.promise().query(
      "SELECT 1 FROM templates WHERE id = ? OR name = ?",
      [tpl.id, tpl.name]
    );
    if (rows.length === 0) {
      await db.promise().query(
        "INSERT INTO templates (id, name, description, type) VALUES (?, ?, ?, ?)",
        [tpl.id, tpl.name, tpl.description, tpl.type]
      );
      console.log(`Template ajouté : ${tpl.name}`);
    } else {
      console.log(`Template déjà présent : ${tpl.name}`);
    }
  }
}

// Lancer la fonction puis démarrer l’app
insertTemplatesIfNotExist()
  .then(() => {
    const app = require("./server");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erreur lors de l’insertion des templates :", err);
    process.exit(1);
  });
