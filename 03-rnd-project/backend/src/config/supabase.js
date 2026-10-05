/**
 * Supabase (Postgres) connection pool — used exclusively by the Patents module.
 *
 * Strategy: Option C from the implementation plan.
 * - MySQL pool (config/db.js) remains unchanged for all existing routes.
 * - This pg pool is used only for the expanded Patents model which requires
 *   the full 14-field schema that will live in Supabase Postgres.
 *
 * The DATABASE_URL must be URL-encoded (@ → %40, & → %26 in the password).
 * Example:
 *   DATABASE_URL=postgresql://user:p%40ss%26word@host:port/dbname
 */
const { Pool } = require('pg');

let pool = null;

function getSupabasePool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    });

    pool.on('error', (err) => {
      console.error('[supabase] Unexpected pool error:', err.message);
    });
  }
  return pool;
}

module.exports = { getSupabasePool };
