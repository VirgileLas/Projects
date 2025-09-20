const request = require("supertest");
const app = require("../server");
const { db } = require("../db");

const randomUser = () => {
  const rand = Math.floor(Math.random() * 100000);
  return {
    username: `testuser_${rand}`,
    email: `test_${rand}@example.com`,
    password: "testpass123",
  };
};

describe("Auth API", () => {
  let user;

  beforeEach(() => {
    user = randomUser();
  });

  afterEach(async () => {
    if (user && user.username) {
      await db
        .promise()
        .query("DELETE FROM users WHERE username = ?", [user.username]);
    }
  });

  test("POST /signup - should create a new user", async () => {
    const res = await request(app).post("/signup").send(user);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe(user.username);
  });

  test("POST /signup - should fail with duplicate username", async () => {
    await request(app).post("/signup").send(user);
    const res = await request(app).post("/signup").send(user);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /login - should return token with valid credentials", async () => {
    await request(app).post("/signup").send(user);
    const res = await request(app).post("/login").send({
      username: user.username,
      password: user.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  test("POST /login - should fail with wrong password", async () => {
    await request(app).post("/signup").send(user);
    const res = await request(app).post("/login").send({
      username: user.username,
      password: "wrongpassword",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("POST /logout - should clear JWT cookie", async () => {
    const signup = await request(app).post("/signup").send(user);
    const cookie =
      signup.headers["set-cookie"] && signup.headers["set-cookie"][0];
    expect(cookie).toBeDefined();
    const res = await request(app).post("/logout").set("Cookie", cookie);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /auth - should return user from valid JWT cookie", async () => {
    const signup = await request(app).post("/signup").send(user);
    const cookie =
      signup.headers["set-cookie"] && signup.headers["set-cookie"][0];
    expect(cookie).toBeDefined();
    const res = await request(app).get("/auth").set("Cookie", cookie);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe(user.username);
  });

  test("GET /auth - should fail without token", async () => {
    const res = await request(app).get("/auth");
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
