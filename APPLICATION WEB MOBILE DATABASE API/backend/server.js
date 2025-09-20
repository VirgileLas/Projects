const express = require("express");
const cors = require("cors");
const { db, redisClient } = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const comparators = require("./comparator");
const multer = require("multer");
const cron = require("node-cron");

const storage = multer.memoryStorage(); // Pour stocker en BLOB
const upload = multer({ storage });

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173", // Allow frontend origin (very important for localhost testing)
    credentials: true, // Allow cookies in cross-origin requests
  })
);

const PORT = 5000;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY; // Secret key for JWT signing

//get = read
//post = create
//put = update
//delete = destroy

// Tous les jours à minuit
cron.schedule("0 0 * * *", async () => {
  try {
    await db.promise().query("TRUNCATE TABLE games, guesses"); // Reset the games and guesses tables
    await redisClient.flushAll(); // Clear all Redis data
    console.log("Table reset successfully at midnight.");
  } catch (err) {
    console.error("Failed to reset table:", err);
  }
});

const sendErrorResponse = (res, status_code, message) => {
  return res.status(status_code).json({ success: false, message });
};

const sendSuccessResponse = (res, status_code, message) => {
  return res.status(status_code).json({ success: true, message });
};

const runQuery = async (query, params = []) => {
  try {
    const rows = await db.promise().query(query, params);
    return rows;
  } catch (error) {
    console.error("Database query error:", error);
    return [];
  }
};

// Middleware to Verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1]; // Get JWT from cookie // or Authorization header
  if (!token) {
    return sendErrorResponse(res, 401, "Unauthorized. No token provided.");
  }
  jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return sendErrorResponse(res, 403, "Unauthorized. Invalid token.");
    }
    req.user = user; // Username is the decoded payload of the JWT
    next();
  });
};

app.get("/auth", (req, res) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1]; // Reading the JWT from httpOnly cookie
  if (!token) {
    return sendErrorResponse(res, 401, "Unauthorized. No token provided.");
  }
  jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return sendErrorResponse(res, 403, "Unauthorized. Invalid token.");
    }
    res.json({ success: true, user }); // Send user details to frontend
  });
});

// Route for creating a new user (signup for clients)
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return sendErrorResponse(res, 400, "Please fill in all fields.");
  }
  try {
    const [existingUser] = await runQuery(
      "SELECT COUNT(*) AS count FROM users WHERE username = ?",
      [username]
    );
    if (existingUser[0].count > 0) {
      return sendErrorResponse(
        res,
        400,
        "This username is already used, please choose another one."
      );
    }
    const [existingEmail] = await runQuery(
      "SELECT COUNT(*) AS count FROM users WHERE email = ?",
      [email]
    );
    if (existingEmail[0].count > 0) {
      return sendErrorResponse(
        res,
        400,
        "This email is already used, please choose another one."
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await runQuery(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    ); // Inserting the new user

    const token = jwt.sign({ username: username }, JWT_SECRET_KEY, {
      expiresIn: "1h",
    }); // Generating a JWT that expires in 1 hour with the username as payload
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false, // If true can only be used with https, to be changed in production
      sameSite: "Strict",
      maxAge: 3600000, // Time in milliseconds so 1 hour
    }); // Storing the JWT in an httpOnly cookie
    res.status(201).json({
      success: true,
      message: "Account created.",
      token,
      user: { username : username },
    });

    return ;
  } catch (err) {
    console.error("Error creating user:", err.message);
    return sendErrorResponse(res, 500, err.message);
  }
});

