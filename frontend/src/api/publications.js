import apiClient from './client';

// ─── Publications API ─────────────────────────────────────────────────────────
// Endpoint: /api/publications (protected, Bearer token)
// Admin: sees all publications. Faculty: sees only their own.

export const fetchPublications = async () => {
  const { data } = await apiClient.get('/publications');
  return data;
};

export const fetchPublicationById = async (id) => {
  const { data } = await apiClient.get(`/publications/${id}`);
  return data;
};

export const createPublication = async (payload) => {
  const { data } = await apiClient.post('/publications', payload);
  return data;
};

export const updatePublication = async (id, payload) => {
  const { data } = await apiClient.put(`/publications/${id}`, payload);
  return data;
};

export const deletePublication = async (id) => {
  const { data } = await apiClient.delete(`/publications/${id}`);
  return data;
};
