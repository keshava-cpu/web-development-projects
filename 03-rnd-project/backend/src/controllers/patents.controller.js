/**
 * Patents Controller
 *
 * Backed by Supabase Postgres via the unified pool (config/db.js).
 * Uses $1/$2/... parameterized query syntax (pg driver).
 *
 * RBAC:
 *   - Faculty: can only read/mutate their own patents (owner_user_id = req.user.user_id)
 *   - Admin:   full access to all patents
 *
 * Response envelope: { status, message, data } — via sendSuccess / sendFailure.
 *
 * Patent fields (spec):
 *   patent_id, title, status, number, inventors, filing_date, publication_date,
 *   grant_date, patent_office, category, description, department,
 *   document_path, owner_user_id, created_at, updated_at
 */
const pool = require('../config/db');
const { sendSuccess, sendFailure } = require('../utils/response');

const VALID_STATUSES = ['Filed', 'Published', 'Granted'];

// ─── CREATE ────────────────────────────────────────────────────────────────────
const createPatent = async (req, res, next) => {
  try {
    const ownerUserId = req.user.user_id ?? req.user.id ?? null;

    const {
      title,
      status,
      number,
      inventors,
      filing_date,
      publication_date,
      grant_date,
      patent_office,
      category,
      description,
      department,
      document_path,
    } = req.body;

    if (!title || !status) {
      return sendFailure(res, { statusCode: 400, message: 'Title and status are required.' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return sendFailure(res, {
        statusCode: 400,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}.`,
      });
    }

    const result = await pool.query(
      `INSERT INTO patents (
         title, status, number, inventors, filing_date, publication_date,
         grant_date, patent_office, category, description, department,
         document_path, owner_user_id
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        title,
        status,
        number || null,
        inventors || null,
        filing_date || null,
        publication_date || null,
        grant_date || null,
        patent_office || null,
        category || null,
        description || null,
        department || null,
        document_path || null,
        ownerUserId,
      ],
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Patent created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Database Error:", error);
    return sendFailure(res, { statusCode: 500, message: "Internal Server Error: Failed to process patent operation." });
  }
};

// ─── GET ALL (RBAC-scoped) ─────────────────────────────────────────────────────
const getPatents = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const ownerUserId = req.user?.user_id ?? req.user?.id ?? null;

    let result;
    if (isAdmin) {
      result = await pool.query(`SELECT * FROM patents ORDER BY created_at DESC`);
    } else {
      result = await pool.query(
        `SELECT * FROM patents WHERE owner_user_id = $1 ORDER BY created_at DESC`,
        [ownerUserId],
      );
    }

    return sendSuccess(res, {
      message: 'Patents retrieved successfully.',
      data: result.rows,
    });
  } catch (error) {
    console.error("Database Error:", error);
    return sendFailure(res, { statusCode: 500, message: "Internal Server Error: Failed to process patent operation." });
  }
};

// ─── GET BY ID (RBAC-scoped) ───────────────────────────────────────────────────
const getPatentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';
    const ownerUserId = req.user?.user_id ?? req.user?.id ?? null;

    const result = await pool.query(
      'SELECT * FROM patents WHERE patent_id = $1',
      [id],
    );

    if (result.rows.length === 0) {
      return sendFailure(res, { statusCode: 404, message: 'Patent not found.' });
    }

    const patent = result.rows[0];

    if (!isAdmin && String(patent.owner_user_id) !== String(ownerUserId)) {
      return sendFailure(res, {
        statusCode: 403,
        message: 'You are not authorised to view this patent.',
      });
    }

    return sendSuccess(res, {
      message: 'Patent retrieved successfully.',
      data: patent,
    });
  } catch (error) {
    console.error("Database Error:", error);
    return sendFailure(res, { statusCode: 500, message: "Internal Server Error: Failed to process patent operation." });
  }
};

// ─── UPDATE (RBAC-scoped) ──────────────────────────────────────────────────────
const updatePatent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';
    const ownerUserId = req.user?.user_id ?? req.user?.id ?? null;

    // Fetch existing patent first
    const existing = await pool.query(
      'SELECT * FROM patents WHERE patent_id = $1',
      [id],
    );

    if (existing.rows.length === 0) {
      return sendFailure(res, { statusCode: 404, message: 'Patent not found.' });
    }

    const patent = existing.rows[0];

    if (!isAdmin && String(patent.owner_user_id) !== String(ownerUserId)) {
      return sendFailure(res, {
        statusCode: 403,
        message: 'You are not authorised to edit this patent.',
      });
    }

    const {
      title,
      status,
      number,
      inventors,
      filing_date,
      publication_date,
      grant_date,
      patent_office,
      category,
      description,
      department,
      document_path,
    } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return sendFailure(res, {
        statusCode: 400,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}.`,
      });
    }

    const result = await pool.query(
      `UPDATE patents SET
         title            = COALESCE($1,  title),
         status           = COALESCE($2,  status),
         number           = COALESCE($3,  number),
         inventors        = COALESCE($4,  inventors),
         filing_date      = COALESCE($5,  filing_date),
         publication_date = COALESCE($6,  publication_date),
         grant_date       = COALESCE($7,  grant_date),
         patent_office    = COALESCE($8,  patent_office),
         category         = COALESCE($9,  category),
         description      = COALESCE($10, description),
         department       = COALESCE($11, department),
         document_path    = COALESCE($12, document_path),
         updated_at       = NOW()
       WHERE patent_id = $13
       RETURNING *`,
      [
        title || null,
        status || null,
        number || null,
        inventors || null,
        filing_date || null,
        publication_date || null,
        grant_date || null,
        patent_office || null,
        category || null,
        description || null,
        department || null,
        document_path || null,
        id,
      ],
    );

    return sendSuccess(res, {
      message: 'Patent updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Database Error:", error);
    return sendFailure(res, { statusCode: 500, message: "Internal Server Error: Failed to process patent operation." });
  }
};

// ─── DELETE (RBAC-scoped) ──────────────────────────────────────────────────────
const deletePatent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';
    const ownerUserId = req.user?.user_id ?? req.user?.id ?? null;

    const existing = await pool.query(
      'SELECT * FROM patents WHERE patent_id = $1',
      [id],
    );

    if (existing.rows.length === 0) {
      return sendFailure(res, { statusCode: 404, message: 'Patent not found.' });
    }

    const patent = existing.rows[0];

    if (!isAdmin && String(patent.owner_user_id) !== String(ownerUserId)) {
      return sendFailure(res, {
        statusCode: 403,
        message: 'You are not authorised to delete this patent.',
      });
    }

    await pool.query('DELETE FROM patents WHERE patent_id = $1', [id]);

    return sendSuccess(res, {
      message: 'Patent deleted successfully.',
      data: null,
    });
  } catch (error) {
    console.error("Database Error:", error);
    return sendFailure(res, { statusCode: 500, message: "Internal Server Error: Failed to process patent operation." });
  }
};

module.exports = {
  createPatent,
  getPatents,
  getPatentById,
  updatePatent,
  deletePatent,
};