// Route for logging in a user
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return sendErrorResponse(res, 400, "Please fill in all fields.");
  }
  try {
    const [users] = await runQuery("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (!users || users.length === 0) {
      return sendErrorResponse(res, 404, "User not found.");
    }
    const user = users[0];
    if (await bcrypt.compare(password, user.password_hash)) {
      const token = jwt.sign({ username: user.username }, JWT_SECRET_KEY, {
        expiresIn: "1h",
      }); // Generating a JWT that expires in 1 hour with the username as payload
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        maxAge: 3600000,
      }); // Storing the JWT in an httpOnly cookie
      return res.status(200).json({
        user: {
          username: user.username,
          email: user.email,
          games_played: user.games_played,
          games_won: user.games_won,
        },
        token: token, // Sending the JWT token to the frontend
        success: true,
        message: "Login successful.",
      }); // Sending the user details to the frontend
    } else {
      return sendErrorResponse(res, 401, "Incorrect password.");
    }
  } catch (err) {
    console.error("Error logging in:", err.message);
    return sendErrorResponse(res, 500, err.message);
  }
});

// Logout Route to clear JWT cookie from the client
app.post("/logout", (req, res) => {
  res.clearCookie("jwt", { httpOnly: true, secure: false, sameSite: "Strict" }); // Clears the JWT cookie
  return sendSuccessResponse(res, 200, "Logout successful.");
});

// Protected Route to get user details (only accessible if JWT is valid)
app.get("/users/:username", authenticateToken, async (req, res) => {
  if (req.user.username !== req.params.username) {
    return sendErrorResponse(res, 403, "Unauthorized action.");
  }
  try {
    const [users] = await runQuery(
      "SELECT username, email, games_played, games_won FROM users WHERE username = ?",
      [req.params.username]
    ); // Fetching user details (it's an array but there is only 1 user (normally))
    if (users.length === 0) {
      return sendErrorResponse(res, 404, "User not found.");
    }
    return res.status(200).json({ success: true, user: users[0] }); // Sending the user details to the frontend
  } catch (err) {
    return sendErrorResponse(res, 500, err.message);
  }
});

// Protected Route for updating user details (only accessible if JWT is valid)
app.put("/users/:username", authenticateToken, async (req, res) => {
  if (req.user.username !== req.params.username) {
    return sendErrorResponse(res, 403, "Unauthorized action.");
  }

  const { played_game, won_game } = req.body; // 1 to say if the game was won/played and 0 if not
  if (
    played_game !== 0 &&
    played_game !== 1 &&
    won_game !== 0 &&
    won_game !== 1
  ) {
    return sendErrorResponse(res, 400, "Invalid input.");
  }

  try {
    await runQuery(
      "UPDATE users SET games_played = games_played + ?, games_won = games_won + ? WHERE username = ?",
      [played_game, won_game, req.params.username]
    );
    return sendSuccessResponse(res, 200, "User details updated.");
  } catch (err) {
    return sendErrorResponse(res, 500, err.message);
  }
});

// Function to fetch the daily word from Redis or MySQL
const getDailyChallenge = async (gameTypeId) => {
  try {
    console.log("Fetching daily challenge from Redis..."); //debug
    const daily_challenge = await redisClient.get(
      `daily_challenge:${gameTypeId}`
    );

    if (daily_challenge) {
      console.log("Daily challenge found in Redis:", daily_challenge); //debug
      return daily_challenge;
    }

    console.log("No daily challenge found in Redis, selecting a new one..."); //debug
    const [challenge] = await runQuery(
      "SELECT * FROM challenges WHERE game_type_id = ? ORDER BY RAND() LIMIT 1",
      [gameTypeId]
    ); // To select a random challenge from the table
    if (!challenge || challenge.length === 0) {
      throw new Error("No challenge found in MySQL!"); //debug
    }

    console.log(
      "Storing the new daily challenge in Redis:",
      challenge[0].solution
    ); //debug
    await redisClient.set(
      `daily_challenge:${gameTypeId}`,
      challenge[0].solution,
      { EX: 86400 }
    ); // Storing the challenge in Redis for 24 hours
    if (challenge[0].data) {
      await redisClient.set(
        `daily_challenge_data:${gameTypeId}`,
        JSON.stringify(challenge[0].data),
        { EX: 86400 }
      ); // Storing the challenge data in Redis for 24 hours
    }
    return challenge[0].solution;
  } catch (error) {
    console.error("Error fetching daily challenge:", error.message); //debug
    throw new Error("Failed to fetch daily challenge"); //debug
  }
};

