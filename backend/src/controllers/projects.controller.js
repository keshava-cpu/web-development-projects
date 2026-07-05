const pool = require('../config/db');
const { sendSuccess, sendFailure } = require('../utils/response');
const { getUtilizationReportPath } = require('../services/upload.service');

const createProject = async (req, res, next) => {
  try {
    const { title, agency, amount, pi, copi, status, user_ids: userIds } = req.body;

    if (!title || !agency || !pi || !status) {
      return sendFailure(res, {
        statusCode: 400,
        message: 'Title, Agency, PI, and status are required.',
      });
    }

    const utilizationReportPath = req.file
      ? getUtilizationReportPath(req.file.filename)
      : null;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO projects (title, agency, amount, pi, copi, status, utilization_report_path)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, agency, amount || 0, pi, copi || null, status, utilizationReportPath]
      );

      const projectId = result.insertId;

      if (Array.isArray(userIds) && userIds.length > 0) {
        const linkValues = userIds.map((userId) => [projectId, userId]);
        await connection.query(
          'INSERT INTO project_users (project_id, user_id) VALUES ?',
          [linkValues]
        );
      } else if (req.user?.user_id) {
        await connection.query(
          'INSERT INTO project_users (project_id, user_id) VALUES (?, ?)',
          [projectId, req.user.user_id]
        );
      }

      await connection.commit();

      return sendSuccess(res, {
        statusCode: 201,
        message: 'Project created successfully.',
        data: {
          id: projectId,
          title, 
          agency,
          amount,
          pi,
          copi,
          status,
          utilization_report_path: utilizationReportPath,
        },
      });
    } catch (transactionError) {
      await connection.rollback();
      throw transactionError;
    } finally {
      connection.release();
    }
  } catch (error) {
    return next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, agency, amount, pi, copi, status, utilization_report_path, created_at, updated_at
       FROM projects
       ORDER BY created_at DESC`
    );

    const [memberships] = await pool.query(
      'SELECT project_id, user_id FROM project_users'
    );

    const projects = rows.map((project) => ({
      ...project,
      user_ids: memberships
        .filter((membership) => membership.project_id === project.id)
        .map((membership) => membership.user_id),
    }));

    return sendSuccess(res, {
      message: 'Projects retrieved successfully.',
      data: projects,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
};