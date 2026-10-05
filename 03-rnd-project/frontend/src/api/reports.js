import apiClient from './client';

// ─── Reports API ──────────────────────────────────────────────────────────────
// Endpoint: /api/reports (protected, Bearer token)
// Returns aggregate counts and financial totals across all modules.

export const fetchReports = async () => {
  const { data } = await apiClient.get('/reports');
  return data;
};