// Route to to fetch the daily challenge
app.get("/challenge/:gameTypeId", async (req, res) => {
  gameTypeId = req.params.gameTypeId;
  if (!gameTypeId) {
    return sendErrorResponse(res, 400, "Game type ID is required.");
  }
  try {
    const challenge = await getDailyChallenge(gameTypeId);
    return sendSuccessResponse(res, 200, challenge);
  } catch (error) {
    return sendErrorResponse(
      res,
      500,
      "Error fetching the daily challenge." + error.message
    );
  }
});

// Protected Route to make a guess in the game for a connected user
app.post(
  "/guess/:gameTypeId/:username",
  authenticateToken,
  async (req, res) => {
    if (req.user.username !== req.params.username) {
      return sendErrorResponse(res, 403, "Unauthorized action.");
    }
    if (!req.params.gameTypeId) {
      return sendErrorResponse(res, 400, "Game type ID is required.");
    }
    const username = req.params.username;
    const gameTypeId = req.params.gameTypeId;
    const { guess, guess_number } = req.body;

    if (!guess) {
      return sendErrorResponse(res, 400, "Guess cannot be empty");
    } else if (!guess_number) {
      return sendErrorResponse(res, 400, "Guess number cannot be empty");
    }

    const dailyChallenge = (await getDailyChallenge(gameTypeId)).toLowerCase(); // Fetch the daily word
    const [data] = await runQuery(
      "SELECT number_of_guesses FROM game_types WHERE id = ?",
      [gameTypeId]
    ); // Fetch the number of guesses allowed for the game type
    const numberOfGuesses = data[0].number_of_guesses;
    if (guess_number === 1) {
      await runQuery(
        `INSERT INTO games (status, challenge_id, username, game_type_id)
      SELECT 'in_progress', c.id, ?, ?
      FROM challenges c
      WHERE c.game_type_id = ? AND c.solution = ?
      LIMIT 1`,
        [username, gameTypeId, gameTypeId, dailyChallenge]
      );
    }
    if (
      guess_number === numberOfGuesses &&
      guess.toLowerCase() !== dailyChallenge.toLowerCase()
    ) {
      await runQuery(
        "UPDATE games SET status = 'lost' WHERE username = ? AND game_type_id = ?",
        [username, gameTypeId]
      );
      await runQuery(
        "UPDATE users SET games_played = games_played + 1 WHERE username = ?",
        [username]
      );
    }
    const [game_id] = await runQuery(
      "SELECT id FROM games WHERE username = ? AND game_type_id = ? ORDER BY started_at DESC LIMIT 1",
      [username, gameTypeId]
    ); // Any better ideas to get the game_id without making a query everytime?
    await runQuery(
      "INSERT INTO guesses (game_id, guess, guess_number) VALUES (?, ?, ?)",
      [game_id[0].id, guess.toLowerCase(), guess_number]
    );

    const [type] = await runQuery(
      `SELECT t.type
    FROM game_types gt
    JOIN templates t ON t.id = gt.template_id
    WHERE gt.id = ?`,
      [gameTypeId]
    );
    const comparatorName = type[0].type;
    const compare = comparators[comparatorName];
    if (!compare) {
      return sendErrorResponse(
        res,
        500,
        "Comparator not found for the game type."
      );
    }
    let colorResult = [];
    if (type[0].type === "word_guess") {
      colorResult = compare(guess.toLowerCase(), dailyChallenge);
    } else if (type[0].type === "character_guess") {
      const [data1] = await runQuery(
        "SELECT data FROM challenges WHERE game_type_id = ? AND solution = ?",
        [gameTypeId, dailyChallenge]
      );
      if (data1.length === 0) {
        return sendErrorResponse(
          res,
          404,
          "No challenge data found for the daily challenge."
        );
      }
      const [data2] = await runQuery(
        "SELECT data FROM challenges WHERE game_type_id = ? AND solution = ?",
        [gameTypeId, guess]
      );
      if (data2.length === 0) {
        return sendErrorResponse(
          res,
          404,
          "No challenge data found for the guess."
        );
      }
      const dailyChallengeData = data1[0].data;
      const guessData = data2[0].data;
      colorResult = compare(guessData, dailyChallengeData);
    }

    if (guess.toLowerCase() === dailyChallenge.toLowerCase()) {
      console.log("Correct guess!"); //debug
      await runQuery(
        "UPDATE games SET status = 'won' WHERE username = ? AND game_type_id = ?",
        [username, gameTypeId]
      );
      await runQuery(
        "UPDATE users SET games_played = games_played + 1, games_won = games_won + 1 WHERE username = ?",
        [username]
      );
      return res.status(200).json({
        colors: colorResult,
        correct: true,
        success: true,
        message: "Correct guess!",
      });
    } else {
      return res.status(200).json({
        colors: colorResult,
        correct: false,
        success: true,
        message: "Incorrect guess, try again!",
      });
    }
  }
);

