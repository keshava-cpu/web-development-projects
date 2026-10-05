/**
 * Keshava Publications Controller
 *
 * Backed by Supabase Postgres via the unified pool (config/db.js).
 * Matches the frontend publications module schema (/frontend/src/features/publications).
 */
const pool = require("../config/db");

const safeJsonParse = (val, fallback) => {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

/**
 * Maps database row (snake_case) to the camelCase structure expected by the frontend.
 */
const mapRowToEntry = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    department: row.department,
    owner: row.owner,
    contributors: safeJsonParse(row.contributors, []),
    status: row.status || "draft",
    summary: row.summary || "",
    latestFile: row.latest_file || "draft.pdf",
    updatedAt: row.updated_at || "",
    reviewRequestedAt: row.review_requested_at || null,
    metrics: safeJsonParse(row.metrics, { messageCount: 0, impactPoints: 0 }),
    versions: safeJsonParse(row.versions, []),
    timeline: safeJsonParse(row.timeline, []),
    messages: safeJsonParse(row.messages, []),
    adminNotes: safeJsonParse(row.admin_notes, []),
  };
};

/**
 * GET /api/keshava/publications
 * Returns all publication entries. Public/authenticated endpoint.
 */
const getPublications = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM publications ORDER BY created_at DESC",
    );
    const items = result.rows.map(mapRowToEntry);
    return res.json({ items });
  } catch (error) {
    console.error("Error fetching publications:", error);
    return next(error);
  }
};

/**
 * POST /api/keshava/publications
 * Creates a new publication entry. Requires authenticated user.
 */
const createPublication = async (req, res, next) => {
  console.log("inside create pub");
  if (!req.user) {
    console.log("user not auth", req.user);
    return res.status(401).json({ error: "not_authenticated" });
  }

  const {
    id,
    title,
    department,
    owner,
    contributors,
    status,
    summary,
    latestFile,
    updatedAt,
    metrics,
    versions,
    timeline,
    messages,
    adminNotes,
  } = req.body;

  if (!id || !title || !department || !owner) {
    return res.status(400).json({ error: "missing_required_fields" });
  }

  try {
    const newEntry = {
      id,
      title,
      department,
      owner,
      contributors: contributors || [owner],
      status: status || "draft",
      summary: summary || "",
      latestFile: latestFile || "draft.pdf",
      updatedAt: updatedAt || new Date().toISOString(),
      metrics: metrics || { messageCount: 0, impactPoints: 0 },
      versions: versions || [],
      timeline: timeline || [],
      messages: messages || [],
      adminNotes: adminNotes || [],
    };

    const query = `
      INSERT INTO publications (
        id, title, department, owner, contributors, status, summary,
        latest_file, updated_at, metrics, versions, timeline, messages, admin_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      newEntry.id,
      newEntry.title,
      newEntry.department,
      newEntry.owner,
      JSON.stringify(newEntry.contributors),
      newEntry.status,
      newEntry.summary,
      newEntry.latestFile,
      newEntry.updatedAt,
      JSON.stringify(newEntry.metrics),
      JSON.stringify(newEntry.versions),
      JSON.stringify(newEntry.timeline),
      JSON.stringify(newEntry.messages),
      JSON.stringify(newEntry.adminNotes),
    ];

    const result = await pool.query(query, values);
    const item = mapRowToEntry(result.rows[0]);
    return res.json({ item });
  } catch (error) {
    console.error("Error creating publication:", error);
    return next(error);
  }
};

/**
 * POST /api/keshava/publications/:id/status
 * Updates the status of a publication entry. Requires authenticated user.
 */
const updatePublicationStatus = async (req, res, next) => {
  if (!req.user) {
    console.log("Not aithen");
    return res.status(401).json({ error: "not_authenticated" });
  }

  const { id } = req.params;
  const nextStatus = req.body?.status;
  const timelineEvent = req.body?.timelineEvent;

  if (!nextStatus) {
    return res
      .status(400)
      .json({ error: "publication_not_found_or_invalid_status" });
  }

  try {
    const checkResult = await pool.query(
      "SELECT * FROM publications WHERE id = $1",
      [id],
    );
    if (checkResult.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "publication_not_found_or_invalid_status" });
    }

    const row = checkResult.rows[0];
    let reviewRequestedAt = row.review_requested_at;
    if (nextStatus === "in_review") {
      reviewRequestedAt = new Date().toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const updatedAt = new Date().toISOString();
    const timeline = Array.isArray(row.timeline) ? row.timeline : [];
    if (timelineEvent) {
      timeline.push(timelineEvent);
    }

    const query = `
      UPDATE publications
      SET status = $1,
          review_requested_at = $2,
          updated_at = $3,
          timeline = $4
      WHERE id = $5
      RETURNING *
    `;

    const values = [
      nextStatus,
      reviewRequestedAt,
      updatedAt,
      JSON.stringify(timeline),
      id,
    ];

    const updateResult = await pool.query(query, values);
    const item = mapRowToEntry(updateResult.rows[0]);
    return res.json({ item });
  } catch (error) {
    console.error("Error updating publication status:", error);
    return next(error);
  }
};

/**
 * POST /api/keshava/publications/:id/update
 * Updates fields on a publication. Only the owner can edit. Requires authenticated user.
 */
const updatePublication = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "not_authenticated" });
  }

  const { id } = req.params;

  try {
    const checkResult = await pool.query(
      "SELECT * FROM publications WHERE id = $1",
      [id],
    );
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "publication_not_found" });
    }

    const row = checkResult.rows[0];

    // Check authorization: Only the owner is allowed to perform edits
    if (row.owner !== req.user.email) {
      return res.status(403).json({
        error: "unauthorized",
        message: "Only the entry owner can edit this publication",
      });
    }

    const {
      title,
      department,
      summary,
      contributors,
      latestFile,
      metrics,
      newVersion,
      timelineEvent,
    } = req.body;

    const nextTitle = title !== undefined ? title : row.title;
    const nextDepartment =
      department !== undefined ? department : row.department;
    const nextSummary = summary !== undefined ? summary : row.summary;
    const nextContributors =
      contributors !== undefined ? contributors : row.contributors;
    const nextLatestFile =
      latestFile !== undefined ? latestFile : row.latest_file;
    const nextMetrics = metrics !== undefined ? metrics : row.metrics;
    const updatedAt = new Date().toISOString();

    const versions = Array.isArray(row.versions) ? row.versions : [];
    if (newVersion) {
      versions.push(newVersion);
    }

    const timeline = Array.isArray(row.timeline) ? row.timeline : [];
    if (timelineEvent) {
      timeline.push(timelineEvent);
    }

    const query = `
      UPDATE publications
      SET title = $1,
          department = $2,
          summary = $3,
          contributors = $4,
          latest_file = $5,
          metrics = $6,
          updated_at = $7,
          versions = $8,
          timeline = $9
      WHERE id = $10
      RETURNING *
    `;

    const values = [
      nextTitle,
      nextDepartment,
      nextSummary,
      JSON.stringify(nextContributors),
      nextLatestFile,
      JSON.stringify(nextMetrics),
      updatedAt,
      JSON.stringify(versions),
      JSON.stringify(timeline),
      id,
    ];

    const updateResult = await pool.query(query, values);
    const item = mapRowToEntry(updateResult.rows[0]);
    return res.json({ item });
  } catch (error) {
    console.error("Error updating publication:", error);
    return next(error);
  }
};

module.exports = {
  getPublications,
  createPublication,
  updatePublicationStatus,
  updatePublication,
};
