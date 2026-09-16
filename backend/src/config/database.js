const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

pool.getConnection()
  .then(connection => {

    console.log('==============================================');
    console.log('        MYSQL DATABASE CONNECTED');
    console.log('==============================================');

    connection.release();

  })
  .catch(error => {

    console.error('MYSQL CONNECTION FAILED');
    console.error(error.message);

  });

module.exports = pool;