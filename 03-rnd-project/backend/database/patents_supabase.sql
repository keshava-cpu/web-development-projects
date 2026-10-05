-- ─── Patents table — Supabase Postgres ──────────────────────────────────────
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor).
--
-- This is a NEW table in Supabase Postgres (not the MySQL patents table).
-- It holds the full 14-field spec from the implementation plan.
-- The MySQL schema (database/schema.sql) keeps its own thin patents table
-- unchanged for backward compatibility with Vinay's original dashboard.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS patents (
  patent_id         BIGSERIAL PRIMARY KEY,

  -- Core identification
  title             TEXT        NOT NULL,
  status            TEXT        NOT NULL CHECK (status IN ('Filed', 'Published', 'Granted')),
  number            TEXT,
  inventors         TEXT,                          -- comma-separated or JSON string

  -- Dates
  filing_date       DATE,
  publication_date  DATE,
  grant_date        DATE,

  -- Classification
  patent_office     TEXT,                          -- e.g. "IPO", "USPTO", "EPO"
  category          TEXT,                          -- e.g. "Utility", "Design"
  description       TEXT,
  department        TEXT,                          -- e.g. "CSE", "ECE"

  -- File
  document_path     TEXT,                          -- relative or cloud path to PDF

  -- Ownership
  owner_user_id     INTEGER,                       -- maps to user_id from MySQL users table

  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient RBAC-scoped queries (faculty sees only own records)
CREATE INDEX IF NOT EXISTS idx_patents_owner_user_id ON patents (owner_user_id);

-- Status index for filtered dashboard views
CREATE INDEX IF NOT EXISTS idx_patents_status ON patents (status);

-- ─── Comments ────────────────────────────────────────────────────────────────
COMMENT ON TABLE patents IS
  'Patent records managed by the R&D Management System (Supabase Postgres backend).';
COMMENT ON COLUMN patents.owner_user_id IS
  'References user_id from the MySQL users table. Cross-DB reference — enforced at the application layer.';
COMMENT ON COLUMN patents.status IS
  'One of: Filed (#D97706 amber), Published (#00A6C8 teal), Granted (#16803C green).';
