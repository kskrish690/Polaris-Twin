require('dotenv').config();

const express = require('express');
const cors = require('cors');

const pool = require('./config/database');

const authRoutes = require('./routes/auth.routes');

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: 'http://localhost:4200'
  })
);

app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    res.json({
      success: true,
      system: 'POLARIS-TWIN',
      api: 'ONLINE',
      database: 'CONNECTED'
    });

  } catch (error) {
    console.error('Database connection failed:', error);

    res.status(500).json({
      success: false,
      system: 'POLARIS-TWIN',
      api: 'ONLINE',
      database: 'DISCONNECTED',
      error: error.message
    });
  }
});

/* =========================
   AUTH ROUTES
========================= */

app.use('/api/auth', authRoutes);

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`POLARIS-TWIN API running on port ${PORT}`);
});