/**
 * Unified PostgreSQL (Supabase) connection pool.
 *
 * Replaces the old mysql2 pool and the now-deleted config/supabase.js.
 * All controllers import this single pool instance.
 *
 * DATABASE_URL must be set in .env, e.g.:
 *   DATABASE_URL=postgresql://user:p%40ss@host:port/dbname
 * (Special characters in the password must be URL-encoded.)
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

pool.on('error', (err) => {
  console.error('[pg pool] Unexpected client error:', err.message);
});

module.exports = pool;
