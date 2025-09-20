const request = require("supertest");
const app = require("../server");
const jwt = require("jsonwebtoken");
const { db } = require("../db");
require("dotenv").config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

describe("/guess et /restore routes", () => {
  let user, token, template, gameType, challenge;

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

    // Créer un template pour le game type
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

    // Créer un game type (pour test)
    const data_schema = JSON.stringify(["attribute"]);
    const [gameTypeResult] = await db.promise().query(
      `INSERT INTO game_types (name, template_id, description, created_by, data_schema, number_of_guesses, wordSize)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `gametype_${Date.now()}`,
        template.id,
        "desc",
        user.username,
        data_schema,
        6,
        5,
      ]
    );
    const [getGameType] = await db
      .promise()
      .query("SELECT * FROM game_types WHERE id = LAST_INSERT_ID()");
    gameType = getGameType[0];

    const challengeData = JSON.stringify({ attribute: "leader" });
    const [challengeResult] = await db.promise().query(
      `INSERT INTO challenges (game_type_id, data, solution)
       VALUES (?, ?, ?)`,
      [gameType.id, challengeData, "neo"]
    );
    const [getChallenge] = await db
      .promise()
      .query("SELECT * FROM challenges WHERE id = LAST_INSERT_ID()");
    challenge = getChallenge[0];

    await db.promise().query(
      `INSERT INTO games (status, challenge_id, username, game_type_id)
       VALUES ('in_progress', ?, ?, ?)`,
      [challenge.id, user.username, gameType.id]
    );
  }, 20000);

  afterAll(async () => {
    await db
      .promise()
      .query(
        "DELETE FROM guesses WHERE game_id IN (SELECT id FROM games WHERE username = ?)",
        [user.username]
      );
    await db
      .promise()
      .query("DELETE FROM games WHERE username = ?", [user.username]);
    await db
      .promise()
      .query("DELETE FROM challenges WHERE id = ?", [challenge.id]);
    await db
      .promise()
      .query("DELETE FROM game_types WHERE id = ?", [gameType.id]);
    await db
      .promise()
      .query("DELETE FROM templates WHERE id = ?", [template.id]);
    await db
      .promise()
      .query("DELETE FROM users WHERE username = ?", [user.username]);
  }, 20000);

  it("fait une devinette (non connecté)", async () => {
    const res = await request(app)
      .post(`/guess/${gameType.id}`)
      .send({ guess: "morpheus" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.colors).toBeInstanceOf(Array);
    expect(res.body.correct).toBe(false);
  });

  it("fait une devinette (connectée)", async () => {
    const res = await request(app)
      .post(`/guess/${gameType.id}/${user.username}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ guess: "neo", guess_number: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.correct).toBe(true);
    expect(res.body.colors).toBeInstanceOf(Array);
  });

  it("restore renvoie les anciennes guesses", async () => {
    await request(app)
      .post(`/guess/${gameType.id}/${user.username}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ guess: "neo", guess_number: 1 });

    const res = await request(app)
      .get(`/restore/${gameType.id}/${user.username}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.guesses).toBeInstanceOf(Array);
    expect(res.body.guesses.length).toBeGreaterThan(0);
  });
});
