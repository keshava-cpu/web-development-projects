/**
 * Projects Controller
 *
 * Backed by Supabase Postgres via the unified pool (config/db.js).
 * Uses $1/$2/... parameterized query syntax (pg driver).
 *
 * Table: projects
 * Columns: project_id (PK), agency, amount, pi, co_pi, status, owner_user_id (FK), created_at
 *
 * NOTE: The Supabase projects table per spec does NOT have a `title` column.
 * If the live table does include `title`, add it back to INSERT/UPDATE queries.
 * The project_users join table from the MySQL schema is NOT used — single owner via owner_user_id.
 *
 * RBAC:
 *   - Faculty: can only read/mutate their own projects (owner_user_id = req.user.user_id)
 *   - Admin:   full access to all projects
 *
 * Response envelope: { status, message, data } — via sendSuccess / sendFailure.
 */
const pool = require('../config/db');
const { sendSuccess, sendFailure } = require('../utils/response');

// ─── CREATE ────────────────────────────────────────────────────────────────────
const createProject = async (req, res, next) => {
  try {
    const { agency, amount, pi, co_pi, copi, status } = req.body;
    const ownerUserId = req.user.user_id;

    // Accept either co_pi (spec column name) or copi (old frontend field name)
    const coPI = co_pi || copi || null;

    if (!agency || !pi || !status) {
      return sendFailure(res, {
        statusCode: 400,
        message: 'Agency, PI, and status are required.',
      });
    }

    const result = await pool.query(
      `INSERT INTO projects (agency, amount, pi, co_pi, status, owner_user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [agency, amount || 0, pi, coPI, status, ownerUserId],
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Project created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
};

// ─── GET ALL ───────────────────────────────────────────────────────────────────
const getProjects = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const ownerUserId = req.user?.user_id;

    let result;
    if (isAdmin) {
      result = await pool.query(`SELECT * FROM projects ORDER BY created_at DESC`);
    } else {
      result = await pool.query(
        `SELECT * FROM projects WHERE owner_user_id = $1 ORDER BY created_at DESC`,
        [ownerUserId],
      );
    }

    return sendSuccess(res, {
      message: 'Projects retrieved successfully.',
      data: result.rows,
    });
  } catch (error) {
    return next(error);
  }
};

// ─── GET BY ID ─────────────────────────────────────────────────────────────────
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';
    const ownerUserId = req.user?.user_id;

    const result = await pool.query(
      `SELECT * FROM projects WHERE project_id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return sendFailure(res, { statusCode: 404, message: 'Project not found.' });
    }

    const project = result.rows[0];

    if (!isAdmin && String(project.owner_user_id) !== String(ownerUserId)) {
      return sendFailure(res, {
        statusCode: 403,
        message: 'You are not authorised to view this project.',
      });
    }

    return sendSuccess(res, {
      message: 'Project retrieved successfully.',
      data: project,
    });
  } catch (error) {
    return next(error);
  }
};

// ─── UPDATE ────────────────────────────────────────────────────────────────────
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { agency, amount, pi, co_pi, copi, status } = req.body;
    const coPI = co_pi || copi || null;
    const isAdmin = req.user?.role === 'admin';
    const ownerUserId = req.user?.user_id;

    const existing = await pool.query(
      `SELECT * FROM projects WHERE project_id = $1`,
      [id],
    );

    if (existing.rows.length === 0) {
      return sendFailure(res, { statusCode: 404, message: 'Project not found.' });
    }

    if (!isAdmin && String(existing.rows[0].owner_user_id) !== String(ownerUserId)) {
      return sendFailure(res, {
        statusCode: 403,
        message: 'You are not authorised to edit this project.',
      });
    }

    const result = await pool.query(
      `UPDATE projects
       SET agency = COALESCE($1, agency),
           amount = COALESCE($2, amount),
           pi     = COALESCE($3, pi),
           co_pi  = COALESCE($4, co_pi),
           status = COALESCE($5, status)
       WHERE project_id = $6
       RETURNING *`,
      [agency || null, amount != null ? amount : null, pi || null, coPI, status || null, id],
    );

    if (result.rowCount === 0) {
      return sendFailure(res, { statusCode: 404, message: 'Project not found.' });
    }

    return sendSuccess(res, {
      message: 'Project updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
};

// ─── DELETE ────────────────────────────────────────────────────────────────────
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';
    const ownerUserId = req.user?.user_id;

    const existing = await pool.query(
      `SELECT * FROM projects WHERE project_id = $1`,
      [id],
    );

    if (existing.rows.length === 0) {
      return sendFailure(res, { statusCode: 404, message: 'Project not found.' });
    }

    if (!isAdmin && String(existing.rows[0].owner_user_id) !== String(ownerUserId)) {
      return sendFailure(res, {
        statusCode: 403,
        message: 'You are not authorised to delete this project.',
      });
    }

    await pool.query('DELETE FROM projects WHERE project_id = $1', [id]);

    return sendSuccess(res, {
      message: 'Project deleted successfully.',
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
