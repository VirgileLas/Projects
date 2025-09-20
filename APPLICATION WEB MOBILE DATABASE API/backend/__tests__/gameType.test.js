const request = require("supertest");
const app = require("../server");
const jwt = require("jsonwebtoken");
const { db } = require("../db");
require("dotenv").config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

describe("POST /create_game_type/:templateId/:username", () => {
  let user, token, template, endpoint;

  beforeAll(async () => {
    user = {
      username: `testuser_${Math.floor(Math.random() * 100000)}`,
      email: `test_${Math.floor(Math.random() * 100000)}@example.com`,
      password: "testpass123",
    };
    await request(app).post("/signup").send(user);

    token = jwt.sign({ username: user.username }, JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    const [templateResult] = await db
      .promise()
      .query(
        `INSERT INTO templates (name, description, type) VALUES (?, ?, ?)`,
        [`template_${Date.now()}`, "desc", "word_guess"]
      );
    const [getTemplate] = await db
      .promise()
      .query("SELECT * FROM templates WHERE id = LAST_INSERT_ID()");
    template = getTemplate[0];

    endpoint = `/create_game_type/${template.id}/${user.username}`;
  }, 20000);

  afterAll(async () => {
    await db
      .promise()
      .query("DELETE FROM game_types WHERE template_id = ?", [template.id]);
    await db
      .promise()
      .query("DELETE FROM templates WHERE id = ?", [template.id]);
    await db
      .promise()
      .query("DELETE FROM users WHERE username = ?", [user.username]);
  }, 20000);

  it("crée un mode de jeu avec un nom unique", async () => {
    const uniqueName = "TestMode_" + Date.now();
    const res = await request(app)
      .post(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .field("name", uniqueName)
      .field("description", "Un mode de test")
      .field("number_of_guesses", "6")
      .field("data_schema", JSON.stringify(["attribute"]))
      .field("wordSize", "5");

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.gameTypeId).toBeDefined();
    expect(typeof res.body.gameTypeId).toBe("number");
  });

  it("échoue si le nom existe déjà", async () => {
    const reusedName = "TestDuplicateName_" + Date.now();

    // 1ère fois : succès
    await request(app)
      .post(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .field("name", reusedName)
      .field("description", "Premier test")
      .field("number_of_guesses", "4")
      .field("data_schema", JSON.stringify(["a"]))
      .field("wordSize", "5");

    // 2ème fois : échec attendu
    const res = await request(app)
      .post(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .field("name", reusedName)
      .field("description", "Tentative de doublon")
      .field("number_of_guesses", "4")
      .field("data_schema", JSON.stringify(["a"]))
      .field("wordSize", "5");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });
});
