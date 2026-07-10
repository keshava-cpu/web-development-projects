const pool = require("../config/db").default;
const { sendSuccess } = require("../utils/response");

const getReports = async (req, res, next) => {
  try {
    const [[publicationCount]] = await pool.query(
      "SELECT COUNT(*) AS total FROM publications",
    );
    const [[patentCount]] = await pool.query(
      "SELECT COUNT(*) AS total FROM patents",
    );
    const [[consultancyCount]] = await pool.query(
      "SELECT COUNT(*) AS total FROM consultancy",
    );
    const [[projectCount]] = await pool.query(
      "SELECT COUNT(*) AS total FROM projects",
    );
    const [[consultancyAmount]] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM consultancy",
    );
    const [[projectAmount]] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM projects",
    );

    return sendSuccess(res, {
      message: "Reports retrieved successfully.",
      data: {
        totals: {
          publications: publicationCount.total,
          patents: patentCount.total,
          consultancy: consultancyCount.total,
          projects: projectCount.total,
        },
        financials: {
          consultancy_amount: consultancyAmount.total,
          project_amount: projectAmount.total,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getReports,
};
