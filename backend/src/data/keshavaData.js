/**
 * Keshava in-memory publications data.
 *
 * The seed data has been removed. The array starts empty so that only
 * real data created through the API is shown.
 *
 * NOTE: This in-memory store resets on every server restart.
 * Full Supabase persistence for the Keshava Publications Tracker requires
 * JSONB columns in the `publications` table (contributors, versions,
 * timeline, messages, adminNotes, latestFile, metrics) — a separate migration
 * that must be confirmed with the Supabase table owner before proceeding.
 */
const apiEntries = [];

module.exports = { apiEntries };
