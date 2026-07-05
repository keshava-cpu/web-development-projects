import apiClient from './client';

export const loginUser = async (credentials) => {
  const { data } = await apiClient.post('/login', credentials);
  return data;
};

export const registerUser = async (payload) => {
  const { data } = await apiClient.post('/register', payload);
  return data;
};
