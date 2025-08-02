const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// PostgreSQL connection pool using Kubernetes secrets / env vars
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

// Test DB connection
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL for Order Service'))
  .catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });

// Optional: Auto-create orders table if it doesn't exist
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_name VARCHAR(100),
      product_name VARCHAR(100),
      quantity INT,
      total_price DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✅ Orders table is ready');
}
initDB();

// ----------------- API Routes -----------------

// 1️⃣ Get all orders
app.get('/orders', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('GET /orders error:', err);
    res.status(500).send('Error retrieving orders');
  }
});

// 2️⃣ Create a new order
app.post('/orders', async (req, res) => {
  const { customer_name, product_name, quantity, total_price } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO orders (customer_name, product_name, quantity, total_price)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [customer_name, product_name, quantity, total_price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /orders error:', err);
    res.status(500).send('Error creating order');
  }
});

// 3️⃣ Update an order
app.put('/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { customer_name, product_name, quantity, total_price } = req.body;
  try {
    const result = await pool.query(
      `UPDATE orders
       SET customer_name=$1, product_name=$2, quantity=$3, total_price=$4
       WHERE id=$5 RETURNING *`,
      [customer_name, product_name, quantity, total_price, id]
    );

    if (result.rows.length === 0) return res.status(404).send('Order not found');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /orders error:', err);
    res.status(500).send('Error updating order');
  }
});

// 4️⃣ Delete an order
app.delete('/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM orders WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).send('Order not found');
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /orders error:', err);
    res.status(500).send('Error deleting order');
  }
});

// ----------------- Start Server -----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Order Service running on port ${PORT}`);
});