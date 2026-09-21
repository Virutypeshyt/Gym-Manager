const mysql = require('mysql2');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || 'Vyshnavi@1002',
  database: process.env.DB_NAME     || 'gym_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

const db = pool.promise();

// Verify connection on startup
pool.getConnection((err, conn) => {
  if (err) {
    console.error('❌  MySQL connection failed:', err.message);
  } else {
    console.log('✅  MySQL connected successfully');
    conn.release();
  }
});

module.exports = db;
