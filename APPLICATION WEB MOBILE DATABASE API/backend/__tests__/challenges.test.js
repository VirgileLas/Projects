const request = require("supertest");
const app = require("../server");
const { db } = require("../db");

describe("POST /add_challenges/:gameTypeId", () => {
  let token, user, template, gameType;

  beforeAll(async () => {
    // 1. Créer un user
    user = {
      username: `testuser_${Math.floor(Math.random() * 100000)}`,
      email: `test_${Math.floor(Math.random() * 100000)}@ex.com`,
      password: "testpass123",
    };
    await request(app).post("/signup").send(user);
    const loginRes = await request(app).post("/login").send({
      username: user.username,
      password: user.password,
    });
    token = loginRes.body.token;

    // 2. Créer un template (nécessaire pour game_types)
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
  }, 20000);

  afterAll(async () => {
    // Supprimer dans l'ordre inverse des contraintes FK
    await db
      .promise()
      .query("DELETE FROM challenges WHERE game_type_id = ?", [gameType.id]);
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

  it("ajoute des challenges valides", async () => {
    const solutions = ["Neo", "Morpheus"];
    const data = [{ attribute: "leader" }, { attribute: "mentor" }];

    const res = await request(app)
      .post(`/add_challenges/${gameType.id}`)
      .set("Authorization", `Bearer ${token}`)
      .type("form")
      .field("solutions", JSON.stringify(solutions))
      .field("data", JSON.stringify(data));

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/challenges added/i);
  });

  it("échoue si les solutions sont manquantes", async () => {
    const data = [{ attribute: "value" }];
    const res = await request(app)
      .post(`/add_challenges/${gameType.id}`)
      .set("Authorization", `Bearer ${token}`)
      .type("form")
      .field("data", JSON.stringify(data));

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/solutions are required/i);
  });

  it("échoue si le JSON est invalide", async () => {
    const res = await request(app)
      .post(`/add_challenges/${gameType.id}`)
      .set("Authorization", `Bearer ${token}`)
      .type("form")
      .field("solutions", "not-json")
      .field("data", "not-json");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid json/i);
  });
});
