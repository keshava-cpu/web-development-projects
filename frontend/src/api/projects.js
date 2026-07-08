import apiClient from './client';

export const fetchProjects = async () => {
  const { data } = await apiClient.get('/projects');
  return data;
};

export const createProject = async (formData) => {
  const { data } = await apiClient.post('/projects', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
