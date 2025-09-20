const request = require("supertest");
const app = require("../server");
const { db } = require("../db");

describe("Miscellaneous Routes", () => {
  let user, template, gameType, challenge;

  beforeAll(async () => {
    // 1. Créer un user
    user = {
      username: `testuser_${Math.floor(Math.random() * 100000)}`,
      email: `test_${Math.floor(Math.random() * 100000)}@ex.com`,
      password: "testpass123",
    };
    await db
      .promise()
      .query(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        [user.username, user.email, user.password]
      );

    // 2. Créer un template
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

    // 3. Créer un game_type
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

    // 4. Créer un challenge (lié à game_type)
    const challengeData = JSON.stringify({ attribute: "leader" });
    const [challengeResult] = await db.promise().query(
      `INSERT INTO challenges (game_type_id, data, solution)
       VALUES (?, ?, ?)`,
      [gameType.id, challengeData, "Neo"]
    );
    const [getChallenge] = await db
      .promise()
      .query("SELECT * FROM challenges WHERE id = LAST_INSERT_ID()");
    challenge = getChallenge[0];
  }, 20000);

  afterAll(async () => {
    if (challenge && challenge.id) {
      await db
        .promise()
        .query("DELETE FROM challenges WHERE id = ?", [challenge.id]);
    }
    if (gameType && gameType.id) {
      await db
        .promise()
        .query("DELETE FROM game_types WHERE id = ?", [gameType.id]);
    }
    if (template && template.id) {
      await db
        .promise()
        .query("DELETE FROM templates WHERE id = ?", [template.id]);
    }
    if (user && user.username) {
      await db
        .promise()
        .query("DELETE FROM users WHERE username = ?", [user.username]);
    }
  }, 20000);

  test("GET /leaderboard should return an array of users", async () => {
    const res = await request(app).get("/leaderboard");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.leaderboard)).toBe(true);
  });

  test("GET /templates should return an array of templates", async () => {
    const res = await request(app).get("/templates");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.templates)).toBe(true);
  });

  test("GET /challenges/:gameTypeId should return challenges", async () => {
    const res = await request(app).get(`/challenges/${gameType.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.challenges)).toBe(true);
    expect(res.body.challenges[0]).toHaveProperty("solution");
  });

  test("GET /game_type_info/:id should return wordSize and number_of_guesses", async () => {
    const res = await request(app).get(`/game_type_info/${gameType.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("wordSize");
    expect(res.body).toHaveProperty("number_of_guesses");
  });
});