// Route to make a guess for not connected users
app.post("/guess/:gameTypeId", async (req, res) => {
  if (!req.params.gameTypeId) {
    return sendErrorResponse(res, 400, "Game type ID is required.");
  }
  gameTypeId = req.params.gameTypeId;
  const { guess } = req.body;

  const [type] = await runQuery(
    `SELECT t.type
      FROM game_types gt
      JOIN templates t ON t.id = gt.template_id
      WHERE gt.id = ?`,
    [gameTypeId]
  );
  const comparatorName = type[0].type;
  const compare = comparators[comparatorName];
  if (!compare) {
    return sendErrorResponse(
      res,
      500,
      "Comparator not found for the game type."
    );
  }
  const dailyChallenge = (await getDailyChallenge(gameTypeId)).toLowerCase(); // Fetch the daily word
  let colorResult = [];
  if (type[0].type === "word_guess") {
    colorResult = compare(guess.toLowerCase(), dailyChallenge);
  } else if (type[0].type === "character_guess") {
    const [data1] = await runQuery(
      "SELECT data FROM challenges WHERE game_type_id = ? AND solution = ?",
      [gameTypeId, dailyChallenge]
    );
    if (data1.length === 0) {
      return sendErrorResponse(
        res,
        404,
        "No challenge data found for the daily challenge."
      );
    }
    const [data2] = await runQuery(
      "SELECT data FROM challenges WHERE game_type_id = ? AND solution = ?",
      [gameTypeId, guess]
    );
    if (data2.length === 0) {
      return sendErrorResponse(
        res,
        404,
        "No challenge data found for the guess."
      );
    }
    const dailyChallengeData = data1[0].data;
    const guessData = data2[0].data;
    colorResult = compare(guessData, dailyChallengeData);
  }
  console.log("Daily challenge:", colorResult); //debug
  if (guess.toLowerCase() === dailyChallenge.toLowerCase()) {
    return res.status(200).json({
      colors: colorResult,
      correct: true,
      success: true,
      message: "Correct guess!",
    });
  } else {
    return res.status(200).json({
      colors: colorResult,
      correct: false,
      success: true,
      message: "Incorrect guess, try again!",
    });
  }
});

