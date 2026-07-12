/**
 * Reports Controller
 *
 * Backed by Supabase Postgres via the unified pool (config/db.js).
 * Uses $1/$2/... parameterized query syntax (pg driver).
 *
 * Aggregates counts and financial totals across all main tables.
 * Admin-only endpoint — protected at the route level.
 *
 * Note: pg returns COUNT(*) as a string; we parse it to int explicitly.
 *
 * Response envelope: { status, message, data } — via sendSuccess / sendFailure.
 */
const pool = require('../config/db');
const { sendSuccess } = require('../utils/response');

const getReports = async (req, res, next) => {
  try {
    const [
      pubResult,
      patentResult,
      consultancyResult,
      projectResult,
      consultancyAmountResult,
      projectAmountResult,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM publications'),
      pool.query('SELECT COUNT(*) AS total FROM patents'),
      pool.query('SELECT COUNT(*) AS total FROM consultancy'),
      pool.query('SELECT COUNT(*) AS total FROM projects'),
      pool.query('SELECT COALESCE(SUM(amount), 0) AS total FROM consultancy'),
      pool.query('SELECT COALESCE(SUM(amount), 0) AS total FROM projects'),
    ]);

    return sendSuccess(res, {
      message: 'Reports retrieved successfully.',
      data: {
        totals: {
          publications: parseInt(pubResult.rows[0].total, 10),
          patents: parseInt(patentResult.rows[0].total, 10),
          consultancy: parseInt(consultancyResult.rows[0].total, 10),
          projects: parseInt(projectResult.rows[0].total, 10),
        },
        financials: {
          consultancy_amount: parseFloat(consultancyAmountResult.rows[0].total),
          project_amount: parseFloat(projectAmountResult.rows[0].total),
        },
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    return sendFailure(res, { statusCode: 500, message: "Internal Server Error: Failed to generate reports." });
  }
};

module.exports = {
  getReports,
};
