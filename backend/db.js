require('dotenv').config();
const { Pool } = require('pg');

const requiredEnvVars = ['DB_USER', 'DB_NAME', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`[DB] Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('[DB] Please set these in your .env file');
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || '127.0.0.1',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  max: 20,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 30000,
  query_timeout: 30000,
});

pool.on('error', (err) => {
  console.error(`[DB] Pool error: ${err.message}`);
});

let connectionVerified = false;

async function testConnection(retries = 3, delay = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    let client;
    try {
      client = await pool.connect();
      const dbCheck = await client.query('SELECT current_database()');
      const dbName = dbCheck.rows[0].current_database;
      
      if (dbName !== process.env.DB_NAME) {
        throw new Error(`Wrong database: ${dbName}, expected: ${process.env.DB_NAME}`);
      }
      
      await client.query('SELECT NOW()');
      client.release();
      
      connectionVerified = true;
      console.log(`[DB] Connected to ${dbName}`);
      return { success: true, database: dbName };
      
    } catch (error) {
      if (client) {
        client.release();
      }
      
      if (attempt === retries) {
        if (error.code === '28P01') {
          console.error('[DB] Authentication failed - check DB_USER and DB_PASSWORD');
        } else if (error.code === '3D000') {
          console.error(`[DB] Database '${process.env.DB_NAME}' does not exist`);
        } else if (error.code === 'ECONNREFUSED') {
          console.error(`[DB] Connection refused - check DB_HOST and DB_PORT`);
        } else {
          console.error(`[DB] Connection failed: ${error.message}`);
        }
        return { success: false, error: error.message, code: error.code };
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

testConnection().catch((err) => {
  console.error(`[DB] Connection test failed: ${err.message}`);
});

module.exports = pool;