// Protected Route to restore the ongoing game for a connected user
app.get(
  "/restore/:gameTypeId/:username",
  authenticateToken,
  async (req, res) => {
    if (req.user.username !== req.params.username) {
      return sendErrorResponse(res, 403, "Unauthorized action.");
    }
    const gameTypeId = req.params.gameTypeId;
    if (!gameTypeId) {
      return sendErrorResponse(res, 400, "Game type ID is required.");
    }
    try {
      const username = req.params.username;
      const [game] = await runQuery(
        "SELECT id FROM games WHERE username = ? AND game_type_id = ? ORDER BY started_at DESC LIMIT 1",
        [username, gameTypeId]
      ); // Fetch the ongoing game if there is one
      if (game.length === 0) {
        return sendErrorResponse(res, 404, "No active game found");
      }
      const [guesses] = await runQuery(
        "SELECT guess, guess_number FROM guesses WHERE game_id = ? ORDER BY guess_number ASC",
        [game[0].id]
      ); // Fetch the guesses for the ongoing game
      return res.json({ success: true, guesses: guesses });
    } catch (error) {
      console.error("Error restoring a game:", error); //debug
      return sendErrorResponse(res, 500, "Failed to restore game");
    }
  }
);

// Leaderboard Route to get leaderboard data
app.get("/leaderboard", async (req, res) => {
  try {
    const [leaderboard] = await runQuery(
      `SELECT username, games_played, games_won
      FROM users
      ORDER BY games_won DESC, games_played ASC
      LIMIT 50`
    );
    return res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return sendErrorResponse(res, 500, "Failed to fetch leaderboard");
  }
});

// Route to get all game types
app.get("/game_types", async (req, res) => {
  try {
    const [gameTypes] = await runQuery(
      "SELECT id, name, template_id, description, created_by, number_of_guesses, TO_BASE64(image) as image FROM game_types"
    );
    return res.status(200).json({ success: true, gameTypes });
  } catch (error) {
    console.error("Error fetching game types:", error);
    return sendErrorResponse(res, 500, "Failed to fetch game types");
  }
});

// Route to create a new game type
app.post(
  "/create_game_type/:templateId/:username",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    if (req.user.username !== req.params.username) {
      console.log("Unauthorized action by user:", req.user.username); //debug
      return sendErrorResponse(res, 403, "Unauthorized action.");
    }
    if (!req.params.templateId) {
      return sendErrorResponse(res, 400, "Template ID is required.");
    }
    const { name, description, number_of_guesses, data_schema } = req.body;
    let wordSize;
    if (req.body.wordSize === "null") {
      wordSize = null;
    } else {
      wordSize = req.body.wordSize;
    }
    const image = req.file ? req.file.buffer : null;
    console.log("Image received:", image ? "Yes" : "No"); //debug

    try {
      // 🔍 Vérification : un mode avec le même nom existe-t-il déjà ?
      const [existing] = await runQuery(
        "SELECT id FROM game_types WHERE name = ?",
        [name]
      );
      if (existing.length > 0) {
        return sendErrorResponse(
          res,
          400,
          "A game type with this name already exists."
        );
      }
      await runQuery(
        "INSERT INTO game_types (name, template_id, description, created_by, number_of_guesses, data_schema, image, wordSize) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          name,
          req.params.templateId,
          description,
          req.params.username,
          number_of_guesses,
          data_schema,
          image,
          wordSize,
        ]
      );
      const [id] = await runQuery("SELECT LAST_INSERT_ID() AS id"); // Get the ID of the newly created game type
      return res.status(201).json({
        success: true,
        message: "Game type created successfully.",
        gameTypeId: id[0].id,
      });
    } catch (error) {
      console.error("Error creating game type:", error);
      return sendErrorResponse(res, 500, "Failed to create game type");
    }
  }
);

