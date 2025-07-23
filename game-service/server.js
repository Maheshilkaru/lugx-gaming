const express = require('express');
const { Pool } = require('pg');

const app = express();
require('dotenv').config();

// Middleware to parse JSON
app.use(express.json());

// PostgreSQL connection using environment variables
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// ✅ GET /api/games – List all games
app.get('/api/games', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM games ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('GET error:', err);
    res.status(500).send('Error retrieving games');
  }
});

// ✅ POST /api/games – Add new game
app.post('/api/games', async (req, res) => {
  const { title, category, release_date, price } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO games (title, category, release_date, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, category, release_date, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).send('Error creating game');
  }
});

// ✅ PUT /api/games/:id – Update game
app.put('/api/games/:id', async (req, res) => {
  const { id } = req.params;
  const { title, category, release_date, price } = req.body;
  try {
    const result = await pool.query(
      'UPDATE games SET title=$1, category=$2, release_date=$3, price=$4 WHERE id=$5 RETURNING *',
      [title, category, release_date, price, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Game not found');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT error:', err);
    res.status(500).send('Error updating game');
  }
});

// ✅ DELETE /api/games/:id – Remove a game
app.delete('/api/games/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM games WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Game not found');
    }
    res.sendStatus(204);
  } catch (err) {
    console.error('DELETE error:', err);
    res.status(500).send('Error deleting game');
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎮 Game Service running on port ${PORT}`);
});