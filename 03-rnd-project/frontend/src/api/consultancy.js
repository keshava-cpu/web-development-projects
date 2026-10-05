import apiClient from './client';

// ─── Consultancy API ──────────────────────────────────────────────────────────
// Endpoint: /api/consultancy (protected, Bearer token)
// Admin: sees all records. Faculty: sees only their own.

export const fetchConsultancy = async () => {
  const { data } = await apiClient.get('/consultancy');
  return data;
};

export const fetchConsultancyById = async (id) => {
  const { data } = await apiClient.get(`/consultancy/${id}`);
  return data;
};

export const createConsultancy = async (payload) => {
  const { data } = await apiClient.post('/consultancy', payload);
  return data;
};

export const updateConsultancy = async (id, payload) => {
  const { data } = await apiClient.put(`/consultancy/${id}`, payload);
  return data;
};

export const deleteConsultancy = async (id) => {
  const { data } = await apiClient.delete(`/consultancy/${id}`);
  return data;
};
