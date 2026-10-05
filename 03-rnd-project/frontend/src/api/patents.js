import apiClient from './client';

export const fetchPatents = async () => {
  const { data } = await apiClient.get('/patents');
  return data;
};

export const fetchPatentById = async (id) => {
  const { data } = await apiClient.get(`/patents/${id}`);
  return data;
};

export const createPatent = async (payload) => {
  const { data } = await apiClient.post('/patents', payload);
  return data;
};

export const updatePatent = async (id, payload) => {
  const { data } = await apiClient.put(`/patents/${id}`, payload);
  return data;
};

export const deletePatent = async (id) => {
  const { data } = await apiClient.delete(`/patents/${id}`);
  return data;
};
