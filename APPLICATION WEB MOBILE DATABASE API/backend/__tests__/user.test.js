const request = require("supertest");
const app = require("../server");
const jwt = require("jsonwebtoken");
const { db } = require("../db");
require("dotenv").config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

describe("/users/:username routes", () => {
  let user;
  let token;

  beforeAll(async () => {
    user = {
      username: `testuser_${Math.floor(Math.random() * 100000)}`,
      email: `test_${Math.floor(Math.random() * 100000)}@example.com`,
      password: "testpassword",
    };
    await request(app).post("/signup").send(user);

    token = jwt.sign({ username: user.username }, JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
  }, 20000);

  afterAll(async () => {
    if (user && user.username) {
      await db
        .promise()
        .query("DELETE FROM users WHERE username = ?", [user.username]);
    }
  }, 20000);

  test("GET /users/:username - returns user profile", async () => {
    const res = await request(app)
      .get(`/users/${user.username}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toHaveProperty("username", user.username);
  });

  test("PUT /users/:username - updates games stats", async () => {
    const res = await request(app)
      .put(`/users/${user.username}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ played_game: 1, won_game: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User details updated.");
  });

  test("GET /users/:username - unauthorized if wrong token", async () => {
    const badToken = jwt.sign({ username: "wronguser" }, JWT_SECRET_KEY);
    const res = await request(app)
      .get(`/users/${user.username}`)
      .set("Authorization", `Bearer ${badToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
