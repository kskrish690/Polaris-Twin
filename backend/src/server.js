const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth.routes');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:4200',
  'https://polaris-twin.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {

    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS blocked origin: ${origin}`)
    );
  },

  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'OPTIONS'
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ]
}));

app.use(express.json());

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get('/api/health', async (req, res) => {

  try {

    const pool = require('./config/database');

    const connection = await pool.getConnection();

    await connection.ping();

    connection.release();

    res.json({
      success: true,
      system: 'POLARIS-TWIN',
      api: 'ONLINE',
      database: 'CONNECTED'
    });

  } catch (error) {

    console.error('Health check error:', error);

    res.status(500).json({
      success: false,
      system: 'POLARIS-TWIN',
      api: 'ONLINE',
      database: 'DISCONNECTED'
    });
  }
});

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

app.use('/api/auth', authRoutes);

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `POLARIS-TWIN API running on port ${PORT}`
  );
});