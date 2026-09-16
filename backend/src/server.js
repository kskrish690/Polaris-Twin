require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const db = require('./config/database');

const app = express();

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';


// ======================================================
// CORS
// ======================================================

const allowedOrigins = [
  'http://localhost:4200',
  'https://polaris-twin.netlify.app',
  'https://polaristwin.netlify.app'
];

app.use(
  cors({
    origin: function (origin, callback) {

      // Allow requests without Origin
      // e.g. curl, Postman, Railway checks
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log('CORS blocked origin:', origin);

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
      );
    },

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ],

    credentials: true
  })
);


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));


// ======================================================
// ROOT
// ======================================================

app.get('/', (req, res) => {

  res.status(200).json({
    success: true,
    system: 'POLARIS-TWIN',
    message: 'POLARIS-TWIN Backend API is running',
    version: '1.0.0',
    status: 'ONLINE'
  });

});


// ======================================================
// HEALTH CHECK
// ======================================================

app.get('/api/health', async (req, res) => {

  try {

    await db.query('SELECT 1');

    res.status(200).json({
      success: true,
      system: 'POLARIS-TWIN',
      api: 'ONLINE',
      database: 'CONNECTED'
    });

  } catch (error) {

    console.error('Database health error:', error);

    res.status(503).json({
      success: false,
      system: 'POLARIS-TWIN',
      api: 'ONLINE',
      database: 'DISCONNECTED'
    });

  }

});


// ======================================================
// AUTH ROUTES
// ======================================================

app.use('/api/auth', authRoutes);


// ======================================================
// 404
// ======================================================

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });

});


// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {

  console.error('Server error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });

});


// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, HOST, () => {

  console.log('==============================================');
  console.log('        POLARIS-TWIN BACKEND API');
  console.log('==============================================');
  console.log(`Server: http://${HOST}:${PORT}`);
  console.log('Health: /api/health');
  console.log('Auth:   /api/auth');
  console.log('Status: ONLINE');
  console.log('==============================================');

});