// Route to get all templates
app.get("/templates", async (req, res) => {
  try {
    const [templates] = await runQuery("SELECT * FROM templates");
    return res.status(200).json({ success: true, templates: templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return sendErrorResponse(res, 500, "Failed to fetch templates");
  }
});

// Route to get all challenges for a specific game type
app.get("/challenges/:gameTypeId", async (req, res) => {
  const gameTypeId = req.params.gameTypeId;
  if (!gameTypeId) {
    return sendErrorResponse(res, 400, "Game type ID is required.");
  }
  try {
    const [challenges] = await runQuery(
      "SELECT * FROM challenges WHERE game_type_id = ?",
      [gameTypeId]
    );
    return res.status(200).json({ success: true, challenges: challenges });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return sendErrorResponse(res, 500, "Failed to fetch challenges");
  }
});

// Route to add a new challenge for a specific game type
app.post(
  "/add_challenges/:gameTypeId",
  authenticateToken,
  upload.none(),
  async (req, res) => {
    if (!req.params.gameTypeId) {
      return sendErrorResponse(res, 400, "Game type ID is required.");
    }
    const { solutions } = req.body;
    if (!solutions) {
      return sendErrorResponse(res, 400, "Solutions are required.");
    }
    let parsedData;
    let parsedSolutions;
    try {
      const dataRaw = req.body.data;
      const solutionsRaw = req.body.solutions;

      parsedData = JSON.parse(dataRaw);
      parsedSolutions = JSON.parse(solutionsRaw);
    } catch (e) {
      return sendErrorResponse(
        res,
        400,
        "Invalid JSON in 'data' or 'solutions'."
      );
    }
    const [row] = await runQuery(
      "SELECT data_schema FROM game_types WHERE id = ?",
      [req.params.gameTypeId]
    );
    const data_schema = row[0].data_schema;
    console.log("Parsed data:", parsedData); //debug
    console.log("Parsed solutions:", parsedSolutions); //debug
    console.log("Data schema:", data_schema); //debug
    const allValid = parsedData.every((character) =>
      data_schema.every((key) => key in character)
    );
    let i = 0;
    if (allValid) {
      try {
        for (const char of parsedData) {
          await runQuery(
            "INSERT INTO challenges (game_type_id, solution, data) VALUES (?, ?, ?)",
            [req.params.gameTypeId, parsedSolutions[i], JSON.stringify(char)]
          );
          i++;
        }
        return sendSuccessResponse(
          res,
          201,
          "All challenges added successfully."
        );
      } catch (error) {
        console.error("Error adding challenge:", error);
        return sendErrorResponse(res, 500, "Failed to add challenge");
      }
    }
  }
);

//Route to get wordSize and number of guesses for a specific game type
app.get("/game_type_info/:gameTypeId", async (req, res) => {
  const gameTypeId = req.params.gameTypeId;
  if (!gameTypeId) {
    return sendErrorResponse(res, 400, "Game type ID is required.");
  }
  try {
    const [info] = await runQuery(
      "SELECT wordSize, number_of_guesses FROM game_types WHERE id = ?",
      [gameTypeId]
    );
    if (info.length === 0) {
      return sendErrorResponse(res, 404, "Game type not found.");
    }
    return res.status(200).json({
      success: true,
      wordSize: info[0].wordSize,
      number_of_guesses: info[0].number_of_guesses,
    });
  } catch (error) {
    console.error("Error fetching game type info:", error);
    return sendErrorResponse(res, 500, "Failed to fetch game type info");
  }
});

app.get("/template_info/:gameTypeId", async (req, res) => {
  const gameTypeId = req.params.gameTypeId;
  if (!gameTypeId) {
    return sendErrorResponse(res, 400, "Game type ID is required.");
  }
  try {
    const [info] = await runQuery(
      "SELECT template_id FROM game_types WHERE id = ?",
      [gameTypeId]
    );
    if (info.length === 0) {
      return sendErrorResponse(res, 404, "Game type not found.");
    }
    return res
      .status(200)
      .json({ success: true, template_id: info[0].template_id });
  } catch (error) {
    console.error("Error fetching game type info:", error);
    return sendErrorResponse(res, 500, "Failed to fetch game type info");
  }
});

module.exports = app;