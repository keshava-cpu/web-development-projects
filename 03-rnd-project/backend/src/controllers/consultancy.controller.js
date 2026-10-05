/**
 * Consultancy Controller
 *
 * Backed by Supabase Postgres via the unified pool (config/db.js).
 * Uses $1/$2/... parameterized query syntax (pg driver).
 *
 * Table: consultancy
 * Columns: consultancy_id (PK), industry, amount, duration, owner_user_id (FK), created_at
 *
 * RBAC:
 *   - Faculty: can only read/mutate their own records (owner_user_id = req.user.user_id)
 *   - Admin:   full access to all records
 *
 * Response envelope: { status, message, data } — via sendSuccess / sendFailure.
 */
const pool = require('../config/db');
const { sendSuccess, sendFailure } = require('../utils/response');

// ─── CREATE ────────────────────────────────────────────────────────────────────
const createConsultancy = async (req, res, next) => {
  try {
    const { industry, amount, duration } = req.body;
    const ownerUserId = req.user.user_id;

    if (!industry) {
      return sendFailure(res, {
        statusCode: 400,
        message: 'Industry is required.',
      });
    }

    const result = await pool.query(
      `INSERT INTO consultancy (industry, amount, duration, owner_user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [industry, amount || 0, duration || null, ownerUserId],
    );

    const newRecord = result.rows[0];

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Consultancy record created successfully.',
      data: newRecord,
    });
  } catch (error) {
    return next(error);
  }
};

// ─── GET ALL ───────────────────────────────────────────────────────────────────
const getConsultancy = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const ownerUserId = req.user?.user_id;

    let result;
    if (isAdmin) {
      result = await pool.query(
        `SELECT * FROM consultancy ORDER BY created_at DESC`,
      );
    } else {
      result = await pool.query(
        `SELECT * FROM consultancy WHERE owner_user_id = $1 ORDER BY created_at DESC`,
        [ownerUserId],
      );
    }

    return sendSuccess(res, {
      message: 'Consultancy records retrieved successfully.',
      data: result.rows,
    });
  } catch (error) {
    return next(error);
  }
};

// ─── GET BY ID ─────────────────────────────────────────────────────────────────
const getConsultancyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';
    const ownerUserId = req.user?.user_id;

    const result = await pool.query(
      `SELECT * FROM consultancy WHERE consultancy_id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return sendFailure(res, { statusCode: 404, message: 'Consultancy record not found.' });
    }

    const record = result.rows[0];

    if (!isAdmin && String(record.owner_user_id) !== String(ownerUserId)) {
      return sendFailure(res, {
        statusCode: 403,
        message: 'You are not authorised to view this record.',
      });
    }

    return sendSuccess(res, {
      message: 'Consultancy record retrieved successfully.',
      data: record,
    });
  } catch (error) {
    return next(error);
  }
};

// ─── UPDATE ────────────────────────────────────────────────────────────────────
const updateConsultancy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { industry, amount, duration } = req.body;
    const isAdmin = req.user?.role === 'admin';
    const ownerUserId = req.user?.user_id;

    const existing = await pool.query(
      `SELECT * FROM consultancy WHERE consultancy_id = $1`,
      [id],
    );

    if (existing.rows.length === 0) {
      return sendFailure(res, { statusCode: 404, message: 'Consultancy record not found.' });
    }

    if (!isAdmin && String(existing.rows[0].owner_user_id) !== String(ownerUserId)) {
      return sendFailure(res, {
        statusCode: 403,
        message: 'You are not authorised to edit this record.',
      });
    }

    const result = await pool.query(
      `UPDATE consultancy
       SET industry = COALESCE($1, industry),
           amount   = COALESCE($2, amount),
           duration = COALESCE($3, duration)
       WHERE consultancy_id = $4
       RETURNING *`,
      [industry || null, amount != null ? amount : null, duration || null, id],
    );

    if (result.rowCount === 0) {
      return sendFailure(res, { statusCode: 404, message: 'Consultancy record not found.' });
    }

    return sendSuccess(res, {
      message: 'Consultancy record updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
};

// ─── DELETE ────────────────────────────────────────────────────────────────────
const deleteConsultancy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';
    const ownerUserId = req.user?.user_id;

    const existing = await pool.query(
      `SELECT * FROM consultancy WHERE consultancy_id = $1`,
      [id],
    );

    if (existing.rows.length === 0) {
      return sendFailure(res, { statusCode: 404, message: 'Consultancy record not found.' });
    }

    if (!isAdmin && String(existing.rows[0].owner_user_id) !== String(ownerUserId)) {
      return sendFailure(res, {
        statusCode: 403,
        message: 'You are not authorised to delete this record.',
      });
    }

    await pool.query('DELETE FROM consultancy WHERE consultancy_id = $1', [id]);

    return sendSuccess(res, {
      message: 'Consultancy record deleted successfully.',
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createConsultancy,
  getConsultancy,
  getConsultancyById,
  updateConsultancy,
  deleteConsultancy,
};
