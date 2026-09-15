const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth.routes');

const app = express();

const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:4300',
  'https://polaris-twin.netlify.app'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn('CORS blocked origin:', origin);

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
    ],

    credentials: false
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --------------------------------------------------
// ROOT
// --------------------------------------------------

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    system: 'POLARIS-TWIN',
    message: 'POLARIS-TWIN Backend API is running',
    version: '1.0.0',
    status: 'ONLINE'
  });
});


// --------------------------------------------------
// HEALTH
// --------------------------------------------------

app.get('/api/health', async (req, res) => {
  try {
    const pool = require('./config/database');

    const connection = await pool.getConnection();

    await connection.ping();

    connection.release();

    return res.status(200).json({
      success: true,
      system: 'POLARIS-TWIN',
      api: 'ONLINE',
      database: 'CONNECTED'
    });

  } catch (error) {
    console.error('HEALTH ERROR:', error);

    return res.status(500).json({
      success: false,
      system: 'POLARIS-TWIN',
      api: 'ONLINE',
      database: 'DISCONNECTED'
    });
  }
});


// --------------------------------------------------
// AUTH
// --------------------------------------------------

app.use('/api/auth', authRoutes);


// --------------------------------------------------
// UNKNOWN API ROUTE
// --------------------------------------------------

app.use('/api', (req, res) => {
  return res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});


// --------------------------------------------------
// INVALID JSON
// --------------------------------------------------

app.use((error, req, res, next) => {

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {

    console.error('INVALID JSON:', error.message);

    return res.status(400).json({
      success: false,
      message: 'Invalid JSON request body'
    });
  }

  if (
    error.message &&
    error.message.startsWith('CORS blocked')
  ) {

    return res.status(403).json({
      success: false,
      message: error.message
    });
  }

  console.error('SERVER ERROR:', error);

  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});


// --------------------------------------------------
// START
// --------------------------------------------------

app.listen(PORT, '0.0.0.0', () => {

  console.log('');
  console.log('==============================================');
  console.log('        POLARIS-TWIN BACKEND API');
  console.log('==============================================');
  console.log(`Server: http://0.0.0.0:${PORT}`);
  console.log('Health: /api/health');
  console.log('Auth:   /api/auth');
  console.log('Status: ONLINE');
  console.log('==============================================');
  console.log('');
});