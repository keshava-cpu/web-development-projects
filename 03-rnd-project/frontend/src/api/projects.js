import apiClient from './client';

// ─── Projects API ─────────────────────────────────────────────────────────────
// Endpoint: /api/projects (protected, Bearer token)
// Admin: sees all projects. Faculty: sees only their own.

export const fetchProjects = async () => {
  const { data } = await apiClient.get('/projects');
  return data;
};

export const fetchProjectById = async (id) => {
  const { data } = await apiClient.get(`/projects/${id}`);
  return data;
};

export const createProject = async (payload) => {
  const { data } = await apiClient.post('/projects', payload);
  return data;
};

export const updateProject = async (id, payload) => {
  const { data } = await apiClient.put(`/projects/${id}`, payload);
  return data;
};

export const deleteProject = async (id) => {
  const { data } = await apiClient.delete(`/projects/${id}`);
  return data;
};
