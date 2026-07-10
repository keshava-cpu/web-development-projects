/**
 * Keshava Publications Routes
 * Migrated from server/src/index.js (ESM → CommonJS).
 * Mounted at: /api/keshava/publications
 *
 * These are separate from backend's existing /api/publications (MySQL-backed).
 * These routes use the in-memory apiEntries array from server/.
 */
const protect = require("../../middleware/protect");
const express = require("express");
const { apiEntries } = require("../../data/keshavaData");

const router = express.Router();

router.use(protect);

/**
 * GET /api/keshava/publications
 * Returns all in-memory publication entries. Public endpoint.
 */
router.get("/", (_req, res) => {
  res.json({ items: apiEntries });
});

/**
 * POST /api/keshava/publications
 * Creates a new in-memory publication entry. Requires authenticated user.
 */
router.post("/", (req, res) => {
  if (!req.user) {
    console.log("baaaaaaaad!!!!");
    res.status(401).json({ error: "not_authenticated" });
    return;
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
    res.status(400).json({ error: "missing_required_fields" });
    return;
  }

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

  apiEntries.unshift(newEntry);
  res.json({ item: newEntry });
});

/**
 * POST /api/keshava/publications/:id/status
 * Updates the status of a publication entry. Requires authenticated user.
 */
router.post("/:id/status", (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "not_authenticated" });
    return;
  }

  const nextStatus = req.body?.status;
  const target = apiEntries.find((entry) => entry.id === req.params.id);

  if (!target || !nextStatus) {
    res.status(400).json({ error: "publication_not_found_or_invalid_status" });
    return;
  }

  target.status = nextStatus;

  if (nextStatus === "in_review") {
    target.reviewRequestedAt = new Date().toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  target.updatedAt = new Date().toISOString();

  const timelineEvent = req.body?.timelineEvent;
  if (timelineEvent) {
    target.timeline = target.timeline || [];
    target.timeline.push(timelineEvent);
  }

  res.json({ item: target });
});

/**
 * POST /api/keshava/publications/:id/update
 * Updates fields on a publication. Only the owner can edit. Requires authenticated user.
 */
router.post("/:id/update", (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "not_authenticated" });
    return;
  }

  const target = apiEntries.find((entry) => entry.id === req.params.id);
  if (!target) {
    res.status(404).json({ error: "publication_not_found" });
    return;
  }

  if (target.owner !== req.user.email) {
    console.log("yeaaaaaaa");
    res.status(403).json({
      error: "unauthorized",
      message: "Only the entry owner can edit this publication",
    });
    return;
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

  if (title !== undefined) target.title = title;
  if (department !== undefined) target.department = department;
  if (summary !== undefined) target.summary = summary;
  if (contributors !== undefined) target.contributors = contributors;
  if (latestFile !== undefined) target.latestFile = latestFile;
  if (metrics !== undefined) target.metrics = metrics;

  target.updatedAt = new Date().toISOString();

  if (newVersion) {
    target.versions = target.versions || [];
    target.versions.push(newVersion);
  }
  if (timelineEvent) {
    target.timeline = target.timeline || [];
    target.timeline.push(timelineEvent);
  }

  res.json({ item: target });
});

module.exports = router;
