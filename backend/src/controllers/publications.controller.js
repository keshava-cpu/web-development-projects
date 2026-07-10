const pool = require("../config/db").default;
const { sendSuccess, sendFailure } = require("../utils/response");

const createPublication = async (req, res, next) => {
  try {
    const { title, doi, year, proof } = req.body;
    const userId = req.user.user_id;

    if (!title) {
      return sendFailure(res, {
        statusCode: 400,
        message: "Title is required.",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO publications (user_id, title, doi, year, proof) VALUES (?, ?, ?, ?, ?)",
      [userId, title, doi || null, year || null, proof || null],
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: "Publication created successfully.",
      data: { publication_id: result.insertId, title, doi, year, proof },
    });
  } catch (error) {
    return next(error);
  }
};

const getPublications = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT publication_id, user_id, title, doi, year, proof, created_at, updated_at
       FROM publications
       ORDER BY created_at DESC`,
    );

    return sendSuccess(res, {
      message: "Publications retrieved successfully.",
      data: rows,
    });
  } catch (error) {
    return next(error);
  }
};

const updatePublication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, doi, year, proof } = req.body;

    const [existing] = await pool.query(
      "SELECT publication_id FROM publications WHERE publication_id = ?",
      [id],
    );

    if (existing.length === 0) {
      return sendFailure(res, {
        statusCode: 404,
        message: "Publication not found.",
      });
    }

    await pool.query(
      `UPDATE publications
       SET title = COALESCE(?, title),
           doi = COALESCE(?, doi),
           year = COALESCE(?, year),
           proof = COALESCE(?, proof)
       WHERE publication_id = ?`,
      [title, doi, year, proof, id],
    );

    const [updated] = await pool.query(
      "SELECT publication_id, user_id, title, doi, year, proof FROM publications WHERE publication_id = ?",
      [id],
    );

    return sendSuccess(res, {
      message: "Publication updated successfully.",
      data: updated[0],
    });
  } catch (error) {
    return next(error);
  }
};

const deletePublication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM publications WHERE publication_id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return sendFailure(res, {
        statusCode: 404,
        message: "Publication not found.",
      });
    }

    return sendSuccess(res, {
      message: "Publication deleted successfully.",
      data: { publication_id: Number(id) },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createPublication,
  getPublications,
  updatePublication,
  deletePublication,
};
