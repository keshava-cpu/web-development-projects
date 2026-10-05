/**
 * Publications Controller
 *
 * Backed by Supabase Postgres via the unified pool (config/db.js).
 * Uses $1/$2/... parameterized query syntax (pg driver).
 *
 * Table: publications
 * Columns: publication_id (PK), title, doi, year, proof, owner_user_id (FK), created_at
 *
 * RBAC:
 *   - Faculty: can only read/mutate their own publications (owner_user_id = req.user.user_id)
 *   - Admin:   full access to all publications
 *
 * Response envelope: { status, message, data } — via sendSuccess / sendFailure.
 */
const pool = require('../config/db');
const { sendSuccess, sendFailure } = require('../utils/response');

// ─── CREATE ────────────────────────────────────────────────────────────────────
const createPublication = async (req, res, next) => {
  try {
    const { title, doi, year, proof } = req.body;
    const ownerUserId = req.user.user_id;

    if (!title) {
      return sendFailure(res, {
        statusCode: 400,
        message: 'Title is required.',
      });
    }

    const result = await pool.query(
      `INSERT INTO publications (title, doi, year, proof, owner_user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, doi || null, year || null, proof || null, ownerUserId],
    );

    const newRecord = result.rows[0];

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Publication created successfully.',
      data: newRecord,
    });
  } catch (error) {
    return next(error);
  }
};

// ─── GET ALL ───────────────────────────────────────────────────────────────────
const getPublications = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const ownerUserId = req.user?.user_id;

    let result;
    if (isAdmin) {
      result = await pool.query(
        `SELECT * FROM publications ORDER BY created_at DESC`,
      );
    } else {
      result = await pool.query(
        `SELECT * FROM publications WHERE owner_user_id = $1 ORDER BY created_at DESC`,
        [ownerUserId],
      );
    }

    return sendSuccess(res, {
      message: 'Publications retrieved successfully.',
      data: result.rows,
    });
  } catch (error) {
    return next(error);
  }
};

// ─── GET BY ID ─────────────────────────────────────────────────────────────────
const getPublicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';
    const ownerUserId = req.user?.user_id;

    const result = await pool.query(
      `SELECT * FROM publications WHERE publication_id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return sendFailure(res, { statusCode: 404, message: 'Publication not found.' });
    }

    const pub = result.rows[0];

    if (!isAdmin && String(pub.owner_user_id) !== String(ownerUserId)) {
      return sendFailure(res, {
        statusCode: 403,
        message: 'You are not authorised to view this publication.',
      });
    }

    return sendSuccess(res, {
      message: 'Publication retrieved successfully.',
      data: pub,
    });
  } catch (error) {
    return next(error);
  }
};

// ─── UPDATE ────────────────────────────────────────────────────────────────────
const updatePublication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, doi, year, proof } = req.body;
    const isAdmin = req.user?.role === 'admin';
    const ownerUserId = req.user?.user_id;

    // Verify existence and ownership first
    const existing = await pool.query(
      `SELECT * FROM publications WHERE publication_id = $1`,
      [id],
    );

    if (existing.rows.length === 0) {
      return sendFailure(res, { statusCode: 404, message: 'Publication not found.' });
    }

    if (!isAdmin && String(existing.rows[0].owner_user_id) !== String(ownerUserId)) {
      return sendFailure(res, {
        statusCode: 403,
        message: 'You are not authorised to edit this publication.',
      });
    }

    const result = await pool.query(
      `UPDATE publications
       SET title      = COALESCE($1, title),
           doi        = COALESCE($2, doi),
           year       = COALESCE($3, year),
           proof      = COALESCE($4, proof)
       WHERE publication_id = $5
       RETURNING *`,
      [title || null, doi || null, year || null, proof || null, id],
    );

    if (result.rowCount === 0) {
      return sendFailure(res, { statusCode: 404, message: 'Publication not found.' });
    }

    return sendSuccess(res, {
      message: 'Publication updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
};

// ─── DELETE ────────────────────────────────────────────────────────────────────
const deletePublication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';
    const ownerUserId = req.user?.user_id;

    // Verify existence and ownership first
    const existing = await pool.query(
      `SELECT * FROM publications WHERE publication_id = $1`,
      [id],
    );

    if (existing.rows.length === 0) {
      return sendFailure(res, { statusCode: 404, message: 'Publication not found.' });
    }

    if (!isAdmin && String(existing.rows[0].owner_user_id) !== String(ownerUserId)) {
      return sendFailure(res, {
        statusCode: 403,
        message: 'You are not authorised to delete this publication.',
      });
    }

    await pool.query('DELETE FROM publications WHERE publication_id = $1', [id]);

    return sendSuccess(res, {
      message: 'Publication deleted successfully.',
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createPublication,
  getPublications,
  getPublicationById,
  updatePublication,
  deletePublication,
};
