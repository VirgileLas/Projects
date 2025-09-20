const mysql = require("mysql2");
const redis = require("redis");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) console.error("DB error:", err);
  else console.log("Connected to MySQL database");
});

// Setup Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
});

redisClient.on("error", (err) => console.error("Redis error:", err));

(async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (e) {
    console.error("Redis connection failed:", e);
  }
})();

module.exports = { db, redisClient };
