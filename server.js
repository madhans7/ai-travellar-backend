const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const authRoutes = require("./routes/authRoutes");
const authController = require("./controllers/authController");
const tripRoutes = require("./routes/tripRoutes");
const tripController = require("./controllers/tripController");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

let db = null;

// Initialize Database
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: "./travelplanner.db",
      driver: sqlite3.Database,
    });

    // Users Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);

    // Trips Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        destination TEXT,
        days INTEGER,
        budget_type TEXT,
        interests TEXT,
        itinerary TEXT,
        budget TEXT,
        hotels TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    console.log("✅ SQLite Database Connected");

    // Provide DB reference to controllers that need it
    if (authController && typeof authController.setDB === 'function') {
      authController.setDB(db);
    }
    if (tripController && typeof tripController.setDB === 'function') {
      tripController.setDB(db);
    }

    // Mount trip routes
    app.use('/api/trips', tripRoutes);

    app.listen(5000, () => {
      console.log("🚀 Server Running on http://localhost:5000");
    });
  } catch (error) {
    console.log("Database Error:", error.message);
  }
};

initializeDBAndServer();

// Test Route
app.get("/", (req, res) => {
  res.send("AI Travel Planner Backend Running");
});