const aiService = require('../services/aiService');

let db;

const setDB = (database) => {
  db = database;
};

const createTrip = async (req, res) => {
  try {
    const userId = req.userId;
    const { destination, days, budgetType, interests } = req.body;

    const result = await db.run(
      `INSERT INTO trips (user_id,destination,days,budget_type,interests) VALUES (?,?,?,?,?)`,
      [userId, destination, days || null, budgetType || null, JSON.stringify(interests || [])]
    );

    const tripId = result.lastID;
    const trip = await db.get('SELECT * FROM trips WHERE id = ?', [tripId]);
    res.status(201).json({ trip: parseTrip(trip) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const parseTrip = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    destination: row.destination,
    days: row.days,
    budget_type: row.budget_type,
    interests: row.interests ? JSON.parse(row.interests) : [],
    itinerary: row.itinerary ? JSON.parse(row.itinerary) : null,
    budget: row.budget ? JSON.parse(row.budget) : null,
    hotels: row.hotels ? JSON.parse(row.hotels) : null,
    created_at: row.created_at,
  };
};

const getUserTrips = async (req, res) => {
  try {
    const userId = req.userId;
    const rows = await db.all('SELECT * FROM trips WHERE user_id = ?', [userId]);
    res.json({ trips: rows.map(parseTrip) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTripById = async (req, res) => {
  try {
    const userId = req.userId;
    const id = req.params.id;
    const row = await db.get('SELECT * FROM trips WHERE id = ? AND user_id = ?', [id, userId]);
    if (!row) return res.status(404).json({ message: 'Trip not found' });
    res.json({ trip: parseTrip(row) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteTrip = async (req, res) => {
  try {
    const userId = req.userId;
    const id = req.params.id;
    await db.run('DELETE FROM trips WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate trip using AI mock, save and return
const generateTrip = async (req, res) => {
  try {
    const userId = req.userId;
    const { destination, days = 3, interests = [] } = req.body;

    const ai = await aiService.generateTrip({ destination, days, interests });

    const result = await db.run(
      `INSERT INTO trips (user_id,destination,days,budget_type,interests,itinerary,budget,hotels) VALUES (?,?,?,?,?,?,?,?)`,
      [
        userId,
        destination,
        days,
        null,
        JSON.stringify(interests),
        JSON.stringify(ai.itinerary),
        JSON.stringify(ai.budget),
        JSON.stringify(ai.hotels),
      ]
    );

    const tripId = result.lastID;
    const trip = await db.get('SELECT * FROM trips WHERE id = ?', [tripId]);
    res.status(201).json({ trip: parseTrip(trip) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addActivity = async (req, res) => {
  try {
    const userId = req.userId;
    const id = req.params.id;
    const { day, activity } = req.body;
    const row = await db.get('SELECT * FROM trips WHERE id = ? AND user_id = ?', [id, userId]);
    if (!row) return res.status(404).json({ message: 'Trip not found' });

    const trip = parseTrip(row);
    const itinerary = trip.itinerary || {};
    if (!itinerary[day]) itinerary[day] = [];
    itinerary[day].push(activity);

    await db.run('UPDATE trips SET itinerary = ? WHERE id = ?', [JSON.stringify(itinerary), id]);
    res.json({ itinerary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const userId = req.userId;
    const id = req.params.id;
    const { day, activity } = req.body;
    const row = await db.get('SELECT * FROM trips WHERE id = ? AND user_id = ?', [id, userId]);
    if (!row) return res.status(404).json({ message: 'Trip not found' });

    const trip = parseTrip(row);
    const itinerary = trip.itinerary || {};
    if (!itinerary[day]) return res.status(400).json({ message: 'Day not found' });
    itinerary[day] = itinerary[day].filter((a) => a !== activity);

    await db.run('UPDATE trips SET itinerary = ? WHERE id = ?', [JSON.stringify(itinerary), id]);
    res.json({ itinerary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const regenerateDay = async (req, res) => {
  try {
    const userId = req.userId;
    const id = req.params.id;
    const { day } = req.body;
    const row = await db.get('SELECT * FROM trips WHERE id = ? AND user_id = ?', [id, userId]);
    if (!row) return res.status(404).json({ message: 'Trip not found' });

    const trip = parseTrip(row);
    const newActivities = await aiService.regenerateDay({ day, destination: trip.destination });
    const itinerary = trip.itinerary || {};
    itinerary[day] = newActivities;

    await db.run('UPDATE trips SET itinerary = ? WHERE id = ?', [JSON.stringify(itinerary), id]);
    res.json({ itinerary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  setDB,
  createTrip,
  getUserTrips,
  getTripById,
  deleteTrip,
  generateTrip,
  addActivity,
  deleteActivity,
  regenerateDay,
};
